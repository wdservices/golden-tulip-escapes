import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { format, subDays, isToday, isYesterday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Eye, 
  Plus, 
  Download, 
  Calendar, 
  Loader2, 
  Filter, 
  Clock, 
  Users, 
  TrendingUp, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Bed,
  Star,
  Edit
} from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Booking, BookingStatus } from "@/types/booking";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const BookingsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const { currentUser } = useAuth();

  // Fetch bookings from Firestore
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Start with base query
        let q = query(
          collection(db, "bookings"),
          orderBy("checkInDate", "desc") // Most recent first
        );

        // Apply branch filter if user is branch-specific
        if (currentUser?.branch && currentUser.role !== 'admin') {
          q = query(q, where("branchId", "==", currentUser.branch));
        }

        const querySnapshot = await getDocs(q);
        const bookingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[];

        setBookings(bookingsData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.branchName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesBranch = branchFilter === "all" || booking.branchId === branchFilter;
    
    const matchesDate = !dateRange || 
      !dateRange.from || 
      !dateRange.to || 
      (new Date(booking.checkInDate) >= dateRange.from && 
       new Date(booking.checkOutDate) <= dateRange.to);

    return matchesSearch && matchesStatus && matchesBranch && matchesDate;
  });

  // Get recent bookings (last 7 days)
  const recentBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate || booking.createdAt || '');
    const sevenDaysAgo = subDays(new Date(), 7);
    return bookingDate >= sevenDaysAgo;
  });

  // Get today's check-ins and check-outs
  const todayCheckIns = bookings.filter(booking => 
    isToday(new Date(booking.checkInDate))
  );
  const todayCheckOuts = bookings.filter(booking => 
    isToday(new Date(booking.checkOutDate))
  );

  // Get unique branches for filter
  const branches = Array.from(new Set(bookings.map(b => b.branchName).filter(Boolean)));

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getRelativeTime = (date: string) => {
    const bookingDate = new Date(date);
    if (isToday(bookingDate)) return 'Today';
    if (isYesterday(bookingDate)) return 'Yesterday';
    return format(bookingDate, 'MMM d');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card p-6">
        <div className="flex items-center space-x-3 text-red-600">
          <XCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Error Loading Bookings</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gradient-gold">Bookings Management</h1>
          <p className="text-muted-foreground">
            Manage all hotel bookings, reservations, and guest services
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="admin-card">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={showCreateBooking} onOpenChange={setShowCreateBooking}>
            <DialogTrigger asChild>
              <Button className="btn-luxury-nav">
                <Plus className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
              </DialogHeader>
              <div className="p-6 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Booking creation form will be implemented here</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="admin-stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Check-ins</p>
                <p className="text-2xl font-bold text-green-600">{todayCheckIns.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Check-outs</p>
                <p className="text-2xl font-bold text-blue-600">{todayCheckOuts.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Bookings</p>
                <p className="text-2xl font-bold text-luxury">{recentBookings.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-luxury/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-luxury" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all-bookings" className="space-y-6">
        <TabsList className="admin-card">
          <TabsTrigger value="all-bookings">All Bookings</TabsTrigger>
          <TabsTrigger value="recent">Recent Bookings</TabsTrigger>
          <TabsTrigger value="today">Today's Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="all-bookings" className="space-y-6">
          {/* Filters */}
          <Card className="admin-card">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by guest name, email, booking ID, or branch..."
                    className="pl-10 booking-select"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus | "all")}>
                    <SelectTrigger className="w-[180px] booking-select">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="booking-dropdown">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  {branches.length > 1 && (
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger className="w-[180px] booking-select">
                        <MapPin className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Branch" />
                      </SelectTrigger>
                      <SelectContent className="booking-dropdown">
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <DateRangePicker
                    dateRange={dateRange || { from: undefined, to: undefined }}
                    onDateRangeChange={setDateRange}
                    className="w-[250px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card className="admin-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="font-semibold">Booking Details</TableHead>
                    <TableHead className="font-semibold">Guest Information</TableHead>
                    <TableHead className="font-semibold">Stay Details</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <Calendar className="h-8 w-8 text-muted-foreground opacity-50" />
                          <div>
                            <p className="font-medium">
                              {searchTerm || statusFilter !== 'all' || dateRange
                                ? 'No matching bookings found'
                                : 'No bookings available'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Try adjusting your search criteria
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id} className="border-border/20 hover:bg-muted/20 transition-colors">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-sm">#{booking.id.substring(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {getRelativeTime(booking.bookingDate || booking.createdAt || '')}
                            </p>
                            {booking.branchName && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                {booking.branchName}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <p className="font-medium text-sm">{booking.guestName || 'N/A'}</p>
                            </div>
                            {booking.guestEmail && (
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {booking.guestEmail}
                              </div>
                            )}
                            {booking.guestPhone && (
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {booking.guestPhone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Bed className="h-3 w-3 text-muted-foreground" />
                              <p className="text-sm capitalize">{booking.roomType}</p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <p>Check-in: {format(new Date(booking.checkInDate), 'MMM d, yyyy')}</p>
                              <p>Check-out: {format(new Date(booking.checkOutDate), 'MMM d, yyyy')}</p>
                            </div>
                            {booking.guests && (
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-semibold text-primary">
                              {formatCurrency(booking.totalAmount)}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <CreditCard className="h-3 w-3" />
                              <span className="capitalize">{booking.paymentStatus || 'pending'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusVariant(booking.status)} border capitalize flex items-center space-x-1 w-fit`}>
                            {getStatusIcon(booking.status)}
                            <span>{booking.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-48 p-2">
                              <div className="flex flex-col space-y-1">
                                <Button variant="ghost" size="sm" className="justify-start">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                                <Button variant="ghost" size="sm" className="justify-start">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Booking
                                </Button>
                                {booking.status !== "completed" && (
                                  <Button variant="ghost" size="sm" className="justify-start text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Complete
                                  </Button>
                                )}
                                {booking.status !== "cancelled" && (
                                  <Button variant="ghost" size="sm" className="justify-start text-red-600">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="border-t border-border/30 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredBookings.length}</span> of{' '}
                  <span className="font-medium text-foreground">{bookings.length}</span> bookings
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-luxury" />
                <span>Recent Bookings (Last 7 Days)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No recent bookings found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.slice(0, 10).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.guestName || 'Guest'}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.roomType} • {booking.branchName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{formatCurrency(booking.totalAmount)}</p>
                        <Badge className={`${getStatusVariant(booking.status)} border text-xs`}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Today's Check-ins</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayCheckIns.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No check-ins scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayCheckIns.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
                        <div>
                          <p className="font-medium">{booking.guestName || 'Guest'}</p>
                          <p className="text-sm text-muted-foreground">{booking.roomType}</p>
                        </div>
                        <Badge className={`${getStatusVariant(booking.status)} border`}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Today's Check-outs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayCheckOuts.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No check-outs scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayCheckOuts.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
                        <div>
                          <p className="font-medium">{booking.guestName || 'Guest'}</p>
                          <p className="text-sm text-muted-foreground">{booking.roomType}</p>
                        </div>
                        <Badge className={`${getStatusVariant(booking.status)} border`}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingsPage;
