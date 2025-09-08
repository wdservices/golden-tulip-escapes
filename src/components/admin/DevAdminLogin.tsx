import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import { isAdmin } from "@/utils/auth";

export function DevAdminLogin() {
  const { login, currentUser, logout, register } = useAuth();
  const userIsAdmin = isAdmin(currentUser);

  // This is for development only - in production, use proper authentication
  const handleDevAdminLogin = async () => {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      toast.error('Admin login is only available in development mode');
      return;
    }

    const email = 'admin@example.com';
    const password = 'password123';
    
    // Try to log in with test admin credentials first
    try {
      toast.info('Logging in as admin...');
      await login(email, password);
      toast.success('Successfully logged in as admin!');
      window.location.href = '/admin';
      return;
    } catch (error: any) {
      console.warn('Login attempt failed, trying to create test admin:', error);
    }
    
    // If login fails, try to create a test admin user
    try {
      toast.info('Creating test admin user...');
      await register('Test Admin', email, '+1234567890', password);
      toast.success('Test admin user created and logged in!');
      window.location.href = '/admin';
      return;
    } catch (registerError: any) {
      console.warn('Failed to create test admin, using mock user:', registerError);
      
      // If user already exists, try to log in one more time
      if (registerError.code === 'auth/email-already-in-use') {
        try {
          await login(email, password);
          toast.success('Successfully logged in as admin!');
          window.location.href = '/admin';
          return;
        } catch (loginError) {
          console.error('Second login attempt failed:', loginError);
          toast.error('Failed to log in as admin. Please try again.');
        }
      } else {
        toast.error(`Failed to create admin user: ${registerError.message || 'Unknown error'}`);
      }
    }
    
    // If all else fails, try to use a mock user
    try {
      toast.info('Falling back to development mock admin...');
      const testAdmin = {
        id: 'test-admin-123',
        name: 'Test Admin',
        email: email,
        role: 'admin',
        preferences: {},
        phone: '+1234567890',
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      // @ts-ignore - We're setting a mock user for development
      window.mockUser = testAdmin;
      
      // Force a page reload to ensure all auth state is properly initialized
      window.location.href = '/admin';
    } catch (mockError) {
      console.error('Failed to set mock user:', mockError);
      toast.error('Failed to initialize mock admin user');
    }
  };

  const handleLogout = async () => {
    try {
      // Clear any mock user data first
      if (process.env.NODE_ENV === 'development') {
        // @ts-ignore
        delete window.mockUser;
      }
      
      // Perform the actual logout
      await logout();
      
      // Redirect to home page after logout
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.');
      
      // Force redirect even if logout fails
      window.location.href = '/';
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      {userIsAdmin ? (
        <Button 
          variant="destructive" 
          size="sm" 
          className="shadow-lg"
          onClick={handleLogout}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Logout Admin
        </Button>
      ) : (
        <Button 
          variant="default" 
          size="sm" 
          className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
          onClick={handleDevAdminLogin}
        >
          <Lock className="h-4 w-4 mr-2" />
          Dev: Login as Admin
        </Button>
      )}
      <div className="text-xs text-muted-foreground bg-background/80 backdrop-blur p-2 rounded-md border">
        <div>Dev Mode</div>
        <div>Status: {userIsAdmin ? 'Admin' : 'User'}</div>
      </div>
    </div>
  );
}
