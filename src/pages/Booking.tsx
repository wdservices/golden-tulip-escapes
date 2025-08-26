import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Users, Bed, Utensils, Waves, Car, CreditCard, Phone, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import luxurySuite from "@/assets/luxury-suite.jpg";
import hotelExterior from "@/assets/hotel-exterior.jpg";

interface BookingFormData {
  branch: string;
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  roomType: string;
  adults: number;
  children: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
  addOns: string[];
}

const Booking = () => {
  const [bookingData, setBookingData] = useState<BookingFormData>({
    branch: "",
    checkInDate: undefined,
    checkOutDate: undefined,
    roomType: "",
    adults: 1,
    children: 0,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    addOns: []
  });

  const branches = [
    { id: "main", name: "GRA Head Branch", location: "Government Reserved Area", image: hotelExterior },
    { id: "waterlines", name: "Waterlines Branch", location: "Port Harcourt Waterfront", image: luxurySuite },
    { id: "airforce", name: "Airforce Base", location: "Port Harcourt", image: hotelExterior },
    { id: "oyigbo", name: "Oyigbo Branch", location: "Rivers State", image: luxurySuite }
  ];

  const roomTypes = [
    {
      id: "standard",
      name: "Standard Room",
      price: 45000,
      features: ["Queen-size bed", "City view", "Free Wi-Fi", "Air conditioning"],
      image: luxurySuite
    },
    {
      id: "deluxe",
      name: "Deluxe Room",
      price: 65000,
      features: ["King-size bed", "Premium view", "Mini bar", "Work desk"],
      image: luxurySuite
    },
    {
      id: "executive",
      name: "Executive Suite",
      price: 95000,
      features: ["Separate living area", "Premium amenities", "Concierge service", "Executive lounge access"],
      image: luxurySuite
    },
    {
      id: "presidential",
      name: "Presidential Suite",
      price: 150000,
      features: ["Luxury living space", "Personal butler", "Premium dining", "Private balcony"],
      image: luxurySuite
    }
  ];

  const addOns = [
    { id: "breakfast", name: "Continental Breakfast", price: 8500 },
    { id: "spa", name: "Spa Package", price: 35000 },
    { id: "airport", name: "Airport Transfer", price: 15000 },
    { id: "laundry", name: "Laundry Service", price: 5000 },
    { id: "gym", name: "Premium Gym Access", price: 3000 }
  ];

  const calculateTotal = () => {
    const selectedRoom = roomTypes.find(room => room.id === bookingData.roomType);
    const roomPrice = selectedRoom ? selectedRoom.price : 0;
    const addOnPrice = bookingData.addOns.reduce((total, addOnId) => {
      const addOn = addOns.find(a => a.id === addOnId);
      return total + (addOn ? addOn.price : 0);
    }, 0);
    
    const nights = bookingData.checkInDate && bookingData.checkOutDate 
      ? Math.ceil((bookingData.checkOutDate.getTime() - bookingData.checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      : 1;
    
    return (roomPrice * nights) + addOnPrice;
  };

  const handleAddOnChange = (addOnId: string, checked: boolean) => {
    if (checked) {
      setBookingData(prev => ({
        ...prev,
        addOns: [...prev.addOns, addOnId]
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        addOns: prev.addOns.filter(id => id !== addOnId)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab="" onTabChange={() => {}} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-black via-black/90 to-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-gradient-gold">
                Reserve Your Golden Experience
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Book your stay at Nigeria's most luxurious hotel chain and create unforgettable memories
              </p>
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Booking Form */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Branch Selection */}
                  <Card className="luxury-booking-card">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gradient-gold">
                        <MapPin className="h-5 w-5 mr-2" />
                        Select Your Preferred Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {branches.map((branch) => (
                          <div
                            key={branch.id}
                            onClick={() => setBookingData(prev => ({ ...prev, branch: branch.id }))}
                            className={`branch-selection-card cursor-pointer group ${
                              bookingData.branch === branch.id ? 'branch-selected' : ''
                            }`}
                          >
                            <div className="relative overflow-hidden rounded-lg h-32">
                              <img
                                src={branch.image}
                                alt={branch.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="font-semibold text-white text-sm">{branch.name}</h3>
                                <p className="text-white/80 text-xs">{branch.location}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Room Selection */}
                  <Card className="luxury-booking-card">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gradient-gold">
                        <Bed className="h-5 w-5 mr-2" />
                        Choose Your Room
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {roomTypes.map((room) => (
                          <div
                            key={room.id}
                            onClick={() => setBookingData(prev => ({ ...prev, roomType: room.id }))}
                            className={`room-selection-card cursor-pointer group ${
                              bookingData.roomType === room.id ? 'room-selected' : ''
                            }`}
                          >
                            <div className="relative overflow-hidden rounded-lg h-32 mb-3">
                              <img
                                src={room.image}
                                alt={room.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                                ₦{room.price.toLocaleString()}/night
                              </div>
                            </div>
                            <h3 className="font-semibold mb-2">{room.name}</h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {room.features.slice(0, 2).map((feature, idx) => (
                                <li key={idx} className="flex items-center">
                                  <div className="w-1 h-1 rounded-full bg-primary mr-2"></div>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dates and Guests */}
                  <Card className="luxury-booking-card">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gradient-gold">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        Select Dates & Guests
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Check-in Date */}
                        <div className="space-y-2">
                          <Label>Check-in Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal booking-date-input",
                                  !bookingData.checkInDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {bookingData.checkInDate ? format(bookingData.checkInDate, "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={bookingData.checkInDate}
                                onSelect={(date) => setBookingData(prev => ({ ...prev, checkInDate: date }))}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
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
                                  "w-full justify-start text-left font-normal booking-date-input",
                                  !bookingData.checkOutDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {bookingData.checkOutDate ? format(bookingData.checkOutDate, "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={bookingData.checkOutDate}
                                onSelect={(date) => setBookingData(prev => ({ ...prev, checkOutDate: date }))}
                                disabled={(date) => date <= (bookingData.checkInDate || new Date())}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Guests */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Adults</Label>
                          <Select value={bookingData.adults.toString()} onValueChange={(value) => setBookingData(prev => ({ ...prev, adults: parseInt(value) }))}>
                            <SelectTrigger className="booking-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1,2,3,4,5,6].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num} Adult{num > 1 ? 's' : ''}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Children</Label>
                          <Select value={bookingData.children.toString()} onValueChange={(value) => setBookingData(prev => ({ ...prev, children: parseInt(value) }))}>
                            <SelectTrigger className="booking-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[0,1,2,3,4].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Child' : 'Children'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Guest Information */}
                  <Card className="luxury-booking-card">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gradient-gold">
                        <User className="h-5 w-5 mr-2" />
                        Guest Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input
                            value={bookingData.firstName}
                            onChange={(e) => setBookingData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="booking-input"
                            placeholder="Enter first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input
                            value={bookingData.lastName}
                            onChange={(e) => setBookingData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="booking-input"
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <Input
                            type="email"
                            value={bookingData.email}
                            onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                            className="booking-input"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <Input
                            type="tel"
                            value={bookingData.phone}
                            onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                            className="booking-input"
                            placeholder="+234 xxx xxx xxxx"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Special Requests (Optional)</Label>
                        <Textarea
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                          className="booking-input"
                          placeholder="Any special requirements or preferences..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add-ons */}
                  <Card className="luxury-booking-card">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gradient-gold">
                        <Utensils className="h-5 w-5 mr-2" />
                        Enhance Your Stay
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {addOns.map((addOn) => (
                          <div key={addOn.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={bookingData.addOns.includes(addOn.id)}
                                onCheckedChange={(checked) => handleAddOnChange(addOn.id, checked as boolean)}
                              />
                              <div>
                                <p className="font-medium">{addOn.name}</p>
                                <p className="text-sm text-muted-foreground">₦{addOn.price.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Booking Summary Sidebar */}
                <div className="lg:col-span-1">
                  <Card className="luxury-booking-card sticky top-24">
                    <CardHeader>
                      <CardTitle className="text-gradient-gold">Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {bookingData.branch && (
                        <div className="p-3 rounded-lg bg-muted/20">
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{branches.find(b => b.id === bookingData.branch)?.name}</p>
                        </div>
                      )}
                      
                      {bookingData.roomType && (
                        <div className="p-3 rounded-lg bg-muted/20">
                          <p className="text-sm text-muted-foreground">Room Type</p>
                          <p className="font-medium">{roomTypes.find(r => r.id === bookingData.roomType)?.name}</p>
                        </div>
                      )}

                      {bookingData.checkInDate && bookingData.checkOutDate && (
                        <div className="p-3 rounded-lg bg-muted/20">
                          <p className="text-sm text-muted-foreground">Stay Duration</p>
                          <p className="font-medium">
                            {Math.ceil((bookingData.checkOutDate.getTime() - bookingData.checkInDate.getTime()) / (1000 * 60 * 60 * 24))} nights
                          </p>
                        </div>
                      )}

                      <div className="p-3 rounded-lg bg-muted/20">
                        <p className="text-sm text-muted-foreground">Guests</p>
                        <p className="font-medium">{bookingData.adults} Adults, {bookingData.children} Children</p>
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Room Rate</span>
                          <span>₦{(roomTypes.find(r => r.id === bookingData.roomType)?.price || 0).toLocaleString()}</span>
                        </div>
                        {bookingData.addOns.length > 0 && (
                          <div className="flex justify-between">
                            <span>Add-ons</span>
                            <span>₦{bookingData.addOns.reduce((total, addOnId) => {
                              const addOn = addOns.find(a => a.id === addOnId);
                              return total + (addOn ? addOn.price : 0);
                            }, 0).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span className="text-gradient-gold">Total</span>
                          <span className="text-gradient-gold">₦{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>

                      <Button className="btn-luxury w-full mt-6">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Proceed to Payment
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;