import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, Home, MapPin, Moon, Star, Sun } from "lucide-react";
import { BookingCard } from "@/components/dashboard/BookingCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { getUserProfile, mockBookings } from "@/services/mockData";
import { format } from "date-fns";

export const UserDashboard = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [bookingStats, setBookingStats] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/auth", { state: { from: "/dashboard" } });
      return;
    }

    if (user) {
      // Simulate API call
      const loadData = async () => {
        setIsLoading(true);
        try {
          // In a real app, this would be an API call
          const { profile, stats } = getUserProfile(user.id);
          setProfileData(profile);
          setBookingStats(stats);
        } catch (error) {
          console.error("Failed to load user data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }
  }, [user, isAuthenticated, isAuthLoading, navigate]);

  const handleViewBookingDetails = (bookingId: string) => {
    // Navigate to booking details page
    navigate(`/bookings/${bookingId}`);
  };

  const handleCancelBooking = (bookingId: string) => {
    // Handle booking cancellation
    console.log("Cancel booking:", bookingId);
    // In a real app, this would trigger an API call
  };

  const upcomingBookings = mockBookings
    .filter((b) => new Date(b.checkInDate) > new Date() && b.status === "confirmed")
    .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());

  const pastBookings = mockBookings
    .filter((b) => new Date(b.checkInDate) <= new Date() || b.status !== "confirmed")
    .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());

  if (isAuthLoading || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" alt={profileData?.name} />
            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-700 text-white text-2xl">
              {profileData?.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {profileData?.name.split(" ")[0]}</h1>
            <p className="text-muted-foreground">
              Member since {profileData?.joinDate ? format(new Date(profileData.joinDate), 'MMMM yyyy') : ''}
            </p>
          </div>
        </div>
        <Button className="mt-4 md:mt-0" onClick={() => navigate("/booking")}>
          Book a Stay
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Stays"
          value={bookingStats?.totalBookings || 0}
          icon={<Home className="h-4 w-4" />}
          description={`${bookingStats?.totalNights || 0} nights in total`}
        />
        <StatCard
          title="Favorite Branch"
          value={bookingStats?.favoriteBranch || "-"}
          icon={<MapPin className="h-4 w-4" />}
          description="Your most visited location"
        />
        <StatCard
          title="Last Stay"
          value={bookingStats?.lastStay ? format(new Date(bookingStats.lastStay), 'MMM yyyy') : "-"}
          icon={<Moon className="h-4 w-4" />}
          description={bookingStats?.lastStay ? "Your most recent visit" : "No stays yet"}
        />
        <StatCard
          title="Loyalty Status"
          value="Gold Member"
          icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
          description="Earn points with every stay"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="upcoming" onClick={() => setActiveTab("upcoming")}>
            Upcoming Stays
          </TabsTrigger>
          <TabsTrigger value="past" onClick={() => setActiveTab("past")}>
            Past Stays
          </TabsTrigger>
          <TabsTrigger value="profile" onClick={() => setActiveTab("profile")}>
            Profile
          </TabsTrigger>
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
                  <div className="space-y-2">
                    <p className="text-lg font-medium">{upcomingBookings[0].branchName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(upcomingBookings[0].checkInDate), 'MMM d, yyyy')} -{' '}
                      {format(new Date(upcomingBookings[0].checkOutDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm">
                      {upcomingBookings[0].roomType} • {upcomingBookings[0].guests} {upcomingBookings[0].guests === 1 ? 'guest' : 'guests'}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => handleViewBookingDetails(upcomingBookings[0].id)}>
                      View Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No upcoming stays</p>
                    <Button className="mt-4" onClick={() => navigate('/booking')}>
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
                  Loyalty Points
                </CardTitle>
              </CardHeader>
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
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewBookingDetails}
                  onCancel={handleCancelBooking}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No upcoming stays</h3>
              <p className="text-muted-foreground mb-6">Your next adventure awaits!</p>
              <Button onClick={() => navigate('/booking')}>Book a Stay</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pastBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewBookingDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No past stays yet</h3>
              <p className="text-muted-foreground mb-6">Your travel history will appear here</p>
              <Button onClick={() => navigate('/booking')}>Book Your First Stay</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="text-base">{profileData?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{profileData?.email}</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-base">{profileData?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                    <p className="text-base">
                      {profileData?.joinDate ? format(new Date(profileData.joinDate), 'MMMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
                {profileData?.preferences && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Preferences</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                            <p className="text-sm font-medium">Room Type</p>
                            <p className="text-sm text-muted-foreground">
                              {profileData.preferences.roomType || 'No preference'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Floor Preference</p>
                            <p className="text-sm text-muted-foreground">
                              {profileData.preferences.floorPreference || 'No preference'}
                            </p>
                          </div>
                          {profileData.preferences.specialNeeds?.length > 0 && (
                            <div className="md:col-span-2">
                              <p className="text-sm font-medium">Special Requests</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {profileData.preferences.specialNeeds.map((need: string, index: number) => (
                                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {need}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={() => setActiveTab('profile')}>
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
