import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Booking, BookingStatus, PaymentStatus } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Search, Filter, MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatCurrency } from "@/utils/currencyUtils";

interface BookingsTableProps {
  bookings: Booking[];
  isLoading: boolean;
  onEdit: (booking: Booking) => void;
  onStatusChange: (bookingId: string, status: BookingStatus) => void;
}

export function BookingsTable({ bookings, isLoading, onEdit, onStatusChange }: BookingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

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
                    {booking.checkInDate instanceof Timestamp 
                      ? format(booking.checkInDate.toDate(), "MMM dd, yyyy")
                      : format(new Date(booking.checkInDate), "MMM dd, yyyy")
                    }
                  </TableCell>
                  <TableCell className="text-white">
                    {booking.checkOutDate instanceof Timestamp 
                      ? format(booking.checkOutDate.toDate(), "MMM dd, yyyy")
                      : format(new Date(booking.checkOutDate), "MMM dd, yyyy")
                    }
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
    </div>
  );
}
