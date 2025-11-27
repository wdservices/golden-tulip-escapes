import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Building } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { getBranches } from "@/services/branchService";


const DashboardHome = () => {
  const [dateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const { activeBranchId } = useAuth();
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {currentBranchName ? `${currentBranchName} Dashboard` : "Dashboard"}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            {currentBranchName && (
              <div className="flex items-center text-muted-foreground text-sm">
                <Building className="h-3.5 w-3.5 mr-1" />
                <span>{currentBranchName}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your hotel today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 bg-white/5 border-white/20 text-white hover:bg-yellow-400/10 hover:text-yellow-300 hover:border-yellow-400/30">
            <Calendar className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
            </span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))]">Analytics</TabsTrigger>
          <TabsTrigger value="reports" disabled className="text-white/50">
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
