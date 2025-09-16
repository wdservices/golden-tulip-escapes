import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

const DashboardHome = () => {
  const [dateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here's what's happening with your hotel today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
            </span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard />
        </TabsContent>
        <TabsContent value="overview" className="space-y-4">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">Dashboard Overview</h3>
            <p className="text-sm text-muted-foreground">
              Select a tab to view detailed analytics or reports
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardHome;
