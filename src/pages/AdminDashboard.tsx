import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getBranches } from "@/services/branchService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Home,
  Calendar,
  Bed,
  Users,
  Building2,
  Megaphone,
  CreditCard,
  BarChart2,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  LogOut, 
  ArrowLeft
} from "lucide-react";

// Import components
import DashboardStats from "@/components/admin/DashboardStats";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import NetworkStatus from "@/components/ui/NetworkStatus";
import RevenueSnapshot from "@/components/admin/RevenueSnapshot";
import ClientActivity from "@/components/admin/ClientActivity";

// Import hooks for Firestore data
import { useAuthUsers } from "@/hooks/useAuthUsers";
import { useCollection } from "@/hooks/useCollection";
import { useBookings } from "@/hooks/useBookings";


// We'll fetch real bookings from Firestore

// We'll fetch real rooms from Firestore

// We'll fetch real ads from Firestore

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'rooms', label: 'Rooms & Facilities', icon: Bed },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'branches', label: 'Branches', icon: Building2 },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart2 },
  { id: 'payments', label: 'Payments & Finance', icon: CreditCard },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface Ad {
  id?: string;
  title: string;
  discount: string;
  validUntil: string;
  description: string;
  status?: string;
}

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { userMeta, activeBranchId } = useAuth();
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  
  // Get current active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'dashboard';
    const segment = path.split('/admin/')[1]?.split('/')[0];
    return segment || 'dashboard';
  };
  
  const activeTab = getActiveTab();
  
  // Load essential data immediately for dashboard
  const { mergedUsers, loading: usersLoading, error: usersError } = useAuthUsers();
  const { bookings, isLoading: bookingsLoading, error: bookingsError } = useBookings();
  
  // Always call hooks but optimize loading behavior
  const { documents: rooms, loading: roomsLoading, error: roomsError } = useCollection('rooms');
  const { documents: ads, loading: adsLoading, error: adsError } = useCollection('promotions');
  
  // Only show loading for essential data to speed up initial render
  const isLoading = usersLoading || bookingsLoading;

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
  
  // Handle navigation to admin routes
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [newAd, setNewAd] = useState<Ad>({
    title: "",
    discount: "",
    validUntil: "",
    description: ""
  });

  const toggleSubmenu = (itemId: string) => {
    setActiveSubmenu(activeSubmenu === itemId ? null : itemId);
  };

  // Calculate dashboard stats from real data
  const stats = {
    totalUsers: mergedUsers?.length || 0,
    totalBookings: bookings?.length || 0,
    totalRevenue: bookings?.reduce((sum, booking) => sum + (booking.amount || 0), 0) || 0,
    occupancyRate: rooms?.length ? Math.round((rooms.filter(room => !room.availability).length / rooms.length) * 100) : 0
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      active: "default",
      confirmed: "default",
      pending: "secondary", 
      completed: "outline",
      inactive: "destructive",
      expired: "destructive",
      maintenance: "secondary"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  // Get the addDocument function from the promotions collection
  const { addDocument: addPromotion } = useCollection('promotions');
  
  const handleCreateAd = async () => {
    if (newAd.title && newAd.discount && newAd.validUntil) {
      try {
        // Add the ad to Firestore promotions collection
        await addPromotion({
          ...newAd,
          status: 'active',
          createdAt: new Date().toISOString()
        });
        
        // Reset the form
        setNewAd({ title: "", discount: "", validUntil: "", description: "" });
      } catch (error) {
        console.error("Error creating promotion:", error);
      }
    }
  };

  // Show loading state if data is still loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state if there was an error fetching data
  if (usersError || bookingsError || roomsError || adsError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive">Error loading dashboard data</h2>
          <p className="text-muted-foreground">
            {usersError?.message || bookingsError?.message || roomsError?.message || adsError?.message}
          </p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white/10 backdrop-blur-md border-r border-white/20 transition-all duration-300 ease-in-out`}>
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-bold text-white">Golden Tulip</h1>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="ml-auto text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        <nav className="mt-6">
          <div className="px-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'rooms', label: 'Rooms', icon: Bed },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'marketing', label: 'Marketing', icon: Megaphone },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'reports', label: 'Reports', icon: BarChart2 },
              { id: 'branches', label: 'Branches', icon: Building2 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start ${!isSidebarOpen ? 'justify-center' : ''} ${
                  activeTab === item.id 
                    ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' 
                    : 'text-white/80 hover:text-yellow-300 hover:bg-yellow-400/10'
                }`}
                onClick={() => handleNavigation(item.id === 'dashboard' ? '/admin' : `/admin/${item.id}`)}
              >
                <item.icon className="h-5 w-5" />
                {isSidebarOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            ))}
          </div>
          
          {/* Exit Button */}
          <div className="mt-auto p-4 border-t border-white/20">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-300 hover:bg-yellow-400/10 hover:text-yellow-300"
              onClick={() => window.location.href = '/'}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {isSidebarOpen && <span>Exit to Home</span>}
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-white">
                {currentBranchName ? `${currentBranchName} Admin Dashboard` : "Admin Dashboard"}
                {activeTab !== 'dashboard' && ` - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-400"></span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 border-white/30 text-white hover:bg-white/10">
                <div className="h-8 w-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-yellow-300">AD</span>
                </div>
                {isSidebarOpen && <span>Admin User</span>}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white/5 backdrop-blur-sm">
          {activeTab === 'dashboard' ? (
            <div className="p-6">
              <NetworkStatus />
              <AnalyticsDashboard />
            </div>
          ) : (
            <div className="p-6">
              <div className="pb-0">
                <NetworkStatus />
              </div>
              <div className="pt-6">
                <Outlet />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;