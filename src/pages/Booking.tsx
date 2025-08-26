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
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Main Booking Form */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* Booking Details */}
                  <Card className="luxury-booking-card">
                    <CardHeader>
                      <CardTitle className="text-gradient-gold text-2xl">
                        Booking Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Location and Room Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-base font-medium flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            Select Location
                          </Label>
                          <Select value={bookingData.branch} onValueChange={(value) => setBookingData(prev => ({ ...prev, branch: value }))}>
                            <SelectTrigger className="booking-select h-12">
                              <SelectValue placeholder="Choose your preferred location" />
                            </SelectTrigger>
                            <SelectContent className="booking-dropdown">
                              {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id} className="booking-dropdown-item">
                                  <div className="flex flex-col">
                                    <span className="font-medium">{branch.name}</span>
                                    <span className="text-xs text-muted-foreground">{branch.location}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-medium flex items-center">
                            <Bed className="h-4 w-4 mr-2 text-primary" />
                            Room Type
                          </Label>
                          <Select value={bookingData.roomType} onValueChange={(value) => setBookingData(prev => ({ ...prev, roomType: value }))}>
                            <SelectTrigger className="booking-select h-12">
                              <SelectValue placeholder="Choose room type" />
                            </SelectTrigger>
                            <SelectContent className="booking-dropdown">
                              {roomTypes.map((room) => (
                                <SelectItem key={room.id} value={room.id} className="booking-dropdown-item">
                                  <div className="flex justify-between items-center w-full">
                                    <div className="flex flex-col">
                                      <span className="font-medium">{room.name}</span>
                                      <span className="text-xs text-muted-foreground">{room.features[0]}</span>
                                    </div>
                                    <span className="text-primary font-semibold text-sm">₦{room.price.toLocaleString()}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Dates and Guests */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Check-in Date */}
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Check-in Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal booking-date-input h-12",
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
                          <Label className="text-base font-medium">Check-out Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal booking-date-input h-12",
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
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-base font-medium flex items-center">
                            <Users className="h-4 w-4 mr-2 text-primary" />
                            Adults
                          </Label>
                          <Select value={bookingData.adults.toString()} onValueChange={(value) => setBookingData(prev => ({ ...prev, adults: parseInt(value) }))}>
                            <SelectTrigger className="booking-select h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="booking-dropdown">
                              {[1,2,3,4,5,6].map(num => (
                                <SelectItem key={num} value={num.toString()} className="booking-dropdown-item">
                                  {num} Adult{num > 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Children</Label>
                          <Select value={bookingData.children.toString()} onValueChange={(value) => setBookingData(prev => ({ ...prev, children: parseInt(value) }))}>
                            <SelectTrigger className="booking-select h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="booking-dropdown">
                              {[0,1,2,3,4].map(num => (
                                <SelectItem key={num} value={num.toString()} className="booking-dropdown-item">
                                  {num} {num === 1 ? 'Child' : 'Children'}
                                </SelectItem>
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
                      <CardTitle className="flex items-center text-gradient-gold text-xl">
                        <User className="h-5 w-5 mr-2" />
                        Guest Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">First Name</Label>
                          <Input
                            value={bookingData.firstName}
                            onChange={(e) => setBookingData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="booking-input h-12"
                            placeholder="Enter first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Last Name</Label>
                          <Input
                            value={bookingData.lastName}
                            onChange={(e) => setBookingData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="booking-input h-12"
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-base font-medium flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-primary" />
                            Email Address
                          </Label>
                          <Input
                            type="email"
                            value={bookingData.email}
                            onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                            className="booking-input h-12"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base font-medium flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-primary" />
                            Phone Number
                          </Label>
                          <Input
                            type="tel"
                            value={bookingData.phone}
                            onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                            className="booking-input h-12"
                            placeholder="+234 xxx xxx xxxx"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Special Requests (Optional)</Label>
                        <Textarea
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                          className="booking-input min-h-[100px]"
                          placeholder="Any special requirements or preferences..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add-ons */}
                  <Card className="luxury-booking-card">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gradient-gold text-xl">
                        <Utensils className="h-5 w-5 mr-2" />
                        Enhance Your Stay
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addOns.map((addOn) => (
                          <div key={addOn.id} className="addon-card">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={bookingData.addOns.includes(addOn.id)}
                                onCheckedChange={(checked) => handleAddOnChange(addOn.id, checked as boolean)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{addOn.name}</p>
                                <p className="text-primary font-semibold text-sm">₦{addOn.price.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Booking Summary Sidebar */}
                <div className="lg:col-span-2">
                  <div className="sticky top-24 space-y-6">
                    <Card className="luxury-booking-card">
                      <CardHeader>
                        <CardTitle className="text-gradient-gold text-xl">Booking Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {bookingData.branch && (
                          <div className="summary-item">
                            <div className="flex items-center mb-2">
                              <MapPin className="h-4 w-4 mr-2 text-primary" />
                              <span className="text-sm text-muted-foreground">Location</span>
                            </div>
                            <p className="font-medium">{branches.find(b => b.id === bookingData.branch)?.name}</p>
                          </div>
                        )}
                        
                        {bookingData.roomType && (
                          <div className="summary-item">
                            <div className="flex items-center mb-2">
                              <Bed className="h-4 w-4 mr-2 text-primary" />
                              <span className="text-sm text-muted-foreground">Room Type</span>
                            </div>
                            <p className="font-medium">{roomTypes.find(r => r.id === bookingData.roomType)?.name}</p>
                          </div>
                        )}

                        {bookingData.checkInDate && bookingData.checkOutDate && (
                          <div className="summary-item">
                            <div className="flex items-center mb-2">
                              <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                              <span className="text-sm text-muted-foreground">Stay Duration</span>
                            </div>
                            <p className="font-medium">
                              {Math.ceil((bookingData.checkOutDate.getTime() - bookingData.checkInDate.getTime()) / (1000 * 60 * 60 * 24))} nights
                            </p>
                          </div>
                        )}

                        <div className="summary-item">
                          <div className="flex items-center mb-2">
                            <Users className="h-4 w-4 mr-2 text-primary" />
                            <span className="text-sm text-muted-foreground">Guests</span>
                          </div>
                          <p className="font-medium">{bookingData.adults} Adults, {bookingData.children} Children</p>
                        </div>

                        <div className="border-t pt-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Room Rate</span>
                            <span>₦{(roomTypes.find(r => r.id === bookingData.roomType)?.price || 0).toLocaleString()}</span>
                          </div>
                          {bookingData.addOns.length > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Add-ons</span>
                              <span>₦{bookingData.addOns.reduce((total, addOnId) => {
                                const addOn = addOns.find(a => a.id === addOnId);
                                return total + (addOn ? addOn.price : 0);
                              }, 0).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-lg pt-3 border-t">
                            <span className="text-gradient-gold">Total</span>
                            <span className="text-gradient-gold">₦{calculateTotal().toLocaleString()}</span>
                          </div>
                        </div>

                        <Button className="btn-luxury w-full h-12 mt-6">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Proceed to Payment
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Trust Indicators */}
                    <Card className="luxury-booking-card">
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <div className="flex justify-center space-x-2 text-xs text-muted-foreground">
                            <span>🔒 Secure Payment</span>
                            <span>•</span>
                            <span>💯 Best Price Guarantee</span>
                          </div>
                          <div className="flex justify-center space-x-2 text-xs text-muted-foreground">
                            <span>📞 24/7 Support</span>
                            <span>•</span>
                            <span>🚫 Free Cancellation</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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