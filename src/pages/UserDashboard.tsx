import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, Home, MapPin, Star, LogOut, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { format } from "date-fns";
import type { Booking } from "@/types/booking";
import type { User } from "@/types/auth";
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [bookingStats, setBookingStats] = useState<DashboardStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [favoriteBranch, setFavoriteBranch] = useState<string>("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);

  // Helper function to load user data with performance optimizations
  const loadUserData = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    try {
      // Use the current user data from Firebase
      setProfileData(currentUser);

      // Limit query to recent bookings for performance
      const bookings: Booking[] = [];
      const branchCount: Record<string, number> = {};

      try {
        // Fetch user's bookings from Firestore with limit for performance
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef, 
          where('userId', '==', currentUser.id),
          orderBy('checkInDate', 'desc'),
          limit(50) // Limit to prevent performance issues
        );

        // Race between Firestore query and timeout
        const queryPromise = getDocs(q);
        const querySnapshot = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Booking;
          bookings.push({
            ...data,
            id: doc.id,
            checkInDate: (data.checkInDate as unknown as Timestamp).toDate().toISOString(),
            checkOutDate: (data.checkOutDate as unknown as Timestamp).toDate().toISOString(),
            bookingDate: (data.bookingDate as unknown as Timestamp).toDate().toISOString(),
          });

          // Count branch usage
          if (data.branchName) {
            branchCount[data.branchName] = (branchCount[data.branchName] || 0) + 1;
          }
        });
      } catch (firestoreError) {
        console.warn("Could not load booking data:", firestoreError);
        // Continue with empty bookings array if Firestore fails
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
        toast.error("Failed to load dashboard data. Please refresh the page.");
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

  // Load user data on component mount and when auth state changes
  useEffect(() => {
    // Check for welcome flag in URL
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true);
      toast.success('Registration successful! Welcome to Golden Tulip Escapes!', {
        duration: 5000,
      });
      // Clean up the URL
      navigate('/dashboard', { replace: true });
    }

    if (!isAuthLoading && !isAuthenticated) {
      navigate("/auth", { state: { from: "/dashboard" } });
      return;
    }

    if (currentUser) {
      loadUserData().catch(error => {
        console.error("Failed to load dashboard data:", error);
        // Don't redirect on data loading failure, show the dashboard with error state
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
    toast.info("Cancellation request sent");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Failed to log out', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Welcome Message Component
  const WelcomeMessage = () => (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">{getGreeting()}, {profileData?.name || 'there'}! Welcome to Golden Tulip Escapes!</h3>
          <div className="mt-2 text-sm text-green-700">
            <p>Your account has been created successfully. Start exploring our exclusive offers!</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Show dashboard skeleton immediately - no full page loading
  const isInitialLoad = isLoading && !profileData;

  // Show dashboard skeleton immediately - never show "unable to load" page
  // Data will load in background or show empty states

  return (
    <div className="container mx-auto px-4 py-8">
      {showWelcome && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Welcome to Golden Tulip Escapes!</h3>
              <p className="mt-1 text-sm text-green-700">Your account has been created successfully.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center space-x-4">
          {isInitialLoad ? (
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
                <h1 className="text-2xl font-bold">
                  {getGreeting()}, {profileData?.name || 'Guest'}
                </h1>
                <p className="text-muted-foreground">Here's what's happening with your bookings</p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {showWelcome && !isInitialLoad && <WelcomeMessage />}
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isInitialLoad ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border p-6">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Stays"
              value={bookingStats?.totalBookings || 0}
              icon={<Home className="h-4 w-4" />}
              description={`${bookingStats?.totalNights || 0} total nights`}
            />
            <StatCard
              title="Upcoming Trips"
              value={upcomingBookings.length}
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
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-amber-600" />
                  Next Stay
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-lg font-medium">{upcomingBookings[0].branchName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(upcomingBookings[0].checkInDate), 'MMM d, yyyy')} -{' '}
                      {format(new Date(upcomingBookings[0].checkOutDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm">
                      {upcomingBookings[0].roomType} • {upcomingBookings[0].guests} {upcomingBookings[0].guests === 1 ? 'guest' : 'guests'}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => handleViewBookingDetails(upcomingBookings[0].id)}
                    >
                      View Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No upcoming stays</p>
                    <Button 
                    className="mt-4" 
                    onClick={() => navigate('/booking')}
                  >
                    Book a Stay
                  </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Star className="h-5 w-5 mr-2 text-amber-400 fill-amber-400" />
                  Loyalty Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {profileData?.joinDate ? format(new Date(profileData.joinDate), 'MMM d, yyyy') : '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Tier</p>
                      <p className="text-sm text-amber-600 font-medium">
                        {bookingStats?.loyaltyPoints && bookingStats.loyaltyPoints >= 1000 ? 'Gold' : 'Silver'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Silver Tier</span>
                      <span>Gold Tier</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                        style={{
                          width: `${Math.min(100, ((bookingStats?.loyaltyPoints || 0) / 1000) * 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {bookingStats?.loyaltyPoints || 0} / 1000 points to Gold
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Current Status</span>
                      <span className="font-medium">Gold Member</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-amber-600 h-2.5 rounded-full" 
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      7,500 / 10,000 points to Platinum
                    </p>
                  </div>
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Benefits</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Free room upgrade when available</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Late checkout until 2 PM</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Welcome amenity at check-in</span>
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
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No upcoming stays</h3>
              <p className="text-muted-foreground mb-6">Your next adventure awaits!</p>
              <Button 
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/auth", { state: { from: "/booking" } });
                  } else {
                    navigate("/booking");
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
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{booking.branchName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.checkInDate), 'MMM d, yyyy')} - {format(new Date(booking.checkOutDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.roomType} • {booking.status}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
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
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No past stays yet</h3>
              <p className="text-muted-foreground">Your upcoming adventures will appear here</p>
              <Button 
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/auth", { state: { from: "/booking" } });
                  } else {
                    navigate("/booking");
                  }
                }}
              >
                Book Your First Stay
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-amber-600" />
                <CardTitle>Feedback & Support</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
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
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{profileData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profileData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {format(new Date(profileData.joinDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {format(new Date(profileData.lastLogin), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Handle edit profile
                    toast.info('Edit profile functionality coming soon');
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
  );
};
