import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Building2, 
  Bed, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Megaphone,
  BarChart3,
  Settings,
  Bell,
  Search,
  Filter,
  Download
} from "lucide-react";

// Mock Data
const mockUsers = [
  { id: 1, name: "John Doe", email: "john@email.com", phone: "+234 801 234 5678", totalBookings: 3, status: "active", joinDate: "2024-01-15" },
  { id: 2, name: "Jane Smith", email: "jane@email.com", phone: "+234 802 345 6789", totalBookings: 1, status: "active", joinDate: "2024-02-20" },
  { id: 3, name: "Mike Johnson", email: "mike@email.com", phone: "+234 803 456 7890", totalBookings: 5, status: "inactive", joinDate: "2023-12-10" },
];

const mockBookings = [
  { 
    id: "BK001", 
    guest: "John Doe", 
    branch: "GRA Head Branch", 
    room: "Executive Suite", 
    checkIn: "2024-12-28", 
    checkOut: "2024-12-30", 
    status: "confirmed", 
    amount: 190000,
    guests: 2
  },
  { 
    id: "BK002", 
    guest: "Jane Smith", 
    branch: "Waterlines Branch", 
    room: "Deluxe Room", 
    checkIn: "2024-12-29", 
    checkOut: "2024-12-31", 
    status: "pending", 
    amount: 130000,
    guests: 1
  },
  { 
    id: "BK003", 
    guest: "Mike Johnson", 
    branch: "GRA Head Branch", 
    room: "Presidential Suite", 
    checkIn: "2024-12-25", 
    checkOut: "2024-12-28", 
    status: "completed", 
    amount: 450000,
    guests: 4
  },
];

const mockRooms = [
  { id: 1, name: "Standard Room", branch: "GRA Head Branch", price: 45000, total: 20, available: 15, occupied: 5, status: "active" },
  { id: 2, name: "Deluxe Room", branch: "GRA Head Branch", price: 65000, total: 15, available: 12, occupied: 3, status: "active" },
  { id: 3, name: "Executive Suite", branch: "Waterlines Branch", price: 95000, total: 10, available: 8, occupied: 2, status: "active" },
  { id: 4, name: "Presidential Suite", branch: "GRA Head Branch", price: 150000, total: 5, available: 4, occupied: 1, status: "maintenance" },
];

const mockAds = [
  { id: 1, title: "Christmas Special", discount: "25%", validUntil: "2024-12-31", status: "active", description: "Special holiday discount for all rooms" },
  { id: 2, title: "New Year Package", discount: "30%", validUntil: "2025-01-05", status: "active", description: "Celebrate New Year with us" },
  { id: 3, title: "Weekend Getaway", discount: "15%", validUntil: "2024-12-30", status: "expired", description: "Perfect weekend escape" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [newAd, setNewAd] = useState({
    title: "",
    discount: "",
    validUntil: "",
    description: ""
  });

  const stats = {
    totalUsers: mockUsers.length,
    totalBookings: mockBookings.length,
    totalRevenue: mockBookings.reduce((sum, booking) => sum + booking.amount, 0),
    occupancyRate: Math.round((mockRooms.reduce((sum, room) => sum + room.occupied, 0) / mockRooms.reduce((sum, room) => sum + room.total, 0)) * 100)
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      active: "default",
      confirmed: "default",
      pending: "secondary", 
      completed: "outline",
      inactive: "destructive",
      expired: "destructive",
      maintenance: "secondary"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const handleCreateAd = () => {
    if (newAd.title && newAd.discount && newAd.validUntil) {
      // In real app, this would call an API
      console.log("Creating ad:", newAd);
      setNewAd({ title: "", discount: "", validUntil: "", description: "" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-gradient-gold">Golden Tulip Admin</h1>
              <p className="text-sm text-muted-foreground">Hotel Management Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center space-x-2">
              <Bed className="h-4 w-4" />
              <span className="hidden sm:inline">Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="branches" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Branches</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center space-x-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Ads</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="admin-stat-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient-gold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="admin-stat-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient-gold">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card className="admin-stat-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient-gold">₦{stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+25% from last month</p>
                </CardContent>
              </Card>

              <Card className="admin-stat-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient-gold">{stats.occupancyRate}%</div>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <div>
                          <p className="font-medium">{booking.guest}</p>
                          <p className="text-sm text-muted-foreground">{booking.room} - {booking.branch}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₦{booking.amount.toLocaleString()}</p>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card">
                <CardHeader>
                  <CardTitle>Room Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRooms.slice(0, 4).map((room) => (
                      <div key={room.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <div>
                          <p className="font-medium">{room.name}</p>
                          <p className="text-sm text-muted-foreground">{room.branch}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Available: <span className="font-semibold text-primary">{room.available}/{room.total}</span></p>
                          {getStatusBadge(room.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search bookings..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <Card className="admin-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>{booking.guest}</TableCell>
                        <TableCell>{booking.branch}</TableCell>
                        <TableCell>{booking.room}</TableCell>
                        <TableCell>{booking.checkIn}</TableCell>
                        <TableCell>{booking.checkOut}</TableCell>
                        <TableCell>₦{booking.amount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Room Management</h2>
              <Button className="btn-luxury">
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>

            <Card className="admin-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Price/Night</TableHead>
                      <TableHead>Total Rooms</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Occupied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.name}</TableCell>
                        <TableCell>{room.branch}</TableCell>
                        <TableCell>₦{room.price.toLocaleString()}</TableCell>
                        <TableCell>{room.total}</TableCell>
                        <TableCell className="text-primary font-semibold">{room.available}</TableCell>
                        <TableCell>{room.occupied}</TableCell>
                        <TableCell>{getStatusBadge(room.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">User Management</h2>
              <div className="flex space-x-2">
                <Input placeholder="Search users..." className="w-64" />
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <Card className="admin-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Total Bookings</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.totalBookings}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="admin-card">
                  <CardHeader>
                    <CardTitle>Active Promotions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAds.map((ad) => (
                        <div key={ad.id} className="p-4 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{ad.title}</h3>
                            {getStatusBadge(ad.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{ad.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-primary font-semibold">{ad.discount} OFF</span>
                            <span className="text-muted-foreground">Valid until: {ad.validUntil}</span>
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="admin-card">
                  <CardHeader>
                    <CardTitle>Create New Promotion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Promotion Title</Label>
                      <Input
                        value={newAd.title}
                        onChange={(e) => setNewAd(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Summer Special"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount Percentage</Label>
                      <Input
                        value={newAd.discount}
                        onChange={(e) => setNewAd(prev => ({ ...prev, discount: e.target.value }))}
                        placeholder="e.g., 25%"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valid Until</Label>
                      <Input
                        type="date"
                        value={newAd.validUntil}
                        onChange={(e) => setNewAd(prev => ({ ...prev, validUntil: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newAd.description}
                        onChange={(e) => setNewAd(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Promotion description..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleCreateAd} className="btn-luxury w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Promotion
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Branch Management</h2>
              <Button className="btn-luxury">
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "GRA Head Branch", location: "Government Reserved Area", rooms: 50, occupancy: 85, status: "active" },
                { name: "Waterlines Branch", location: "Port Harcourt Waterfront", rooms: 35, occupancy: 72, status: "active" },
                { name: "Airforce Base", location: "Port Harcourt", rooms: 30, occupancy: 90, status: "active" },
                { name: "Oyigbo Branch", location: "Rivers State", rooms: 25, occupancy: 65, status: "active" }
              ].map((branch, index) => (
                <Card key={index} className="admin-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{branch.name}</CardTitle>
                      {getStatusBadge(branch.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{branch.location}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Rooms</p>
                        <p className="text-xl font-semibold text-primary">{branch.rooms}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Occupancy</p>
                        <p className="text-xl font-semibold text-primary">{branch.occupancy}%</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;