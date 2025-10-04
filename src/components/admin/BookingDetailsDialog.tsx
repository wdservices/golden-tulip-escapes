import * as React from "react";
import { format } from "date-fns";
import { Booking } from "@/types/booking";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  CreditCard,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  BedDouble,
  CalendarClock,
  ClipboardList,
  Home,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { paymentService } from "@/services/paymentService";
import { useAuth } from "@/contexts/AuthContext";

interface BookingDetailsDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailsDialog({
  booking,
  open,
  onOpenChange,
}: BookingDetailsDialogProps) {
  const [isUpdatingPayment, setIsUpdatingPayment] = React.useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  if (!booking) return null;

  const handlePaymentStatusUpdate = async (newStatus: 'successful' | 'failed' | 'refunded') => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only administrators can update payment status.",
      });
      return;
    }

    setIsUpdatingPayment(true);
    try {
      await paymentService.updateBookingPaymentStatus(booking.id, booking.branchId, newStatus);
      
      toast({
        title: "Payment status updated",
        description: `Payment status has been updated to ${newStatus}.`,
      });
      
      // Close dialog to refresh the booking data
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update payment status. Please try again.",
      });
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP p");
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "refunded":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Booking #{booking.id.substring(0, 8)}
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            View and manage booking information, payment status, and guest details.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Booking Details</TabsTrigger>
            <TabsTrigger value="guest">Guest Information</TabsTrigger>
            <TabsTrigger value="payment">Payment & Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Stay Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">{formatDate(booking.checkInDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">{formatDate(booking.checkOutDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nights</span>
                    <span className="font-medium">
                      {Math.ceil(
                        (new Date(booking.checkOutDate).getTime() -
                          new Date(booking.checkInDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">{booking.guests}</span>
                  </div>
                  {booking.actualCheckOutDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actual Check-out</span>
                      <span className="font-medium">{formatDateTime(booking.actualCheckOutDate)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Branch</span>
                    <span className="font-medium">{booking.branchName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room Type</span>
                    <span className="font-medium">{booking.roomType}</span>
                  </div>
                  {booking.roomNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Number</span>
                      <span className="font-medium">{booking.roomNumber}</span>
                    </div>
                  )}
                  {booking.roomStatus && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Status</span>
                      <Badge variant="outline">
                        {booking.roomStatus.charAt(0).toUpperCase() + booking.roomStatus.slice(1)}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {booking.specialRequests && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Special Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{booking.specialRequests}</p>
                </CardContent>
              </Card>
            )}

            {booking.housekeepingNotes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Housekeeping Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{booking.housekeepingNotes}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Booking Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking Date</span>
                  <span className="font-medium">{formatDateTime(booking.bookingDate)}</span>
                </div>
                {booking.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created At</span>
                    <span className="font-medium">{formatDateTime(booking.createdAt)}</span>
                  </div>
                )}
                {booking.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{formatDateTime(booking.updatedAt)}</span>
                  </div>
                )}
                {booking.source && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking Source</span>
                    <Badge variant="outline">
                      {booking.source.charAt(0).toUpperCase() + booking.source.slice(1)}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guest" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Guest Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Name:</span>
                    <span className="font-medium">{booking.guestName || "Not provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Email:</span>
                    <span className="font-medium">{booking.guestEmail || "Not provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Phone:</span>
                    <span className="font-medium">{booking.guestPhone || "Not provided"}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Additional Information</h4>
                  {booking.marketSegment && (
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">Market Segment:</span>
                      <Badge variant="outline">
                        {booking.marketSegment.charAt(0).toUpperCase() + booking.marketSegment.slice(1)}
                      </Badge>
                    </div>
                  )}
                  {booking.rateCode && (
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">Rate Code:</span>
                      <span className="font-medium">{booking.rateCode}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                    {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                  </Badge>
                </div>
                {booking.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium">{booking.paymentMethod}</span>
                  </div>
                )}
                {booking.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Date</span>
                    <span className="font-medium">{formatDate(booking.paymentDate)}</span>
                  </div>
                )}
                {booking.lastPaymentAmount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Payment</span>
                    <span className="font-medium">{formatCurrency(booking.lastPaymentAmount)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {booking.baseRate !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Rate</span>
                    <span className="font-medium">{formatCurrency(booking.baseRate)}</span>
                  </div>
                )}
                {booking.extraPersonFee !== undefined && booking.extraPersonFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Extra Person Fee</span>
                    <span className="font-medium">{formatCurrency(booking.extraPersonFee)}</span>
                  </div>
                )}
                {booking.resortFee !== undefined && booking.resortFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resort Fee</span>
                    <span className="font-medium">{formatCurrency(booking.resortFee)}</span>
                  </div>
                )}
                {booking.cityTax !== undefined && booking.cityTax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City Tax</span>
                    <span className="font-medium">{formatCurrency(booking.cityTax)}</span>
                  </div>
                )}
                {booking.vat !== undefined && booking.vat > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT</span>
                    <span className="font-medium">{formatCurrency(booking.vat)}</span>
                  </div>
                )}
                {booking.discount !== undefined && booking.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-500">-{formatCurrency(booking.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(booking.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Controls for Admins */}
            {currentUser?.role === 'admin' && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Payment Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Update payment status for this booking. This action will be logged.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {booking.paymentStatus !== 'paid' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handlePaymentStatusUpdate('successful')}
                        disabled={isUpdatingPayment}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isUpdatingPayment ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Mark as Paid
                      </Button>
                    )}
                    {booking.paymentStatus !== 'failed' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handlePaymentStatusUpdate('failed')}
                        disabled={isUpdatingPayment}
                      >
                        {isUpdatingPayment ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Mark as Failed
                      </Button>
                    )}
                    {booking.paymentStatus === 'paid' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePaymentStatusUpdate('refunded')}
                        disabled={isUpdatingPayment}
                      >
                        {isUpdatingPayment ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        Process Refund
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}