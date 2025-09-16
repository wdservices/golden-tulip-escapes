import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MapPin, Phone, Mail, Globe, Building, Edit, Trash2, Loader2, Home, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDatabase } from "@/contexts/DatabaseContext";
import { toast } from "sonner";
import { BranchForm } from "@/components/admin/BranchForm";
import { RoomForm } from "@/components/admin/RoomForm";

export type BranchStatus = 'active' | 'inactive' | 'maintenance';

export interface Branch {
  id?: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  status: BranchStatus;
  description: string;
  amenities: string[];
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    pets: string;
    payment: string;
  };
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Room {
  id?: string;
  roomNumber: string;
  type: string;
  price: number;
  capacity: number;
  size: number;
  bedType: string;
  view: string;
  description: string;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance';
  images: string[];
  branchId: string;
  createdAt?: string;
  updatedAt?: string;
}

export const BranchesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const [branchRooms, setBranchRooms] = useState<Room[]>([]);
  
  const { queryDocuments, addDocument, updateDocument, deleteDocument } = useDatabase();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoading(true);
        const branchesData = await queryDocuments<Branch>('branches', []);
        setBranches(branchesData);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('Failed to load branches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const getStatusVariant = (status: BranchStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewBranch = async (branch: Branch) => {
    setSelectedBranch(branch);
    try {
      setIsLoading(true);
      // Fetch rooms for this branch
      const rooms = await queryDocuments<Room>(`branches/${branch.id}/rooms`, []);
      setBranchRooms(rooms);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load room information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditDialogOpen(true);
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        // First delete all rooms in this branch
        const rooms = await queryDocuments<Room>(`branches/${branchId}/rooms`, []);
        await Promise.all(rooms.map(room => 
          deleteDocument(`branches/${branchId}/rooms`, room.id!)
        ));
        
        // Then delete the branch
        await deleteDocument('branches', branchId);
        
        // Refresh branches list
        const updatedBranches = await queryDocuments<Branch>('branches', []);
        setBranches(updatedBranches);
        
        toast.success('Branch and associated rooms deleted successfully');
      } catch (error) {
        console.error('Error deleting branch:', error);
        toast.error('Failed to delete branch');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddRoom = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsAddRoomDialogOpen(true);
  };

  const handleRoomAdded = async () => {
    if (selectedBranch) {
      const rooms = await queryDocuments<Room>(`branches/${selectedBranch.id}/rooms`, []);
      setBranchRooms(rooms);
    }
    setIsAddRoomDialogOpen(false);
  };

  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.location.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branches</h1>
          <p className="text-sm text-muted-foreground">Manage your hotel branches and their details</p>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search branches..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Branch</DialogTitle>
                <DialogDescription>
                  Add a new hotel branch to the system. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <BranchForm onSuccess={() => {
                // Refresh branches list
                queryDocuments<Branch>('branches', []).then(updatedBranches => {
                  setBranches(updatedBranches);
                });
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading branches...</span>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No branches found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm ? 'Try a different search term' : 'Get started by adding a new branch'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rooms</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map((branch) => (
                <TableRow key={branch.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewBranch(branch)}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Building className="h-5 w-5 mr-2 text-primary" />
                      <div>
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-sm text-muted-foreground">{branch.contact.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{branch.location.city}, {branch.location.country}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{branch.location.address}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{branch.contact.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{branch.contact.email}</span>
                      </div>
                      {branch.contact.website && (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a 
                            href={branch.contact.website.startsWith('http') ? branch.contact.website : `https://${branch.contact.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {branch.contact.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {branch.amenities?.length || 0} amenities
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusVariant(branch.status)}>
                      {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBranch(branch);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBranch(branch.id!);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* View/Edit Branch Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBranch && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedBranch.name}</DialogTitle>
                <DialogDescription>
                  {selectedBranch.location.city}, {selectedBranch.location.country}
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="rooms">Rooms</TabsTrigger>
                  <TabsTrigger value="policies">Policies</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Contact Information</h3>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{selectedBranch.location.address}, {selectedBranch.location.city}, {selectedBranch.location.country}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{selectedBranch.contact.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{selectedBranch.contact.email}</span>
                          </div>
                          {selectedBranch.contact.website && (
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                              <a 
                                href={selectedBranch.contact.website.startsWith('http') ? selectedBranch.contact.website : `https://${selectedBranch.contact.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {selectedBranch.contact.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Description</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedBranch.description || 'No description provided.'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Amenities</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedBranch.amenities?.length > 0 ? (
                            selectedBranch.amenities.map((amenity, index) => (
                              <Badge key={index} variant="outline">
                                {amenity}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No amenities listed.</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Check-in/Check-out</h3>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Check-in: {selectedBranch.policies.checkIn}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Check-out: {selectedBranch.policies.checkOut}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Cancellation Policy</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedBranch.policies.cancellation}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Pet Policy</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedBranch.policies.pets}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Payment Policy</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedBranch.policies.payment}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="rooms" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Rooms</h3>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handleAddRoom(selectedBranch);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Room
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : branchRooms.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg">
                      <p className="text-muted-foreground">No rooms added yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          setIsViewDialogOpen(false);
                          handleAddRoom(selectedBranch);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Room
                      </Button>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Room Number</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {branchRooms.map((room) => (
                            <TableRow key={room.id}>
                              <TableCell className="font-medium">{room.roomNumber}</TableCell>
                              <TableCell>{room.type}</TableCell>
                              <TableCell>${room.price.toLocaleString()}</TableCell>
                              <TableCell>{room.capacity} {room.capacity > 1 ? 'guests' : 'guest'}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={room.status === 'available' ? 'default' : 'secondary'}
                                  className={room.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                                >
                                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-500 hover:text-red-600"
                                    onClick={async () => {
                                      if (confirm('Are you sure you want to delete this room?')) {
                                        try {
                                          await deleteDocument(`branches/${selectedBranch.id}/rooms`, room.id!);
                                          const updatedRooms = await queryDocuments<Room>(`branches/${selectedBranch.id}/rooms`, []);
                                          setBranchRooms(updatedRooms);
                                          toast.success('Room deleted successfully');
                                        } catch (error) {
                                          console.error('Error deleting room:', error);
                                          toast.error('Failed to delete room');
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="policies" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Policies</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="font-medium">Check-in/Check-out</h4>
                        <div className="mt-2 text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>Check-in: {selectedBranch.policies.checkIn}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>Check-out: {selectedBranch.policies.checkOut}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Cancellation Policy</h4>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedBranch.policies.cancellation}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Pet Policy</h4>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedBranch.policies.pets}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Payment Policy</h4>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedBranch.policies.payment}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                >
                  Edit Branch
                </Button>
                <Button onClick={() => setIsViewDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Branch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>
              Update the branch details below.
            </DialogDescription>
          </DialogHeader>
          {selectedBranch && (
            <BranchForm 
              branch={selectedBranch} 
              onSuccess={() => {
                // Refresh branches list
                queryDocuments<Branch>('branches', []).then(updatedBranches => {
                  setBranches(updatedBranches);
                  setIsEditDialogOpen(false);
                  
                  // If we were viewing this branch, update the selected branch data
                  if (selectedBranch) {
                    const updatedBranch = updatedBranches.find(b => b.id === selectedBranch.id);
                    if (updatedBranch) {
                      setSelectedBranch(updatedBranch);
                    }
                  }
                });
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Room Dialog */}
      <Dialog open={isAddRoomDialogOpen} onOpenChange={setIsAddRoomDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Add a new room to {selectedBranch?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedBranch && (
            <RoomForm 
              branchId={selectedBranch.id!} 
              onSuccess={() => {
                handleRoomAdded();
                // Reopen the view dialog if it was open
                if (isViewDialogOpen) {
                  setIsAddRoomDialogOpen(false);
                  setIsViewDialogOpen(true);
                }
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchesPage;
