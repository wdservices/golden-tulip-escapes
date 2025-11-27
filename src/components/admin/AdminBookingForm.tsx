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
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
    specialRequests: ""
  });

  const { roomTypes } = useRooms(formData.location);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const bookingData = {
        branchId: formData.location,
        roomType: formData.roomType,
        guestName: `${formData.firstName} ${formData.lastName}`,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        checkInDate: Timestamp.fromDate(new Date(formData.checkIn)),
        checkOutDate: Timestamp.fromDate(new Date(formData.checkOut)),
        adults: formData.adults,
        children: formData.children,
        specialRequests: formData.specialRequests,
        status: "confirmed",
        bookingDate: Timestamp.now(),
        createdBy: currentUser?.uid,
        paymentStatus: "pending"
      };

      const bookingsRef = collection(db, "branches", formData.location, "bookings");
      await addDoc(bookingsRef, bookingData);

      toast({
        title: "Booking Created Successfully!",
        className: "bg-green-500 text-white",
      });

      if (onBookingSuccess) {
        onBookingSuccess();
      }

    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error creating the booking.",
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
                  <Select value={formData.roomType} onValueChange={(value) => setFormData(prev => ({ ...prev, roomType: value }))}>
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
                    <Input
                      id="adults"
                      name="adults"
                      type="number"
                      min="1"
                      value={formData.adults}
                      onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="children" className="text-white">Children</Label>
                    <Input
                      id="children"
                      name="children"
                      type="number"
                      min="0"
                      value={formData.children}
                      onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) }))}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
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
