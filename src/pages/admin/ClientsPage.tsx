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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Merge auth users with Firestore users when data is available
  useEffect(() => {
    const mergeUsers = async () => {
      try {
        setLoading(true);
        if (firestoreUsers || authUsers.length > 0) {
          const users = await mergeWithFirestoreUsers(firestoreUsers || []);
          setMergedUsers(users);
          setError(null);
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
  }, [firestoreUsers, authUsers, mergeWithFirestoreUsers]);
  
  // Transform and sort clients
  const { sortedClients, filteredClients } = useMemo(() => {
    if (loading || !mergedUsers) return { sortedClients: [], filteredClients: [] };

    // Transform users to include derived data
    const clients = mergedUsers.map(user => ({
      ...user,
      status: (user.lastSignInAt && 
        new Date().getTime() - (user.lastSignInAt instanceof Date ? user.lastSignInAt.getTime() : new Date(user.lastSignInAt).getTime()) < 30 * 24 * 60 * 60 * 1000
      ) ? 'active' as const : 'inactive' as const,
      bookingCount: user.bookingIds?.length || 0,
      lastActive: user.lastSignInAt 
        ? (user.lastSignInAt instanceof Date ? user.lastSignInAt : new Date(user.lastSignInAt))
        : null,
      joinDate: user.createdAt 
        ? (user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt))
        : null
    }));

    // Apply sorting
    const sorted = [...clients].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'displayName':
          aValue = a.displayName || '';
          bValue = b.displayName || '';
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'createdAt':
          aValue = a.joinDate?.getTime() || 0;
          bValue = b.joinDate?.getTime() || 0;
          break;
        case 'lastSignInAt':
          aValue = a.lastActive?.getTime() || 0;
          bValue = b.lastActive?.getTime() || 0;
          break;
        case 'bookingCount':
          aValue = a.bookingCount;
          bValue = b.bookingCount;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply filters
    const filtered = sorted.filter(client => {
      // Search term filter
      const matchesSearch = !searchTerm.trim() || 
        (client.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         client.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'active' && client.status === 'active') ||
        (filters.status === 'inactive' && client.status === 'inactive');
      
      // Booking count filter
      const matchesBookingCount = filters.bookingCount === 'all' ||
        (filters.bookingCount === 'none' && client.bookingCount === 0) ||
        (filters.bookingCount === 'some' && client.bookingCount > 0 && client.bookingCount < 5) ||
        (filters.bookingCount === 'many' && client.bookingCount >= 5);
      
      // Last active filter
      const matchesLastActive = filters.lastActive === 'all' ||
        (filters.lastActive === 'today' && client.lastActive && 
          client.lastActive > subDays(new Date(), 1)) ||
        (filters.lastActive === 'week' && client.lastActive && 
          client.lastActive > subDays(new Date(), 7)) ||
        (filters.lastActive === 'month' && client.lastActive && 
          client.lastActive > subDays(new Date(), 30)) ||
        (filters.lastActive === 'never' && !client.lastActive);
      
      return matchesSearch && matchesStatus && matchesBookingCount && matchesLastActive;
    });

    return { sortedClients: clients, filteredClients: filtered };
  }, [users, searchTerm, sortField, sortDirection, filters]);

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
      'Member Since': client.joinDate ? formatDate(client.joinDate) : 'N/A',
      'Last Active': client.lastActive ? formatDateTime(client.lastActive) : 'Never',
      'Total Bookings': client.bookingCount,
      'Admin': client.isAdmin ? 'Yes' : 'No',
      'Phone Verified': client.phoneNumberVerified ? 'Yes' : 'No',
      'Email Verified': client.emailVerified ? 'Yes' : 'No',
      'Last Sign In': client.lastSignInAt ? formatDateTime(client.lastSignInAt.toDate()) : 'Never'
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading clients...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <h3 className="text-sm font-medium text-red-800">Error loading clients</h3>
        <p className="mt-1 text-sm text-red-700">{error.message}</p>
      </div>
    );
  }
  
  if (!users || users.length === 0) {
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
            {filteredClients.length !== users.length && ` (of ${users.length} total)`}
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
                    {client.createdAt ? formatDate(client.createdAt.toDate()) : 'N/A'}
                    {client.lastSignInAt && (
                      <p className="text-xs text-muted-foreground">
                        Last active: {formatDate(client.lastSignInAt.toDate())}
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
