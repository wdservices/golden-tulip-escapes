import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Home, Building, CreditCard, BarChart, Bell, UserCog } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  items?: NavItem[];
  exact?: boolean;
}

interface AdminDashboardProps {
  children?: React.ReactNode;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ children }) => {
  const { logout: signOut, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleNavigation = (href: string) => {
    // Only navigate if we're not already on the target page
    if (!isActive(href)) {
      navigate(href);
    }
  };

  // Navigation items
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      exact: true
    },
    {
      title: "Bookings",
      href: "/admin/bookings",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      title: "Rooms & Facilities",
      href: "/admin/rooms",
      icon: <Home className="h-5 w-5" />
    },
    {
      title: "Clients",
      href: "/admin/clients",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Marketing",
      href: "/admin/marketing",
      icon: <Bell className="h-5 w-5" />
    },
    {
      title: "Payments",
      href: "/admin/payments",
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: <BarChart className="h-5 w-5" />
    },
    {
      title: "Branches",
      href: "/admin/branches",
      icon: <Building className="h-5 w-5" />
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          title: "Pricing",
          href: "/admin/pricing",
          icon: <CreditCard className="h-4 w-4" />
        },
        {
          title: "Users & Roles",
          href: "/admin/settings/users",
          icon: <UserCog className="h-4 w-4" />
        },
        {
          title: "System Settings",
          href: "/admin/settings/system",
          icon: <Settings className="h-4 w-4" />
        },
        {
          title: "Test Page",
          href: "/admin/test",
          icon: <span className="h-4 w-4 flex items-center justify-center">🧪</span>
        }
      ]
    }
  ];

  // Improved isActive function to handle all route matching cases
  const isActive = (href: string, exact: boolean = false): boolean => {
    // Normalize the paths by removing trailing slashes
    const normalizePath = (path: string) => path.replace(/\/+$/, '');
    
    const currentPath = normalizePath(location.pathname);
    const normalizedHref = normalizePath(href);
    
    // Handle exact matches
    if (currentPath === normalizedHref) {
      return true;
    }
    
    // If exact is true, don't match sub-routes
    if (exact) {
      return false;
    }
    
    // Handle index route
    if (normalizedHref === '/admin' && (currentPath === '/admin' || currentPath === '')) {
      return true;
    }
    
    // Handle nested routes
    if (currentPath.startsWith(normalizedHref)) {
      // Check if it's a complete segment match
      const nextChar = currentPath[normalizedHref.length];
      return !nextChar || nextChar === '/' || nextChar === '?' || nextChar === '#';
    }
    
    return false;
  };

  // Render navigation items recursively
  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.href} className={level > 0 ? 'pl-4' : ''}>
        <button
          onClick={() => handleNavigation(item.href)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors',
            isActive(item.href, item.exact)
              ? 'bg-primary/10 text-primary'
              : 'text-foreground/80 hover:bg-accent hover:text-foreground',
            isCollapsed ? 'justify-center' : 'justify-start'
          )}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {!isCollapsed && <span>{item.title}</span>}
        </button>
        {!isCollapsed && item.items && (
          <div className="mt-1 space-y-1">
            {renderNavItems(item.items, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-300 z-10",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!isCollapsed && <h1 className="text-xl font-bold text-primary">Admin Panel</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto hover:bg-accent"
          >
            {isCollapsed ? "→" : "←"}
          </Button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2">
          {renderNavItems(navItems)}
        </nav>
        
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {navItems.find(item => isActive(item.href))?.title || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-border hover:bg-accent">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : <User className="h-4 w-4" />}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
