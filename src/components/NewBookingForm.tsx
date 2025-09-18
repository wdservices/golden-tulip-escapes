import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calendar, MapPin, Users, User, Loader2, Bed, Clock, CreditCard, Sparkles, Star, CheckCircle, MessageSquare, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBranches } from "@/hooks/useBranches";
import { useRooms } from "@/hooks/useRooms";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { collection, addDoc, Timestamp, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  // Add other user properties as needed
}

interface BookingFormProps {
  selectedBranch?: string;
  showLocationDropdown?: boolean;
  onBookingSuccess?: () => void;
}

interface RoomType {
  id: string;
  name: string;
  price: string;
  description: string;
}

interface Branch {
  id?: string;
  name: string;
  address: string;
  email: string;
  location: string;
  phone: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt?: string;
  updatedAt?: string;
}

export const NewBookingForm = ({ 
  selectedBranch, 
  showLocationDropdown = true, 
  onBookingSuccess 
}: BookingFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { branches, isLoading: branchesLoading, error: branchesError } = useBranches();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    location: selectedBranch || "",
    roomType: "",
    guests: 2,
    firstName: (currentUser as any)?.displayName?.split(' ')[0] || "",
    lastName: (currentUser as any)?.displayName?.split(' ').slice(1).join(' ') || "",
    email: (currentUser as any)?.email || "",
    phone: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    specialRequests: ""
  });

  const { roomTypes, isLoading: roomsLoading, error: roomsError } = useRooms(formData.location);

  // Auto-populate user data when authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setFormData(prev => ({
        ...prev,
        firstName: currentUser.displayName?.split(' ')[0] || "",
        lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || "",
        email: currentUser.email || "",
      }));
    }
  }, [isAuthenticated, currentUser]);

  // Update selected branch when prop changes
  useEffect(() => {
    if (selectedBranch) {
      setFormData(prev => ({ ...prev, location: selectedBranch }));
    }
  }, [selectedBranch]);

  // Clear room type when location changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, roomType: "" }));
  }, [formData.location]);

  const calculateTotal = (): number => {
    const selectedRoom = roomTypes.find(room => room.id === formData.roomType);
    if (!selectedRoom || !formData.checkIn || !formData.checkOut) return 0;

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const pricePerNight = selectedRoom.price;
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalGuests = formData.adults + formData.children;
    return pricePerNight * nights * totalGuests;
  };

  const totalPrice = calculateTotal();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!formData.checkIn || !formData.checkOut) {
       toast({
         title: "Please select check-in and check-out dates",
         variant: "destructive",
       });
       return;
     }

     if (!formData.roomType) {
       toast({
         title: "Please select a room type",
         variant: "destructive",
       });
       return;
     }

     setIsLoading(true);

     // Require authentication for booking to satisfy Firestore rules
     if (!isAuthenticated || !currentUser) {
       toast({
         title: "Sign in required",
         description: "Please sign in to complete your booking.",
         variant: "destructive",
       });
       setIsLoading(false);
       navigate('/auth');
       return;
     }

     try {
      // Build booking payload matching admin BookingsPage expectations
      const selectedBranchObj = branches.find(b => b.id === formData.location);
      const totalGuests = formData.adults + formData.children;
      const totalAmount = totalPrice;
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      const newBooking = {
        userId: (currentUser as any).uid || (currentUser as any).id, // Fallback to id if uid is not available
        branchId: formData.location,
        branchName: selectedBranchObj?.name || '',
        roomType: formData.roomType,
        checkInDate: Timestamp.fromDate(checkInDate),
        checkOutDate: Timestamp.fromDate(checkOutDate),
        status: 'confirmed' as const,
        totalAmount,
        paymentStatus: 'pending' as const,
        bookingDate: Timestamp.fromDate(new Date()),
        guests: totalGuests,
        nights: nights,
        specialRequests: formData.specialRequests?.trim() || '',
        guestName: `${formData.firstName} ${formData.lastName}`.trim(),
        guestEmail: formData.email,
        guestPhone: formData.phone,
        createdAt: Timestamp.fromDate(new Date()),
        serviceCharge: 0, // Add default service charge
      };

      // Add the booking document
      const bookingRef = await addDoc(collection(db, 'bookings'), newBooking);
      
      // Update room count for the selected room type
      // First, get all rooms of the selected type in the branch
      const roomsRef = collection(db, `branches/${formData.location}/rooms`);
      const q = query(roomsRef, where("type", "==", formData.roomType), where("availability", "==", true));
      const roomsSnapshot = await getDocs(q);
      
      // If we found an available room of this type with roomCount > 0, update it
      if (!roomsSnapshot.empty) {
        const roomDoc = roomsSnapshot.docs[0];
        const roomData = roomDoc.data();
        
        // Only decrement if roomCount is greater than 0
        if (roomData.roomCount && roomData.roomCount > 0) {
          await updateDoc(doc(db, `branches/${formData.location}/rooms`, roomDoc.id), {
            roomCount: roomData.roomCount - 1,
            // If this was the last room, mark it as unavailable
            availability: roomData.roomCount > 1
          });
        }
      }
      
      toast({
        title: "Booking Successful!",
        description: "Your reservation has been confirmed and saved.",
      });
       
       // Call the success callback if provided
       onBookingSuccess?.();
       
       // Redirect to dashboard or bookings page
       navigate('/dashboard');
     } catch (error) {
       console.error('Booking failed:', error);
       toast({
         title: "Booking Failed",
         description: "There was an error processing your booking. Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsLoading(false);
     }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-hero py-16 px-4">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-primary mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-gold">
              Reserve Your Room
            </h1>
            <Sparkles className="w-8 h-8 text-primary ml-3" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create your perfect stay at Golden Tulip Hotels. Experience luxury redefined.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <div className="card-luxury">
              <div className="flex items-center mb-8">
                <Calendar className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-foreground">New Reservation</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Guest Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <User className="w-5 h-5 text-primary mr-2" />
                    Guest Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Hotel Selection */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <MapPin className="w-5 h-5 text-primary mr-2" />
                    Hotel Selection
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-sm font-medium text-foreground">
                      Select Branch *
                    </Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                      <SelectTrigger className="h-12 bg-input border-border text-foreground">
                        <SelectValue placeholder="Choose your preferred location" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {branchesLoading ? (
                          <SelectItem value="loading" disabled>
                            <div className="flex items-center">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Loading branches...
                            </div>
                          </SelectItem>
                        ) : branches.length === 0 ? (
                          <SelectItem value="no-locations" disabled>
                            No locations available
                          </SelectItem>
                        ) : (
                          branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id} className="text-foreground hover:bg-accent">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-primary mr-2" />
                                {branch.name} - {branch.location}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Room Selection */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <Bed className="w-5 h-5 text-primary mr-2" />
                    Room Preferences
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="roomType" className="text-sm font-medium text-foreground">
                      Room Type *
                    </Label>
                    <Select 
                      value={formData.roomType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, roomType: value }))}
                      disabled={!formData.location || roomsLoading}
                    >
                      <SelectTrigger className="h-12 bg-input border-border text-foreground">
                        <SelectValue placeholder={
                          !formData.location 
                            ? "Please select a branch first" 
                            : roomsLoading 
                              ? "Loading room types..." 
                              : "Select your room type"
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {roomsLoading ? (
                          <SelectItem value="loading" disabled>
                            <div className="flex items-center">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Loading room types...
                            </div>
                          </SelectItem>
                        ) : roomsError ? (
                          <SelectItem value="error" disabled>
                            <div className="flex items-center text-destructive">
                              <span>Error loading room types</span>
                            </div>
                          </SelectItem>
                        ) : roomTypes.length === 0 ? (
                          <SelectItem value="no-rooms" disabled>
                            No room types available for this branch
                          </SelectItem>
                        ) : (
                          roomTypes.map((room) => (
                            <SelectItem key={room.id} value={room.id} className="text-foreground hover:bg-accent">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                  <Bed className="w-4 h-4 text-primary mr-2" />
                                  <span>{room.name}</span>
                                </div>
                                <span className="text-primary font-semibold ml-4">
                                  ₦{room.price.toLocaleString()}/night
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <Calendar className="w-5 h-5 text-primary mr-2" />
                    Stay Duration
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn" className="text-sm font-medium text-foreground">
                        Check-in Date *
                      </Label>
                      <Input
                        id="checkIn"
                        name="checkIn"
                        type="date"
                        value={formData.checkIn}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="h-12 bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut" className="text-sm font-medium text-foreground">
                        Check-out Date *
                      </Label>
                      <Input
                        id="checkOut"
                        name="checkOut"
                        type="date"
                        value={formData.checkOut}
                        onChange={handleInputChange}
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                        required
                        className="h-12 bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Guests */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <Users className="w-5 h-5 text-primary mr-2" />
                    Guest Count
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="adults" className="text-sm font-medium text-foreground">
                        Adults *
                      </Label>
                      <Input
                        id="adults"
                        name="adults"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.adults}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="children" className="text-sm font-medium text-foreground">
                        Children
                      </Label>
                      <Input
                        id="children"
                        name="children"
                        type="number"
                        min="0"
                        max="10"
                        value={formData.children}
                        onChange={handleInputChange}
                        className="h-12 bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <MessageSquare className="w-5 h-5 text-primary mr-2" />
                    Special Requests
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="specialRequests" className="text-sm font-medium text-foreground">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={4}
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary resize-none"
                      placeholder="Any special requests or preferences for your stay..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="btn-luxury w-full h-14 text-lg font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Creating Reservation...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Create Reservation
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="card-luxury">
                <div className="flex items-center mb-6">
                  <Star className="w-6 h-6 text-primary mr-3" />
                  <h3 className="text-xl font-bold text-foreground">Reservation Summary</h3>
                </div>

                <div className="space-y-4">
                  {formData.branch && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="text-foreground font-medium">
                        {branches.find(b => b.id === formData.branch)?.name || 'Selected Branch'}
                      </span>
                    </div>
                  )}

                  {formData.roomType && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Room Type:</span>
                      <span className="text-foreground font-medium">
                        {roomTypes.find(r => r.id === formData.roomType)?.name || 'Selected Room'}
                      </span>
                    </div>
                  )}

                  {formData.checkIn && formData.checkOut && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Check-in:</span>
                        <span className="text-foreground font-medium">
                          {new Date(formData.checkIn).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Check-out:</span>
                        <span className="text-foreground font-medium">
                          {new Date(formData.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="text-foreground font-medium">
                          {Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Guests:</span>
                    <span className="text-foreground font-medium">
                      {formData.adults} Adults{formData.children > 0 && `, ${formData.children} Children`}
                    </span>
                  </div>

                  {totalPrice > 0 && (
                    <div className="pt-4">
                      <div className="flex justify-between items-center py-3 bg-gradient-primary rounded-lg px-4">
                        <span className="text-primary-foreground font-semibold text-lg">Total Price:</span>
                        <span className="text-primary-foreground font-bold text-2xl">
                          ₦{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-primary mr-2" />
                      Secure booking with SSL encryption
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary mr-2" />
                      Free cancellation up to 24 hours
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-primary mr-2" />
                      Best price guarantee
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
