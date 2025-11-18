import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, User, Home, CreditCard, Info, X } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Booking, BookingStatus, PaymentStatus } from "@/types/booking";
import { formatCurrency } from "@/utils/currencyUtils";
import { Timestamp } from "firebase/firestore";

interface BookingDetailsProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  onStatusChange: (bookingId: string, status: BookingStatus) => void;
}

export function BookingDetails({
  booking,
  isOpen,
  onClose,
  onSave,
  onStatusChange,
}: BookingDetailsProps) {
  const [editableBooking, setEditableBooking] = useState<Booking | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (booking) {
      setEditableBooking({ ...booking });
      setIsEditing(false);
    }
  }, [booking]);

  if (!booking || !editableBooking) return null;

  const handleChange = (field: keyof Booking, value: any) => {
    setEditableBooking((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = () => {
    if (editableBooking) {
      onSave(editableBooking);
      setIsEditing(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">{status}</Badge>;
      case "completed":
        return <Badge variant="secondary">{status}</Badge>;
      case "cancelled":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">{status}</Badge>;
      case "pending":
        return <Badge variant="outline">{status}</Badge>;
      case "refunded":
        return <Badge variant="secondary">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Booking Details</DialogTitle>
            <div className="flex items-center space-x-2">
              {getStatusBadge(booking.status)}
              {getPaymentBadge(booking.paymentStatus)}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="mr-2 h-4 w-4" />
                <span>Booking Information</span>
              </div>
              <div className="pl-6 space-y-2">
                <div>
                  <Label>Booking ID</Label>
                  <Input value={booking.id} disabled className="mt-1" />
                </div>
                <div>
                  <Label>Booking Date</Label>
                  <Input
                    value={format(booking.bookingDate instanceof Timestamp ? booking.bookingDate.toDate() : new Date(booking.bookingDate), "PPpp")}
                    disabled
                    className="mt-1"
                  />
                </div>
                {isEditing ? (
                  <div>
                    <Label>Special Requests</Label>
                    <Textarea
                      value={editableBooking.specialRequests || ""}
                      onChange={(e) => handleChange("specialRequests", e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Special Requests</Label>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {booking.specialRequests || "No special requests"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Home className="mr-2 h-4 w-4" />
                <span>Stay Details</span>
              </div>
              <div className="pl-6 space-y-2">
                <div>
                  <Label>Branch</Label>
                  <Input value={booking.branchName} disabled className="mt-1" />
                </div>
                <div>
                  <Label>Room Type</Label>
                  <Input value={booking.roomType} disabled={!isEditing} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Check-in</Label>
                    <Input
                      value={format(booking.checkInDate instanceof Timestamp ? booking.checkInDate.toDate() : new Date(booking.checkInDate), "PP")}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Check-out</Label>
                    <Input
                      value={format(booking.checkOutDate instanceof Timestamp ? booking.checkOutDate.toDate() : new Date(booking.checkOutDate), "PP")}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Guests</Label>
                  <Input
                    type="number"
                    value={booking.guests}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("guests", parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="mr-2 h-4 w-4" />
                <span>Guest Information</span>
              </div>
              <div className="pl-6 space-y-2">
                <div>
                  <Label>Guest ID</Label>
                  <Input value={booking.userId} disabled className="mt-1" />
                </div>
                {/* In a real app, you would fetch and display more guest details here */}
                <div>
                  <Label>Contact</Label>
                  <Input value="guest@example.com" disabled className="mt-1" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Payment Information</span>
              </div>
              <div className="pl-6 space-y-2">
                <div>
                  <Label>Total Amount</Label>
                  <Input
                    value={formatCurrency(booking.totalAmount, 'NGN', 'en-NG')}
                    disabled={!isEditing}
                    className="mt-1 font-medium"
                  />
                </div>
                {isEditing ? (
                  <div>
                    <Label>Payment Status</Label>
                    <select
                      value={editableBooking.paymentStatus}
                      onChange={(e) => handleChange("paymentStatus", e.target.value as PaymentStatus)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    >
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <Label>Payment Status</Label>
                    <div className="mt-1">{getPaymentBadge(booking.paymentStatus)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <>
              {booking.status !== "cancelled" && booking.status !== "completed" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => onStatusChange(booking.id, "cancelled")}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    Cancel Booking
                  </Button>
                  <Button onClick={() => onStatusChange(booking.id, "completed")}>
                    Complete Stay
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
