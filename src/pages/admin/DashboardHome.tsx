import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Users, Home, CreditCard, ArrowUpDown, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data - replace with real data from your API
const stats = {
  todayCheckIns: 12,
  todayCheckOuts: 8,
  availableRooms: 45,
  pendingPayments: 3,
  revenue: {
    current: 245000,
    previous: 198000,
    trend: 'up',
    percentage: 23.7
  },
  recentBookings: [
    { id: 1, guest: 'John Doe', room: 'Deluxe Double', checkIn: '2023-06-15', status: 'confirmed' },
    { id: 2, guest: 'Jane Smith', room: 'Executive Suite', checkIn: '2023-06-16', status: 'pending' },
    { id: 3, guest: 'Robert Johnson', room: 'Standard', checkIn: '2023-06-16', status: 'confirmed' },
    { id: 4, guest: 'Emily Davis', room: 'Deluxe Twin', checkIn: '2023-06-17', status: 'cancelled' },
    { id: 5, guest: 'Michael Wilson', room: 'Executive Suite', checkIn: '2023-06-17', status: 'confirmed' },
  ],
  revenueData: [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
  ]
};

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      {/* G.R.A. Branch Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-foreground">GOLDEN TULIP HOTELS</h1>
        <p className="text-base font-medium text-primary">G.R.A. Branch - Head Office</p>
        <div className="w-16 h-0.5 bg-primary mx-auto mt-1.5 rounded-full"></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your hotel today, {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Button variant="outline" className="bg-card hover:bg-accent">
          Generate Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Today's Check-ins" 
          value={stats.todayCheckIns}
          icon={<Users className="h-4 w-4 text-amber-600" />}
          description={`${stats.todayCheckIns} guests checking in today`}
        />
        <StatCard 
          title="Today's Check-outs" 
          value={stats.todayCheckOuts}
          icon={<Calendar className="h-4 w-4 text-blue-600" />}
          description={`${stats.todayCheckOuts} rooms becoming available`}
        />
        <StatCard 
          title="Available Rooms" 
          value={stats.availableRooms}
          icon={<Home className="h-4 w-4 text-green-600" />}
          description={`${stats.availableRooms} out of 120 rooms available`}
        />
        <StatCard 
          title="Pending Payments" 
          value={stats.pendingPayments}
          icon={<CreditCard className="h-4 w-4 text-red-600" />}
          description={`${stats.pendingPayments} payments awaiting confirmation`}
        />
      </div>

      {/* Revenue and Recent Bookings */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex items-center mb-4">
              <div className="text-2xl font-bold">₦{stats.revenue.current.toLocaleString()}</div>
              <div className={cn(
                "ml-2 flex items-center text-sm",
                stats.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                <ArrowUpDown className={`h-4 w-4 mr-1 ${stats.revenue.trend === 'up' ? 'rotate-0' : 'rotate-180'}`} />
                {stats.revenue.percentage}% from last month
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{booking.guest}</p>
                    <p className="text-sm text-muted-foreground">{booking.room}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-2">
                      {format(new Date(booking.checkIn), 'MMM d')}
                    </span>
                    {booking.status === 'confirmed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : booking.status === 'pending' ? (
                      <Clock className="h-4 w-4 text-amber-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4">
              View all bookings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 mr-3" />
                <div>
                  <p className="text-sm font-medium">New booking #100{i} created</p>
                  <p className="text-sm text-muted-foreground">
                    {i} hour{i !== 1 ? 's' : ''} ago · {['John Doe', 'Jane Smith', 'Mike Johnson'][i - 1]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for stat cards
const StatCard = ({ title, value, icon, description }: { title: string; value: number; icon: React.ReactNode; description: string }) => (
  <Card className="bg-card/50 hover:bg-card transition-colors">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="h-4 w-4 text-primary">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

export default DashboardHome;
