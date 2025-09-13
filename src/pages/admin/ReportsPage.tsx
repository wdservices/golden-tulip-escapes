import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, BarChart, LineChart, PieChart, Filter } from "lucide-react";
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
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
        <div className="flex items-center justify-center w-full">
          <div className="relative">
            <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-[260px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRangeString}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[100]" align="start" side="bottom" sideOffset={5} style={{ position: 'absolute' }}>
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
          <Button variant="outline" size="icon" className="ml-2">
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="ml-2">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="revenue" onValueChange={(value) => setActiveTab(value as ReportType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="occupancy">
            <BarChart className="h-4 w-4 mr-2" />
            Occupancy
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <Calendar className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="guests">
            <Users className="h-4 w-4 mr-2" />
            Guests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full flex items-center justify-center">
                <LineChart className="h-32 w-32 text-muted-foreground" />
                <p className="text-muted-foreground">Revenue chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full flex items-center justify-center">
                <PieChart className="h-32 w-32 text-muted-foreground" />
                <p className="text-muted-foreground">Occupancy chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bookings Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full flex items-center justify-center">
                <BarChart className="h-32 w-32 text-muted-foreground" />
                <p className="text-muted-foreground">Bookings chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Guests Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full flex items-center justify-center">
                <Users className="h-32 w-32 text-muted-foreground" />
                <p className="text-muted-foreground">Guests chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.3%</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,347</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
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
