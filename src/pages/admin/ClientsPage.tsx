import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Mail, Phone, Users, Loader2, Copy, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthUsers } from "@/hooks/useAuthUsers";
import { getBranches } from "@/services/branchService";
import { syncBookingClientsWithUsers, getBookingClientStats } from "@/services/bookingClientSync";
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { currentUser, activeBranchId } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState<{ created: number; updated: number; errors: string[] } | null>(null);
  const [bookingClientStats, setBookingClientStats] = useState<{ totalClients: number; uniqueEmails: number; clientsWithMultipleBookings: number; recentClients: number } | null>(null);
  
  // Fetch current branch name
  useEffect(() => {
    const fetchBranchName = async () => {
      console.log('🔍 ClientsPage: Fetching branch name for activeBranchId:', activeBranchId);
      if (activeBranchId) {
        try {
          // First try to get from static branches
          const branches = await getBranches();
          console.log('🔍 ClientsPage: Available branches:', branches.map(b => ({ id: b.id, name: b.name })));
          let branch = branches.find(b => b.id === activeBranchId);
          
          // If not found in static branches, try Firestore directly
          if (!branch) {
            console.log('🔍 ClientsPage: Branch not found in static data, trying Firestore for ID:', activeBranchId);
            try {
              const branchDoc = await getDoc(doc(db, 'branches', activeBranchId));
              if (branchDoc.exists()) {
                const branchData = branchDoc.data();
                console.log('🔍 ClientsPage: Firestore branch data:', branchData);
                branch = {
                  id: activeBranchId,
                  name: branchData.name || branchData.displayName || 'Unknown Branch',
                  fullName: branchData.fullName || branchData.name || branchData.displayName || 'Unknown Branch',
                  logo: branchData.logo || ''
                };
                console.log('🔍 ClientsPage: Found branch in Firestore:', branch);
              } else {
                console.log('🔍 ClientsPage: Branch document does not exist for ID:', activeBranchId);
              }
            } catch (firestoreError) {
              console.warn('🔍 ClientsPage: Could not fetch branch from Firestore:', firestoreError);
            }
          }
          
          if (branch) {
            console.log('🔍 ClientsPage: Setting branch name to:', branch.name);
            setCurrentBranchName(branch.name);
          } else {
            console.warn('🔍 ClientsPage: Branch not found for ID:', activeBranchId);
            // Map known branch IDs to names
            const branchNameMap: { [key: string]: string } = {
              'AS5mYsGNnvA4cxLIPL3W': 'Evo Road',
              'stadium-31': '31 Stadium Rd.',
              'garden-city': 'Garden City',
              'evergreen': 'Evergreen'
            };
            const fallbackName = branchNameMap[activeBranchId] || 'Unknown Branch';
            console.log('🔍 ClientsPage: Using fallback branch name:', fallbackName);
            setCurrentBranchName(fallbackName);
          }
        } catch (error) {
          console.error("🔍 ClientsPage: Error fetching branch name:", error);
          setCurrentBranchName('Unknown Branch');
        }
      } else {
        console.log('🔍 ClientsPage: No activeBranchId, clearing branch name');
        setCurrentBranchName('');
      }
    };
    
    fetchBranchName();
  }, [activeBranchId]);

  // Auto-sync booking clients on page load
  useEffect(() => {
    const autoSync = async () => {
      if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'branch-admin')) {
        try {
          console.log('🔄 Auto-syncing booking clients...');
          const result = await syncBookingClientsWithUsers(activeBranchId);
          console.log('✅ Auto-sync completed:', result);
          
          if (result.created > 0 || result.updated > 0) {
            // Refresh user data after auto-sync
            setRefreshKey(prev => prev + 1);
          }
        } catch (error) {
          console.error('❌ Auto-sync failed:', error);
        }
      }
    };
    
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(autoSync, 2000);
    return () => clearTimeout(timer);
  }, [currentUser, activeBranchId]);

  // Fetch booking client stats
  useEffect(() => {
    const fetchBookingStats = async () => {
      if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'branch-admin')) {
        try {
          console.log('📊 Fetching booking client stats for branch:', activeBranchId);
          const stats = await getBookingClientStats(activeBranchId);
          setBookingClientStats(stats);
          console.log('📊 Booking client stats:', stats);
        } catch (error) {
          console.error('❌ Error fetching booking client stats:', error);
        }
      }
    };
    
    fetchBookingStats();
  }, [currentUser, activeBranchId]);
  
  // Fetch real client data from Firestore
  const { mergedUsers, loading, error } = useAuthUsers(activeBranchId, refreshKey);

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm) return mergedUsers;
    
    const searchLower = searchTerm.toLowerCase();
    return mergedUsers.filter(client => 
      (client.displayName && client.displayName.toLowerCase().includes(searchLower)) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.phoneNumber && client.phoneNumber.toLowerCase().includes(searchLower)) ||
      (client.id && client.id.toLowerCase().includes(searchLower)) ||
      (client.uid && client.uid.toLowerCase().includes(searchLower))
    );
  }, [mergedUsers, searchTerm]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString();
  };

  const copyUserId = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedId(userId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy user ID:', err);
    }
  };

  const syncBookingClients = async () => {
    try {
      setIsSyncing(true);
      setSyncStats(null);
      
      console.log('🔄 Starting booking client sync for branch:', activeBranchId);
      const result = await syncBookingClientsWithUsers(activeBranchId);
      setSyncStats(result);
      
      // Refresh the user data after sync
      setRefreshKey(prev => prev + 1);
      
      console.log('✅ Booking client sync completed:', result);
    } catch (error) {
      console.error('❌ Error syncing booking clients:', error);
      setSyncStats({ created: 0, updated: 0, errors: [`Sync failed: ${error}`] });
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
        <span className="ml-2 text-white">Loading clients...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error loading clients: {error.message}</p>
        <p className="text-white/70 text-sm mt-2">Please check your connection and permissions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Client Management</h2>
          {currentBranchName && (
            <div className="flex items-center text-sm text-white/70 mb-1">
              <span className="text-yellow-400 font-medium">{currentBranchName}</span>
            </div>
          )}
          <p className="text-sm text-white/70">
            {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} found
            {mergedUsers.length !== filteredClients.length && ` (of ${mergedUsers.length} total)`}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={syncBookingClients}
            className="bg-green-400/20 text-green-400 border-green-400/30 hover:bg-green-400/30 hover:text-green-300"
            disabled={isSyncing || loading}
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Users className="mr-2 h-4 w-4" />
            )}
            Sync Booking Clients
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="bg-white/5 border-white/20 text-white hover:bg-yellow-400/10 hover:text-yellow-300 hover:border-yellow-400/30"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Users className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button className="bg-yellow-400 text-[hsl(var(--royal-blue-dark))] border-yellow-400 hover:bg-yellow-300">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Sync Status */}
      {syncStats && (
        <Card className="bg-green-400/10 backdrop-blur-md border-green-400/30 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-400">Sync Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-white/70">Created:</span>
                <span className="text-green-400 ml-2 font-bold">{syncStats.created}</span>
              </div>
              <div>
                <span className="text-white/70">Updated:</span>
                <span className="text-yellow-400 ml-2 font-bold">{syncStats.updated}</span>
              </div>
              <div>
                <span className="text-white/70">Errors:</span>
                <span className="text-red-400 ml-2 font-bold">{syncStats.errors.length}</span>
              </div>
            </div>
            {syncStats.errors.length > 0 && (
              <div className="mt-4">
                <span className="text-white/70 text-sm">Errors:</span>
                <div className="mt-2 space-y-1">
                  {syncStats.errors.map((error, index) => (
                    <div key={index} className="text-red-400 text-xs bg-red-400/10 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Debug Information */}
      {currentUser && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-yellow-400">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-white/70">Current User:</span>
                <span className="text-white ml-2 font-mono text-xs">{currentUser.email || 'No email'}</span>
              </div>
              <div>
                <span className="text-white/70">Role:</span>
                <span className="text-white ml-2">{currentUser.role || 'No role'}</span>
              </div>
              <div>
                <span className="text-white/70">Branch:</span>
                <span className="text-white ml-2">{activeBranchId || 'All branches'}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-white/70">Loading:</span>
                <span className="text-white ml-2">{loading ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-white/70">Error:</span>
                <span className="text-white ml-2">{error ? error.message : 'None'}</span>
              </div>
              <div>
                <span className="text-white/70">Users Found:</span>
                <span className="text-white ml-2">{mergedUsers.length}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/70">Branch Filter:</span>
                <span className="text-white ml-2">{activeBranchId || 'All branches'}</span>
              </div>
              <div>
                <span className="text-white/70">Search Term:</span>
                <span className="text-white ml-2">{searchTerm || 'None'}</span>
              </div>
            </div>
            {mergedUsers.length > 0 && (
              <div className="mt-4">
                <span className="text-white/70">Sample User IDs:</span>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mergedUsers.slice(0, 3).map((user, index) => (
                    <div key={user.id} className="text-white text-xs font-mono bg-white/10 p-2 rounded">
                      {index + 1}. {user.id || user.uid || 'No ID'}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-white/50">
                  Showing first 3 of {mergedUsers.length} users
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Total Registered Clients</CardTitle>
            <Users className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{mergedUsers.length}</div>
            <p className="text-xs text-white/70">Clients registered in the system</p>
            {bookingClientStats && (
              <p className="text-xs text-green-400 mt-1">
                {bookingClientStats.totalClients} from bookings
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Active Clients</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-yellow-400"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="m22 21-3-3m0 0-3-3m3 3h-6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {mergedUsers.filter(c => c.lastSignInAt).length}
            </div>
            <p className="text-xs text-white/70">Clients with recent activity</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Verified Emails</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-yellow-400"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {mergedUsers.filter(c => c.emailVerified).length}
            </div>
            <p className="text-xs text-white/70">Email verified clients</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">With Phone Numbers</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-yellow-400"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {mergedUsers.filter(c => c.phoneNumber).length}
            </div>
            <p className="text-xs text-white/70">Clients with phone numbers</p>
          </CardContent>
        </Card>
        
        {bookingClientStats && (
          <Card className="bg-green-400/10 backdrop-blur-md border-green-400/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Booking Clients</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-green-400"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {bookingClientStats.uniqueEmails}
              </div>
              <p className="text-xs text-white/70">Unique clients from bookings</p>
              <p className="text-xs text-green-400 mt-1">
                {bookingClientStats.recentClients} this month
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search and Table */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <CardTitle className="text-lg text-yellow-400">All Clients</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-yellow-400" />
              <Input
                type="search"
                placeholder="Search clients..."
                className="w-full pl-8 sm:w-[250px] bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-yellow-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/20">
                <TableHead className="text-yellow-400">User ID</TableHead>
                <TableHead className="text-yellow-400">Name</TableHead>
                <TableHead className="text-yellow-400">Contact</TableHead>
                <TableHead className="text-yellow-400">Member Since</TableHead>
                <TableHead className="text-yellow-400">Last Active</TableHead>
                <TableHead className="text-yellow-400">Total Bookings</TableHead>
                <TableHead className="text-yellow-400">Role</TableHead>
                <TableHead className="text-right text-yellow-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow className="border-white/20">
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <Users className="h-8 w-8 text-yellow-400" />
                      <p className="text-white/70">
                        {searchTerm ? 'No clients match your search' : 'No clients found'}
                      </p>
                      {!searchTerm && (
                        <p className="text-xs text-white/50">
                          Client data will appear here once users register in the system
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-white/20 hover:bg-white/5">
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-white/70 truncate max-w-24" title={client.id || client.uid || ''}>
                          {(client.id || client.uid || 'No ID').substring(0, 8)}...
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                          onClick={() => copyUserId(client.id || client.uid || '')}
                        >
                          {copiedId === (client.id || client.uid) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-white">
                          {client.displayName || client.name || 'No name provided'}
                        </span>
                        {client.role === 'admin' && (
                          <Badge variant="outline" className="mt-1 w-fit bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-white/70">
                            {client.email || 'No email provided'}
                          </span>
                          {client.emailVerified && (
                            <Badge variant="secondary" className="ml-2 text-xs bg-green-500/20 text-green-400 border-green-400/30">
                              Verified
                            </Badge>
                          )}
                        </div>
                        {client.phoneNumber && (
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-white/70">{client.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-white/70">
                          {formatDate(client.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-white/70">
                          {client.lastSignInAt ? formatDate(client.lastSignInAt) : 'Never'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-[hsl(var(--royal-blue)/0.2)] text-[hsl(var(--royal-blue))] border-[hsl(var(--royal-blue)/0.3)]">
                        {client.bookingIds?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-white/70 border-white/30">
                        {client.role || 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-white hover:bg-yellow-400 hover:text-[hsl(var(--royal-blue-dark))]"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsPage;