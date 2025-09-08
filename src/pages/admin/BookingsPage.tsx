import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Booking } from "@/types/booking";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { BookingDetails } from "@/components/bookings/BookingDetails";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

// Define the booking form data type
interface BookingFormData {
  branch: string;
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  roomType: string;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
  bookForClient: boolean;
  clientEmail?: string;
  clientName?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Initialize booking form data
  const [bookingData, setBookingData] = useState<BookingFormData>({
    branch: "",
    checkInDate: undefined,
    checkOutDate: undefined,
    roomType: "",
    adults: 1,
    children: 0,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
    bookForClient: false,
  });

  // Mock data for the form
  const branches = [
    { id: "main", name: "GRA Head Branch" },
    { id: "waterlines", name: "Waterlines Branch" },
    { id: "airforce", name: "Airforce Base" },
    { id: "oyigbo", name: "Oyigbo Branch" }
  ];

  const roomTypes = [
    { id: "standard", name: "Standard Room", price: 45000 },
    { id: "deluxe", name: "Deluxe Room", price: 65000 },
    { id: "executive", name: "Executive Suite", price: 95000 },
    { id: "presidential", name: "Presidential Suite", price: 150000 }
  ];

  // Fetch bookings from Firestore
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const bookingsRef = collection(db, "bookings");
      
      // If user is not an admin, only fetch their bookings
      const q = currentUser?.role === 'admin'
        ? query(bookingsRef, orderBy("bookingDate", "desc"))
        : query(bookingsRef, 
            where("userId", "==", currentUser?.id),
            orderBy("bookingDate", "desc")
          );

      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamps to Date objects
        checkInDate: doc.data().checkInDate?.toDate().toISOString(),
        checkOutDate: doc.data().checkOutDate?.toDate().toISOString(),
        bookingDate: doc.data().bookingDate?.toDate().toISOString(),
      })) as Booking[];

      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load bookings on component mount
  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  // Handle booking status update
  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        // If marking as completed, update the checkout time
        ...(newStatus === 'completed' && { actualCheckOutDate: new Date().toISOString() })
      });

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus } 
            : booking
        )
      );

      toast({
        title: "Success",
        description: `Booking has been marked as ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle booking update
  const handleUpdateBooking = async (updatedBooking: Booking) => {
    try {
      const { id, ...bookingData } = updatedBooking;
      const bookingRef = doc(db, "bookings", id);
      
      await updateDoc(bookingRef, {
        ...bookingData,
        // Ensure dates are stored as timestamps
        checkInDate: new Date(bookingData.checkInDate),
        checkOutDate: new Date(bookingData.checkOutDate),
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === id ? { ...updatedBooking } : booking
        )
      );

      toast({
        title: "Success",
        description: "Booking has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle view/edit booking
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  // Handle add new booking
  const handleAddBooking = () => {
    setIsBookingModalOpen(true);
  };

  // Handle booking form submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingData.branch || !bookingData.roomType || !bookingData.checkInDate || !bookingData.checkOutDate) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingRef = collection(db, 'bookings');
      const newBooking = {
        userId: currentUser?.id || 'system',
        branchId: bookingData.branch,
        branchName: branches.find(b => b.id === bookingData.branch)?.name || '',
        roomType: bookingData.roomType,
        roomNumber: '',
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        status: 'confirmed',
        paymentStatus: 'pending',
        totalAmount: roomTypes.find(r => r.id === bookingData.roomType)?.price || 0,
        bookingDate: new Date().toISOString(),
        guests: bookingData.adults + bookingData.children,
        adults: bookingData.adults,
        children: bookingData.children,
        specialRequests: bookingData.specialRequests,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        createdBy: currentUser?.id || 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        roomCharge: roomTypes.find(r => r.id === bookingData.roomType)?.price || 0,
        serviceCharge: 0,
        tax: 0,
        discount: 0,
        source: 'admin',
        marketSegment: 'leisure',
        rateCode: 'BAR'
      };

      await addDoc(bookingRef, newBooking);
      
      toast({
        title: "Booking Created",
        description: "The booking has been successfully created.",
      });
      
      // Refresh bookings and close modal
      fetchBookings();
      setIsBookingModalOpen(false);
      
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: "There was an error creating the booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isBookingModalOpen) {
      setBookingData({
        branch: "",
        checkInDate: undefined,
        checkOutDate: undefined,
        roomType: "",
        adults: 1,
        children: 0,
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        specialRequests: "",
        bookForClient: false,
      });
    }
  }, [isBookingModalOpen]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bookings Management</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all hotel bookings
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleAddBooking}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingsTable 
            bookings={bookings} 
            isLoading={isLoading}
            onEdit={handleViewBooking}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>

      {selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedBooking(null);
          }}
          onSave={(updatedBooking) => {
            // Update the booking in the local state
            setBookings(bookings.map(b => 
              b.id === updatedBooking.id ? updatedBooking : b
            ));
            setSelectedBooking(updatedBooking);
          }}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* New Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Booking</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new booking.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitBooking} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch Selection */}
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={bookingData.branch}
                  onValueChange={(value) => setBookingData({ ...bookingData, branch: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Room Type */}
              <div className="space-y-2">
                <Label htmlFor="roomType">Room Type</Label>
                <Select
                  value={bookingData.roomType}
                  onValueChange={(value) => setBookingData({ ...bookingData, roomType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} (₦{room.price.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Check-in Date */}
              <div className="space-y-2">
                <Label>Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !bookingData.checkInDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.checkInDate ? (
                        format(bookingData.checkInDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingData.checkInDate}
                      onSelect={(date) => setBookingData({ ...bookingData, checkInDate: date || undefined })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out Date */}
              <div className="space-y-2">
                <Label>Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !bookingData.checkOutDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.checkOutDate ? (
                        format(bookingData.checkOutDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingData.checkOutDate}
                      onSelect={(date) => setBookingData({ ...bookingData, checkOutDate: date || undefined })}
                      initialFocus
                      disabled={(date) => 
                        date <= (bookingData.checkInDate || new Date())
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Guest Information */}
              <div className="space-y-2">
                <Label htmlFor="guestName">Guest Name</Label>
                <Input
                  id="guestName"
                  value={bookingData.guestName}
                  onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                  placeholder="Guest's full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestEmail">Guest Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={bookingData.guestEmail}
                  onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
                  placeholder="guest@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestPhone">Guest Phone</Label>
                <Input
                  id="guestPhone"
                  value={bookingData.guestPhone}
                  onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label>Guests</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adults" className="text-sm">Adults</Label>
                    <Input
                      id="adults"
                      type="number"
                      min="1"
                      value={bookingData.adults}
                      onChange={(e) => setBookingData({ ...bookingData, adults: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="children" className="text-sm">Children</Label>
                    <Input
                      id="children"
                      type="number"
                      min="0"
                      value={bookingData.children}
                      onChange={(e) => setBookingData({ ...bookingData, children: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                  placeholder="Any special requests or notes..."
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBookingModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Booking'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
