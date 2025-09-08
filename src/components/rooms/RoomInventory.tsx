import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Room, RoomStatus, RoomType, RoomInventoryStats } from '@/types/room';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export function RoomInventory() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<RoomInventoryStats | null>(null);
  const [activeTab, setActiveTab] = useState<RoomStatus | 'all'>('all');
  const { toast } = useToast();

  // Fetch rooms from Firestore
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const roomsRef = collection(db, 'rooms');
        const q = query(roomsRef, orderBy('floor', 'asc'), orderBy('roomNumber', 'asc'));
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const roomsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to strings if needed
            lastCleaned: doc.data().lastCleaned?.toDate().toISOString(),
            nextMaintenance: doc.data().nextMaintenance?.toDate().toISOString(),
            createdAt: doc.data().createdAt?.toDate().toISOString(),
            updatedAt: doc.data().updatedAt?.toDate().toISOString(),
          })) as Room[];
          
          setRooms(roomsData);
          updateStats(roomsData);
          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast({
          title: 'Error',
          description: 'Failed to load room data',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Calculate statistics
  const updateStats = (roomsData: Room[]) => {
    const stats: RoomInventoryStats = {
      totalRooms: roomsData.length,
      available: 0,
      occupied: 0,
      maintenance: 0,
      cleaning: 0,
      reserved: 0,
      occupancyRate: 0,
      byType: {
        standard: { total: 0, available: 0, occupied: 0 },
        deluxe: { total: 0, available: 0, occupied: 0 },
        suite: { total: 0, available: 0, occupied: 0 },
        family: { total: 0, available: 0, occupied: 0 },
        executive: { total: 0, available: 0, occupied: 0 },
      },
      byFloor: {},
    };

    roomsData.forEach(room => {
      // Count by status
      if (room.status === 'available') stats.available++;
      if (room.status === 'occupied') stats.occupied++;
      if (room.status === 'maintenance') stats.maintenance++;
      if (room.status === 'cleaning') stats.cleaning++;
      if (room.status === 'reserved') stats.reserved++;

      // Count by type
      if (room.type in stats.byType) {
        stats.byType[room.type].total++;
        if (room.status === 'available') stats.byType[room.type].available++;
        if (room.status === 'occupied') stats.byType[room.type].occupied++;
      }

      // Count by floor
      if (!stats.byFloor[room.floor]) {
        stats.byFloor[room.floor] = { total: 0, available: 0, occupied: 0 };
      }
      stats.byFloor[room.floor].total++;
      if (room.status === 'available') stats.byFloor[room.floor].available++;
      if (room.status === 'occupied') stats.byFloor[room.floor].occupied++;
    });

    // Calculate occupancy rate
    stats.occupancyRate = Math.round((stats.occupied / stats.totalRooms) * 100);
    setStats(stats);
  };

  // Filter rooms based on active tab
  const filteredRooms = activeTab === 'all' 
    ? rooms 
    : rooms.filter(room => room.status === activeTab);

  // Get status badge color
  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Available</Badge>;
      case 'occupied':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Occupied</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Maintenance</Badge>;
      case 'cleaning':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Cleaning</Badge>;
      case 'reserved':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Reserved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get room type display name
  const getRoomTypeName = (type: RoomType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
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
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRooms || 0}</div>
            <p className="text-xs text-muted-foreground">Total rooms in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
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
              <path d="M5 22h14" />
              <path d="M5 2h14" />
              <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
              <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.available || 0}</div>
            <p className="text-xs text-muted-foreground">Rooms available now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
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
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.occupied || 0}</div>
            <p className="text-xs text-muted-foreground">Rooms currently occupied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
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
            <div className="text-2xl font-bold">{stats?.occupancyRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Current occupancy rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Room List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Room Inventory</CardTitle>
              <CardDescription>
                Manage and monitor all rooms in the hotel
              </CardDescription>
            </div>
            <div className="mt-4 md:mt-0
            ">
              <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as RoomStatus | 'all')}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="available">Available</TabsTrigger>
                  <TabsTrigger value="occupied">Occupied</TabsTrigger>
                  <TabsTrigger value="reserved">Reserved</TabsTrigger>
                  <TabsTrigger value="cleaning">Cleaning</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border
          ">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Cleaned</TableHead>
                  <TableHead>Next Maintenance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.roomNumber}</TableCell>
                      <TableCell>{getRoomTypeName(room.type)}</TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell>{getStatusBadge(room.status)}</TableCell>
                      <TableCell>
                        {room.lastCleaned ? format(new Date(room.lastCleaned), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {room.nextMaintenance ? format(new Date(room.nextMaintenance), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No rooms found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
