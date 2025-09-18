import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calendar, MapPin, Users, Loader2, Bed, CreditCard, Star, Sparkles, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBranches } from "@/hooks/useBranches";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BookingFormProps {
  selectedBranch?: string;
  showLocationDropdown?: boolean;
  onBookingSuccess?: () => void;
}

interface RoomType {
  id: string;
  name: string;
  price: string;
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

const roomTypes: RoomType[] = [
  { 
    id: "standard", 
    name: "Standard Room", 
    price: "₦45,000",
    description: "Comfortable room with essential amenities"
  },
  { 
    id: "deluxe", 
    name: "Deluxe Room", 
    price: "₦65,000",
    description: "Spacious room with premium amenities and city view"
  },
  { 
    id: "executive", 
    name: "Executive Suite", 
    price: "₦95,000",
    description: "Luxurious suite with separate living area and premium services"
  },
  { 
    id: "presidential", 
    name: "Presidential Suite", 
    price: "₦150,000",
    description: "The ultimate in luxury with premium services and amenities"
  },
];

export const BookingForm = ({ selectedBranch, showLocationDropdown = true, onBookingSuccess }: BookingFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { branches, isLoading: branchesLoading, error: branchesError } = useBranches();
  
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const [formData, setFormData] = useState({
    location: selectedBranch || "",
    roomType: "",
    guests: 2,
    firstName: currentUser?.displayName?.split(' ')[0] || "",
    lastName: currentUser?.displayName?.split(' ').slice(1).join(' ') || "",
    email: currentUser?.email || "",
    phone: "",
    specialRequests: ""
  });

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

  const calculateTotal = (): number => {
    const selectedRoom = roomTypes.find(room => room.id === formData.roomType);
    if (!selectedRoom || !date.from || !date.to) return 0;

    const pricePerNight = parseInt(selectedRoom.price.replace(/[₦,]/g, ''));
    const nights = Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24));
    return pricePerNight * nights * formData.guests;
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date.from || !date.to) {
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

    setIsLoading(true);

    try {
      // In a real app, this would be an API call to your backend
      const bookingData = {
        ...formData,
        checkInDate: date.from,
        checkOutDate: date.to,
        userId: currentUser?.uid,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        totalPrice: calculateTotal()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Booking Successful!",
        description: "Your reservation has been confirmed. We've sent a confirmation to your email.",
      });
      
      // Call the success callback if provided
      onBookingSuccess?.();
      
      // Redirect to dashboard or bookings page
      navigate('/dashboard');
    } catch (error) {
      console.error('Booking failed:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-hero py-16 px-4">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-primary mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-gold">
              Book Your Stay
            </h1>
            <Sparkles className="w-8 h-8 text-primary ml-3" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience luxury and comfort at Golden Tulip Hotels. Reserve your perfect room today.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <div className="card-luxury">
              <div className="flex items-center mb-8">
                <Calendar className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-foreground">Reservation Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Guest Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <User className="w-5 h-5 text-primary mr-2" />
                    Guest Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Hotel Selection */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <MapPin className="w-5 h-5 text-primary mr-2" />
                    Hotel Selection
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-sm font-medium text-foreground">
                      Select Branch *
                    </Label>
                    <Select value={formData.branch} onValueChange={(value) => setFormData(prev => ({ ...prev, branch: value }))}>
                      <SelectTrigger className="h-12 bg-input border-border text-foreground">
                        <SelectValue placeholder="Choose your preferred location" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {isLoadingBranches ? (
                          <SelectItem value="loading" disabled>
                            <div className="flex items-center">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Loading branches...
                            </div>
                          </SelectItem>
                        ) : branches.length === 0 ? (
                          <SelectItem value="no-locations" disabled>
                            No locations available
                          </SelectItem>
                        ) : (
                          branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id} className="text-foreground hover:bg-accent">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-primary mr-2" />
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
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <Bed className="w-5 h-5 text-primary mr-2" />
                    Room Preferences
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="roomType" className="text-sm font-medium text-foreground">
                      Room Type *
                    </Label>
                    <Select value={formData.roomType} onValueChange={(value) => setFormData(prev => ({ ...prev, roomType: value }))}>
                      <SelectTrigger className="h-12 bg-input border-border text-foreground">
                        <SelectValue placeholder="Select your room type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {roomTypes.map((room) => (
                          <SelectItem key={room.id} value={room.id} className="text-foreground hover:bg-accent">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <Bed className="w-4 h-4 text-primary mr-2" />
                                <span>{room.name}</span>
                              </div>
                              <span className="text-primary font-semibold ml-4">
                                ${room.price}/night
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <Calendar className="w-5 h-5 text-primary mr-2" />
                    Stay Duration
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn" className="text-sm font-medium text-foreground">
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
                        className="h-12 bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut" className="text-sm font-medium text-foreground">
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
                        className="h-12 bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Guests */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <Users className="w-5 h-5 text-primary mr-2" />
                    Guest Count
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="adults" className="text-sm font-medium text-foreground">
                        Adults *
                      </Label>
                      <Input
                        id="adults"
                        name="adults"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.adults}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="children" className="text-sm font-medium text-foreground">
                        Children
                      </Label>
                      <Input
                        id="children"
                        name="children"
                        type="number"
                        min="0"
                        max="10"
                        value={formData.children}
                        onChange={handleInputChange}
                        className="h-12 bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <MessageSquare className="w-5 h-5 text-primary mr-2" />
                    Special Requests
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="specialRequests" className="text-sm font-medium text-foreground">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={4}
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary resize-none"
                      placeholder="Any special requests or preferences for your stay..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-luxury w-full h-14 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing Reservation...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Complete Reservation
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
              <div className="card-luxury">
                <div className="flex items-center mb-6">
                  <Star className="w-6 h-6 text-primary mr-3" />
                  <h3 className="text-xl font-bold text-foreground">Booking Summary</h3>
                </div>

                <div className="space-y-4">
                  {formData.branch && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="text-foreground font-medium">
                        {branches.find(b => b.id === formData.branch)?.name || 'Selected Branch'}
                      </span>
                    </div>
                  )}

                  {formData.roomType && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Room Type:</span>
                      <span className="text-foreground font-medium">
                        {roomTypes.find(r => r.id === formData.roomType)?.name || 'Selected Room'}
                      </span>
                    </div>
                  )}

                  {formData.checkIn && formData.checkOut && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Check-in:</span>
                        <span className="text-foreground font-medium">
                          {new Date(formData.checkIn).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Check-out:</span>
                        <span className="text-foreground font-medium">
                          {new Date(formData.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="text-foreground font-medium">
                          {Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Guests:</span>
                    <span className="text-foreground font-medium">
                      {formData.adults} Adults{formData.children > 0 && `, ${formData.children} Children`}
                    </span>
                  </div>

                  {totalPrice > 0 && (
                    <div className="pt-4">
                      <div className="flex justify-between items-center py-3 bg-gradient-primary rounded-lg px-4">
                        <span className="text-primary-foreground font-semibold text-lg">Total Price:</span>
                        <span className="text-primary-foreground font-bold text-2xl">
                          ₦{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-primary mr-2" />
                      Secure booking with SSL encryption
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary mr-2" />
                      Free cancellation up to 24 hours
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-primary mr-2" />
                      Best price guarantee
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};