import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, Timestamp, getDocs, doc, updateDoc } from "firebase/firestore";
import { format, subDays, isToday, isYesterday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
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
  Edit,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Building
} from "lucide-react";
import { db } from "@/lib/firebase";
import { exportBookingsToCSV, downloadFile } from "@/lib/export-utils";
import { useAuth } from "@/contexts/AuthContext";
import { useBranches } from "@/hooks/useBranches";
import { Booking, BookingStatus } from "@/types/booking";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRangePresets } from "@/components/ui/date-range-presets";
import { BookingDetailsDialog } from "@/components/admin/BookingDetailsDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCollection } from "@/hooks/useCollection";
import { getBranches } from "@/services/branchService";
import { getDatabaseBranchId, getStaticBranchId } from "@/config/branchMappings";
import { AdminBookingForm } from "@/components/admin/AdminBookingForm";

import { BookingsTable } from "@/components/bookings/BookingsTable";
import { clearBookingData } from "@/utils/clearDatabase";

export const BookingsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  const { currentUser, activeBranchId, setActiveBranchId } = useAuth();
  const { toast } = useToast();
  const bookingsCollection = useCollection<Booking>("bookings");
  
  // Get branches data using the useBranches hook for proper branch dropdown
  const { branches: branchesData, isLoading: branchesLoading, error: branchesError } = useBranches();
  
  // Fetch current branch name
  useEffect(() => {
    const fetchBranchName = async () => {
      if (activeBranchId) {
        try {
          const branches = await getBranches();
          const branch = branches.find(b => b.id === activeBranchId);
          if (branch) {
            setCurrentBranchName(branch.name);
          }
        } catch (error) {
          console.error("Error fetching branch name:", error);
        }
      }
    };
    
    fetchBranchName();
  }, [activeBranchId]);

  // Fetch bookings from Firestore
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if user is authenticated
        if (!currentUser) {
          setError("You must be logged in to view bookings.");
          setIsLoading(false);
          return;
        }
        
        // Determine which branch to query
        let targetBranchId = activeBranchId;
        
        // For branch admins, use their assigned branch
        if (currentUser.role === 'branch-admin' && currentUser.branch) {
          targetBranchId = currentUser.branch;
        }
        // For HQ admins, use the selected branch or first available branch
        else if (currentUser.role === 'hq-admin' || currentUser.role === 'admin') {
          if (!targetBranchId && branchesData.length > 0) {
            targetBranchId = branchesData[0].id;
            setActiveBranchId(targetBranchId);
          }
        }

        if (!targetBranchId) {
          setError("No branch available. Please check your account permissions or contact support.");
          setIsLoading(false);
          return;
        }

        // Convert static branch ID to database ID for the query
        const databaseBranchId = getDatabaseBranchId(targetBranchId);

        // Query branch subcollection
        const q = query(
          collection(db, "branches", databaseBranchId, "bookings"),
          orderBy("checkInDate", "desc") // Most recent first
        );

        const querySnapshot = await getDocs(q);
        const bookingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[];

        setBookings(bookingsData);
        
        // Show success toast if data loaded successfully
        if (bookingsData.length > 0) {
          toast({
            title: "Bookings loaded",
            description: `${bookingsData.length} bookings retrieved successfully.`,
          });
        } else {
          toast({
            title: "No bookings found",
            description: "No booking records match your criteria.",
          });
        }
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        
        // Handle Firebase permission errors specifically
        if (err.message && err.message.includes("permission")) {
          setError("You don't have permission to access bookings. Please contact an administrator.");
          toast({
            variant: "destructive",
            title: "Permission denied",
            description: "You don't have sufficient permissions to view bookings.",
          });
        } else {
          setError("Failed to load bookings. Please try again later.");
          toast({
            variant: "destructive",
            title: "Error loading bookings",
            description: err.message || "An unexpected error occurred.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser, toast]);
  useEffect(() => {
    // realtime listener for bookings collection with optional branch filter
    try {
      setIsLoading(true);
      setError(null);

      if (!currentUser) {
        setError("You must be logged in to view bookings.");
        setIsLoading(false);
        return;
      }

      // Determine which branch to query
      let targetBranchId = activeBranchId;
      if (currentUser?.branch && currentUser.role !== 'admin') {
        targetBranchId = currentUser.branch;
      }

      if (!targetBranchId) {
        setError("No branch selected. Please select a branch to view bookings.");
        setIsLoading(false);
        return;
      }

      // Convert static branch ID to database ID
      const databaseBranchId = getDatabaseBranchId(targetBranchId);

      // Query multiple paths to ensure we catch all bookings (legacy, static, and new database IDs)
      const pathsToQuery = new Set<string>();
      pathsToQuery.add(databaseBranchId);
      if (targetBranchId !== databaseBranchId) {
        pathsToQuery.add(targetBranchId);
      }
      // Explicitly check legacy/alternate IDs for known branches
      const staticBranchId = getStaticBranchId(targetBranchId);
      if (staticBranchId === 'evo-road') {
        pathsToQuery.add('AS5mYsGNnvA4cxLIPL3W');
        pathsToQuery.add('evo-road'); // Ensure static is added
        pathsToQuery.add('URcvGkmbfrOFInlOS4I9'); // Ensure database ID is added
      }

      console.log("Querying bookings from paths:", Array.from(pathsToQuery));

      const unsubscribers: (() => void)[] = [];
      const bookingsMap = new Map<string, Booking[]>();
      let initialized = false;
      let previousIds = new Set<string>();

      pathsToQuery.forEach(branchId => {
        const q = query(
          collection(db, "branches", branchId, "bookings"),
          orderBy("checkInDate", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const branchBookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[];
          bookingsMap.set(branchId, branchBookings);

          // Merge all bookings from different paths
          const allBookings = Array.from(bookingsMap.values()).flat();
          
          // Deduplicate by ID
          const uniqueBookings = Array.from(new Map(allBookings.map(b => [b.id, b])).values());
          
          // Sort by checkInDate desc
          uniqueBookings.sort((a, b) => {
            const dateA = a.checkInDate?.toDate ? a.checkInDate.toDate() : new Date(a.checkInDate);
            const dateB = b.checkInDate?.toDate ? b.checkInDate.toDate() : new Date(b.checkInDate);
            return dateB.getTime() - dateA.getTime();
          });

          setBookings(uniqueBookings);

          // Track new docs after initial load to notify
          const currentIds = new Set(uniqueBookings.map(b => b.id));
          if (initialized) {
            for (const id of currentIds) {
              if (!previousIds.has(id)) {
                const newBooking = uniqueBookings.find(b => b.id === id);
                toast({
                  title: "New booking received",
                  description: newBooking?.guestName ? `${newBooking.guestName} just booked.` : `Booking #${id.slice(0,8)} added.`,
                });
              }
            }
          }
          previousIds = currentIds;
          
          // Set initialized to true after first successful fetch from ANY path
          if (!initialized) {
            initialized = true;
            setIsLoading(false);
          }
        }, (err) => {
          console.warn(`Error listening to bookings for path ${branchId}:`, err);
          // Don't fail completely if one path fails, unless all fail
          // But we'll let the other paths continue
        });
        
        unsubscribers.push(unsubscribe);
      });

      return () => {
        unsubscribers.forEach(u => u());
      };

    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.branchName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesBranch = branchFilter === "all" || booking.branchId === branchFilter;
    const matchesRoomType = roomTypeFilter === "all" || booking.roomType === roomTypeFilter;
    
    const matchesDate = !dateRange || 
      !dateRange.from || 
      !dateRange.to || 
      (booking.checkInDate.toDate() >= dateRange.from && 
       booking.checkOutDate.toDate() <= dateRange.to);

    return matchesSearch && matchesStatus && matchesBranch && matchesRoomType && matchesDate;
  });

  // Get recent bookings (last 7 days)
  const recentBookings = bookings.filter(booking => {
    const bookingDate = (booking.bookingDate || booking.createdAt)?.toDate() || new Date();
    const sevenDaysAgo = subDays(new Date(), 7);
    return bookingDate >= sevenDaysAgo;
  });

  // Get today's check-ins and check-outs
  const todayCheckIns = bookings.filter(booking => 
    isToday(booking.checkInDate.toDate())
  );
  const todayCheckOuts = bookings.filter(booking => 
    isToday(booking.checkOutDate.toDate())
  );

  // Get unique branches for filter - use proper branch data from useBranches hook
  const branches = branchesData || [];

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-[hsl(var(--royal-blue))]" />;
      default:
        return <AlertCircle className="h-4 w-4 text-white/70" />;
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
        return 'bg-[hsl(var(--royal-blue)/0.1)] text-[hsl(var(--royal-blue))] border-[hsl(var(--royal-blue)/0.2)]';
      default:
        return 'bg-gray-500/10 text-white border-gray-500/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getRelativeTime = (date: Timestamp | undefined) => {
    if (!date) return 'Unknown';
    const bookingDate = date.toDate();
    if (isToday(bookingDate)) return 'Today';
    if (isYesterday(bookingDate)) return 'Yesterday';
    return format(bookingDate, 'MMM d');
  };

  // Update booking status in Firestore
  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      // Find the booking in our local state to get the branchId
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking || !booking.branchId) {
        throw new Error('Booking not found or missing branch information');
      }
      
      // Get reference to the booking document in the correct branch subcollection
      const bookingRef = doc(db, "branches", booking.branchId, "bookings", bookingId);
      
      // Update the status field
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      
      // Show success toast
      toast({
        title: "Booking updated",
        description: `Booking status changed to ${newStatus}`,
        variant: "default"
      });
      
      // If status is completed, update room availability
      if (newStatus === "completed") {
        // Find the booking in our local state
        const booking = bookings.find(b => b.id === bookingId);
        if (booking && booking.roomId && booking.branchId) {
          try {
            // Get the room document reference
            const roomRef = doc(db, "branches", booking.branchId, "rooms", booking.roomId);
            
            // Update the room availability
            await updateDoc(roomRef, {
              available: true,
              lastCheckoutDate: Timestamp.now()
            });
            
            console.log(`Room ${booking.roomId} marked as available after checkout`);
          } catch (roomError) {
            console.error("Error updating room availability:", roomError);
            // Don't fail the whole operation if room update fails
          }
        }
      }
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update booking status",
        variant: "destructive"
      });
    }
  };
  
  // Handler for status change from BookingsTable
  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    updateBookingStatus(bookingId, newStatus);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-white/70">Loading bookings...</p>
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
            <p className="text-sm text-white/70">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">Bookings Management</h1>
          <p className="text-white/70 mt-1">
            Manage and track all hotel bookings across branches
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="bg-yellow-400 text-[hsl(var(--royal-blue-dark))] border-yellow-400 hover:bg-yellow-300 hover:text-[hsl(var(--royal-blue-dark))] font-semibold"
            onClick={() => {
               const csvData = exportBookingsToCSV(filteredBookings);
               downloadFile(csvData, 'bookings-export.csv', 'text/csv');
               toast({
                 title: "Export successful",
                 description: "Bookings data has been exported to CSV.",
               });
             }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={showCreateBooking} onOpenChange={setShowCreateBooking}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-400 text-[hsl(var(--royal-blue-dark))] hover:bg-yellow-300 hover:text-[hsl(var(--royal-blue-dark))] font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white/10 backdrop-blur-md border-white/20 p-0">
              <AdminBookingForm 
                onBookingSuccess={() => {
                  setShowCreateBooking(false);
                  toast({
                    title: "Success",
                    description: "Booking created successfully!",
                  });
                }}
                onCancel={() => setShowCreateBooking(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total Bookings</p>
                <p className="text-2xl font-bold text-yellow-400">{bookings.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Today's Check-ins</p>
                <p className="text-2xl font-bold text-yellow-400">{todayCheckIns.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-400/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Today's Check-outs</p>
                <p className="text-2xl font-bold text-yellow-400">{todayCheckOuts.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[hsl(var(--royal-blue)/0.2)] flex items-center justify-center">
                <Clock className="h-6 w-6 text-[hsl(var(--royal-blue))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Recent Bookings</p>
                <p className="text-2xl font-bold text-yellow-400">{recentBookings.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-yellow-400">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-400" />
                <Input
                  type="search"
                  placeholder="Search by guest name, email, booking ID, or branch..."
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-yellow-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus | "all")}>
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/20 text-white">
                    <Filter className="mr-2 h-4 w-4 text-yellow-400" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
                    <SelectItem value="all" className="text-white hover:bg-yellow-400/20">All Statuses</SelectItem>
                    <SelectItem value="pending" className="text-white hover:bg-yellow-400/20">Pending</SelectItem>
                    <SelectItem value="confirmed" className="text-white hover:bg-yellow-400/20">Confirmed</SelectItem>
                    <SelectItem value="completed" className="text-white hover:bg-yellow-400/20">Completed</SelectItem>
                    <SelectItem value="cancelled" className="text-white hover:bg-yellow-400/20">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {branches.length > 0 && (
                  <Select value={branchFilter} onValueChange={setBranchFilter} disabled={branchesLoading}>
                    <SelectTrigger className="w-[180px] bg-white/5 border-white/20 text-white">
                      <MapPin className="mr-2 h-4 w-4 text-yellow-400" />
                      <SelectValue placeholder="Branch" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
                      <SelectItem value="all" className="text-white hover:bg-yellow-400/20">All Branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id || ''} className="text-white hover:bg-yellow-400/20">{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                  <SelectTrigger className="w-[180px] bg-white/5 border-white/20 text-white">
                    <BedDouble className="mr-2 h-4 w-4 text-yellow-400" />
                    <SelectValue placeholder="Room Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
                    <SelectItem value="all" className="text-white hover:bg-yellow-400/20">All Room Types</SelectItem>
                    <SelectItem value="standard-room" className="text-white hover:bg-yellow-400/20">Standard Room</SelectItem>
                    <SelectItem value="superior-room" className="text-white hover:bg-yellow-400/20">Superior Room</SelectItem>
                    <SelectItem value="deluxe-room" className="text-white hover:bg-yellow-400/20">Deluxe Room</SelectItem>

                    <SelectItem value="junior-suite" className="text-white hover:bg-yellow-400/20">Junior Suite</SelectItem>
                    <SelectItem value="executive-suite" className="text-white hover:bg-yellow-400/20">Executive Suite</SelectItem>
                    <SelectItem value="presidential-suite" className="text-white hover:bg-yellow-400/20">Presidential Suite</SelectItem>
                    <SelectItem value="penthouse" className="text-white hover:bg-yellow-400/20">Penthouse</SelectItem>
                    <SelectItem value="villa" className="text-white hover:bg-yellow-400/20">Villa</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <DateRangePicker
                    dateRange={dateRange || { from: undefined, to: undefined }}
                    onDateRangeChange={setDateRange}
                    className="w-[250px]"
                  />
                  <DateRangePresets onSelect={setDateRange} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md border-white/20">
          <TabsTrigger value="all" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))]">All Bookings</TabsTrigger>
          <TabsTrigger value="recent" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))]">Recent</TabsTrigger>
          <TabsTrigger value="today" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))]">Today</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-0">
              <BookingsTable 
                bookings={filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} 
                isLoading={isLoading} 
                onEdit={(booking) => {
                  setSelectedBooking(booking);
                  setShowBookingDetails(true);
                }} 
                onStatusChange={handleStatusChange} 
              />
              {filteredBookings.length > 0 && (
                <div className="flex items-center justify-between p-4 border-t border-white/20">
                  <div className="flex items-center gap-2">
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(parseInt(value));
                        setCurrentPage(1); // Reset to first page when changing items per page
                      }}
                    >
                      <SelectTrigger className="w-[120px] bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Per page" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
                        <SelectItem value="5" className="text-white hover:bg-yellow-400/20">5 per page</SelectItem>
                        <SelectItem value="10" className="text-white hover:bg-yellow-400/20">10 per page</SelectItem>
                        <SelectItem value="20" className="text-white hover:bg-yellow-400/20">20 per page</SelectItem>
                        <SelectItem value="50" className="text-white hover:bg-yellow-400/20">50 per page</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-white/70">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredBookings.length)} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/5 border-white/20 text-white hover:bg-yellow-400 hover:text-[hsl(var(--royal-blue-dark))]"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(filteredBookings.length / itemsPerPage)) }, (_, i) => {
                        const pageNumber = i + 1;
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="icon"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`w-8 h-8 ${
                              currentPage === pageNumber 
                                ? "bg-yellow-400 text-[hsl(var(--royal-blue-dark))] hover:bg-yellow-300" 
                                : "bg-white/5 border-white/20 text-white hover:bg-yellow-400 hover:text-[hsl(var(--royal-blue-dark))]"
                            }`}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                      {Math.ceil(filteredBookings.length / itemsPerPage) > 5 && (
                        <span className="text-white/70 mx-1">...</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/5 border-white/20 text-white hover:bg-yellow-400 hover:text-[hsl(var(--royal-blue-dark))]"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredBookings.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredBookings.length / itemsPerPage)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-400">
                <Clock className="h-5 w-5" />
                <span>Recent Bookings (Last 7 Days)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-white/50 opacity-50" />
                  <p className="text-white/70">No recent bookings found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.slice(0, 10).map((booking) => (
                    <div 
                      key={booking.id} 
                      className="flex items-center justify-between p-4 rounded-lg border border-white/20 hover:bg-white/5 transition-colors cursor-pointer bg-white/5"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowBookingDetails(true);
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{booking.guestName || 'Guest'}</p>
                          <p className="text-sm text-white/70">
                            {booking.roomType} • {booking.branchName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-yellow-400">{formatCurrency(booking.totalAmount)}</p>
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
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-400">
                  <Users className="h-5 w-5 text-green-400" />
                  <span>Today's Check-ins</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayCheckIns.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-white/50 opacity-50" />
                    <p className="text-white/70">No check-ins scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayCheckIns.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="flex items-center justify-between p-3 rounded-lg border border-white/20 cursor-pointer hover:bg-white/5 transition-colors bg-white/5"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowBookingDetails(true);
                        }}
                      >
                        <div>
                          <p className="font-medium text-white">{booking.guestName || 'Guest'}</p>
                          <p className="text-sm text-white/70">{booking.roomType}</p>
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

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-400">
                  <Clock className="h-5 w-5 text-[hsl(var(--royal-blue))]" />
                  <span>Today's Check-outs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayCheckOuts.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-white/50 opacity-50" />
                    <p className="text-white/70">No check-outs scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayCheckOuts.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="flex items-center justify-between p-3 rounded-lg border border-white/20 cursor-pointer hover:bg-white/5 transition-colors bg-white/5"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowBookingDetails(true);
                        }}
                      >
                        <div>
                          <p className="font-medium text-white">{booking.guestName || 'Guest'}</p>
                          <p className="text-sm text-white/70">{booking.roomType}</p>
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

      {/* Booking Details Dialog */}
      <BookingDetailsDialog 
        booking={selectedBooking}
        open={showBookingDetails}
        onOpenChange={setShowBookingDetails}
      />
    </div>
  );
};

export default BookingsPage;
