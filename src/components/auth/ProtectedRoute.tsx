import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { isAdmin } from "@/utils/auth";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  redirectTo?: string;
}

export const ProtectedRoute = ({ children, requiredRole, redirectTo }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Memoize the computed values to prevent unnecessary re-renders
  const isUserAdmin = useMemo(() => isAdmin(currentUser), [currentUser]);
  const isAuthorized = useMemo(() => {
    if (!requiredRole) return true;
    if (requiredRole === 'admin') return isUserAdmin;
    return true; // Regular users are always authorized for user routes
  }, [requiredRole, isUserAdmin]);

  // Handle redirections based on auth state
  useEffect(() => {
    if (isLoading) return; // Don't do anything while loading

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const redirectPath = location.pathname !== '/auth' ? location.pathname : '/';
      navigate('/auth', { 
        state: { 
          from: redirectPath,
          message: 'Please sign in to continue' 
        }, 
        replace: true 
      });
      return;
    }

    // Check role-based access
    if (requiredRole === 'admin' && !isUserAdmin) {
      const targetPath = redirectTo || '/dashboard';
      console.warn(`Unauthorized access attempt to ${location.pathname} by ${currentUser?.email}`);
      toast.warning('You do not have permission to access this page');
      navigate(targetPath, { replace: true });
    }
  }, [isLoading, isAuthenticated, isUserAdmin, requiredRole, redirectTo, location, navigate, currentUser]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-6 bg-card rounded-lg shadow-sm">
          <LoadingSpinner size={48} />
          <p className="text-muted-foreground">Checking your access...</p>
        </div>
      </div>
    );
  }

  // Handle unauthenticated users
  if (!isAuthenticated) {
    return null; // Navigation is handled by the effect
  }

  // Handle unauthorized access (wrong role)
  if (requiredRole && !isAuthorized) {
    return null; // Navigation is handled by the effect
  }

  return <>{children}</>;
};
