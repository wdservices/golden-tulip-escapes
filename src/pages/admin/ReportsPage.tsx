import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Download, RefreshCw, Filter, BarChart2, PieChart, Users, DollarSign, Calendar, Hotel } from 'lucide-react';
import { DateRange as DateRangeType } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { generateReport, type ReportData, type ReportType } from '@/services/reportService';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const REPORT_TYPES = [
  { value: 'occupancy', label: 'Occupancy', icon: <Hotel className="h-4 w-4" /> },
  { value: 'revenue', label: 'Revenue', icon: <DollarSign className="h-4 w-4" /> },
  { value: 'room-performance', label: 'Room Performance', icon: <BarChart2 className="h-4 w-4" /> },
  { value: 'guest', label: 'Guest', icon: <Users className="h-4 w-4" /> },
  { value: 'cancellation', label: 'Cancellation', icon: <Calendar className="h-4 w-4" /> },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRangeType>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState<ReportType>('occupancy');
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const { toast } = useToast();

  // Load report data
  const loadReportData = async () => {
    try {
      setIsLoading(true);
      const data = await generateReport({
        dateRange: {
          start: dateRange.from || new Date(),
          end: dateRange.to || new Date(),
        },
      });
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load report data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts or filters change
  useEffect(() => {
    loadReportData();
  }, [dateRange, reportType]);

  // Handle report export
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    toast({
      title: 'Exporting Report',
      description: `Exporting report to ${format.toUpperCase()}...`,
    });
    // In a real app, this would trigger the export
    console.log(`Exporting ${reportType} report to ${format}`);
  };

  // Render chart based on report type
  const renderChart = () => {
    if (isLoading || !reportData) {
      return (
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      );
    }

    switch (reportType) {
      case 'occupancy':
        return (
          <div className="h-96">
            <h3 className="text-lg font-medium mb-4">Occupancy Rate Over Time</h3>
            <Line
              data={{
                labels: reportData.occupancyData.map(item => format(new Date(item.date), 'MMM d')),
                datasets: [
                  {
                    label: 'Occupancy Rate (%)',
                    data: reportData.occupancyData.map(item => item.occupancyRate),
                    borderColor: 'rgba(217, 119, 6, 1)',
                    backgroundColor: 'rgba(217, 119, 6, 0.1)',
                    tension: 0.3,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Occupancy Rate (%)',
                    },
                  },
                },
              }}
            />
          </div>
        );

      case 'revenue':
        return (
          <div className="h-96">
            <h3 className="text-lg font-medium mb-4">Daily Revenue</h3>
            <Bar
              data={{
                labels: reportData.revenueData.map(item => format(new Date(item.date), 'MMM d')),
                datasets: [
                  {
                    label: 'Room Revenue',
                    data: reportData.revenueData.map(item => item.roomRevenue),
                    backgroundColor: 'rgba(217, 119, 6, 0.8)',
                  },
                  {
                    label: 'Service Revenue',
                    data: reportData.revenueData.map(item => item.serviceRevenue),
                    backgroundColor: 'rgba(146, 64, 14, 0.8)',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: true,
                  },
                  y: {
                    stacked: true,
                    title: {
                      display: true,
                      text: 'Amount ($)',
                    },
                  },
                },
              }}
            />
          </div>
        );

      case 'room-performance':
        return (
          <div className="h-96">
            <h3 className="text-lg font-medium mb-4">Room Type Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Revenue by Room Type</h4>
                <Pie
                  data={{
                    labels: reportData.roomTypeData.map(item => item.roomType),
                    datasets: [
                      {
                        data: reportData.roomTypeData.map(item => item.revenue),
                        backgroundColor: [
                          'rgba(217, 119, 6, 0.8)',
                          'rgba(180, 83, 9, 0.8)',
                          'rgba(146, 64, 14, 0.8)',
                          'rgba(120, 53, 15, 0.8)',
                          'rgba(69, 26, 3, 0.8)',
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                  }}
                />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Occupancy by Room Type</h4>
                <Bar
                  data={{
                    labels: reportData.roomTypeData.map(item => item.roomType),
                    datasets: [
                      {
                        label: 'Occupancy Rate (%)',
                        data: reportData.roomTypeData.map(item => item.occupancyRate),
                        backgroundColor: 'rgba(217, 119, 6, 0.8)',
                      },
                    ],
                  }}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Occupancy Rate (%)',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'guest':
        return (
          <div className="h-96 overflow-auto">
            <h3 className="text-lg font-medium mb-4">Guest Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Guests</CardDescription>
                  <CardTitle className="text-3xl">
                    {isLoading ? <Skeleton className="h-8 w-20" /> : reportData.guestData.length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Stays per Guest</CardDescription>
                  <CardTitle className="text-3xl">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      (reportData.guestData.reduce((sum, guest) => sum + guest.totalStays, 0) / 
                        reportData.guestData.length).toFixed(1)
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Spend per Guest</CardDescription>
                  <CardTitle className="text-3xl">
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      `$${(
                        reportData.guestData.reduce((sum, guest) => sum + guest.totalSpent, 0) / 
                        reportData.guestData.length
                      ).toFixed(2)}`
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
            <div className="h-64">
              <Bar
                data={{
                  labels: reportData.guestData
                    .sort((a, b) => b.totalSpent - a.totalSpent)
                    .slice(0, 10)
                    .map(guest => guest.name.split(' ')[0]),
                  datasets: [
                    {
                      label: 'Total Spent ($)',
                      data: reportData.guestData
                        .sort((a, b) => b.totalSpent - a.totalSpent)
                        .slice(0, 10)
                        .map(guest => guest.totalSpent),
                      backgroundColor: 'rgba(217, 119, 6, 0.8)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Amount Spent ($)',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        );

      case 'cancellation':
        return (
          <div className="h-96">
            <h3 className="text-lg font-medium mb-4">Cancellation Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Cancellation Rate Over Time</h4>
                <div className="h-64">
                  <Line
                    data={{
                      labels: reportData.cancellationData.map(item => 
                        format(new Date(item.date), 'MMM d')
                      ),
                      datasets: [
                        {
                          label: 'Cancellation Rate (%)',
                          data: reportData.cancellationData.map(item => item.cancellationRate),
                          borderColor: 'rgba(220, 38, 38, 1)',
                          backgroundColor: 'rgba(220, 38, 38, 0.1)',
                          tension: 0.3,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: 'Cancellation Rate (%)',
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Cancellation Impact</h4>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Cancellations</CardDescription>
                      <CardTitle className="text-2xl">
                        {reportData.cancellationData.reduce(
                          (sum, item) => sum + item.cancelledBookings, 0
                        )}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Lost Revenue</CardDescription>
                      <CardTitle className="text-2xl">
                        ${reportData.cancellationData
                          .reduce((sum, item) => sum + item.cancelledRevenue, 0)
                          .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a report type to view data</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Generate and analyze hotel performance reports
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={reportType}
            onValueChange={(value) => setReportType(value as ReportType)}
          >
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center">
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            className="w-[250px]"
          />
          
          <Button variant="outline" onClick={loadReportData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <div className="relative">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {REPORT_TYPES.find(t => t.value === reportType)?.label} Report
              </CardTitle>
              <CardDescription>
                {dateRange.from && dateRange.to ? (
                  <>
                    {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                  </>
                ) : (
                  'Select a date range'
                )}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Generated: {new Date().toLocaleString()}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {renderChart()}
          
          {/* Data Table - Show for all report types except guest (which has its own table) */}
          {reportType !== 'guest' && reportData && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Detailed Data</h3>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(reportData[`${reportType}Data`][0] || {}).map((key) => (
                        <th
                          key={key}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData[`${reportType}Data`].slice(0, 10).map((item: any, index: number) => (
                      <tr key={index}>
                        {Object.values(item).map((value: any, i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {typeof value === 'number' 
                              ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
                              : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reportData[`${reportType}Data`].length > 10 && (
                <div className="mt-2 text-sm text-muted-foreground text-center">
                  Showing 10 of {reportData[`${reportType}Data`].length} records
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      {!isLoading && reportData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reportType === 'occupancy' && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Occupancy</CardDescription>
                  <CardTitle className="text-2xl">
                    {(reportData.occupancyData.reduce((sum, item) => sum + item.occupancyRate, 0) / 
                      reportData.occupancyData.length).toFixed(1)}%
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Peak Occupancy</CardDescription>
                  <CardTitle className="text-2xl">
                    {Math.max(...reportData.occupancyData.map(item => item.occupancyRate))}%
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Daily Rate</CardDescription>
                  <CardTitle className="text-2xl">
                    ${(reportData.occupancyData.reduce((sum, item) => sum + item.adr, 0) / 
                      reportData.occupancyData.length).toFixed(2)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>RevPAR</CardDescription>
                  <CardTitle className="text-2xl">
                    ${(reportData.occupancyData.reduce((sum, item) => sum + item.revPar, 0) / 
                      reportData.occupancyData.length).toFixed(2)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </>
          )}
          
          {reportType === 'revenue' && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Revenue</CardDescription>
                  <CardTitle className="text-2xl">
                    ${reportData.revenueData
                      .reduce((sum, item) => sum + item.totalRevenue, 0)
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Room Revenue</CardDescription>
                  <CardTitle className="text-2xl">
                    ${reportData.revenueData
                      .reduce((sum, item) => sum + item.roomRevenue, 0)
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Service Revenue</CardDescription>
                  <CardTitle className="text-2xl">
                    ${reportData.revenueData
                      .reduce((sum, item) => sum + item.serviceRevenue, 0)
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Daily Revenue</CardDescription>
                  <CardTitle className="text-2xl">
                    ${(reportData.revenueData.reduce((sum, item) => sum + item.totalRevenue, 0) / 
                      reportData.revenueData.length).toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                  </CardTitle>
                </CardHeader>
              </Card>
            </>
          )}
          
          {reportType === 'room-performance' && reportData.roomTypeData.map((roomType) => (
            <Card key={roomType.roomType}>
              <CardHeader className="pb-2">
                <CardDescription className="capitalize">{roomType.roomType} Rooms</CardDescription>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Occupancy:</span>
                    <span className="font-medium">{roomType.occupancyRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">ADR:</span>
                    <span className="font-medium">${roomType.adr.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">RevPAR:</span>
                    <span className="font-medium">${roomType.revPar.toFixed(2)}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
          
          {reportType === 'cancellation' && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Cancellations</CardDescription>
                  <CardTitle className="text-2xl">
                    {reportData.cancellationData
                      .reduce((sum, item) => sum + item.cancelledBookings, 0)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Lost Revenue</CardDescription>
                  <CardTitle className="text-2xl">
                    ${reportData.cancellationData
                      .reduce((sum, item) => sum + item.cancelledRevenue, 0)
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Cancellation Rate</CardDescription>
                  <CardTitle className="text-2xl">
                    {(reportData.cancellationData.reduce((sum, item) => sum + item.cancellationRate, 0) / 
                      reportData.cancellationData.length).toFixed(1)}%
                  </CardTitle>
                </CardHeader>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
