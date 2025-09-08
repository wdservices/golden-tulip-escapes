import { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Trash2, Loader2, Search, User, Clock, Calendar, LogIn } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  role: string;
  lastLogin?: string;
  isActive?: boolean;
  sessions?: Array<{
    loginTime: string;
    logoutTime?: string;
    deviceInfo?: string;
  }>;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser } = useAuth();

  // Fetch users and their active sessions from Firestore
  useEffect(() => {
    const fetchUsersAndSessions = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, "users");
        const sessionsRef = collection(db, "sessions");
        
        // Only fetch non-admin users for the current branch
        const usersQuery = query(
          usersRef, 
          where("role", "==", "user"),
          where("branch", "==", currentUser?.branch || "GRA")
        );
        
        const [usersSnapshot, activeSessionsSnapshot] = await Promise.all([
          getDocs(usersQuery),
          getDocs(query(sessionsRef, where("status", "==", "active")))
        ]);
        
        // Create a map of active user sessions
        const activeSessions = new Map<string, any>();
        activeSessionsSnapshot.forEach(doc => {
          const session = doc.data();
          if (session.userId) {
            activeSessions.set(session.userId, {
              ...session,
              id: doc.id,
              loginTime: session.loginTime?.toDate().toISOString()
            });
          }
        });
        
        // Process users and add session info
        const usersData = await Promise.all(usersSnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          const activeSession = activeSessions.get(doc.id);
          
          return {
            id: doc.id,
            name: userData.name || 'No Name',
            email: userData.email || 'No Email',
            phone: userData.phone || 'No Phone',
            branch: userData.branch || 'Unassigned',
            role: userData.role || 'user',
            lastLogin: userData.lastLogin?.toDate?.()?.toISOString() || null,
            isActive: !!activeSession,
            sessions: activeSession ? [{
              loginTime: activeSession.loginTime,
              deviceInfo: activeSession.deviceInfo || 'Unknown device'
            }] : [],
            createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          } as Client;
        }));
        
        setClients(usersData);
      } catch (error) {
        console.error("Error fetching users and sessions:", error);
        toast.error("Failed to load client data");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === 'admin') {
      fetchUsersAndSessions();
    }
  }, [currentUser?.branch, currentUser?.role]);

  // Delete a single user
  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", clientId));
        setClients(clients.filter(client => client.id !== clientId));
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  // Delete multiple users
  const handleBulkDelete = async () => {
    if (selectedClients.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedClients.length} selected users?`)) {
      try {
        const deletePromises = selectedClients.map(clientId => 
          deleteDoc(doc(db, "users", clientId))
        );
        
        await Promise.all(deletePromises);
        setClients(clients.filter(client => !selectedClients.includes(client.id)));
        setSelectedClients([]);
        toast.success(`${selectedClients.length} users deleted successfully`);
      } catch (error) {
        console.error("Error deleting users:", error);
        toast.error("Failed to delete selected users");
      }
    }
  };

  // Copy client information to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Toggle client selection
  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  // Toggle select all clients
  const toggleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(client => client.id));
    }
  };

  // Filter clients based on search term and active status
  const filteredClients = clients
    .filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    )
    .sort((a, b) => {
      // Sort by active status first, then by last login time
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      return (b.lastLogin || '').localeCompare(a.lastLogin || '');
    });

  // Format date to a readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate session duration
  const getSessionDuration = (loginTime?: string) => {
    if (!loginTime) return 'N/A';
    const login = new Date(loginTime);
    const now = new Date();
    const diffMs = now.getTime() - login.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-sm text-gray-500">
            Manage users and their information for your branch
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {selectedClients.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedClients.length})
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchTerm ? 'No matching users found' : 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow 
                      key={client.id}
                      className={client.isActive ? 'bg-green-50 dark:bg-green-900/20' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={() => toggleClientSelection(client.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${client.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="font-medium">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{client.email}</span>
                          <span className="text-xs text-muted-foreground">{client.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>{client.branch}</TableCell>
                      <TableCell>
                        {new Date(client.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteClient(client.id)}
                          aria-label="Delete client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
