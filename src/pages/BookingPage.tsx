import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Users, Bed, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/types/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Extend UserProfile type with additional properties for the booking form
type ExtendedUserProfile = UserProfile & {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  uid?: string;
};

// Types
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
}

// Mock Data
const branches = [
  { id: "main", name: "GRA Head Branch", location: "Government Reserved Area" },
  { id: "waterlines", name: "Waterlines Branch", location: "Port Harcourt" },
  { id: "airforce", name: "Airforce Base", location: "Port Harcourt" },
  { id: "oyigbo", name: "Oyigbo Branch", location: "Rivers State" }
];

const roomTypes = [
  { 
    id: "standard", 
    name: "Standard Room", 
    price: 45000, 
    description: "Comfortable and cozy room with all basic amenities" 
  },
  { 
    id: "deluxe", 
    name: "Deluxe Room", 
    price: 65000, 
    description: "Spacious room with premium amenities and city view" 
  },
  { 
    id: "suite", 
    name: "Executive Suite", 
    price: 95000, 
    description: "Luxurious suite with separate living area" 
  },
  { 
    id: "presidential", 
    name: "Presidential Suite", 
    price: 150000, 
    description: "Ultimate luxury with premium services and amenities" 
  }
];

const BookingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth() as { currentUser: ExtendedUserProfile | null };
  
  // Pre-fill user data if available
  const [bookingData, setBookingData] = useState<BookingFormData>({
    branch: "",
    checkInDate: undefined,
    checkOutDate: undefined,
    roomType: "",
    adults: 1,
    children: 0,
    firstName: currentUser?.displayName?.split(' ')[0] || "",
    lastName: currentUser?.displayName?.split(' ').slice(1).join(' ') || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    specialRequests: ""
  });

  // Auto-populate guest info from Firestore when user is available
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (!currentUser?.id) return;
        
        // Set initial data from currentUser
        setBookingData(prev => ({
          ...prev,
          firstName: currentUser.displayName?.split(' ')[0] || prev.firstName,
          lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || prev.lastName,
          email: currentUser.email || prev.email,
          phone: currentUser.phone || currentUser.phoneNumber || prev.phone,
        }));
        
        // Try to get additional data from Firestore
        try {
          const userRef = doc(db, 'users', currentUser.id);
          const snap = await getDoc(userRef);
          
          if (snap.exists()) {
            const userData = snap.data();
            const fullName = userData?.name || currentUser.displayName || '';
            const [firstName, ...rest] = fullName.split(' ').filter(Boolean);
            const lastName = rest.join(' ');
            
            setBookingData(prev => ({
              ...prev,
              firstName: firstName || prev.firstName,
              lastName: lastName || prev.lastName,
              email: userData?.email || currentUser.email || prev.email,
              phone: userData?.phone || currentUser.phone || currentUser.phoneNumber || prev.phone,
              specialRequests: userData?.preferences?.specialRequests || prev.specialRequests,
            }));
          }
        } catch (firestoreError) {
          console.warn('Error loading additional user data from Firestore:', firestoreError);
          // Continue with the data we have from currentUser
        }
      } catch (e) {
        console.error('Failed to load user profile:', e);
      }
    };
    
    if (currentUser) {
      loadUserProfile();
    }
  }, [currentUser?.id]);

  // Calculate total price
  const calculateTotal = (): number => {
    const room = roomTypes.find(r => r.id === bookingData.roomType);
    if (!room || !bookingData.checkInDate || !bookingData.checkOutDate) return 0;
    
    const nights = Math.ceil(
      (bookingData.checkOutDate.getTime() - bookingData.checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return room.price * nights;
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get selected room details
  const getSelectedRoom = () => {
    return roomTypes.find(r => r.id === bookingData.roomType);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking submitted:", bookingData);
    // TODO: Implement booking submission
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab="book" onTabChange={() => {}} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-black via-black/90 to-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient-gold">
                Reserve Your Golden Experience
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Book your stay at Nigeria's most luxurious hotel chain and create unforgettable memories.
              </p>
              
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="mt-8 text-primary hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Booking Details */}
                  <div className="luxury-booking-card">
                    <div className="p-6 pb-0">
                      <h2 className="text-gradient-gold text-2xl">Booking Details</h2>
                    </div>
                    <div className="p-6 space-y-6">
                    {/* Location and Room Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Select Location
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Select 
                            value={bookingData.branch}
                            onValueChange={(value) => setBookingData(prev => ({ ...prev, branch: value }))}
                          >
                            <SelectTrigger className="booking-select h-12 pl-10">
                              <SelectValue placeholder="Choose location" />
                            </SelectTrigger>
                            <SelectContent className="booking-dropdown">
                              {branches.map(branch => (
                                <SelectItem key={branch.id} value={branch.id}>
                                  <div>
                                    <div className="font-medium">{branch.name}</div>
                                    <div className="text-xs text-muted-foreground">{branch.location}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Room Type
                        </Label>
                        <div className="relative">
                          <Bed className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Select 
                            value={bookingData.roomType}
                            onValueChange={(value) => setBookingData(prev => ({ ...prev, roomType: value }))}
                          >
                            <SelectTrigger className="h-12 pl-10">
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent className="booking-dropdown min-w-[300px]">
                              {roomTypes.map(room => (
                                <SelectItem 
                                  key={room.id} 
                                  value={room.id}
                                  className="px-4 py-3"
                                >
                                  <div className="flex flex-col w-full">
                                    <div className="flex justify-between items-center w-full">
                                      <span className="font-medium flex-1">{room.name}</span>
                                      <span className="text-primary font-semibold whitespace-nowrap pl-4">
                                        {formatCurrency(room.price)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {room.description}
                                    </p>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Check-in Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal booking-date-input h-12"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {bookingData.checkInDate ? (
                                format(bookingData.checkInDate, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={bookingData.checkInDate}
                              onSelect={(date) => setBookingData(prev => ({ ...prev, checkInDate: date || undefined }))}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>Check-out Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal booking-date-input h-12"
                              disabled={!bookingData.checkInDate}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {bookingData.checkOutDate ? (
                                format(bookingData.checkOutDate, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={bookingData.checkOutDate}
                              onSelect={(date) => setBookingData(prev => ({ ...prev, checkOutDate: date || undefined }))}
                              disabled={(date) => 
                                date <= (bookingData.checkInDate || new Date())
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-amber-600" />
                          Adults
                        </Label>
                        <Select
                          value={bookingData.adults.toString()}
                          onValueChange={(value) => 
                            setBookingData(prev => ({ ...prev, adults: parseInt(value) }))
                          }
                        >
                          <SelectTrigger className="booking-select h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'Adult' : 'Adults'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Children</Label>
                        <Select
                          value={bookingData.children.toString()}
                          onValueChange={(value) => 
                            setBookingData(prev => ({ ...prev, children: parseInt(value) }))
                          }
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'Child' : 'Children'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Guest Information */}
                  <div className="luxury-booking-card">
                    <div className="p-6 pb-0">
                      <h3 className="flex items-center text-gradient-gold text-xl">
                        <User className="h-5 w-5 mr-2" />
                        Guest Information
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <User className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="text-lg font-semibold">
                          Guest Information
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                          <Input 
                            type="text" 
                            value={bookingData.firstName}
                            onChange={(e) => setBookingData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="h-12"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                          <Input 
                            type="text" 
                            value={bookingData.lastName}
                            onChange={(e) => setBookingData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="h-12"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                          <Input 
                            type="email" 
                            value={bookingData.email}
                            onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                            className="h-12"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                          <Input 
                            type="tel" 
                            value={bookingData.phone}
                            onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                            className="h-12"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Special Requests (Optional)</Label>
                        <div className="relative">
                          <textarea
                            value={bookingData.specialRequests}
                            onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                            rows={4}
                            placeholder="Any special requirements or requests?"
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="sticky top-24 space-y-6">
                    <div className="luxury-booking-card">
                      <div className="p-6 pb-0">
                        <h3 className="text-gradient-gold text-xl">Booking Summary</h3>
                      </div>
                      <div className="p-6 space-y-4">
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
                            <span>{formatCurrency(roomTypes.find(r => r.id === bookingData.roomType)?.price || 0)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg pt-3 border-t">
                            <span className="text-gradient-gold">Total</span>
                            <span className="text-gradient-gold">{formatCurrency(calculateTotal())}</span>
                          </div>
                          <Button
                            type="button"
                            className="btn-luxury w-full h-12 mt-6"
                            disabled={!bookingData.branch || !bookingData.roomType || !bookingData.checkInDate || !bookingData.checkOutDate || !bookingData.firstName || !bookingData.lastName || !bookingData.email || !bookingData.phone}
                            onClick={() => {
                              console.log('Proceed to Payment clicked', bookingData);
                            }}
                          >
                            Proceed to Payment
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="luxury-booking-card">
                      <div className="p-4">
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
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 text-green-500">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-2 text-sm text-muted-foreground">
                          Free cancellation until 24 hours before check-in
                        </p>
                      </div>
                    </div>
                  </div>
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

export default BookingPage;
