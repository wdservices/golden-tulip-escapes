import { Line, Pie } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, Users, DollarSign, Home, Bed, Building, Clock } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import { useAllRooms, useRooms } from '@/hooks/useRooms';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { getBranches } from '@/services/branchService';


// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to format room type names
const formatRoomTypeName = (type: string): string => {
  // Capitalize first letter and replace underscores with spaces
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
};

export const AnalyticsDashboard = () => {
  const dateRange = {
    from: subDays(new Date(), 30),
    to: new Date(),
  };
  
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  const { activeBranchId } = useAuth();
  
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

  // Get room data from Firestore for current active branch
  const { rooms, isLoading: roomsLoading, error: roomsError } = useAllRooms();
  
  // Get real booking data from Firestore
  const { bookings, isLoading: bookingsLoading, error: bookingsError } = useBookings();

  const resolveDate = (value: unknown) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'object' && (value as { toDate?: () => Date }).toDate) {
      return (value as { toDate: () => Date }).toDate();
    }
    const date = new Date(value as string | number);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  // Process data for charts
  const filteredBookings = bookings.filter(
    booking => {
      const checkIn = resolveDate(booking.checkInDate);
      return checkIn ? checkIn >= startOfDay(dateRange.from) && checkIn <= endOfDay(dateRange.to) : false;
    }
  );

  // Revenue by day
  const revenueByDay = filteredBookings.reduce((acc, booking) => {
    const dateStr = format(booking.checkInDate, 'MM/dd');
    acc[dateStr] = (acc[dateStr] || 0) + booking.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // Room type distribution - using real room data
  const roomTypeCount = rooms.reduce((acc, room) => {
    const formattedType = formatRoomTypeName(room.type);
    acc[formattedType] = (acc[formattedType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Room availability by type
  const roomAvailability = rooms.reduce((acc, room) => {
    const formattedType = formatRoomTypeName(room.type);
    if (!acc[formattedType]) {
      acc[formattedType] = { total: 0, available: 0, occupied: 0 };
    }
    acc[formattedType].total += 1;
    // Check if room is available based on availability property
    if (room.availability) {
      acc[formattedType].available += 1;
    } else {
      acc[formattedType].occupied += 1;
    }
    return acc;
  }, {} as Record<string, { total: number, available: number, occupied: number }>);

  // Calculate metrics
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(room => room.availability).length;
  const occupiedRooms = totalRooms - availableRooms;
  
  // Calculate total revenue from all bookings (not just filtered ones)
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
  
  const averageGuests = filteredBookings.length > 0 
    ? Math.round(filteredBookings.reduce((sum, b) => sum + (b.guestCount || 0), 0) / filteredBookings.length * 10) / 10 
    : 0;

  const recentBookings = bookings
    .map(booking => ({
      ...booking,
      __recentDate: resolveDate(booking.bookingDate || booking.createdAt || booking.checkInDate)
    }))
    .filter(booking => {
      if (!booking.__recentDate) return false;
      return booking.__recentDate >= subDays(new Date(), 7);
    })
    .sort((a, b) => (b.__recentDate?.getTime() || 0) - (a.__recentDate?.getTime() || 0))
    .slice(0, 6);

  // Chart data
  const revenueData = {
    labels: Object.keys(revenueByDay),
    datasets: [{
      label: 'Revenue (₦)',
      data: Object.values(revenueByDay),
      borderColor: 'rgba(34, 197, 94, 1)', // Vibrant green
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: 'rgba(34, 197, 94, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 3
    }]
  };

  const roomTypeData = {
    labels: Object.keys(roomTypeCount),
    datasets: [{
      data: Object.values(roomTypeCount),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',  // Blue
        'rgba(16, 185, 129, 0.8)',  // Green
        'rgba(249, 115, 22, 0.8)',  // Orange
        'rgba(139, 92, 246, 0.8)',  // Purple
        'rgba(236, 72, 153, 0.8)',  // Pink
        'rgba(234, 179, 8, 0.8)',   // Yellow
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',  // Blue
        'rgba(16, 185, 129, 1)',  // Green
        'rgba(249, 115, 22, 1)',  // Orange
        'rgba(139, 92, 246, 1)',  // Purple
        'rgba(236, 72, 153, 1)',  // Pink
        'rgba(234, 179, 8, 1)',   // Yellow
      ],
      borderWidth: 2,
      hoverOffset: 10,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            weight: 'bold' as const
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return '₦' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          maxTicksLimit: 7,
          font: {
            size: 11,
            weight: 'bold' as const
          },
          color: 'rgba(100, 116, 139, 0.8)'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)'
        },
        ticks: {
          callback: function(value: any) {
            return '₦' + value.toLocaleString();
          },
          font: {
            size: 11,
            weight: 'bold' as const
          },
          color: 'rgba(100, 116, 139, 0.8)',
          padding: 10
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    hover: {
      mode: 'nearest' as const,
      intersect: true
    },
    animation: {
      duration: 1000
    }
  };

  // Loading and error states
  if (roomsLoading || bookingsLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (roomsError || bookingsError) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Error Loading Data</h3>
            <p>{roomsError || bookingsError}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Note: Removed no data state - cards should always display with zero values when no data is available

  return (
    <div className="space-y-4">
      {/* Branch Header */}
      {currentBranchName && (
        <div className="flex items-center text-white/80 mb-2">
          <Building className="h-4 w-4 mr-2 text-yellow-400" />
          <span>{currentBranchName} Analytics</span>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                maximumFractionDigits: 0
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-white/70">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Bookings</CardTitle>
            <Home className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{bookings.length}</div>
            <p className="text-xs text-white/70">
              {bookings.length > 0 ? `${bookings.length} total bookings` : 'No bookings yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Avg. Guests</CardTitle>
            <Users className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{averageGuests}</div>
            <p className="text-xs text-white/70">per booking</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Room Availability</CardTitle>
            <Bed className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{availableRooms}/{totalRooms}</div>
            <p className="text-xs text-white/70">rooms available</p>
          </CardContent>
        </Card>
      </div>

      {/* Room Status Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="text-white">Available Rooms by Type</CardTitle>
            <CardDescription className="text-white/70">Number of rooms available for each type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(roomAvailability).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{type}</p>
                    <p className="text-sm text-white/70">
                      {data.available} of {data.total} available
                    </p>
                  </div>
                  <div className="font-bold text-yellow-400">
                    {Math.round((data.available / data.total) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="text-white">Occupied Rooms by Type</CardTitle>
            <CardDescription className="text-white/70">Number of rooms occupied for each type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(roomAvailability).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{type}</p>
                    <p className="text-sm text-white/70">
                      {data.occupied} of {data.total} occupied
                    </p>
                  </div>
                  <div className="font-bold text-yellow-400">
                    {Math.round((data.occupied / data.total) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="text-white">Revenue Overview</CardTitle>
            <CardDescription className="text-white/70">Daily revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              {Object.keys(revenueByDay).length > 0 ? (
                <Line data={revenueData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white/70">No revenue data available for the selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="text-white">Room Type Distribution</CardTitle>
            <CardDescription className="text-white/70">Breakdown by room category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {Object.keys(roomTypeCount).length > 0 ? (
                <Pie data={roomTypeData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: 'bottom' as const,
                      labels: {
                        font: {
                          size: 12,
                          weight: 'bold'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: 'rgba(255, 255, 255, 0.9)'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleFont: {
                        size: 14,
                        weight: 'bold'
                      },
                      bodyFont: {
                        size: 13
                      },
                      padding: 12,
                      cornerRadius: 6
                    }
                  },
                  animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1000
                  },
                  cutout: '60%',
                  radius: '90%'
                }} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white/70">No room type data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-400" />
            <CardTitle className="text-white">Recent Bookings</CardTitle>
          </div>
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
            onClick={() => {
              window.location.href = "/admin/bookings";
            }}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-white/70">No recent bookings in the last 7 days</div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border border-white/20 bg-white/5 px-4 py-3"
                >
                  <div>
                    <div className="text-white font-medium">
                      {booking.guestName || booking.guest || booking.fullName || "Guest"}
                    </div>
                    <div className="text-sm text-white/70">
                      {booking.branchName || "Branch"} • {booking.roomType || "Room"}
                    </div>
                    {booking.__recentDate ? (
                      <div className="text-xs text-white/60">
                        {format(booking.__recentDate, "MMM d, yyyy")}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-semibold">
                      {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: 'NGN',
                        maximumFractionDigits: 0
                      }).format(booking.totalAmount || 0)}
                    </div>
                    <div className="text-xs text-white/70">
                      {booking.status || "pending"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
