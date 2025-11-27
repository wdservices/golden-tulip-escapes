import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, BarChart, LineChart, PieChart, Filter, Building, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getBranches } from "@/services/branchService";
import { useBookings } from "@/hooks/useBookings";
import { useAuthUsers } from "@/hooks/useAuthUsers";
import { formatCurrency } from "@/utils/currencyUtils";
import { exportToCsv } from "@/lib/utils";

import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ReportType = 'revenue' | 'occupancy' | 'bookings' | 'guests';

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('revenue');
  const [date, setDate] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  
  // Get auth context for branch filtering
  const { activeBranchId } = useAuth();
  
  // Get real data from hooks
  const { bookings, loading: bookingsLoading } = useBookings();
  const { mergedUsers, loading: usersLoading } = useAuthUsers();
  
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

  // Calculate real statistics from data
  const calculateStats = () => {
    if (!bookings || !mergedUsers) {
      return {
        totalRevenue: 0,
        occupancyRate: 0,
        totalBookings: 0,
        totalGuests: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        newGuests: 0,
        returningGuests: 0
      };
    }

    // Filter bookings by date range if selected
    const filteredBookings = bookings.filter(booking => {
      if (!date?.from || !booking.createdAt) return true;
      const bookingDate = new Date(booking.createdAt);
      const fromDate = date.from;
      const toDate = date.to || new Date();
      return bookingDate >= fromDate && bookingDate <= toDate;
    });

    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    const totalBookings = filteredBookings.length;
    const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = filteredBookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled').length;
    
    // Calculate occupancy rate (simplified - you may need to adjust based on your room data)
    const occupancyRate = totalBookings > 0 ? Math.min(100, (confirmedBookings / totalBookings) * 100) : 0;
    
    const totalGuests = mergedUsers.length;
    const newGuests = mergedUsers.filter(user => {
      if (!date?.from || !user.createdAt) return false;
      const userDate = new Date(user.createdAt);
      return userDate >= date.from && userDate <= (date.to || new Date());
    }).length;
    const returningGuests = totalGuests - newGuests;

    return {
      totalRevenue,
      occupancyRate,
      totalBookings,
      totalGuests,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      newGuests,
      returningGuests
    };
  };

  const stats = calculateStats();
  const isLoading = bookingsLoading || usersLoading;

  // Export reports data to CSV
  const handleExport = () => {
    try {
      if (isLoading) {
        console.warn('Cannot export while data is loading');
        return;
      }

      // Get date range as string for export
      const getDateRangeString = () => {
        if (date?.from) {
          if (date.to) {
            return `${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')}`;
          } else {
            return format(date.from, 'LLL dd, y');
          }
        }
        return 'All Time';
      };

      const exportData = {
        summary: {
          'Total Revenue': formatCurrency(stats.totalRevenue, 'NGN', 'en-NG'),
          'Occupancy Rate': `${stats.occupancyRate.toFixed(1)}%`,
          'Total Bookings': stats.totalBookings,
          'Confirmed Bookings': stats.confirmedBookings,
          'Pending Bookings': stats.pendingBookings,
          'Cancelled Bookings': stats.cancelledBookings,
          'Total Guests': stats.totalGuests,
          'New Guests': stats.newGuests,
          'Returning Guests': stats.returningGuests,
          'Report Period': getDateRangeString(),
          'Generated Date': new Date().toLocaleDateString(),
          'Branch': currentBranchName || 'All Branches'
        },
        bookings: bookings.map(booking => ({
          'Booking ID': booking.id,
          'Guest Name': booking.guestName || 'N/A',
          'Guest Email': booking.guestEmail || 'N/A',
          'Guest Phone': booking.guestPhone || 'N/A',
          'Branch': booking.branchName || 'N/A',
          'Room Type': booking.roomType || 'N/A',
          'Room Number': booking.roomNumber || 'N/A',
          'Check-in Date': booking.checkInDate,
          'Check-out Date': booking.checkOutDate,
          'Status': booking.status,
          'Payment Status': booking.paymentStatus,
          'Total Amount': formatCurrency(booking.totalAmount || 0, 'NGN', 'en-NG'),
          'Guests': booking.guests,
          'Booking Date': booking.bookingDate,
          'Special Requests': booking.specialRequests || 'N/A'
        })),
        guests: mergedUsers.map(user => ({
          'User ID': user.id,
          'Name': user.displayName || 'N/A',
          'Email': user.email,
          'Phone': user.phoneNumber || 'N/A',
          'Role': user.role || 'client',
          'Status': user.disabled ? 'Disabled' : 'Active',
          'Created Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
          'Last Sign In': user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleDateString() : 'N/A'
        }))
      };

      // Export summary data
      const summaryData = [exportData.summary];
      exportToCsv(summaryData, `reports_summary_${new Date().toISOString().split('T')[0]}`);
      
      console.log('✅ Reports export completed successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Format date range for display
  const dateRangeString = date?.from ? (
    date.to ? (
      <>
        {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
      </>
    ) : (
      format(date.from, 'LLL dd, y')
    )
  ) : (
    <span>Pick a date</span>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-yellow-400">
            {currentBranchName && (
              <span className="flex items-center">
                <span className="mr-2">{currentBranchName}</span>
                <span className="mx-2">-</span>
              </span>
            )}
            Reports & Analytics
          </h2>
          {currentBranchName && (
            <div className="flex items-center text-sm text-white/70 mb-1">
              <Building className="h-4 w-4 mr-1 text-yellow-400" />
              <span>{currentBranchName}</span>
            </div>
          )}
          <p className="text-white/70">
            View detailed reports and analytics for your hotel operations
          </p>
        </div>
        <div className="flex items-center w-full">
          <div className="relative">
            <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-[260px] justify-start text-left font-normal bg-white/5 border-white/20 text-white hover:bg-yellow-400/10 hover:text-yellow-300 hover:border-yellow-400/30",
                  !date && "text-white/50"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-yellow-400" />
                {dateRangeString}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[100] bg-white/10 backdrop-blur-md border-white/20" align="start" side="bottom" sideOffset={5} style={{ position: 'absolute' }}>
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(range?: DateRange) => range && setDate(range)}
                numberOfMonths={2}
              />
            </PopoverContent>
            </Popover>
          </div>
          <Button variant="outline" size="icon" className="ml-2 bg-white/5 border-white/20 text-white hover:bg-yellow-400/10 hover:text-yellow-300 hover:border-yellow-400/30">
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            className="ml-2 bg-yellow-400 text-[hsl(var(--royal-blue-dark))] border-yellow-400 hover:bg-yellow-300"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="revenue" onValueChange={(value) => setActiveTab(value as ReportType)}>
        <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
          <TabsTrigger value="revenue" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))]">
            <NairaSign className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))]">
            <BarChart className="h-4 w-4 mr-2" />
            Occupancy
          </TabsTrigger>
          <TabsTrigger value="bookings" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))]">
            <Calendar className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="guests" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))]">
            <Users className="h-4 w-4 mr-2" />
            Guests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">Revenue Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-32 w-32 text-yellow-400 mx-auto mb-4" />
                    <p className="text-white/70">Revenue chart will be displayed here</p>
                    <p className="text-sm text-white/50 mt-2">
                      Total Revenue: {formatCurrency(stats.totalRevenue, 'NGN', 'en-NG')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="mt-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">Occupancy Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-32 w-32 text-yellow-400 mx-auto mb-4" />
                    <p className="text-white/70">Occupancy chart will be displayed here</p>
                    <p className="text-sm text-white/50 mt-2">
                      Current Occupancy Rate: {stats.occupancyRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">Bookings Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="h-32 w-32 text-yellow-400 mx-auto mb-4" />
                    <p className="text-white/70">Bookings chart will be displayed here</p>
                    <div className="text-sm text-white/50 mt-2 space-y-1">
                      <p>Confirmed: {stats.confirmedBookings}</p>
                      <p>Pending: {stats.pendingBookings}</p>
                      <p>Cancelled: {stats.cancelledBookings}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests" className="mt-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">Guests Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-32 w-32 text-yellow-400 mx-auto mb-4" />
                    <p className="text-white/70">Guests chart will be displayed here</p>
                    <div className="text-sm text-white/50 mt-2 space-y-1">
                      <p>New Guests: {stats.newGuests}</p>
                      <p>Returning Guests: {stats.returningGuests}</p>
                      <p>Total Guests: {stats.totalGuests}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Total Revenue</CardTitle>
            <NairaSign className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(stats.totalRevenue, 'NGN', 'en-NG')}
                </div>
                <p className="text-xs text-white/70">
                  {stats.totalRevenue > 0 ? 'From selected period' : 'No revenue data'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Occupancy Rate</CardTitle>
            <Home className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">{stats.occupancyRate.toFixed(1)}%</div>
                <p className="text-xs text-white/70">
                  {stats.totalBookings > 0 ? 'Based on current bookings' : 'No booking data'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">{stats.totalBookings}</div>
                <p className="text-xs text-white/70">
                  {stats.confirmedBookings} confirmed, {stats.pendingBookings} pending
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">{stats.totalGuests}</div>
                <p className="text-xs text-white/70">
                  {stats.newGuests} new in selected period
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Naira Sign Icon Component
function NairaSign(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3v18" />
      <path d="M18 3v18" />
      <path d="M6 9h12" />
      <path d="M6 15h12" />
      <path d="M6 3l12 18" />
    </svg>
  )
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function Home(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

export default ReportsPage;
