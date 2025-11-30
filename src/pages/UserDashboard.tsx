import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Home, Calendar, Star, Plus, CheckCircle, LogOut, Clock, MapPin, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import type { Booking } from "@/types/booking";
import type { User } from "@/types/auth";
// Removed Firestore imports - now using API endpoint
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

// Define the dashboard stats interface
interface DashboardStats {
  totalBookings: number;
  totalNights: number;
  favoriteBranch?: string;
  loyaltyPoints: number;
  upcomingTrips?: number;
  pastTrips?: number;
  lastStay?: {
    branch: string;
    date: string;
    roomType: string;
  };
}

// DashboardStats interface is used for the booking statistics

// Simple loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
  </div>
);

export const UserDashboard = () => {
  const { currentUser, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false); // Start with false to prevent initial loading screen
  const [profileData, setProfileData] = useState<Partial<User>>({
    name: '',
    email: '',
    joinDate: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    role: 'user',
    preferences: {}
  });
  const [bookingStats, setBookingStats] = useState<DashboardStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [favoriteBranch, setFavoriteBranch] = useState<string>("");
  const [showWelcome, setShowWelcome] = useState(false);

  // Helper function to safely format dates
  const safeFormatDate = (dateString?: string, formatString: string = 'MMM d, yyyy') => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid date' : format(date, formatString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Helper function to get payment status badge
  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
      case 'successful':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-[hsl(var(--royal-blue)/0.1)] text-[hsl(var(--royal-blue))] border-[hsl(var(--royal-blue)/0.2)]">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Unknown</Badge>;
    }
  };

  // Helper function to load user data with performance optimizations
  const loadUserData = useCallback(async () => {
    if (!currentUser) {
      console.log('No current user available');
      setIsLoading(false);
      return;
    }

    // Store currentUser reference to avoid race conditions
    const user = currentUser;

    console.log('Loading user data for:', user.email, 'Role:', user.role);
    setIsLoading(true);
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    try {
      // Use the current user data from Firebase
      setProfileData(user);

      // Initialize with default values
      let bookings: Booking[] = [];
      const branchCount: Record<string, number> = {};
      let stats: DashboardStats = {
        totalBookings: 0,
        totalNights: 0,
        loyaltyPoints: 0,
        upcomingTrips: 0,
        pastTrips: 0
      };

      // Helper to normalize Firestore Timestamp or ISO string to ISO string
      const toIso = (v: any) => {
        if (!v) return new Date().toISOString();
        if (typeof v === 'string') {
          const d = new Date(v);
          return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        }
        if (typeof (v as any).toDate === 'function') {
          try { return (v as any).toDate().toISOString(); } catch { return new Date().toISOString(); }
        }
        try { return new Date(v).toISOString(); } catch { return new Date().toISOString(); }
      };

      try {
        // Create fetch request with timeout
        const API_BASE_URL = (import.meta as any).env?.VITE_NEXT_PUBLIC_API_URL || (import.meta as any).env?.NEXT_PUBLIC_API_URL || '/api';
        const fetchRequest = fetch(`${API_BASE_URL}/user-bookings/${user.id}`);
        
        // Race between fetch and timeout
        const response = await Promise.race([
          fetchRequest,
          timeoutPromise
        ]) as Response;
        
        if (response.ok) {
          // Check if response is actually JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            bookings = data.bookings || [];
            
            // Map API stats to dashboard stats format
            stats = {
              totalBookings: data.stats.totalBookings || 0,
              totalNights: data.stats.totalNights || 0,
              loyaltyPoints: data.stats.loyaltyPoints || 0,
              upcomingTrips: data.stats.upcomingBookings || 0,
              pastTrips: data.stats.pastBookings || 0
            };

            // Set favorite branch
            if (data.stats.favoriteBranch && data.stats.favoriteBranch !== 'No bookings yet') {
              branchCount[data.stats.favoriteBranch] = 1;
            }
          } else {
            // Response is not JSON (likely HTML error page)
            const textResponse = await response.text();
            console.error('API returned non-JSON response:', textResponse.substring(0, 200));
            throw new Error('Server returned an invalid response format');
          }
        } else {
          // Handle HTTP error responses
          const errorText = await response.text();
          console.error(`API request failed with status ${response.status}:`, errorText.substring(0, 200));
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

      } catch (error) {
        console.error('Error fetching booking data from API:', error);
        
        // Provide user-friendly error messages with toast notifications
        if (error instanceof Error) {
          if (error.message === 'Request timeout') {
            console.error('API request timed out after 10 seconds');
            toast({
              title: "Connection Timeout",
              description: "The request took too long to complete. Please check your internet connection and try again.",
              variant: "destructive"
            });
          } else if (error.message.includes('invalid response format')) {
            console.error('Server returned an error page instead of data');
            toast({
              title: "Server Error",
              description: "The server encountered an error. Please try refreshing the page or contact support if the issue persists.",
              variant: "destructive"
            });
          } else if (error.message.includes('Failed to fetch')) {
            console.error('Network error - check if the API server is running');
            toast({
              title: "Connection Error",
              description: "Unable to connect to the server. Please check your internet connection and try again.",
              variant: "destructive"
            });
          } else if (error.message.includes('API request failed')) {
            toast({
              title: "Data Loading Error",
              description: "Failed to load your booking data. Please try refreshing the page.",
              variant: "destructive"
            });
          } else {
            // Generic error fallback
            toast({
              title: "Unexpected Error",
              description: "Something went wrong while loading your data. Please try again.",
              variant: "destructive"
            });
          }
        } else {
          // Non-Error object thrown
          toast({
            title: "Unexpected Error",
            description: "Something went wrong while loading your data. Please try again.",
            variant: "destructive"
          });
        }
        
        // Keep default values if there's an error
      }
      
      // Calculate favorite branch
      let favorite = "";
      let maxCount = 0;
      Object.entries(branchCount).forEach(([branch, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favorite = branch;
        }
      });
      setFavoriteBranch(favorite);

      const now = new Date();
      const upcoming = bookings
        .filter(b => new Date(b.checkOutDate) >= now)
        .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());

      const past = bookings
        .filter(b => new Date(b.checkOutDate) < now);

      // Calculate total nights stayed (limit to prevent performance issues)
      const totalNights = past.slice(0, 20).reduce((total, booking) => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        return total + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }, 0);

      // Calculate loyalty points (1 point per night stayed)
      const loyaltyPoints = 100 + totalNights; // Starting with 100 points

      // Initialize stats
      const userStats: DashboardStats = {
        totalBookings: bookings.length,
        totalNights,
        loyaltyPoints,
        upcomingTrips: upcoming.length,
        pastTrips: past.length,
        favoriteBranch: favorite,
      };

      if (past.length > 0) {
        userStats.lastStay = {
          branch: past[0].branchName,
          date: past[0].checkOutDate,
          roomType: past[0].roomType
        };
      }

      setBookingStats(userStats);
      setUpcomingBookings(upcoming);
      setPastBookings(past);

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Don't show toast for network issues, just log them
      if (error instanceof Error && !error.message.includes('network')) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Helper function to get favorite branch
  const getFavoriteBranch = useCallback((): string => {
    if (favoriteBranch) return favoriteBranch;
    return bookingStats?.favoriteBranch || "—";
  }, [favoriteBranch, bookingStats]);

  // Helper function to get last stay info
  const getLastStayInfo = useCallback((): string => {
    if (pastBookings.length > 0) {
      return `Last stay: ${format(new Date(pastBookings[0].checkOutDate), 'MMM yyyy')}`;
    }
    if (bookingStats?.lastStay) {
      return `Last stay: ${format(new Date(bookingStats.lastStay.date), 'MMM yyyy')}`;
    }
    return "No past stays";
  }, [pastBookings, bookingStats]);

  // Load user data on mount and when currentUser changes
  useEffect(() => {
    // Check for welcome flag in URL
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true);
      // Handle redirection if not authenticated
      if (!isAuthenticated) {
        navigate('/auth', { 
          state: { 
            from: window.location.pathname,
            message: 'Please sign in to access your dashboard' 
          }, 
          replace: true 
        });
      }
    }

    if (!isAuthLoading && !isAuthenticated) {
      navigate('/auth', { 
        state: { 
          from: window.location.pathname,
          message: 'Please sign in to access your dashboard' 
        }, 
        replace: true 
      });
      return;
    }

    if (currentUser) {
      console.log('UserDashboard: Loading user data for:', currentUser.email);
      setIsLoading(true);
      loadUserData().catch(error => {
        console.error("Failed to load dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Some features may be limited.",
          variant: "destructive"
        });
      }).finally(() => {
        setIsLoading(false);
      });
    }

    // Cleanup function to prevent Firestore connection issues
    return () => {
      // Reset loading state when component unmounts
      setIsLoading(false);
    };
  }, [currentUser, isAuthenticated, isAuthLoading, navigate, searchParams, loadUserData]);

  const handleViewBookingDetails = (bookingId: string) => {
    // Navigate to booking details page
    navigate(`/bookings/${bookingId}`);
  };

  const handleCancelBooking = (bookingId: string) => {
    // Handle booking cancellation
    console.log("Cancel booking:", bookingId);
    // In a real app, this would trigger an API call
    toast({
      title: "Info",
      description: "Cancellation request sent"
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "Successfully logged out"
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Set active tab based on URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'bookings', 'profile', 'preferences', 'reviews'].includes(tab)) {
      setActiveTab(tab);
    }
    
    // Show welcome message on first visit
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [searchParams]);

  // Welcome Message Component removed

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  // Show skeleton loaders during initial data load
  const showSkeletons = isLoading && !profileData?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--royal-blue-dark))] via-[hsl(var(--royal-blue))] to-[hsl(var(--royal-blue-light))]">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center space-x-4">
          {showSkeletons ? (
            <>
              <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
              <div>
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
              </div>
            </>
          ) : (
            <>
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={profileData?.name || ''} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-700 text-white text-2xl">
                  {profileData?.name
                    .split(" ")
                    .map(n => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {getGreeting()}, {profileData?.name || 'Guest'}
                </h1>
                <p className="text-white">Here's what's happening with your bookings</p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {showSkeletons ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Total Stays"
              value={bookingStats?.totalNights?.toString() || '0'}
              icon={<Home className="h-4 w-4 text-muted-foreground" />}
              description={`${bookingStats?.totalNights || 0} nights across ${bookingStats?.totalBookings || 0} bookings`}
            />
            <StatCard
              title="Upcoming Trips"
              value={upcomingBookings.length.toString()}
              icon={<Calendar className="h-4 w-4" />}
              description={`${upcomingBookings.length} booked`}
            />
            <StatCard
              title="Loyalty Points"
              value={bookingStats?.loyaltyPoints || 0}
              icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
              description="Earn more with each stay"
            />
            <StatCard
              title="Favorite Branch"
              value={bookingStats?.favoriteBranch || "—"}
              icon={<MapPin className="h-4 w-4 text-rose-500" />}
              description={getLastStayInfo()}
              valueClassName="text-lg"
            />
          </>
        )}

        {/* Upcoming Bookings List */}
        <div className="space-y-4">
          {upcomingBookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{booking.branchName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.checkInDate), 'MMM d, yyyy')} - {format(new Date(booking.checkOutDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewBookingDetails(booking.id)}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/10 backdrop-blur-md border-white/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))] text-white">Overview</TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))] text-white">My Bookings</TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))] text-white">Feedback</TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))] text-white">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-white">
                  <Calendar className="h-5 w-5 mr-2 text-yellow-400" />
                  Next Stay
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-lg font-medium text-white">{upcomingBookings[0].branchName}</p>
                    <p className="text-sm text-white">
                      {format(new Date(upcomingBookings[0].checkInDate), 'MMM d, yyyy')} -{' '}
                      {format(new Date(upcomingBookings[0].checkOutDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-white">
                      {upcomingBookings[0].roomType} • {upcomingBookings[0].guests} {upcomingBookings[0].guests === 1 ? 'guest' : 'guests'}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 bg-yellow-400/20 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30" 
                      onClick={() => handleViewBookingDetails(upcomingBookings[0].id)}
                    >
                      View Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="h-8 w-8 mx-auto text-white mb-2" />
                    <p className="text-white">No upcoming stays</p>
                    <Button 
                    className="mt-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-[hsl(var(--royal-blue-dark))] hover:from-yellow-500 hover:to-amber-600 font-semibold" 
                    onClick={() => navigate('/book')}
                  >
                    Book a Stay
                  </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-white">
                  <Star className="h-5 w-5 mr-2 text-yellow-400 fill-yellow-400" />
                  Loyalty Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Member Since</p>
                      <p className="text-sm text-white">
                        {profileData?.joinDate ? format(new Date(profileData.joinDate), 'MMM d, yyyy') : '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">Tier</p>
                      <p className="text-sm text-yellow-400 font-medium">
                        {bookingStats?.loyaltyPoints && bookingStats.loyaltyPoints >= 1000 ? 'Gold' : 'Silver'}
                      </p>
                    </div>
                  </div>
                    <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-white">
                      <span>Silver Tier</span>
                      <span>Gold Tier</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
                        style={{
                          width: `${Math.min(100, ((bookingStats?.loyaltyPoints || 0) / 1000) * 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-white text-center">
                      {bookingStats?.loyaltyPoints || 0} / 1000 points to Gold
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">Current Status</span>
                      <span className="font-medium text-white">Gold Member</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2.5 rounded-full" 
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-white mt-1">
                      7,500 / 10,000 points to Platinum
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/20">
                    <h4 className="text-sm font-medium mb-2 text-white">Benefits</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-yellow-400 mr-2" />
                        <span className="text-white">Free room upgrade when available</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-yellow-400 mr-2" />
                        <span className="text-white">Late checkout until 2 PM</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-yellow-400 mr-2" />
                        <span className="text-white">Welcome amenity at check-in</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-4 shadow-xl hover:bg-white/15 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white">{booking.branchName}</h3>
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </div>
                      <p className="text-sm text-white">
                        {format(new Date(booking.checkInDate), 'MMM d, yyyy')} - {format(new Date(booking.checkOutDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-white">
                        {booking.roomType} • {booking.guestCount} guests
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={() => handleViewBookingDetails(booking.id)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-white mb-4" />
              <h3 className="text-lg font-medium text-white">No upcoming stays</h3>
              <p className="text-white mb-6">Your next adventure awaits!</p>
              <Button 
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-[hsl(var(--royal-blue-dark))] hover:from-yellow-500 hover:to-amber-600 font-medium"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/auth", { state: { from: "/book" } });
                  } else {
                    navigate("/book");
                  }
                }}
              >
                Book a Stay
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pastBookings.map((booking) => (
                <div key={booking.id} className="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-4 shadow-xl hover:bg-white/15 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white">{booking.branchName}</h3>
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </div>
                      <p className="text-sm text-[hsl(var(--royal-blue-light))]">
                        {format(new Date(booking.checkInDate), 'MMM d, yyyy')} - {format(new Date(booking.checkOutDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-[hsl(var(--royal-blue-light))]">
                        {booking.roomType} • {booking.status} • ${booking.totalAmount}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      onClick={() => handleViewBookingDetails(booking.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-white mb-4" />
              <h3 className="text-lg font-medium text-white">No past stays yet</h3>
              <p className="text-white">Your upcoming adventures will appear here</p>
              <Button 
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-[hsl(var(--royal-blue-dark))] hover:from-yellow-500 hover:to-amber-600 font-medium"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/auth", { state: { from: "/book" } });
                  } else {
                    navigate("/book");
                  }
                }}
              >
                Book Your First Stay
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="h-5 w-5 text-yellow-400" />
                Share Your Feedback
              </CardTitle>
              <p className="text-sm text-white mt-1">
                We'd love to hear your feedback or help with any issues you're experiencing.
              </p>
            </CardHeader>
            <CardContent>
              <FeedbackForm 
                userId={currentUser?.id || ''}
                userEmail={currentUser?.email || ''}
                onSuccess={() => {
                  // Optional: Handle success (e.g., show a thank you message)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white">Full Name</p>
                  <p className="font-medium text-white">{profileData?.name || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm text-white">Email</p>
                  <p className="font-medium text-white">{profileData?.email || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm text-white">Member Since</p>
                  <p className="font-medium text-white">
                    {safeFormatDate(profileData?.joinDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white">Last Login</p>
                  <p className="font-medium text-white">
                    {safeFormatDate(profileData.lastLogin, 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <Button 
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => {
                    // Handle edit profile
                    toast({
                      title: "Info",
                      description: "Edit profile functionality coming soon"
                    });
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};
