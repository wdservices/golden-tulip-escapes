import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Mail, Phone, Loader2, ArrowUpDown, Download, Filter, X } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { useAuthUsers } from "@/hooks/useAuthUsers";
import { User, ClientStatus } from "@/types";
import { subDays } from "date-fns";
import { exportToCsv, formatDate, formatDateTime } from "@/lib/utils";
import { ClientDetailsModal } from "@/components/admin/ClientDetailsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type SortField = 'displayName' | 'email' | 'createdAt' | 'lastSignInAt' | 'bookingCount';

export const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    bookingCount: 'all',
    lastActive: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch users from Firestore and Auth
  const { data: firestoreUsers, loading: firestoreLoading, error: firestoreError, updateDocument } = useCollection<User>('users');
  const { authUsers, loading: authLoading, error: authError, mergeWithFirestoreUsers } = useAuthUsers();
  const [mergedUsers, setMergedUsers] = useState<User[]>([]);
  // Initialize loading state based on the initial loading state of the data sources
  const [loading, setLoading] = useState(firestoreLoading || authLoading);
  const [error, setError] = useState<Error | null>(null);

  // Merge auth users with Firestore users when data is available
  useEffect(() => {
    // Update loading state whenever the source loading states change
    setLoading(firestoreLoading || authLoading);
    
    // Skip the effect if we're still loading data
    if (firestoreLoading || authLoading) return;
    
    const mergeUsers = async () => {
      try {
        // Check if we have a Firebase connection issue
        if ((firestoreError && firestoreError.message && firestoreError.message.includes('permission')) ||
            (authError && authError.message && authError.message.includes('permission'))) {
          console.warn('Permission error detected in ClientsPage, attempting to reconnect...');
          
          // Import and use the reconnectFirebase function
          const { reconnectFirebase } = await import('@/lib/firebase');
          const reconnected = await reconnectFirebase();
          
          if (!reconnected) {
            throw new Error('Failed to reconnect to Firebase. Please refresh the page and try again.');
          }
          
          console.log('Successfully reconnected to Firebase in ClientsPage');
        }
        
        // Merge users from Firestore with any authenticated user data
        // This will now include all users from the Firestore 'users' collection
        const users = await mergeWithFirestoreUsers(firestoreUsers || []);
        
        if (users && users.length > 0) {
          console.log(`Loaded ${users.length} users from Firestore and Auth`);
          setMergedUsers(users);
          setError(null);
        } else {
          console.warn('No users found in Firestore or Auth');
          setMergedUsers([]);
        }
      } catch (err) {
        console.error('Error merging users:', err);
        setError(err as Error);
        // Fallback to just Firestore users if there's an error
        setMergedUsers(firestoreUsers || []);
      } finally {
        setLoading(false);
      }
    };

    mergeUsers();
  }, [firestoreUsers, authUsers, firestoreLoading, authLoading, firestoreError, authError, mergeWithFirestoreUsers]);
  
  // Transform and sort clients
  const { sortedClients, filteredClients } = useMemo(() => {
    if (!mergedUsers || !mergedUsers.length) return { sortedClients: [], filteredClients: [] };

    // Transform users to include derived data
    const clients = mergedUsers.map(user => {
      // Safely handle date conversions
      const lastSignInDate = user.lastSignInAt ? 
        (user.lastSignInAt instanceof Date ? user.lastSignInAt : 
         typeof user.lastSignInAt === 'object' && user.lastSignInAt.toDate ? user.lastSignInAt.toDate() : 
         new Date(user.lastSignInAt)) : null;
      
      const createdAtDate = user.createdAt ? 
        (user.createdAt instanceof Date ? user.createdAt : 
         typeof user.createdAt === 'object' && user.createdAt.toDate ? user.createdAt.toDate() : 
         new Date(user.createdAt)) : new Date();
      
      return {
        ...user,
        lastSignInAt: lastSignInDate,
        createdAt: createdAtDate,
        status: user.status || 'active',
        bookingCount: user.bookingIds?.length || 0
      };
    });

    // Sort clients
    const sortedClients = [...clients].sort((a, b) => {
      if (sortField === 'displayName' || sortField === 'email') {
        const aValue = a[sortField] || '';
        const bValue = b[sortField] || '';
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (sortField === 'createdAt' || sortField === 'lastSignInAt') {
        const aValue = a[sortField] ? new Date(a[sortField]).getTime() : 0;
        const bValue = b[sortField] ? new Date(b[sortField]).getTime() : 0;
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (sortField === 'bookingCount') {
        const aValue = a.bookingIds?.length || 0;
        const bValue = b.bookingIds?.length || 0;
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    // Apply filters and search
    const filteredClients = sortedClients.filter(user => {
      // Status filter
      if (filters.status !== 'all' && user.status !== filters.status) {
        return false;
      }
      
      // Booking count filter
      const bookingCount = user.bookingIds?.length || 0;
      if (filters.bookingCount === 'none' && bookingCount > 0) {
        return false;
      } else if (filters.bookingCount === 'some' && (bookingCount === 0 || bookingCount >= 5)) {
        return false;
      } else if (filters.bookingCount === 'many' && bookingCount < 5) {
        return false;
      }
      
      // Last active filter
      if (filters.lastActive !== 'all') {
        if (filters.lastActive === 'never' && user.lastSignInAt) {
          return false;
        } else if (filters.lastActive !== 'never' && !user.lastSignInAt) {
          return false;
        } else if (user.lastSignInAt) {
          const lastSignInDate = new Date(user.lastSignInAt);
          const now = new Date();
          
          if (filters.lastActive === 'today' && 
              (lastSignInDate.getDate() !== now.getDate() || 
               lastSignInDate.getMonth() !== now.getMonth() || 
               lastSignInDate.getFullYear() !== now.getFullYear())) {
            return false;
          } else if (filters.lastActive === 'week' && 
                     now.getTime() - lastSignInDate.getTime() > 7 * 24 * 60 * 60 * 1000) {
            return false;
          } else if (filters.lastActive === 'month' && 
                     now.getTime() - lastSignInDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
            return false;
          }
        }
      }
      
      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (user.displayName && user.displayName.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });

    return { sortedClients, filteredClients };
  }, [mergedUsers, sortField, sortDirection, filters, searchTerm, loading]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export to CSV
  const handleExport = () => {
    const data = filteredClients.map(client => ({
      Name: client.displayName || 'N/A',
      Email: client.email || 'N/A',
      Phone: client.phoneNumber || 'N/A',
      Status: client.status === 'active' ? 'Active' : 'Inactive',
      'Member Since': client.createdAt ? formatDate(
        client.createdAt instanceof Date ? client.createdAt :
        typeof client.createdAt === 'object' && client.createdAt.toDate ?
        client.createdAt.toDate() : new Date(client.createdAt)
      ) : 'N/A',
      'Last Active': client.lastSignInAt ? formatDateTime(
        client.lastSignInAt instanceof Date ? client.lastSignInAt :
        typeof client.lastSignInAt === 'object' && client.lastSignInAt.toDate ?
        client.lastSignInAt.toDate() : new Date(client.lastSignInAt)
      ) : 'Never',
      'Total Bookings': client.bookingCount,
      'Admin': client.isAdmin ? 'Yes' : 'No',
      'Phone Verified': client.phoneNumberVerified ? 'Yes' : 'No',
      'Email Verified': client.emailVerified ? 'Yes' : 'No',
      'Last Sign In': client.lastSignInAt ? formatDateTime(
        client.lastSignInAt instanceof Date ? client.lastSignInAt :
        typeof client.lastSignInAt === 'object' && client.lastSignInAt.toDate ?
        client.lastSignInAt.toDate() : new Date(client.lastSignInAt)
      ) : 'Never'
    }));
    
    exportToCsv(data, `clients_export_${new Date().toISOString().split('T')[0]}`);
  };

  const getStatusVariant = (status: 'active' | 'inactive') => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
      : 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  const handleClientUpdate = () => {
    // This will trigger a re-fetch of the clients
    // The useCollection hook will automatically update the data
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-muted-foreground">Loading client data...</span>
      </div>
    );
  }
  
  if (error) {
    const isPermissionError = error.message && (
      error.message.includes('permission') || 
      error.message.includes('unauthorized') ||
      error.message.includes('400')
    );
    
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <h3 className="text-sm font-medium text-red-800">
          {isPermissionError ? 'Firebase Permission Error' : 'Error loading clients'}
        </h3>
        <p className="mt-1 text-sm text-red-700">
          {isPermissionError 
            ? 'You may not have the required access rights. The system is attempting to reconnect automatically.'
            : error.message}
        </p>
        {isPermissionError && (
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        )}
      </div>
    );
  }
  
  if (!mergedUsers || mergedUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No clients found</h3>
        <p className="mt-1 text-sm text-gray-500">
          There are currently no clients in the system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Client Management</h2>
          <p className="text-sm text-muted-foreground">
            {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} found
            {filteredClients.length !== mergedUsers.length && ` (of ${mergedUsers.length} total)`}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>
      
      {/* Client Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered Clients</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mergedUsers.length}</div>
            <p className="text-xs text-muted-foreground">Clients registered in the system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mergedUsers.filter(user => {
                if (!user.lastSignInAt) return false;
                
                // Safely handle date conversion
                const lastSignInDate = user.lastSignInAt instanceof Date ? user.lastSignInAt : 
                  (typeof user.lastSignInAt === 'object' && user.lastSignInAt.toDate ? 
                    user.lastSignInAt.toDate() : new Date(user.lastSignInAt));
                
                // Check if active within last 30 days
                return new Date().getTime() - lastSignInDate.getTime() < 30 * 24 * 60 * 60 * 1000;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Active in the last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients with Bookings</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mergedUsers.filter(user => user.bookingIds && user.bookingIds.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Clients with at least one booking</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Clients</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mergedUsers.filter(user => {
                if (!user.createdAt) return false;
                
                // Safely handle date conversion
                const createdAtDate = user.createdAt instanceof Date ? user.createdAt : 
                  (typeof user.createdAt === 'object' && user.createdAt.toDate ? 
                    user.createdAt.toDate() : new Date(user.createdAt));
                
                // Safely convert createdAt to Date and check if created within last 7 days
                const createdDate = user.createdAt instanceof Date ? user.createdAt :
                  typeof user.createdAt === 'object' && user.createdAt.toDate ?
                  user.createdAt.toDate() : new Date(user.createdAt);
                return new Date().getTime() - createdDate.getTime() < 7 * 24 * 60 * 60 * 1000;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Registered in the last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Hide Filters
                </>
              ) : (
                <>
                  <Filter className="mr-2 h-4 w-4" />
                  Show Filters
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <Label>Bookings</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.bookingCount}
                  onChange={(e) => setFilters({ ...filters, bookingCount: e.target.value })}
                >
                  <option value="all">Any Number of Bookings</option>
                  <option value="none">No Bookings</option>
                  <option value="some">1-4 Bookings</option>
                  <option value="many">5+ Bookings</option>
                </select>
              </div>
              
              <div>
                <Label>Last Active</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.lastActive}
                  onChange={(e) => setFilters({ ...filters, lastActive: e.target.value })}
                >
                  <option value="all">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                onClick={() => setFilters({
                  status: 'all',
                  bookingCount: 'all',
                  lastActive: 'all'
                })}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <CardTitle className="text-lg">All Clients</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search clients..."
                  className="w-full pl-8 sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSort('displayName')}>
                    Name {sortField === 'displayName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('email')}>
                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                    Join Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('lastSignInAt')}>
                    Last Active {sortField === 'lastSignInAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('bookingCount')}>
                    Booking Count {sortField === 'bookingCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Member Since</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{client.displayName || 'No name'}</span>
                      {client.isAdmin && (
                        <Badge variant="outline" className="mt-1 w-fit">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{client.email || 'No email'}</span>
                      </div>
                      {client.phoneNumber && (
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{client.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.createdAt ? 
                      formatDate(client.createdAt instanceof Date ? client.createdAt : 
                        typeof client.createdAt === 'object' && client.createdAt.toDate ? 
                        client.createdAt.toDate() : new Date(client.createdAt)) : 'N/A'}
                    {client.lastSignInAt && (
                      <p className="text-xs text-muted-foreground">
                        Last active: {formatDate(client.lastSignInAt instanceof Date ? client.lastSignInAt :
                          typeof client.lastSignInAt === 'object' && client.lastSignInAt.toDate ?
                          client.lastSignInAt.toDate() : new Date(client.lastSignInAt))}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{client.bookingIds?.length || 0}</TableCell>
                  <TableCell>
                    <Badge className={getStatusVariant(client.status)}>
                      {client.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedClient(client)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Client Details Modal */}
      <ClientDetailsModal
        client={selectedClient}
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        onUpdate={handleClientUpdate}
      />
    </div>
  );
};


export default ClientsPage;
