import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, LogOut, ShieldAlert } from "lucide-react";
import { isAdmin } from "@/utils/auth";

export const AdminTestPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const userIsAdmin = isAdmin(currentUser);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userIsAdmin) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/admin')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin Access Test</CardTitle>
          <CardDescription>
            This page verifies your admin access and displays your user information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">User Information</h3>
            <div className="bg-muted p-4 rounded-md">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(
                  {
                    id: currentUser?.id,
                    name: currentUser?.name,
                    email: currentUser?.email,
                    role: currentUser?.role,
                    isAdmin: userIsAdmin,
                    joinDate: currentUser?.joinDate,
                    lastLogin: currentUser?.lastLogin,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Access Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span>Admin Access</span>
                <Badge variant={userIsAdmin ? "default" : "secondary"}>
                  {userIsAdmin ? "Granted" : "Denied"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span>User Role</span>
                <Badge variant={userIsAdmin ? "default" : "outline"}>
                  {currentUser?.role || "user"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-3">Test Admin Routes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/bookings')}
              >
                Test Bookings Access
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/rooms')}
              >
                Test Rooms Access
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/clients')}
              >
                Test Clients Access
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/settings')}
              >
                Test Settings Access
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTestPage;
