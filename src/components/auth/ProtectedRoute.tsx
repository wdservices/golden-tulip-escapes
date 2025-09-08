import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { isAdmin } from "@/utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  redirectTo?: string;
}

export const ProtectedRoute = ({ children, requiredRole, redirectTo }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're not already on the login page
    if (!isLoading && !isAuthenticated && location.pathname !== '/auth') {
      navigate('/auth', { state: { from: location }, replace: true });
    }
  }, [isLoading, isAuthenticated, location, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (requiredRole) {
    const isUserAdmin = isAdmin(currentUser);
    
    // If user is not authorized for this route
    if ((requiredRole === 'admin' && !isUserAdmin) || 
        (requiredRole === 'user' && isUserAdmin)) {
      // Redirect to the specified path or default paths based on user role
      const redirectPath = redirectTo || (isUserAdmin ? '/admin' : '/dashboard');
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};
