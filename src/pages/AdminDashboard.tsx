import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getBranches } from "@/services/branchService";
import { clearBookingData } from "@/utils/clearDatabase";

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
  ArrowLeft,
  MessageSquare,
  Megaphone,
  BookOpen
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
import { db } from "@/lib/firebase";
import { collection, collectionGroup, getDocs, orderBy, query, limit } from "firebase/firestore";


// We'll fetch real bookings from Firestore

// We'll fetch real rooms from Firestore

// We'll fetch real ads from Firestore

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'rooms', label: 'Rooms & Facilities', icon: Bed },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'payments', label: 'Payments & Finance', icon: CreditCard },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart2 },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'branches', label: 'Branches', icon: Building2 },
  { id: 'ads', label: 'Ads', icon: Megaphone },
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
  const { userMeta, activeBranchId, currentUser, isAuthenticated, isLoading } = useAuth();
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  
  // Debug: Log all auth state
  useEffect(() => {
    console.log("🏢 AdminDashboard - Auth State:", {
      isAuthenticated,
      isLoading,
      currentUser: currentUser?.email,
      userRole: currentUser?.role,
      userMeta,
      activeBranchId,
      currentBranchName,
      currentPath: location.pathname
    });
  }, [isAuthenticated, isLoading, currentUser, userMeta, activeBranchId, currentBranchName, location.pathname]);
  
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
  const dataLoading = usersLoading || bookingsLoading;

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; title: string; description?: string; link: string }>>([]);

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const results: Array<{ id: string; type: string; title: string; description?: string; link: string }> = [];
      try {
        const fq = query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(5));
        const fs = await getDocs(fq);
        fs.docs.forEach(d => {
          const dt: any = d.data();
          results.push({ id: d.id, type: "feedback", title: dt.type || "Feedback", description: dt.message || "", link: "/admin/feedback" });
        });
      } catch (_) {
        const fs = await getDocs(query(collection(db, "feedback"), limit(5)));
        fs.docs.forEach(d => {
          const dt: any = d.data();
          results.push({ id: d.id, type: "feedback", title: dt.type || "Feedback", description: dt.message || "", link: "/admin/feedback" });
        });
      }
      try {
        const bq = query(collectionGroup(db, "bookings"), limit(5));
        const bs = await getDocs(bq);
        bs.docs.forEach(d => {
          const dt: any = d.data();
          results.push({ id: d.id, type: "booking", title: dt.guestName || "New Booking", description: dt.branchName || dt.roomType || "", link: "/admin/bookings" });
        });
      } catch (_) {}
      try {
        const pq = query(collectionGroup(db, "payments"), limit(5));
        const ps = await getDocs(pq);
        ps.docs.forEach(d => {
          const dt: any = d.data();
          results.push({ id: d.id, type: "payment", title: `${dt.amount || 0} ${dt.currency || ""}`.trim() || "Payment", description: dt.status || "", link: "/admin/payments" });
        });
      } catch (_) {}
      setNotifications(results);
    } finally {
      setNotifLoading(false);
    }
  };

  // Fetch current branch name
  useEffect(() => {
    const fetchBranchName = async () => {
      console.log("fetchBranchName called with activeBranchId:", activeBranchId);
      if (activeBranchId) {
        try {
          console.log("Fetching branch name for activeBranchId:", activeBranchId);
          const branches = await getBranches();
          console.log("Available branches:", branches);
          console.log("Branch IDs:", branches.map(b => b.id));
          const branch = branches.find(b => b.id === activeBranchId);
          console.log("Found branch:", branch);
          if (branch) {
            console.log("Setting currentBranchName to:", branch.name);
            setCurrentBranchName(branch.name);
          } else {
            console.warn("No branch found for activeBranchId:", activeBranchId);
            setCurrentBranchName("");
          }
        } catch (error) {
          console.error("Error fetching branch name:", error);
          setCurrentBranchName("");
        }
      } else {
        console.log("No activeBranchId, clearing currentBranchName");
        setCurrentBranchName("");
      }
    };
    
    fetchBranchName();
  }, [activeBranchId]);
  
  // Handle navigation to admin routes
  const handleNavigation = (path: string) => {
    try {
      console.log('🧭 Navigation triggered:', path);
      console.log('📍 Current path:', location.pathname);
      
      // Prevent navigation to the same path
      if (location.pathname === path) {
        console.log('🔄 Same path navigation prevented');
        return;
      }
      
      // Force a small delay to ensure proper state cleanup
      setTimeout(() => {
        navigate(path, { replace: false });
      }, 50);
    } catch (error) {
      console.error('🧭 Navigation error:', error);
      // Fallback to window.location for critical navigation failures
      console.log('🔄 Fallback to window.location');
      window.location.href = path;
    }
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

  // Show loading state if auth is still loading
  if (isLoading) {
    console.log("🏢 AdminDashboard: Auth still loading, showing spinner");
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !currentUser) {
    console.log("🏢 AdminDashboard: User not authenticated, should redirect");
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive">Authentication Required</h2>
          <p className="text-muted-foreground">Please sign in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  // Show loading state if data is still loading
  if (dataLoading) {
    console.log("🏢 AdminDashboard: Data still loading, showing spinner");
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state if there was an error fetching data
  if (usersError || bookingsError || roomsError || adsError) {
    console.log("🏢 AdminDashboard: Data loading error:", {
      usersError: usersError?.message,
      bookingsError: bookingsError?.message,
      roomsError: roomsError?.message,
      adsError: adsError?.message
    });
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

  console.log("🏢 AdminDashboard: Rendering main dashboard interface");

  return (
    <div className="flex h-screen bg-gradient-to-br from-[hsl(var(--royal-blue-dark))] via-[hsl(var(--royal-blue))] to-[hsl(var(--royal-blue-light))]">
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
              { id: 'rooms', label: 'Rooms', icon: Bed },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'reports', label: 'Reports', icon: BarChart2 },
              { id: 'feedback', label: 'Feedback', icon: MessageSquare },
              { id: 'branches', label: 'Branches', icon: Building2 },
              { id: 'ads', label: 'Ads', icon: Megaphone },
              { id: 'documentation', label: 'Documentation', icon: BookOpen },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <Button
                key={`${item.id}-${activeTab}`}
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
            <div className="flex-1 flex items-center justify-center">
              <h2 className="text-2xl font-bold text-white text-center">
                <span className="text-white">Admin Dashboard</span>
                {currentBranchName && (
                  <span className="text-yellow-300"> - {currentBranchName}</span>
                )}
                {activeTab !== 'dashboard' && (
                  <span className="text-white/80"> - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                )}
                {/* Debug info - remove after testing */}
                <div className="text-xs text-gray-300 mt-1">
                  Debug: activeBranchId={activeBranchId || 'null'}, branchName={currentBranchName || 'null'}
                </div>
              </h2>
            </div>
            <div className="flex items-center space-x-4 relative">
              <Button variant="ghost" size="icon" className="relative text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20" onClick={() => { setIsNotifOpen(v => !v); if (!notifications.length) loadNotifications(); }}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-400"></span>
              </Button>
              {isNotifOpen && createPortal(
                <div className="fixed right-6 top-16 w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-md p-3 z-[9999]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/90">Notifications</span>
                    <Button size="sm" variant="ghost" className="text-white/80" onClick={loadNotifications}>{notifLoading ? "Loading" : "Refresh"}</Button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="text-white/60 text-sm">No recent activity</div>
                    ) : notifications.map(n => (
                      <div key={n.id} className="flex items-start justify-between gap-2 bg-white/5 rounded p-2">
                        <div>
                          <div className="text-white text-sm">{n.type.toUpperCase()}</div>
                          <div className="text-white/90 text-sm">{n.title}</div>
                          {n.description ? <div className="text-white/60 text-xs">{n.description}</div> : null}
                        </div>
                        <Button size="sm" className="bg-yellow-500 text-white hover:bg-yellow-600" onClick={() => handleNavigation(n.link)}>View</Button>
                      </div>
                    ))}
                  </div>
                </div>,
                document.body
              )}
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
