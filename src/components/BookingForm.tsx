import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calendar, MapPin, Users, Loader2, Bed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  id: string;
  name: string;
  location: string;
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

const branches: Branch[] = [
  { id: "gra", name: "GRA (Head Branch)", location: "Government Reserved Area" },
  { id: "waterlines", name: "Waterlines", location: "Port Harcourt" },
  { id: "airforce", name: "Airforce Base", location: "Port Harcourt" },
  { id: "oyigbo", name: "Oyigbo", location: "Rivers State" }
];

export const BookingForm = ({ selectedBranch, showLocationDropdown = true, onBookingSuccess }: BookingFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const [formData, setFormData] = useState({
    location: selectedBranch || "",
    roomType: "",
    guests: 2,
    firstName: currentUser?.name?.split(' ')[0] || "",
    lastName: currentUser?.name?.split(' ').slice(1).join(' ') || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    specialRequests: ""
  });
    phone: "",
    specialRequests: ""
  });

  const roomTypes: RoomType[] = [
    { id: "standard", name: "Standard Room", price: "₦45,000" },
    { id: "deluxe", name: "Deluxe Room", price: "₦65,000" },
    { id: "executive", name: "Executive Suite", price: "₦95,000" },
    { id: "presidential", name: "Presidential Suite", price: "₦150,000" },
    { id: "family", name: "Family Room", price: "₦85,000" }
  ];

  const branches: Branch[] = [
    { id: "gra", name: "GRA (Head Branch)", location: "Government Reserved Area" },
    { id: "waterlines", name: "Waterlines", location: "Port Harcourt" },
    { id: "airforce", name: "Airforce Base", location: "Port Harcourt" },
    { id: "oyigbo", name: "Oyigbo", location: "Rivers State" }
  ];

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const nameParts = currentUser.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ');
      
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      }));
    }
  }, [isAuthenticated, currentUser]);

  // Update check-in/check-out when date range changes
  useEffect(() => {
    if (date.from && date.to && date.to <= date.from) {
      const nextDay = new Date(date.from);
      nextDay.setDate(nextDay.getDate() + 1);
      setDate(prev => ({ ...prev, to: nextDay }));
    }
  }, [date.from, date.to]);

  const calculateTotal = (): number => {
    if (!date.from || !date.to || !formData.roomType) return 0;
    
    const selectedRoom = roomTypes.find(room => room.id === formData.roomType);
    if (!selectedRoom) return 0;
    
    const nights = Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24));
    const roomPrice = parseInt(selectedRoom.price.replace(/[^0-9]/g, ''));
    return nights * roomPrice * formData.guests;
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
        userId: currentUser?.id,
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
        userId: user?.id,
        status: 'confirmed',
        createdAt: new Date().toISOString()
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

  const calculateTotal = () => {
    const selectedRoom = roomTypes.find(room => room.id === formData.roomType);
    if (!selectedRoom || !date.from || !date.to) return 0;

    const nights = Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24));
    const roomPrice = parseInt(selectedRoom.price.replace(/[₦,]/g, ""));
    return nights * roomPrice * formData.guests;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-amber-800 flex items-center">
          <Calendar className="h-6 w-6 mr-2" />
          Book Your Stay
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {showLocationDropdown && (
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </Label>
                <Select 
                  value={formData.location}
                  onValueChange={(value) => setFormData({...formData, location: value})}
                  required
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