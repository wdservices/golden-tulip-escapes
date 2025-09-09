import { Line, Bar, Pie } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BarChart2, TrendingUp, Users, Clock, DollarSign, Home, Activity } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Button } from "@/components/ui/button";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Mock data - replace with actual API calls
const mockBookings = [
  { id: 1, date: subDays(new Date(), 6), amount: 45000, status: 'completed', guests: 2, roomType: 'Deluxe' },
  { id: 2, date: subDays(new Date(), 5), amount: 32000, status: 'completed', guests: 1, roomType: 'Standard' },
  { id: 3, date: subDays(new Date(), 4), amount: 52000, status: 'completed', guests: 3, roomType: 'Suite' },
  { id: 4, date: subDays(new Date(), 3), amount: 41000, status: 'completed', guests: 2, roomType: 'Deluxe' },
  { id: 5, date: subDays(new Date(), 2), amount: 38000, status: 'completed', guests: 1, roomType: 'Standard' },
  { id: 6, date: subDays(new Date(), 1), amount: 48000, status: 'confirmed', guests: 2, roomType: 'Deluxe' },
  { id: 7, date: new Date(), amount: 55000, status: 'confirmed', guests: 4, roomType: 'Suite' },
];

export const AnalyticsDashboard = () => {
  const dateRange = {
    from: subDays(new Date(), 30),
    to: new Date(),
  };

  // Process data for charts
  const filteredBookings = mockBookings.filter(
    booking => booking.date >= startOfDay(dateRange.from) && booking.date <= endOfDay(dateRange.to)
  );

  // Revenue by day
  const revenueByDay = filteredBookings.reduce((acc, booking) => {
    const dateStr = format(booking.date, 'MMM dd');
    acc[dateStr] = (acc[dateStr] || 0) + booking.amount;
    return acc;
  }, {} as Record<string, number>);

  // Booking trends
  const bookingsByDay = filteredBookings.reduce((acc, booking) => {
    const dateStr = format(booking.date, 'MMM dd');
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Room type distribution
  const roomTypeCount = filteredBookings.reduce((acc, booking) => {
    acc[booking.roomType] = (acc[booking.roomType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate metrics
  const totalRooms = 50;
  const bookedRooms = filteredBookings.length;
  const occupancyRate = Math.min(100, Math.round((bookedRooms / totalRooms) * 100));
  const totalRevenue = Object.values(revenueByDay).reduce((sum, val) => sum + val, 0);
  const averageGuests = filteredBookings.length > 0 
    ? Math.round(filteredBookings.reduce((sum, b) => sum + b.guests, 0) / filteredBookings.length * 10) / 10 
    : 0;

  // Chart data
  const revenueData = {
    labels: Object.keys(revenueByDay),
    datasets: [{
      label: 'Revenue (₦)',
      data: Object.values(revenueByDay),
      borderColor: 'rgba(180, 83, 9, 0.8)',
      backgroundColor: 'rgba(180, 83, 9, 0.1)',
      tension: 0.3,
      fill: true
    }]
  };

  const bookingTrends = {
    labels: Object.keys(bookingsByDay),
    datasets: [{
      label: 'Bookings',
      data: Object.values(bookingsByDay),
      backgroundColor: 'rgba(146, 64, 14, 0.8)',
      borderColor: 'rgba(146, 64, 14, 0.8)',
    }]
  };

  const roomTypeData = {
    labels: Object.keys(roomTypeCount),
    datasets: [{
      data: Object.values(roomTypeCount),
      backgroundColor: [
        'rgba(180, 83, 9, 0.8)',
        'rgba(146, 64, 14, 0.8)',
        'rgba(120, 53, 15, 0.8)',
      ],
      borderColor: [
        'rgba(180, 83, 9, 1)',
        'rgba(146, 64, 14, 1)',
        'rgba(120, 53, 15, 1)',
      ],
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₦' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                maximumFractionDigits: 0
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredBookings.length > 0 ? '↑ 12% from last month' : 'No bookings yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {occupancyRate > 75 ? 'High occupancy' : 'Moderate occupancy'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGuests}</div>
            <p className="text-xs text-muted-foreground">per booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Daily revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Line data={revenueData} options={chartOptions} />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Room Type Distribution</CardTitle>
            <CardDescription>Breakdown by room category</CardDescription>
          </CardHeader>
          <CardContent>
            <Pie data={roomTypeData} options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' as const } },
            }} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>Daily booking count</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar data={bookingTrends} options={chartOptions} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest bookings and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredBookings.slice(0, 4).map((booking) => (
              <div key={booking.id} className="flex items-center space-x-4">
                <div className="rounded-full bg-amber-100 p-2">
                  <Clock className="h-4 w-4 text-amber-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">
                    {booking.roomType} Booking #{booking.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(booking.date, 'MMM d, yyyy')} • {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="font-medium">
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                  }).format(booking.amount)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
