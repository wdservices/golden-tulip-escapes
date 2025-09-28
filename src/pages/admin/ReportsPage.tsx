import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, BarChart, LineChart, PieChart, Filter, Building, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getBranches } from "@/services/branchService";

import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ReportType = 'revenue' | 'occupancy' | 'bookings' | 'guests';

interface ReportData {
  date: string;
  value: number;
}

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('revenue');
  const [date, setDate] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  
  // Get auth context for branch filtering
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

  // Mock data for charts - replace with actual API calls
  const revenueData: ReportData[] = [
    { date: '2024-01-01', value: 4000 },
    { date: '2024-01-02', value: 3000 },
    { date: '2024-01-03', value: 5000 },
    { date: '2024-01-04', value: 2780 },
    { date: '2024-01-05', value: 1890 },
    { date: '2024-01-06', value: 2390 },
    { date: '2024-01-07', value: 3490 },
  ];

  const occupancyData = [
    { name: 'Occupied', value: 400 },
    { name: 'Available', value: 300 },
    { name: 'Maintenance', value: 200 },
  ];

  const bookingsData = [
    { name: 'Confirmed', value: 12 },
    { name: 'Pending', value: 5 },
    { name: 'Cancelled', value: 3 },
  ];

  const guestsData = [
    { name: 'New', value: 24 },
    { name: 'Returning', value: 15 },
    { name: 'VIP', value: 8 },
  ];

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
          <Button className="ml-2 bg-yellow-400 text-blue-900 border-yellow-400 hover:bg-yellow-300">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="revenue" onValueChange={(value) => setActiveTab(value as ReportType)}>
        <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
          <TabsTrigger value="revenue" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">
            <BarChart className="h-4 w-4 mr-2" />
            Occupancy
          </TabsTrigger>
          <TabsTrigger value="bookings" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">
            <Calendar className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="guests" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">
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
              <div className="h-full flex items-center justify-center">
                <LineChart className="h-32 w-32 text-yellow-400" />
                <p className="text-white/70">Revenue chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="mt-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">Occupancy Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full flex items-center justify-center">
                <PieChart className="h-32 w-32 text-yellow-400" />
                <p className="text-white/70">Occupancy chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">Bookings Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full flex items-center justify-center">
                <BarChart className="h-32 w-32 text-yellow-400" />
                <p className="text-white/70">Bookings chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests" className="mt-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">Guests Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full flex items-center justify-center">
                <Users className="h-32 w-32 text-yellow-400" />
                <p className="text-white/70">Guests chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$45,231.89</div>
            <p className="text-xs text-white/70">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Occupancy Rate</CardTitle>
            <Home className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">78.3%</div>
            <p className="text-xs text-white/70">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+573</div>
            <p className="text-xs text-white/70">+201 since last hour</p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+2,347</div>
            <p className="text-xs text-white/70">+180.1% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Add missing icon components
function DollarSign(props: React.SVGProps<SVGSVGElement>) {
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
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
