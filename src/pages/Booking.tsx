import { useState, useEffect } from "react";
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
import { CalendarIcon, MapPin, Users, Bed, Utensils, Waves, Car, CreditCard, Phone, Mail, User, UserPlus, Check, Star, Shield, Award, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
// Remove Header import
// import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import luxurySuite from "@/assets/luxury-suite.jpg";
import hotelExterior from "@/assets/hotel-exterior.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { useBranches } from "@/hooks/useBranches";
import { getDatabaseBranchId } from "@/config/branchMappings";
import { Loader2 } from "lucide-react";

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
  bookForClient: boolean;
  clientEmail?: string;
  clientName?: string;
}

const Booking = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { branches: dbBranches, isLoading: branchesLoading, error: branchesError } = useBranches();

  // Check if user is admin on component mount
  useEffect(() => {
    if (currentUser) {
      setIsAdmin(currentUser.role === 'admin');
    }
  }, [currentUser]);

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
    addOns: [],
    bookForClient: false,
    clientEmail: "",
    clientName: ""
  });

  // Map database branches to include default images
  const branches = dbBranches.map((branch, index) => ({
    ...branch,
    image: index % 2 === 0 ? hotelExterior : luxurySuite
  }));

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

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!bookingData.branch || !bookingData.roomType || !bookingData.checkInDate || !bookingData.checkOutDate) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (bookingData.bookForClient && !bookingData.clientEmail) {
      toast({
        title: "Client email required",
        description: "Please enter the client's email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // If booking for a client, find their user ID
      let userId = currentUser?.uid;
      let guestEmail = bookingData.email;
      let guestName = `${bookingData.firstName} ${bookingData.lastName}`;

      if (bookingData.bookForClient && bookingData.clientEmail) {
        // Search for the client by email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', bookingData.clientEmail.toLowerCase().trim()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Client exists, use their ID
          userId = querySnapshot.docs[0].id;
          guestEmail = querySnapshot.docs[0].data().email;
          guestName = querySnapshot.docs[0].data().name || bookingData.clientName || 'Guest';
        } else if (bookingData.clientEmail) {
          // Client doesn't exist, create a guest booking
          guestEmail = bookingData.clientEmail;
          guestName = bookingData.clientName || 'Guest';
          userId = 'guest'; // Or generate a guest ID
        }
      }

      const bookingRef = collection(db, 'branches', getDatabaseBranchId(bookingData.branch), 'bookings');
      const newBooking = {
        userId: userId || 'guest',
        branchId: bookingData.branch,
        branchName: branches.find(b => b.id === bookingData.branch)?.name || '',
        roomType: bookingData.roomType,
        roomNumber: '', // Will be assigned at check-in
        checkInDate: Timestamp.fromDate(bookingData.checkInDate),
        checkOutDate: Timestamp.fromDate(bookingData.checkOutDate),
        status: 'confirmed' as const,
        paymentStatus: 'pending' as const,
        totalAmount: calculateTotal(),
        bookingDate: Timestamp.fromDate(new Date()),
        guests: bookingData.adults + bookingData.children,
        adults: bookingData.adults,
        children: bookingData.children,
        specialRequests: bookingData.specialRequests,
        guestName,
        guestEmail,
        guestPhone: bookingData.phone,
        createdBy: currentUser?.uid || 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        addOns: bookingData.addOns,
        roomCharge: roomTypes.find(r => r.id === bookingData.roomType)?.price || 0,
        serviceCharge: bookingData.addOns.reduce((total, addOnId) => {
          const addOn = addOns.find(a => a.id === addOnId);
          return total + (addOn ? addOn.price : 0);
        }, 0),
        tax: 0, // Calculate tax based on your business logic
        discount: 0, // Apply any discounts
        source: 'website',
        marketSegment: 'leisure',
        rateCode: 'BAR', // Best Available Rate
        nights: bookingData.checkInDate && bookingData.checkOutDate
          ? Math.ceil((bookingData.checkOutDate.getTime() - bookingData.checkInDate.getTime()) / (1000 * 60 * 60 * 24))
          : 1
      };

      await addDoc(bookingRef, newBooking);

      toast({
        title: "Booking Confirmed!",
        description: `Your booking has been successfully created${bookingData.bookForClient ? ' for the client' : ''}.`,
      });

      // Redirect to bookings page or show success message
      navigate('/bookings');

    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookForClientChange = (checked: boolean) => {
    setBookingData(prev => ({
      ...prev,
      bookForClient: checked,
      // Clear client fields when toggling off
      clientEmail: checked ? prev.clientEmail : "",
      clientName: checked ? prev.clientName : ""
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Remove Header component */}
      {/* <Header activeTab="booking" onTabChange={() => {}} /> */}

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Luxury Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-serif font-bold text-gradient-gold mb-4">
              Book Your Luxury Stay
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience unparalleled elegance and world-class hospitality at Golden Tulip Port Harcourt
            </p>
          </div>

          <form onSubmit={handleSubmitBooking}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Booking Form */}
              <div className="lg:col-span-2 space-y-6">
              <Card className="card-luxury border-l-4 border-l-amber-500 shadow-glow">
                <CardHeader className="border-b border-amber-500/20">
                  <CardTitle className="text-3xl font-serif text-gradient-gold">
                    Reservation Details
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Customize your perfect stay with our premium accommodations
                  </p>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  {/* Branch Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gradient-gold mb-4 block">
                      Select Your Preferred Branch
                    </Label>
                    {branchesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                        <span className="ml-2 text-muted-foreground">Loading branches...</span>
                      </div>
                    ) : branchesError ? (
                      <div className="text-center py-12">
                        <p className="text-red-500 mb-4">Error loading branches: {branchesError}</p>
                        <Button 
                          variant="outline" 
                          onClick={() => window.location.reload()}
                          className="text-amber-600 border-amber-600 hover:bg-amber-50"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : branches.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No branches available at the moment.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {branches.map((branch) => (
                          <div
                            key={branch.id}
                            className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                              bookingData.branch === branch.id
                                ? 'border-amber-500 bg-gradient-to-br from-amber-500/10 to-amber-600/10 shadow-lg shadow-amber-500/20'
                                : 'border-border/50 bg-card/50 hover:border-amber-400/50 hover:shadow-md'
                            }`}
                            onClick={() => setBookingData(prev => ({ ...prev, branch: branch.id }))}
                          >
                            <img
                              src={branch.image}
                              alt={branch.name}
                              className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                            <h3 className="font-semibold text-primary text-lg">{branch.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-amber-500" />
                              {branch.location}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                      {/* Room Type Selection */}
                  <div className="space-y-6">
                    <Label className="text-2xl font-serif font-semibold text-gradient-gold mb-6 block">
                      Select Your Luxury Room
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {roomTypes.map((room) => (
                        <div
                          key={room.id}
                          className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-500 ${
                            bookingData.roomType === room.id
                              ? 'border-amber-500 bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-amber-700/5 shadow-2xl shadow-amber-500/30 transform scale-105'
                              : 'border-border/30 bg-gradient-to-br from-card/60 to-card/40 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10'
                          }`}
                          onClick={() => setBookingData(prev => ({ ...prev, roomType: room.id }))}
                        >
                          <div className="relative overflow-hidden rounded-xl mb-4">
                            <img
                              src={room.image}
                              alt={room.name}
                              className="w-full h-48 object-cover rounded-xl transition-transform duration-500 hover:scale-110"
                            />
                            {bookingData.roomType === room.id && (
                              <div className="absolute top-3 right-3 bg-amber-500 text-white p-2 rounded-full">
                                <Check className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-serif font-bold text-2xl text-primary mb-2">{room.name}</h3>
                          <p className="text-3xl font-bold text-gradient-gold mb-4">₦{room.price.toLocaleString()}/night</p>
                          <div className="space-y-2">
                            {room.features.map((feature, index) => (
                              <div key={index} className="flex items-center text-muted-foreground">
                                <Star className="w-4 h-4 mr-2 text-amber-500" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
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
                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-6">
                    <Card className="card-luxury border-l-4 border-l-amber-500 shadow-glow">
                      <CardHeader className="border-b border-amber-500/20">
                        <CardTitle className="text-2xl font-serif text-gradient-gold">
                          Booking Summary
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your luxury reservation details
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-6 p-6">
                        {bookingData.branch && (
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <MapPin className="h-5 w-5 mr-3 text-amber-500" />
                              <span className="text-sm font-semibold text-gradient-gold">Location</span>
                            </div>
                            <p className="font-medium text-primary ml-8">{branches.find(b => b.id === bookingData.branch)?.name}</p>
                          </div>
                        )}

                        {bookingData.roomType && (
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <Bed className="h-5 w-5 mr-3 text-amber-500" />
                              <span className="text-sm font-semibold text-gradient-gold">Room Type</span>
                            </div>
                            <p className="font-medium text-primary ml-8">{roomTypes.find(r => r.id === bookingData.roomType)?.name}</p>
                          </div>
                        )}

                        {bookingData.checkInDate && bookingData.checkOutDate && (
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <CalendarIcon className="h-5 w-5 mr-3 text-amber-500" />
                              <span className="text-sm font-semibold text-gradient-gold">Stay Duration</span>
                            </div>
                            <p className="font-medium text-primary ml-8">
                              {Math.ceil((bookingData.checkOutDate.getTime() - bookingData.checkInDate.getTime()) / (1000 * 60 * 60 * 24))} nights
                            </p>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 mr-3 text-amber-500" />
                            <span className="text-sm font-semibold text-gradient-gold">Guests</span>
                          </div>
                          <p className="font-medium text-primary ml-8">
                            {bookingData.adults} {bookingData.adults === 1 ? 'Adult' : 'Adults'}
                            {bookingData.children > 0 && `, ${bookingData.children} ${bookingData.children === 1 ? 'Child' : 'Children'}`}
                          </p>
                        </div>

                        <div className="border-t border-amber-500/20 pt-6 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Room Rate</span>
                            <span className="font-semibold">₦{(roomTypes.find(r => r.id === bookingData.roomType)?.price || 0).toLocaleString()}</span>
                          </div>
                          {bookingData.addOns.length > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Add-ons</span>
                              <span className="font-semibold">₦{bookingData.addOns.reduce((total, addOnId) => {
                                const addOn = addOns.find(a => a.id === addOnId);
                                return total + (addOn ? addOn.price : 0);
                              }, 0).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center border-t border-amber-500/20 pt-4">
                            <span className="text-lg font-serif font-bold text-gradient-gold">Total</span>
                            <span className="text-2xl font-bold text-gradient-gold">₦{calculateTotal().toLocaleString()}</span>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="space-y-4 mt-4 border-t pt-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="bookForClient"
                                checked={bookingData.bookForClient}
                                onCheckedChange={(checked: boolean) => handleBookForClientChange(checked)}
                              />
                              <Label htmlFor="bookForClient" className="text-sm font-medium">
                                Book for a client
                              </Label>
                            </div>

                            {bookingData.bookForClient && (
                              <div className="space-y-4 pl-6">
                                <div className="space-y-2">
                                  <Label htmlFor="clientName" className="text-sm">Client Name</Label>
                                  <Input
                                    id="clientName"
                                    placeholder="Client's full name"
                                    value={bookingData.clientName}
                                    onChange={(e) => setBookingData(prev => ({ ...prev, clientName: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="clientEmail" className="text-sm">Client Email <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="clientEmail"
                                    type="email"
                                    placeholder="client@example.com"
                                    value={bookingData.clientEmail}
                                    onChange={(e) => setBookingData(prev => ({ ...prev, clientEmail: e.target.value }))}
                                    required={bookingData.bookForClient}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <Button
                          type="submit"
                          className="btn-luxury w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                              Processing Your Reservation...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-5 w-5 mr-2" />
                              {bookingData.bookForClient ? 'Book for Client' : 'Secure Your Luxury Stay'}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Trust Indicators */}
                    <Card className="card-luxury bg-gradient-to-br from-amber-500/5 to-amber-600/5 border-amber-500/20">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <div className="flex justify-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2 text-amber-600">
                              <Shield className="w-5 h-5" />
                              <span className="font-semibold">Secure Payment</span>
                            </div>
                            <div className="flex items-center space-x-2 text-amber-600">
                              <Award className="w-5 h-5" />
                              <span className="font-semibold">Best Price</span>
                            </div>
                          </div>
                          <div className="flex justify-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2 text-amber-600">
                              <Phone className="w-5 h-5" />
                              <span className="font-semibold">24/7 Support</span>
                            </div>
                            <div className="flex items-center space-x-2 text-amber-600">
                              <RefreshCw className="w-5 h-5" />
                              <span className="font-semibold">Free Cancellation</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>

      <Footer />
    </div>
  );
};

export default Booking;