import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBranches } from "@/hooks/useBranches";
import { useRooms } from "@/hooks/useRooms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, addDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDatabaseBranchId } from "@/config/branchMappings";

interface AdminBookingFormProps {
  onBookingSuccess?: () => void;
  onCancel?: () => void;
}

export const AdminBookingForm = ({ onBookingSuccess, onCancel }: AdminBookingFormProps) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { branches } = useBranches();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    roomType: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    specialRequests: "",
    paymentMethod: "transfer"
  });

  const { roomTypes } = useRooms(formData.location);

  const isPresidentialRoom = (roomId: string) => {
    const selectedRoom = roomTypes.find(room => room.id === roomId);
    const roomName = selectedRoom?.name || "";
    return roomId.toLowerCase().includes("presidential") || roomName.toLowerCase().includes("presidential");
  };

  const maxAdults = 2;
  const maxChildren = isPresidentialRoom(formData.roomType) ? 2 : 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location || !formData.roomType || !formData.checkIn || !formData.checkOut) {
      toast({
        title: "Missing Information",
        description: "Please select branch, room type, and dates.",
        variant: "destructive",
      });
      return;
    }

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      toast({
        title: "Invalid Dates",
        description: "Please select valid check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const branchId = getDatabaseBranchId(formData.location);
      const selectedRoom = roomTypes.find(room => room.id === formData.roomType);
      const pricePerNight = selectedRoom?.price || 0;
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
      const totalAmount = pricePerNight * nights;
      const bookingData = {
        branchId,
        roomType: formData.roomType,
        guestName: `${formData.firstName} ${formData.lastName}`,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        checkInDate: Timestamp.fromDate(checkInDate),
        checkOutDate: Timestamp.fromDate(checkOutDate),
        adults: formData.adults,
        children: formData.children,
        specialRequests: formData.specialRequests,
        status: "confirmed",
        bookingDate: Timestamp.now(),
        createdBy: (currentUser?.id ?? 'admin'),
        createdAt: serverTimestamp(),
        paymentStatus: "paid",
        paymentMethod: formData.paymentMethod,
        roomPrice: pricePerNight,
        nights,
        totalAmount
      };

      const sanitizedBookingData = Object.fromEntries(
        Object.entries(bookingData).filter(([, v]) => v !== undefined)
      );

      const bookingsRef = collection(db, "branches", branchId, "bookings");
      const newBookingRef = await addDoc(bookingsRef, sanitizedBookingData);

      if (sanitizedBookingData.paymentStatus === "paid") {
        const mapPaymentMethod = (m: string) => {
          if (m === "transfer") return "bank_transfer";
          if (m === "cash") return "cash";
          return "credit_card";
        };
        const paymentsRef = collection(db, "branches", branchId, "bookings", newBookingRef.id, "payments");
        const paymentData = {
          amount: totalAmount,
          currency: "NGN",
          status: "successful",
          paymentMethod: mapPaymentMethod(formData.paymentMethod),
          method: mapPaymentMethod(formData.paymentMethod),
          channel: "manual",
          transactionId: `manual-${Date.now()}`,
          createdAt: serverTimestamp(),
          paidAt: serverTimestamp(),
          branchId,
          bookingId: newBookingRef.id,
          guestName: sanitizedBookingData.guestName,
          customerEmail: sanitizedBookingData.guestEmail,
          gatewayResponse: "Manual entry"
        };
        await addDoc(paymentsRef, paymentData);
      }

      toast({
        title: "Booking Created Successfully!",
        className: "bg-green-500 text-white",
      });

      if (onBookingSuccess) {
        onBookingSuccess();
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : "There was an error creating the booking.";
      toast({
        title: "Booking Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--royal-blue-dark))] via-[hsl(var(--royal-blue))] to-[hsl(var(--royal-blue-light))] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create Booking for Client</h1>
          <p className="text-white/80">Book a room on behalf of a client</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border-white/20 border rounded-lg shadow-xl p-8">
          <div className="flex items-center mb-8">
            <Calendar className="w-6 h-6 text-yellow-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">New Reservation</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location & Room
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location" className="text-white">Branch</Label>
                  <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id || ''} className="text-white hover:bg-yellow-400/20">
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="roomType" className="text-white">Room Type</Label>
                  <Select
                    value={formData.roomType}
                    onValueChange={(value) => {
                      const isPresidential = isPresidentialRoom(value);
                      setFormData(prev => ({
                        ...prev,
                        roomType: value,
                        adults: maxAdults,
                        children: isPresidential ? 2 : 1
                      }));
                    }}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select a room type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
                      {roomTypes.map((room) => (
                        <SelectItem key={room.id} value={room.id} className="text-white hover:bg-yellow-400/20">
                          {room.name} - ₦{room.price.toLocaleString()}/night
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Dates & Guests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkIn" className="text-white">Check-in Date</Label>
                    <Input
                      id="checkIn"
                      name="checkIn"
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkOut" className="text-white">Check-out Date</Label>
                    <Input
                      id="checkOut"
                      name="checkOut"
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adults" className="text-white">Adults</Label>
                    <Select
                      value={formData.adults.toString()}
                      onValueChange={(value) =>
                        setFormData(prev => ({ ...prev, adults: Math.min(parseInt(value), maxAdults) }))
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select adults" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
                        {[1, 2].map((num) => (
                          <SelectItem key={num} value={num.toString()} className="text-white hover:bg-yellow-400/20">
                            {num} {num === 1 ? "Adult" : "Adults"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="children" className="text-white">Children</Label>
                    <Select
                      value={formData.children.toString()}
                      onValueChange={(value) =>
                        setFormData(prev => ({ ...prev, children: Math.min(parseInt(value), maxChildren) }))
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select children" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
                        {Array.from({ length: maxChildren + 1 }, (_, index) => index).map((num) => (
                          <SelectItem key={num} value={num.toString()} className="text-white hover:bg-yellow-400/20">
                            {num} {num === 1 ? "Child" : "Children"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paymentMethod" className="text-white">Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
                      <SelectItem value="transfer" className="text-white hover:bg-yellow-400/20">Transfer</SelectItem>
                      <SelectItem value="cash" className="text-white hover:bg-yellow-400/20">Cash</SelectItem>
                      <SelectItem value="card" className="text-white hover:bg-yellow-400/20">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-yellow-400 text-[hsl(var(--royal-blue-dark))] hover:bg-yellow-300 font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  "Create Booking"
                )}
              </Button>
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
