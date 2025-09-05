import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, MapPin, Users, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/types/booking";
import { cn } from "@/lib/utils";

interface BookingCardProps {
  booking: Booking;
  onViewDetails?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  className?: string;
}

export const BookingCard = ({
  booking,
  onViewDetails,
  onCancel,
  className,
}: BookingCardProps) => {
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const isUpcoming = new Date(booking.checkInDate) > new Date();
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="border-green-200 text-green-800">
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="border-red-200 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">
              {booking.roomType}
            </CardTitle>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              {booking.branchName}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-3">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {format(checkInDate, 'MMM d, yyyy')} - {format(checkOutDate, 'MMM d, yyyy')}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))} nights
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
          </div>
          <div className="flex items-center text-sm">
            <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">${booking.totalAmount.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground ml-1">
              • {booking.paymentStatus === 'paid' ? 'Paid' : 'Payment pending'}
            </span>
          </div>
          {isUpcoming && !isCancelled && booking.specialRequests && (
            <div className="text-sm pt-1 border-t">
              <p className="text-xs text-muted-foreground mb-1">Special Requests:</p>
              <p className="text-sm">{booking.specialRequests}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails?.(booking.id)}
        >
          View Details
        </Button>
        {isUpcoming && !isCancelled && (
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => onCancel?.(booking.id)}
          >
            Cancel Booking
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
