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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BranchForm } from "@/components/admin/BranchForm";
import { RoomForm } from "@/components/admin/RoomForm";
import { getBranches } from "@/services/branchService";


export type BranchStatus = 'active' | 'inactive' | 'maintenance';

export interface Branch {
  id?: string;
  name: string;
  address: string;
  email: string;
  location: string;
  phone: string;
  status: BranchStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface Room {
  id?: string;
  roomNumber: string;
  type: string;
  pricePerNight: number;
  availability: boolean;
  amenities: string[];
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
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  
  // Get auth context for branch filtering
  const { activeBranchId } = useAuth();
  
  // Fetch current branch name
  useEffect(() => {
    const fetchBranchName = async () => {
      if (activeBranchId) {
        try {
          const branches = await getBranches();
          const branch = branches.find(b => b.id === activeBranchId);
          if (branch) {
            setCurrentBranchName(branch.name);
          }
        } catch (error) {
          console.error("Error fetching branch name:", error);
        }
      }
    };
    
    fetchBranchName();
  }, [activeBranchId]);
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  
  // Get auth context
  const { currentUser, isAuthenticated } = useAuth();
  console.log('BranchesPage - Auth state:', { currentUser, isAuthenticated });
  const [branchRooms, setBranchRooms] = useState<Room[]>([]);
  
  const { queryDocuments, addDocument, updateDocument, deleteDocument } = useDatabase();

  // Fetch branches with performance logging
  const fetchBranches = async () => {
    const startTime = performance.now();
    console.log('Fetching branches...');
    
    try {
      setIsLoading(true);
      const branchesData = await queryDocuments<Branch>('branches', []);
      setBranches(branchesData);
      console.log(`Fetched ${branchesData.length} branches`);
      
      const endTime = performance.now();
      console.log(`Branches fetched in ${Math.round(endTime - startTime)}ms`);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    
    // Add event listener for database updates
    const handleDatabaseUpdate = (event: CustomEvent) => {
      const { collectionPath } = event.detail;
      
      // Only refresh if branches collection was updated
      if (collectionPath === 'branches' || collectionPath.startsWith('branches/')) {
        console.log('Database update detected, refreshing branches data...');
        fetchBranches();
      }
    };
    
    window.addEventListener('database-update', handleDatabaseUpdate as EventListener);
    
    return () => {
      window.removeEventListener('database-update', handleDatabaseUpdate as EventListener);
    };
  }, []);

  const getStatusVariant = (status: BranchStatus | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
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
    console.log(`Viewing branch: ${branch.name} (${branch.id})`);
    setSelectedBranch(branch);
    try {
      setIsLoading(true);
      const startTime = performance.now();
      
      // Fetch rooms for this branch
      console.log(`Fetching rooms for branch ${branch.id}...`);
      const rooms = await queryDocuments<Room>(`branches/${branch.id}/rooms`, []);
      console.log(`Fetched ${rooms.length} rooms for branch ${branch.id}`);
      setBranchRooms(rooms);
      
      const endTime = performance.now();
      console.log(`Branch view data loaded in ${Math.round(endTime - startTime)}ms`);
      
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load room information",
        variant: "destructive"
      });
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
        
        toast({
           title: "Success",
           description: "Branch and associated rooms deleted successfully"
         });
       } catch (error) {
         console.error('Error deleting branch:', error);
         toast({
           title: "Error",
           description: "Failed to delete branch",
           variant: "destructive"
         });
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
      console.log(`Refreshing rooms for branch ${selectedBranch.id}`);
      const startTime = performance.now();
      
      try {
        const rooms = await queryDocuments<Room>(`branches/${selectedBranch.id}/rooms`, []);
        console.log(`Fetched ${rooms.length} rooms for branch ${selectedBranch.id}`);
        setBranchRooms(rooms);
        
        const endTime = performance.now();
        console.log(`Rooms refreshed in ${Math.round(endTime - startTime)}ms`);
        console.log(`Performance: Room refresh operation took ${Math.round(endTime - startTime)}ms`);
      } catch (error) {
         console.error('Error refreshing rooms:', error);
         toast({
           title: "Error",
           description: "Failed to refresh room data",
           variant: "destructive"
         });
       }
     } else {
       console.error('No branch selected when trying to refresh rooms');
       toast({
         title: "Error",
         description: "Could not refresh rooms: No branch selected",
         variant: "destructive"
       });
     }
    setIsAddRoomDialogOpen(false);
  };

  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {currentBranchName && (
              <span className="flex items-center">
                <span className="mr-2">{currentBranchName}</span>
                <span className="mx-2">-</span>
              </span>
            )}
            Branches
          </h1>
          {currentBranchName && (
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Building className="h-4 w-4 mr-1" />
              <span>{currentBranchName}</span>
            </div>
          )}
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Branch</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new branch to your hotel chain.
                </DialogDescription>
              </DialogHeader>
              <BranchForm 
                onSuccess={() => {
                  console.log('Branch form submitted successfully');
                  setIsDialogOpen(false);
                  // Branches will be refreshed via the database-update event listener
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
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
              <TableHead>Address</TableHead>
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
                        <div className="text-sm text-muted-foreground">{branch.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{branch.location}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{branch.address}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{branch.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{branch.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {branch.amenities?.length || 0} amenities
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusVariant(branch.status || 'inactive')}>
                      {branch.status ? branch.status.charAt(0).toUpperCase() + branch.status.slice(1) : 'Inactive'}
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
                <DialogTitle className="text-2xl">{selectedBranch.name}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{selectedBranch.address}, {selectedBranch.location}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Branch Details</TabsTrigger>
                  <TabsTrigger value="rooms">Rooms</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{selectedBranch.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{selectedBranch.phone}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge className={getStatusVariant(selectedBranch.status)}>
                          {selectedBranch.status || 'Inactive'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="rooms" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Rooms ({branchRooms.length})</h3>
                    <Button onClick={() => handleAddRoom(selectedBranch)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Room
                    </Button>
                  </div>
                  
                  {branchRooms.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <Home className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">No rooms added yet</p>
                        <Button variant="outline" className="mt-4" onClick={() => handleAddRoom(selectedBranch)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add your first room
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {branchRooms.map((room) => (
                        <Card key={room.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{room.type}</CardTitle>
                                <CardDescription>Room {room.roomNumber}</CardDescription>
                              </div>
                              <Badge variant="outline" className={
                                room.availability === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }>
                                {room.availability === true ? 'Available' : 'Unavailable'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2 pt-0">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Price:</span>
                              <span className="font-medium">₦{room.pricePerNight}/night</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {room.amenities.slice(0, 3).map((amenity, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {room.amenities.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{room.amenities.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => handleEditBranch(selectedBranch)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Branch
                  </Button>
                  <Button variant="outline" onClick={() => handleAddRoom(selectedBranch)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Room
                  </Button>
                </div>
                <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Branch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>
              Make changes to the branch information below.
            </DialogDescription>
          </DialogHeader>
          {selectedBranch && (
            <BranchForm 
              branch={selectedBranch}
              onSuccess={() => {
                console.log('Branch updated successfully');
                setIsEditDialogOpen(false);
                // Branches will be refreshed via the database-update event listener
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Room Dialog */}
      <Dialog open={isAddRoomDialogOpen} onOpenChange={setIsAddRoomDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Add a new room to {selectedBranch?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedBranch && (
            <RoomForm 
              branchId={selectedBranch.id!}
              onSubmit={async (newRoom) => {
                try {
                  setIsLoading(true);
                  await addDocument(`branches/${selectedBranch.id}/rooms`, newRoom);
                  
                  // Refresh rooms list
                  const updatedRooms = await queryDocuments<Room>(`branches/${selectedBranch.id}/rooms`, []);
                  setBranchRooms(updatedRooms);
                  
                  setIsAddRoomDialogOpen(false);
                   toast({
                     title: "Success",
                     description: "Room added successfully"
                   });
                 } catch (error) {
                   console.error('Error adding room:', error);
                   toast({
                     title: "Error",
                     description: "Failed to add room",
                     variant: "destructive"
                   });
                 } finally {
                  setIsLoading(false);
                }
              }}
              onCancel={() => setIsAddRoomDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchesPage;
