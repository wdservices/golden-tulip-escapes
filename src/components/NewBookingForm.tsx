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
import { PaystackPaymentModal } from "@/components/payment/PaystackPaymentModal";
import { useBookingAvailability } from "@/hooks/useBookingAvailability";
import { runAutoEnableSweep, getForBranch } from "@/services/bookingAvailabilityService";
import { BookingDisabledNotice } from "@/components/booking/BookingDisabledNotice";


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
  price: number;
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const isPresidentialRoom = (roomId: string) => {
    const selectedRoom = roomTypes.find(room => room.id === roomId);
    const roomName = selectedRoom?.name || "";
    return roomId.toLowerCase().includes("presidential") || roomName.toLowerCase().includes("presidential");
  };

  const maxAdults = 2;
  const maxChildren = isPresidentialRoom(formData.roomType) ? 2 : 1;

  const calculateTotal = (): number => {
    const selectedRoom = roomTypes.find(room => room.id === formData.roomType);
    if (!selectedRoom || !formData.checkIn || !formData.checkOut) return 0;

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const pricePerNight = selectedRoom.price;
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    return pricePerNight * (nights || 1);
  };

  const totalPrice = calculateTotal();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

     // Require authentication for booking to satisfy Firestore rules
     if (!isAuthenticated || !currentUser) {
       toast({
         title: "Sign in required",
         description: "Please sign in to complete your booking.",
         variant: "destructive",
       });
       navigate('/auth');
       return;
     }

     // Validate required fields
     if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
       toast({
         title: "Missing Information",
         description: "Please fill in all required fields.",
         variant: "destructive",
       });
       return;
     }

     // Open Paystack payment modal
     setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative py-16 px-4">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-yellow-400 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Reserve Your Room
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 ml-3" />
          </div>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Create your perfect stay at Golden Tulip Hotels. Experience luxury redefined.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md border-white/20 border rounded-lg shadow-xl p-8">
              <div className="flex items-center mb-8">
                <Calendar className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">New Reservation</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Guest Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <User className="w-5 h-5 text-yellow-400 mr-2" />
                    Guest Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-white">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-white/90 border-white/30 text-black placeholder:text-gray-500 focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-white">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-white/90 border-white/30 text-black placeholder:text-gray-500 focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-white">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-white/90 border-white/30 text-black placeholder:text-gray-500 focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-white">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-white/90 border-white/30 text-black placeholder:text-gray-500 focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white"
                        placeholder="+234 (xxx) xxx-xxxx"
                      />
                    </div>
                  </div>
                </div>

                {/* Hotel Selection */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <MapPin className="w-5 h-5 text-yellow-400 mr-2" />
                    Hotel Selection
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-sm font-medium text-white">
                      Select Branch *
                    </Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                      <SelectTrigger className="h-12 bg-white/90 border-white/30 text-black focus:ring-yellow-400 focus:border-yellow-400">
                        <SelectValue placeholder="Choose your preferred location" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-md border-white/30 shadow-xl">
                        {branchesLoading ? (
                          <SelectItem value="loading" disabled className="text-gray-500">
                            <div className="flex items-center">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Loading branches...
                            </div>
                          </SelectItem>
                        ) : branches.length === 0 ? (
                          <SelectItem value="no-locations" disabled className="text-gray-500">
                            No locations available
                          </SelectItem>
                        ) : (
                          branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id} className="text-black hover:bg-yellow-400/20 focus:bg-yellow-400/30">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-[hsl(var(--royal-blue))] mr-2" />
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
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Bed className="w-5 h-5 text-yellow-400 mr-2" />
                    Room Preferences
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="roomType" className="text-sm font-medium text-white">
                      Room Type *
                    </Label>
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
                      disabled={!formData.location || roomsLoading}
                    >
                      <SelectTrigger className="h-12 bg-white/90 border-white/30 text-black focus:ring-yellow-400 focus:border-yellow-400">
                        <SelectValue placeholder={
                          !formData.location 
                            ? "Please select a branch first" 
                            : roomsLoading 
                              ? "Loading room types..." 
                              : "Select your room type"
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-md border-white/30 shadow-xl">
                        {roomsLoading ? (
                          <SelectItem value="loading" disabled className="text-gray-500">
                            <div className="flex items-center">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Loading room types...
                            </div>
                          </SelectItem>
                        ) : roomsError ? (
                          <SelectItem value="error" disabled className="text-red-600">
                            <div className="flex items-center">
                              <span>Error loading room types</span>
                            </div>
                          </SelectItem>
                        ) : roomTypes.length === 0 ? (
                          <SelectItem value="no-rooms" disabled className="text-gray-500">
                            No room types available for this branch
                          </SelectItem>
                        ) : (
                          roomTypes.map((room) => (
                            <SelectItem key={room.id} value={room.id} className="text-black hover:bg-yellow-400/20 focus:bg-yellow-400/30">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                  <Bed className="w-4 h-4 text-[hsl(var(--royal-blue))] mr-2" />
                                  <span>{room.name}</span>
                                </div>
                                <span className="text-yellow-600 font-semibold ml-4">
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
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Calendar className="w-5 h-5 text-yellow-400 mr-2" />
                    Stay Duration
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn" className="text-sm font-medium text-white">
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
                        className="h-12 bg-white/90 border-white/30 text-black focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut" className="text-sm font-medium text-white">
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
                        className="h-12 bg-white/90 border-white/30 text-black focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Guests */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Users className="w-5 h-5 text-yellow-400 mr-2" />
                    Guest Count
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="adults" className="text-sm font-medium text-white">
                        Adults *
                      </Label>
                      <Select
                        value={formData.adults.toString()}
                        onValueChange={(value) =>
                          setFormData(prev => ({ ...prev, adults: Math.min(parseInt(value), maxAdults) }))
                        }
                      >
                        <SelectTrigger className="h-12 bg-white/90 border-white/30 text-black focus:ring-yellow-400 focus:border-yellow-400">
                          <SelectValue placeholder="Select adults" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-md border-white/30 shadow-xl">
                          {[1, 2].map((num) => (
                            <SelectItem key={num} value={num.toString()} className="text-black hover:bg-yellow-400/20 focus:bg-yellow-400/30">
                              {num} {num === 1 ? 'Adult' : 'Adults'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="children" className="text-sm font-medium text-white">
                        Children
                      </Label>
                      <Select
                        value={formData.children.toString()}
                        onValueChange={(value) =>
                          setFormData(prev => ({ ...prev, children: Math.min(parseInt(value), maxChildren) }))
                        }
                      >
                        <SelectTrigger className="h-12 bg-white/90 border-white/30 text-black focus:ring-yellow-400 focus:border-yellow-400">
                          <SelectValue placeholder="Select children" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-md border-white/30 shadow-xl">
                          {Array.from({ length: maxChildren + 1 }, (_, index) => index).map((num) => (
                            <SelectItem key={num} value={num.toString()} className="text-black hover:bg-yellow-400/20 focus:bg-yellow-400/30">
                              {num} {num === 1 ? 'Child' : 'Children'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <MessageSquare className="w-5 h-5 text-yellow-400 mr-2" />
                    Special Requests
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="specialRequests" className="text-sm font-medium text-white">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={4}
                      className="bg-white/90 border-white/30 text-black placeholder:text-gray-500 focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white resize-none"
                      placeholder="Any special requests or preferences for your stay..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-[hsl(var(--royal-blue-dark))] border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Proceed to Payment
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
              <div className="bg-white/10 backdrop-blur-md border-white/20 border rounded-lg shadow-xl p-6">
                <div className="flex items-center mb-6">
                  <Star className="w-6 h-6 text-yellow-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Reservation Summary</h3>
                </div>

                <div className="space-y-4">
                  {formData.location && (
                    <div className="flex justify-between items-center py-2 border-b border-white/20">
                      <span className="text-white/70">Location:</span>
                      <span className="text-white font-medium">
                        {branches.find(b => b.id === formData.location)?.name || 'Selected Branch'}
                      </span>
                    </div>
                  )}

                  {formData.roomType && (
                    <div className="flex justify-between items-center py-2 border-b border-white/20">
                      <span className="text-white/70">Room Type:</span>
                      <span className="text-white font-medium">
                        {roomTypes.find(r => r.id === formData.roomType)?.name || 'Selected Room'}
                      </span>
                    </div>
                  )}

                  {formData.checkIn && formData.checkOut && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-white/20">
                        <span className="text-white/70">Check-in:</span>
                        <span className="text-white font-medium">
                          {new Date(formData.checkIn).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/20">
                        <span className="text-white/70">Check-out:</span>
                        <span className="text-white font-medium">
                          {new Date(formData.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/20">
                        <span className="text-white/70">Duration:</span>
                        <span className="text-white font-medium">
                          {Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/70">Guests:</span>
                    <span className="text-white font-medium">
                      {formData.adults} {formData.adults === 1 ? 'Adult' : 'Adults'}{formData.children > 0 && `, ${formData.children} ${formData.children === 1 ? 'Child' : 'Children'}`}
                    </span>
                  </div>

                  {totalPrice > 0 && (
                    <div className="pt-4">
                      <div className="flex justify-between items-center py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg px-4">
                        <span className="text-[hsl(var(--royal-blue-dark))] font-semibold text-lg">Total Price:</span>
                        <span className="text-[hsl(var(--royal-blue-dark))] font-bold text-2xl">
                          ₦{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-white/20">
                    <div className="space-y-3">
                    <div className="flex items-center text-sm text-white/70">
                      <Shield className="w-4 h-4 text-yellow-400 mr-2" />
                      Secure booking with SSL encryption
                    </div>
                    <div className="flex items-center text-sm text-white/70">
                      <Clock className="w-4 h-4 text-yellow-400 mr-2" />
                      Free cancellation up to 24 hours
                    </div>
                    <div className="flex items-center text-sm text-white/70">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      Best price guarantee
                    </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paystack Payment Modal */}
      {showPaymentModal && (
        <PaystackPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          bookingData={{
            roomType: roomTypes.find(room => room.id === formData.roomType)?.name || '',
            roomPrice: roomTypes.find(room => room.id === formData.roomType)?.price || 0,
            checkInDate: new Date(formData.checkIn),
            checkOutDate: new Date(formData.checkOut),
            branchId: formData.location,
            branchName: branches.find(b => b.id === formData.location)?.name || '',
            adults: formData.adults,
            children: formData.children,
            nights: Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
            specialRequests: formData.specialRequests?.trim() || '',
            guestName: `${formData.firstName} ${formData.lastName}`.trim(),
            guestEmail: formData.email,
            guestPhone: formData.phone
          }}
          onPaymentSuccess={(bookingId) => {
            toast({
              title: "Payment Successful!",
              description: "Your booking has been confirmed and payment processed.",
            });
            onBookingSuccess?.();
            navigate('/dashboard');
          }}
          onPaymentError={(error) => {
            toast({
              title: "Payment Failed",
              description: error || "There was an error processing your payment. Please try again.",
              variant: "destructive",
            });
          }}
        />
      )}
      </div>
    );
};
