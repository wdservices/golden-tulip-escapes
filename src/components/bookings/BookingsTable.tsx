import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Booking, BookingStatus, PaymentStatus } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Check, Copy, Filter, Mail as MailIcon, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/utils/currencyUtils";

interface BookingsTableProps {
  bookings: (Booking & { __isRoot?: boolean; __branchPathId?: string })[];
  isLoading: boolean;
  onEdit: (booking: Booking) => void;
  onStatusChange: (bookingId: string, status: BookingStatus) => void;
  onDelete: (booking: Booking & { __isRoot?: boolean; __branchPathId?: string }) => void;
}

export function BookingsTable({ bookings, isLoading, onEdit, onStatusChange, onDelete }: BookingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailBooking, setEmailBooking] = useState<Booking | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const openEmailDialog = (booking: Booking) => {
    setEmailBooking(booking);
    setEmailDialogOpen(true);
    setHasCopied(false);
  };

  const closeEmailDialog = (open: boolean) => {
    setEmailDialogOpen(open);
    if (!open) {
      setEmailBooking(null);
    }
  };

  const formatDateForEmail = (date: Timestamp | string) => {
    if (date instanceof Timestamp) {
      return format(date.toDate(), "PPP");
    }
    return format(new Date(date), "PPP");
  };

  const buildEmailContent = (booking: Booking) => {
    const lines = [
      `Hello ${booking.guestName || "Valued Guest"},`,
      "",
      `Thank you for booking with ${booking.branchName}. We're excited to host you at our property!`,
      "",
      "Booking Summary:",
      `• Booking ID: ${booking.id}`,
      `• Branch: ${booking.branchName}`,
      `• Room Type: ${booking.roomType}`,
      `• Check-in: ${formatDateForEmail(booking.checkInDate)}`,
      `• Check-out: ${formatDateForEmail(booking.checkOutDate)}`,
      `• Guests: ${booking.guests ?? "N/A"}`,
      `• Total Amount: ${formatCurrency(booking.totalAmount, "NGN", "en-NG")}`,
      "",
      "Guest Contact:",
      `• Email: ${booking.guestEmail || "N/A"}`,
      `• Phone: ${booking.guestPhone || "N/A"}`,
      "",
      "If you have any questions or special requests before your arrival, please let us know. We look forward to providing you with a memorable stay.",
      "",
      "Warm regards,",
      `${booking.branchName} Team`,
    ];

    return lines.join("\n");
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    try {
      if (date instanceof Timestamp) return format(date.toDate(), "MMM dd, yyyy");
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Invalid Date";
      return format(d, "MMM dd, yyyy");
    } catch (e) {
      return "Error";
    }
  };

  const handleCopyEmailContent = async () => {
    if (!emailBooking) return;

    try {
      await navigator.clipboard.writeText(buildEmailContent(emailBooking));
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy booking email content", error);
    }
  };

  const handleComposeEmail = () => {
    if (!emailBooking) return;

    const subject = encodeURIComponent(`Your booking at ${emailBooking.branchName}`);
    const body = encodeURIComponent(buildEmailContent(emailBooking));
    const recipient = emailBooking.guestEmail || "";
    window.open(`mailto:${recipient}?subject=${subject}&body=${body}`);
  };

  const handleDownloadEmailPdf = () => {
    if (!emailBooking) return;
    const content = buildEmailContent(emailBooking);
    const w = window.open("", "_blank", "noopener,noreferrer,width=800,height=900");
    if (!w) return;
    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Email - ${emailBooking.branchName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 18px; margin-bottom: 12px; }
            pre { white-space: pre-wrap; font-size: 13px; line-height: 1.6; }
            .actions { margin-top: 16px; }
            .btn { display: inline-block; padding: 8px 12px; background: #222; color: #fff; text-decoration: none; border-radius: 4px; }
            @media print { .actions { display: none; } }
          </style>
        </head>
        <body>
          <h1>Booking Email Preview</h1>
          <pre>${content.replace(/</g, "&lt;")}</pre>
          <div class="actions">
            <a href="#" class="btn" onclick="window.print(); return false;">Print / Save as PDF</a>
          </div>
        </body>
      </html>
    `;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.branchName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    // Handle date range filtering with proper Timestamp conversion
    const matchesDateRange =
      !dateRange.from ||
      !dateRange.to ||
      (booking.checkInDate instanceof Timestamp
        ? (booking.checkInDate.toDate() >= dateRange.from && 
           booking.checkInDate.toDate() <= dateRange.to)
        : (new Date(booking.checkInDate) >= dateRange.from && 
           new Date(booking.checkInDate) <= dateRange.to));

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    onStatusChange(bookingId, newStatus);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search bookings..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus | "all")}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                <CalendarDays className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 booking-popover" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => setDateRange({
                  from: range?.from,
                  to: range?.to
                })}
                numberOfMonths={2}
                className="booking-calendar"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-yellow-400">Booking ID</TableHead>
              <TableHead className="text-yellow-400">Branch</TableHead>
              <TableHead className="text-yellow-400">Room Type</TableHead>
              <TableHead className="text-yellow-400">Check-in</TableHead>
              <TableHead className="text-yellow-400">Check-out</TableHead>
              <TableHead className="text-yellow-400">Status</TableHead>
              <TableHead className="text-yellow-400">Payment</TableHead>
              <TableHead className="text-yellow-400">Total</TableHead>
              <TableHead className="text-right text-yellow-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium text-white">
                    <div className="text-sm">
                      {booking.id.substring(0, 8)}...
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{booking.branchName}</TableCell>
                  <TableCell className="capitalize text-white">{booking.roomType}</TableCell>
                  <TableCell className="text-white">
                    {formatDate(booking.checkInDate)}
                  </TableCell>
                  <TableCell className="text-white">
                    {formatDate(booking.checkOutDate)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === "confirmed"
                          ? "default"
                          : booking.status === "completed"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.paymentStatus === "paid"
                          ? "default"
                          : booking.paymentStatus === "pending"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {booking.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">{formatCurrency(booking.totalAmount, 'NGN', 'en-NG')}</TableCell>
                  <TableCell className="text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-48 p-2">
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start"
                            onClick={() => onEdit(booking)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start"
                            onClick={() => openEmailDialog(booking)}
                          >
                            Email Client
                          </Button>
                          {booking.status !== "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="justify-start"
                              onClick={() => handleStatusChange(booking.id, "completed")}
                              disabled={booking.status === "cancelled"}
                            >
                              Mark as Completed
                            </Button>
                          )}
                          {booking.status !== "cancelled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="justify-start text-red-600 hover:text-red-700"
                              onClick={() => handleStatusChange(booking.id, "cancelled")}
                              disabled={booking.status === "completed"}
                            >
                              Cancel Booking
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start text-red-600 hover:text-red-700"
                            onClick={() => onDelete(booking)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Booking
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={emailDialogOpen} onOpenChange={closeEmailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Email client</DialogTitle>
            {emailBooking && (
              <DialogDescription>
                Prepare a thank-you email for booking #{emailBooking.id.substring(0, 8)}.
              </DialogDescription>
            )}
          </DialogHeader>

          {emailBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">{emailBooking.guestName || "Guest"}</p>
                  <p>{emailBooking.guestEmail || "No email provided"}</p>
                  {emailBooking.guestPhone && <p>{emailBooking.guestPhone}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={handleCopyEmailContent}>
                  {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  <span className="sr-only">Copy email content</span>
                </Button>
              </div>

              <Textarea
                value={buildEmailContent(emailBooking)}
                readOnly
                className="min-h-[220px] text-sm"
              />

              <Button className="w-full" onClick={handleComposeEmail} disabled={!emailBooking.guestEmail}>
                <MailIcon className="h-4 w-4 mr-2" />
                Compose Email
              </Button>
              <Button variant="secondary" className="w-full" onClick={handleDownloadEmailPdf}>
                Download PDF
              </Button>
              {!emailBooking.guestEmail && (
                <p className="text-xs text-muted-foreground text-center">
                  No email address available for this guest.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
