import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
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
  DollarSign,
  TrendingUp,
  Tag,
  LogOut, 
  ArrowLeft
} from "lucide-react";

// Import components
import DashboardStats from "@/components/admin/DashboardStats";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import RevenueSnapshot from "@/components/admin/RevenueSnapshot";
import ClientActivity from "@/components/admin/ClientActivity";

// Mock Data
const mockUsers = [
  { id: 1, name: "John Doe", email: "john@email.com", phone: "+234 801 234 5678", totalBookings: 3, status: "active", joinDate: "2024-01-15" },
  { id: 2, name: "Jane Smith", email: "jane@email.com", phone: "+234 802 345 6789", totalBookings: 1, status: "active", joinDate: "2024-02-20" },
  { id: 3, name: "Mike Johnson", email: "mike@email.com", phone: "+234 803 456 7890", totalBookings: 5, status: "inactive", joinDate: "2023-12-10" },
];

const mockBookings = [
  { 
    id: "BK001", 
    guest: "John Doe", 
    branch: "GRA Head Branch", 
    room: "Executive Suite", 
    checkIn: "2024-12-28", 
    checkOut: "2024-12-30", 
    status: "confirmed", 
    amount: 190000,
    guests: 2
  },
  { 
    id: "BK002", 
    guest: "Jane Smith", 
    branch: "Waterlines Branch", 
    room: "Deluxe Room", 
    checkIn: "2024-12-29", 
    checkOut: "2024-12-31", 
    status: "pending", 
    amount: 130000,
    guests: 1
  },
  { 
    id: "BK003", 
    guest: "Mike Johnson", 
    branch: "GRA Head Branch", 
    room: "Presidential Suite", 
    checkIn: "2024-12-25", 
    checkOut: "2024-12-27",
    status: "completed",
    amount: 250000,
    guests: 2
  },
  { 
    id: "BK004", 
    guest: "Sarah Williams", 
    branch: "Airforce Base", 
    room: "Standard Room", 
    checkIn: "2024-12-30", 
    checkOut: "2025-01-02",
    status: "confirmed",
    amount: 180000,
    guests: 2
  },
  { 
    id: "BK005", 
    guest: "David Brown", 
    branch: "Oyigbo Branch", 
    room: "Deluxe Room", 
    checkIn: "2024-12-24", 
    checkOut: "2024-12-26",
    status: "cancelled",
    amount: 140000,
    guests: 1
  }
];

const mockRooms = [
  { id: 1, name: "Executive Suite", branch: "GRA Head Branch", price: 95000, total: 15, available: 3, occupied: 12, status: "active" },
  { id: 2, name: "Deluxe Room", branch: "Waterlines Branch", price: 65000, total: 20, available: 8, occupied: 12, status: "active" },
  { id: 3, name: "Presidential Suite", branch: "GRA Head Branch", price: 125000, total: 5, available: 1, occupied: 4, status: "active" },
  { id: 4, name: "Standard Room", branch: "Airforce Base", price: 45000, total: 25, available: 15, occupied: 10, status: "active" },
  { id: 5, name: "Family Suite", branch: "Oyigbo Branch", price: 75000, total: 10, available: 2, occupied: 8, status: "maintenance" },
];

const mockAds = [
  { 
    id: 'AD001',
    title: 'Summer Special', 
    description: 'Get 20% off on all room bookings for stays in June and July',
    discount: '20%',
    validUntil: '2024-07-31',
    status: 'active'
  },
  { 
    id: 'AD002',
    title: 'Weekend Getaway', 
    description: '15% off for weekend stays (Friday to Sunday)',
    discount: '15%',
    validUntil: '2024-12-31',
    status: 'active'
  },
  { 
    id: 'AD003',
    title: 'Early Bird Offer', 
    description: 'Book 30 days in advance and get 10% off',
    discount: '10%',
    validUntil: '2024-12-31',
    status: 'expired'
  }
];

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'rooms', label: 'Rooms & Facilities', icon: Bed },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'payments', label: 'Payments & Finance', icon: CreditCard },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart2 },
  { id: 'branches', label: 'Branches', icon: Building2 },
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
  
  // Get current active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'dashboard';
    const segment = path.split('/admin/')[1]?.split('/')[0];
    return segment || 'dashboard';
  };
  
  const activeTab = getActiveTab();
  
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

  const stats = {
    totalUsers: mockUsers.length,
    totalBookings: mockBookings.length,
    totalRevenue: mockBookings.reduce((sum, booking) => sum + booking.amount, 0),
    occupancyRate: Math.round((mockRooms.reduce((sum, room) => sum + room.occupied, 0) / mockRooms.reduce((sum, room) => sum + room.total, 0)) * 100)
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

  const handleCreateAd = () => {
    if (newAd.title && newAd.discount && newAd.validUntil) {
      // In real app, this would call an API
      console.log("Creating ad:", newAd);
      setNewAd({ title: "", discount: "", validUntil: "", description: "" });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-card border-r transition-all duration-300 ease-in-out`}>
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-bold">Golden Tulip</h1>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="ml-auto"
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
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'pricing', label: 'Pricing', icon: Tag },
              { id: 'marketing', label: 'Marketing', icon: Megaphone },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'reports', label: 'Reports', icon: BarChart2 },
              { id: 'branches', label: 'Branches', icon: Building2 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${!isSidebarOpen ? 'justify-center' : ''}`}
                onClick={() => handleNavigation(item.id === 'dashboard' ? '/admin' : `/admin/${item.id}`)}
              >
                <item.icon className="h-5 w-5" />
                {isSidebarOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            ))}
          </div>
          
          {/* Exit Button */}
          <div className="mt-auto p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
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
        <header className="bg-background border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">AD</span>
                </div>
                {isSidebarOpen && <span>Admin User</span>}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' ? (
            <div className="p-6">
              <AnalyticsDashboard />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;