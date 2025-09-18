import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Users, Loader2, Bed, CreditCard, Star, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBranches } from "@/hooks/useBranches";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
// Removed incorrect Booking import to avoid type conflict
interface ModernBookingFormProps {
  selectedBranch?: string;
  showLocationDropdown?: boolean;
  onBookingSuccess?: () => void;
}

interface RoomType {
  id: string;
  name: string;
  price: number;
  description: string;
  priceDisplay: string;
}

const roomTypes: RoomType[] = [
  { 
    id: "standard", 
    name: "Standard Room", 
    price: 45000,
    priceDisplay: "₦45,000",
    description: "Comfortable room with essential amenities"
  },
  { 
    id: "deluxe", 
    name: "Deluxe Room", 
    price: 65000,
    priceDisplay: "₦65,000",
    description: "Spacious room with premium amenities and city view"
  },
  { 
    id: "executive", 
    name: "Executive Suite", 
    price: 95000,
    priceDisplay: "₦95,000",
    description: "Luxurious suite with separate living area and premium services"
  },
  { 
    id: "presidential", 
    name: "Presidential Suite", 
    price: 150000,
    priceDisplay: "₦150,000",
    description: "The ultimate in luxury with premium services and amenities"
  },
];

export const ModernBookingForm = ({ selectedBranch, showLocationDropdown = true, onBookingSuccess }: ModernBookingFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { branches, isLoading: branchesLoading } = useBranches();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();

  const [bookingData, setBookingData] = useState({
    branchId: selectedBranch || "",
    roomType: "",
    adults: 1,
    children: 0,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: ""
  });

  // Auto-populate user data when authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const nameParts = currentUser.displayName?.split(' ') || [];
      setBookingData(prev => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(' ') || "",
        email: currentUser.email || "",
      }));
    }
  }, [isAuthenticated, currentUser]);

  // Set selected branch if provided
  useEffect(() => {
    if (selectedBranch) {
      setBookingData(prev => ({ ...prev, branchId: selectedBranch }));
    }
  }, [selectedBranch]);

  const handleInputChange = (field: keyof typeof bookingData, value: string | number) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !bookingData.roomType) return 0;
    
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const roomPrice = roomTypes.find(r => r.id === bookingData.roomType)?.price || 0;
    return nights * roomPrice;
  };

  const validateForm = () => {
    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Missing Dates",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return false;
    }

    if (checkInDate >= checkOutDate) {
      toast({
        title: "Invalid Dates",
        description: "Check-out date must be after check-in date",
        variant: "destructive",
      });
      return false;
    }

    if (!bookingData.branchId) {
      toast({
        title: "Missing Location",
        description: "Please select a hotel location",
        variant: "destructive",
      });
      return false;
    }

    if (!bookingData.roomType) {
      toast({
        title: "Missing Room Type",
        description: "Please select a room type",
        variant: "destructive",
      });
      return false;
    }

    if (!bookingData.firstName || !bookingData.lastName || !bookingData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required contact information",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!isAuthenticated || !currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a booking",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedRoom = roomTypes.find(r => r.id === bookingData.roomType);
      const totalAmount = calculateTotal();
      const nights = Math.ceil((checkOutDate!.getTime() - checkInDate!.getTime()) / (1000 * 60 * 60 * 24));

      // Create booking data matching the Booking interface
      const newBooking = {
      userId: (currentUser as any).id || currentUser.uid,
         branchId: bookingData.branchId,
         roomType: bookingData.roomType,
         checkInDate: checkInDate!,
         checkOutDate: checkOutDate!,
         adults: bookingData.adults,
         children: bookingData.children,
         totalAmount,
         status: 'confirmed',
         paymentStatus: 'pending',
         guestName: `${bookingData.firstName} ${bookingData.lastName}`,
         guestEmail: bookingData.email,
         guestPhone: bookingData.phone,
         specialRequests: bookingData.specialRequests || undefined,
         nights,
         roomPrice: selectedRoom?.price || 0,
         createdAt: new Date(),
         updatedAt: new Date(),
         source: 'website',
         marketSegment: 'leisure',
         rateCode: 'standard'
       };

      // Write to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...newBooking,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Booking Confirmed!",
        description: `Your reservation has been confirmed. Booking ID: ${docRef.id.slice(0, 8).toUpperCase()}`,
      });
      
      // Call success callback if provided
      onBookingSuccess?.();
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Booking failed:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBranchInfo = branches.find(branch => branch.id === bookingData.branchId);
  const selectedRoomInfo = roomTypes.find(room => room.id === bookingData.roomType);
  const totalPrice = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Book Your Stay</h1>
          <p className="text-muted-foreground text-lg">Experience luxury at Golden Tulip Hotels</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-foreground">Reservation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Location Selection */}
                  {showLocationDropdown && (
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        Hotel Location *
                      </Label>
                      <Select
                        value={bookingData.branchId}
                        onValueChange={(value) => handleInputChange('branchId', value)}
                        disabled={branchesLoading}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id!}>
                              <div className="flex flex-col">
                                <span className="font-medium">{branch.name}</span>
                                <span className="text-sm text-muted-foreground">{branch.location}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                        Check-in Date *
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-12 w-full justify-start text-left font-normal",
                              !checkInDate && "text-muted-foreground"
                            )}
                          >
                            {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={checkInDate}
                            onSelect={setCheckInDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                        Check-out Date *
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-12 w-full justify-start text-left font-normal",
                              !checkOutDate && "text-muted-foreground"
                            )}
                          >
                            {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={checkOutDate}
                            onSelect={setCheckOutDate}
                            disabled={(date) => date <= (checkInDate || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Room Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center">
                      <Bed className="w-4 h-4 mr-2 text-primary" />
                      Room Type *
                    </Label>
                    <Select
                      value={bookingData.roomType}
                      onValueChange={(value) => handleInputChange('roomType', value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            <div className="flex justify-between items-center w-full">
                              <div className="flex flex-col">
                                <span className="font-medium">{room.name}</span>
                                <span className="text-sm text-muted-foreground">{room.description}</span>
                              </div>
                              <span className="font-bold text-primary ml-4">{room.priceDisplay}/night</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Guests */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adults" className="text-sm font-medium flex items-center">
                        <Users className="w-4 h-4 mr-2 text-primary" />
                        Adults *
                      </Label>
                      <Select
                        value={bookingData.adults.toString()}
                        onValueChange={(value) => handleInputChange('adults', parseInt(value))}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} Adult{num > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="children" className="text-sm font-medium">
                        Children
                      </Label>
                      <Select
                        value={bookingData.children.toString()}
                        onValueChange={(value) => handleInputChange('children', parseInt(value))}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'Child' : 'Children'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          value={bookingData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          value={bookingData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="h-12"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={bookingData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={bookingData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="space-y-2">
                    <Label htmlFor="specialRequests" className="text-sm font-medium">
                      Special Requests
                    </Label>
                    <Textarea
                      id="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      rows={3}
                      className="resize-none"
                      placeholder="Any special requests or preferences..."
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing Booking...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Complete Booking
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground flex items-center">
                    <Star className="w-5 h-5 mr-2 text-primary" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedBranchInfo && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{selectedBranchInfo.name}</span>
                    </div>
                  )}

                  {selectedRoomInfo && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Room:</span>
                      <span className="font-medium">{selectedRoomInfo.name}</span>
                    </div>
                  )}

                  {checkInDate && checkOutDate && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Check-in:</span>
                        <span className="font-medium">{format(checkInDate, "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Check-out:</span>
                        <span className="font-medium">{format(checkOutDate, "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Nights:</span>
                        <span className="font-medium">
                          {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Guests:</span>
                    <span className="font-medium">
                      {bookingData.adults} Adult{bookingData.adults > 1 ? 's' : ''}
                      {bookingData.children > 0 && `, ${bookingData.children} Child${bookingData.children > 1 ? 'ren' : ''}`}
                    </span>
                  </div>

                  {totalPrice > 0 && (
                    <div className="pt-4">
                      <div className="flex justify-between items-center py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg px-4">
                        <span className="font-semibold text-lg">Total:</span>
                        <span className="font-bold text-2xl text-primary">
                          ₦{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Trust Indicators */}
                  <div className="pt-6 space-y-3 border-t">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Secure booking
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-blue-500 mr-2" />
                      Free cancellation
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Best price guarantee
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};