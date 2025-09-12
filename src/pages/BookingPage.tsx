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
  { id: "port-harcourt", name: "Golden Tulip GRA", location: "Government Reserved Area, Port Harcourt" },
  { id: "waterlines", name: "Golden Tulip Waterlines", location: "Waterfront, Port Harcourt" },
  { id: "airforce", name: "Golden Tulip Airforce", location: "Airforce Base Area, Port Harcourt" },
  { id: "oyigbo", name: "Golden Tulip Oyigbo", location: "Serene Retreat, Oyigbo, Rivers State" }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header activeTab="book" onTabChange={() => {}} />
      
      <main>
        {/* Hero Section with Back Button */}
        <section className="relative h-[40vh] hero-gradient overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
          
          {/* Back Button - Top Left */}
          <div className="absolute top-8 left-8 z-20">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient-gold">
                Reserve Your Golden Experience
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Create unforgettable memories at Nigeria's most luxurious hotel chain. 
                Select your preferred dates and room type to begin your extraordinary experience.
              </p>
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                  {/* Branch Selection - Variant 3: Emerald */}
                  <div className="card-luxury border-l-4 border-l-emerald-500">
                    <div className="px-8 py-6 border-b border-border/20 bg-gradient-to-r from-emerald-500/10 to-transparent">
                      <h2 className="text-2xl font-serif font-semibold text-gradient-emerald">Select Location</h2>
                      <p className="text-muted-foreground mt-1">Choose your preferred Golden Tulip location</p>
                    </div>
                    <div className="p-8 space-y-8">
                    {/* Location and Room Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-amber-900">
                          Select Location
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-600" />
                          <Select 
                            value={bookingData.branch}
                            onValueChange={(value) => setBookingData(prev => ({ ...prev, branch: value }))}
                          >
                            <SelectTrigger className="h-14 pl-12 bg-white/80 border-amber-200/50 rounded-xl hover:border-amber-400 transition-colors">
                              <SelectValue placeholder="Choose your preferred location" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl">
                              {branches.map(branch => (
                                <SelectItem key={branch.id} value={branch.id} className="py-4 px-4 hover:bg-amber-50/50">
                                  <div>
                                    <div className="font-semibold text-amber-900">{branch.name}</div>
                                    <div className="text-sm text-amber-700">{branch.location}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-amber-900">
                          Room Type
                        </Label>
                        <div className="relative">
                          <Bed className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-600" />
                          <Select 
                            value={bookingData.roomType}
                            onValueChange={(value) => setBookingData(prev => ({ ...prev, roomType: value }))}
                          >
                            <SelectTrigger className="h-14 pl-12 bg-white/80 border-amber-200/50 rounded-xl hover:border-amber-400 transition-colors">
                              <SelectValue placeholder="Select your room type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl min-w-[350px]">
                              {roomTypes.map(room => (
                                <SelectItem 
                                  key={room.id} 
                                  value={room.id}
                                  className="py-4 px-4 hover:bg-amber-50/50"
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div>
                                      <div className="font-semibold text-amber-900">{room.name}</div>
                                      <div className="text-sm text-amber-700 mt-1">{room.description}</div>
                                    </div>
                                    <div className="text-lg font-bold text-amber-600 ml-4">
                                      {formatCurrency(room.price)}
                                    </div>
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
                        <Label className="text-sm font-semibold text-amber-900">Check-in Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal h-14 bg-white/80 border-amber-200/50 rounded-xl hover:border-amber-400 transition-colors"
                            >
                              <CalendarIcon className="mr-3 h-5 w-5 text-amber-600" />
                              {bookingData.checkInDate ? (
                                format(bookingData.checkInDate, "PPP")
                              ) : (
                                <span className="text-amber-700">Select check-in date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-xl shadow-2xl" align="start">
                            <Calendar
                              mode="single"
                              selected={bookingData.checkInDate}
                              onSelect={(date) => setBookingData(prev => ({ ...prev, checkInDate: date || undefined }))}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="rounded-xl"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-amber-900">Check-out Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal h-14 bg-white/80 border-amber-200/50 rounded-xl hover:border-amber-400 transition-colors"
                              disabled={!bookingData.checkInDate}
                            >
                              <CalendarIcon className="mr-3 h-5 w-5 text-amber-600" />
                              {bookingData.checkOutDate ? (
                                format(bookingData.checkOutDate, "PPP")
                              ) : (
                                <span className="text-amber-700">Select check-out date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-xl shadow-2xl" align="start">
                            <Calendar
                              mode="single"
                              selected={bookingData.checkOutDate}
                              onSelect={(date) => setBookingData(prev => ({ ...prev, checkOutDate: date || undefined }))}
                              disabled={(date) => 
                                date <= (bookingData.checkInDate || new Date())
                              }
                              initialFocus
                              className="rounded-xl"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-amber-900 flex items-center">
                          <Users className="h-5 w-5 mr-2 text-amber-600" />
                          Adults
                        </Label>
                        <Select
                          value={bookingData.adults.toString()}
                          onValueChange={(value) => 
                            setBookingData(prev => ({ ...prev, adults: parseInt(value) }))
                          }
                        >
                          <SelectTrigger className="h-14 bg-white/80 border-amber-200/50 rounded-xl hover:border-amber-400 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl">
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <SelectItem key={num} value={num.toString()} className="py-3">
                                {num} {num === 1 ? 'Adult' : 'Adults'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-amber-900">Children</Label>
                        <Select
                          value={bookingData.children.toString()}
                          onValueChange={(value) => 
                            setBookingData(prev => ({ ...prev, children: parseInt(value) }))
                          }
                        >
                          <SelectTrigger className="h-14 bg-white/80 border-amber-200/50 rounded-xl hover:border-amber-400 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl">
                            {[0, 1, 2, 3, 4].map(num => (
                              <SelectItem key={num} value={num.toString()} className="py-3">
                                {num} {num === 1 ? 'Child' : 'Children'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information - Variant 4: Violet */}
              <div className="card-luxury border-l-4 border-l-violet-500">
                <div className="px-8 py-6 border-b border-border/20 bg-gradient-to-r from-violet-500/10 to-transparent">
                  <h2 className="text-2xl font-serif font-semibold text-gradient-violet">Personal Information</h2>
                  <p className="text-muted-foreground mt-1">We need some details to complete your reservation</p>
                </div>
                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-amber-900">First Name</Label>
                          <Input 
                            type="text" 
                            value={bookingData.firstName}
                            onChange={(e) => setBookingData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="h-14 bg-white/80 border-amber-200/50 rounded-xl hover:border-amber-400 transition-colors focus:ring-amber-500"
                            placeholder="Enter your first name"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-amber-900">Last Name</Label>
                          <Input 
                            type="text" 
                            value={bookingData.lastName}
                            onChange={(e) => setBookingData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="h-14 bg-white/80 border-amber-200/50 rounded-xl hover:border-amber-400 transition-colors focus:ring-amber-500"
                            placeholder="Enter your last name"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-amber-900">Email Address</Label>
                          <Input 
                            type="email" 
                            value={bookingData.email}
                            onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                            className="h-14 bg-white/80 border-amber-200/50 rounded-xl hover:border-amber-400 transition-colors focus:ring-amber-500"
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-amber-900">Phone Number</Label>
                          <Input 
                            type="tel" 
                            value={bookingData.phone}
                            onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                            className="h-14 bg-white/80 border-amber-200/50 rounded-xl hover:border-amber-400 transition-colors focus:ring-amber-500"
                            placeholder="+234 XXX XXX XXXX"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mt-8 space-y-2">
                        <Label className="text-sm font-semibold text-amber-900">Special Requests (Optional)</Label>
                        <textarea
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                          rows={4}
                          placeholder="Tell us about any special requirements, dietary restrictions, or preferences..."
                          className="w-full rounded-xl border-amber-200/50 bg-white/80 px-4 py-3 text-sm placeholder:text-amber-600/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-400 transition-all"
                        />
                      </div>
                    </div>
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Booking Summary - Variant 3: Emerald */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border-l-4 border-l-emerald-500 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500/10 to-transparent px-8 py-6 border-b border-white/20">
                  <h3 className="text-xl font-serif font-bold text-emerald-900">Booking Summary</h3>
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700">Check-in:</span>
                    <span className="font-medium text-amber-900">{bookingData.checkInDate ? format(bookingData.checkInDate, "MMM dd, yyyy") : "Not selected"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700">Check-out:</span>
                    <span className="font-medium text-amber-900">{bookingData.checkOutDate ? format(bookingData.checkOutDate, "MMM dd, yyyy") : "Not selected"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700">Guests:</span>
                    <span className="font-medium text-amber-900">
                      {bookingData.adults} Adult{bookingData.adults !== 1 ? 's' : ''}
                      {bookingData.children > 0 && `, ${bookingData.children} Child${bookingData.children !== 1 ? 'ren' : ''}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700">Location:</span>
                    <span className="font-medium text-amber-900">{branches.find(b => b.id === bookingData.branch)?.name || "Not selected"}</span>
                  </div>
                  {bookingData.roomType && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-700">Room Type:</span>
                      <span className="font-medium text-amber-900">{getSelectedRoom()?.name}</span>
                    </div>
                  )}
                  {bookingData.checkInDate && bookingData.checkOutDate && (
                    <div className="pt-4 border-t border-white/20">
                      <div className="flex justify-between items-center font-semibold">
                        <span className="text-amber-900">Total Nights:</span>
                        <span className="text-amber-900">{Math.ceil((bookingData.checkOutDate.getTime() - bookingData.checkInDate.getTime()) / (1000 * 60 * 60 * 24))}</span>
                      </div>
                      {bookingData.roomType && (
                        <div className="flex justify-between items-center font-bold text-lg mt-2">
                          <span className="text-gradient-gold">Total Price:</span>
                          <span className="text-gradient-gold">{formatCurrency(calculateTotal())}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Security Badges - Variant 4: Violet */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border-l-4 border-l-violet-500 overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <span className="text-sm text-amber-700">Secure Payment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="text-sm text-amber-700">Free Cancellation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Headphones className="h-5 w-5 text-amber-600" />
                    <span className="text-sm text-amber-700">24/7 Support</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!bookingData.branch || !bookingData.checkInDate || !bookingData.checkOutDate || !bookingData.roomType || !bookingData.firstName || !bookingData.lastName || !bookingData.email}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Secure Payment
              </Button>
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
