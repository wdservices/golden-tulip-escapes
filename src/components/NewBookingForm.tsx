import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Loader2, Bed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

export const NewBookingForm = ({ 
  selectedBranch, 
  showLocationDropdown = true, 
  onBookingSuccess 
}: BookingFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<{ from?: Date; to?: Date }>({
    from: undefined,
    to: undefined,
  });

  const [formData, setFormData] = useState({
    location: selectedBranch || "",
    roomType: "",
    guests: 2,
    firstName: (currentUser as any)?.displayName?.split(' ')[0] || "",
    lastName: (currentUser as any)?.displayName?.split(' ').slice(1).join(' ') || "",
    email: (currentUser as any)?.email || "",
    phone: "",
    specialRequests: ""
  });

  // Auto-fill user data if authenticated
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        email: (currentUser as any)?.email || "",
        firstName: (currentUser as any)?.displayName?.split(' ')[0] || "",
        lastName: (currentUser as any)?.displayName?.split(' ').slice(1).join(' ') || ""
      }));
    }
  }, [currentUser]);

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    setDate(prev => ({
      from: range.from || prev.from,
      to: range.to || prev.to
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
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
        userId: (currentUser as any)?.uid || 'anonymous',
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

  const calculateTotal = (): number => {
    if (!date.from || !date.to) return 0;
    
    const days = Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24));
    const selectedRoom = roomTypes.find(room => room.id === formData.roomType);
    const price = selectedRoom ? parseInt(selectedRoom.price.replace(/[^0-9]/g, '')) : 0;
    
    return days * price;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-amber-800 flex items-center">
          <Bed className="h-6 w-6 mr-2" />
          Book Your Stay
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Selection */}
          {showLocationDropdown && (
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </Label>
              <Select 
                name="location"
                value={formData.location}
                onValueChange={(value) => setFormData({...formData, location: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-2">
            <Label className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Dates
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} - {" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Select your dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={{ from: date.from, to: date.to }}
                  onSelect={(range) => handleDateSelect(range)}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Room Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="roomType" className="flex items-center">
              <Bed className="h-4 w-4 mr-2" />
              Room Type
            </Label>
            <Select 
              name="roomType"
              value={formData.roomType}
              onValueChange={(value) => setFormData({...formData, roomType: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a room type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{room.name}</span>
                      <span className="text-amber-700 font-medium">{room.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{room.description}</p>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Guests */}
          <div className="space-y-2">
            <Label htmlFor="guests" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Number of Guests
            </Label>
            <Select 
              name="guests"
              value={formData.guests.toString()}
              onValueChange={(value) => setFormData({...formData, guests: parseInt(value)})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of guests" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'guest' : 'guests'}
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
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.specialRequests}
              onChange={handleInputChange}
            />
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Price Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Room Rate</span>
                <span>{roomTypes.find(r => r.id === formData.roomType)?.price || '₦0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span>
                  {date.from && date.to 
                    ? `${Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))} nights`
                    : 'Select dates'}
                </span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>₦{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-6 bg-amber-600 hover:bg-amber-700 text-white font-medium text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Complete Booking'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
