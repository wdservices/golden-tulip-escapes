import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookingFormProps {
  selectedBranch?: string;
  showLocationDropdown?: boolean;
}

export const BookingForm = ({ selectedBranch, showLocationDropdown = true }: BookingFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: "2",
    rooms: "1",
    location: selectedBranch || "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roomType: ""
  });

  const branches = [
    { id: "main", name: "GRA (Head Branch)", location: "Government Reserved Area" },
    { id: "waterlines", name: "Waterlines", location: "Port Harcourt" },
    { id: "airforce", name: "Airforce Base", location: "Port Harcourt" },
    { id: "oyigbo", name: "Oyigbo", location: "Rivers State" }
  ];

  const roomTypes = [
    { id: "standard", name: "Standard Room", price: "₦45,000" },
    { id: "deluxe", name: "Deluxe Room", price: "₦65,000" },
    { id: "executive", name: "Executive Suite", price: "₦95,000" },
    { id: "presidential", name: "Presidential Suite", price: "₦150,000" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Booking Request Submitted!",
      description: "We'll contact you shortly to confirm your reservation.",
    });

    setIsLoading(false);
  };

  const calculateTotal = () => {
    const selectedRoom = roomTypes.find(room => room.id === formData.roomType);
    if (!selectedRoom || !formData.checkIn || !formData.checkOut) return 0;

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const roomPrice = parseInt(selectedRoom.price.replace(/[₦,]/g, ""));
    
    return nights * roomPrice * parseInt(formData.rooms);
  };

  return (
    <section id="booking" className="py-16 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4 text-gradient-gold">
              Reserve Your Stay
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience luxury hospitality at Golden Tulip Hotels. Book your perfect getaway today.
            </p>
          </div>

          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Calendar className="h-6 w-6 mr-3 text-primary" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Location Selection */}
                {showLocationDropdown && (
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center font-semibold">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      Which location would you like to book?
                    </Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => handleInputChange("location", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Golden Tulip branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            <div>
                              <div className="font-medium">{branch.name}</div>
                              <div className="text-sm text-muted-foreground">{branch.location}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Dates and Guests */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkIn">Check-in Date</Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) => handleInputChange("checkIn", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOut">Check-out Date</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => handleInputChange("checkOut", e.target.value)}
                      min={formData.checkIn}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guests" className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-primary" />
                      Guests
                    </Label>
                    <Select
                      value={formData.guests}
                      onValueChange={(value) => handleInputChange("guests", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "Guest" : "Guests"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rooms">Rooms</Label>
                    <Select
                      value={formData.rooms}
                      onValueChange={(value) => handleInputChange("rooms", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "Room" : "Rooms"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Room Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="roomType">Room Category</Label>
                  <Select
                    value={formData.roomType}
                    onValueChange={(value) => handleInputChange("roomType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          <div className="flex justify-between w-full">
                            <span>{room.name}</span>
                            <span className="text-primary font-semibold ml-4">{room.price}/night</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Guest Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Price Summary */}
                {formData.roomType && formData.checkIn && formData.checkOut && (
                  <div className="bg-accent p-6 rounded-lg border-2 border-primary/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">Total Estimated Cost</h3>
                        <p className="text-sm text-muted-foreground">
                          {Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights × {formData.rooms} {formData.rooms === "1" ? "room" : "rooms"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gradient-gold">
                          ₦{calculateTotal().toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">+ taxes & fees</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="btn-luxury w-full text-lg py-6"
                  disabled={isLoading}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {isLoading ? "Processing..." : "Complete Booking"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  By booking, you agree to our terms and conditions. We'll contact you to confirm your reservation.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};