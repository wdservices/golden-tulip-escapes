import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Edit, Trash2, AlertCircle, Building } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useBranches } from "@/hooks/useBranches";
import { toast } from "sonner";
import { RoomForm } from "@/components/admin/RoomForm";
import { useAuth } from "@/contexts/AuthContext";
import { getBranches } from "@/services/branchService";


type RoomStatus = 'available' | 'occupied' | 'maintenance';

interface Room {
  id?: string;
  roomNumber: string;
  type: string;
  pricePerNight: number;
  availability: boolean;
  amenities: string[];
  images: string[];
  roomCount?: number; // Number of rooms of this type
  createdAt?: string;
  updatedAt?: string;
}

export const RoomsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  
  const { queryDocuments, deleteDocument } = useDatabase();
  const { branches, isLoading: branchesLoading, error: branchesError } = useBranches();
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

  // Auto-select first branch when branches are loaded
  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedBranchId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const roomsData = await queryDocuments<Room>(`branches/${selectedBranchId}/rooms`, []);
        setRooms(roomsData);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast.error("Failed to load rooms");
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [selectedBranchId, queryDocuments]);

  const handleAddRoom = () => {
    setIsAddRoomDialogOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsEditRoomDialogOpen(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await deleteDocument(`branches/${selectedBranchId}/rooms`, roomId);
        
        // Refresh rooms list
        const updatedRooms = await queryDocuments<Room>(`branches/${selectedBranchId}/rooms`, []);
        setRooms(updatedRooms);
        
        toast.success("Room deleted successfully");
      } catch (error) {
        console.error('Error deleting room:', error);
        toast.error("Failed to delete room");
      }
    }
  };

  const handleRoomSuccess = async () => {
    setIsAddRoomDialogOpen(false);
    setIsEditRoomDialogOpen(false);
    setSelectedRoom(null);
    
    // Refresh rooms list
    const updatedRooms = await queryDocuments<Room>(`branches/${selectedBranchId}/rooms`, []);
    setRooms(updatedRooms);
  };

  const filteredRooms = rooms.filter(room => 
    room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {currentBranchName ? `${currentBranchName} - Rooms Management` : "Rooms Management"}
          </h2>
          {currentBranchName && (
            <div className="flex items-center text-muted-foreground mb-2">
              <Building className="h-4 w-4 mr-2" />
              <span>{currentBranchName}</span>
            </div>
          )}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="branch-select" className="text-sm font-medium">
                Branch:
              </label>
              <Select
                value={selectedBranchId}
                onValueChange={setSelectedBranchId}
                disabled={branchesLoading || !branches || branches.length === 0}
              >
                <SelectTrigger id="branch-select" className="w-[200px]">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {branchesError && (
              <div className="flex items-center text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                Error loading branches
              </div>
            )}
          </div>
        </div>
        <Button onClick={handleAddRoom} disabled={!selectedBranchId}>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <CardTitle className="text-lg">All Rooms</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search rooms..."
                  className="w-full pl-8 sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {branchesLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Loading branches...</p>
            </div>
          ) : !branches || branches.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                <p className="text-muted-foreground">No branches found.</p>
              </div>
              <p className="text-sm text-muted-foreground">You need to create a branch first before adding rooms.</p>
            </div>
          ) : !selectedBranchId ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Please select a branch to view rooms.</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Loading rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No rooms found for this branch. Add a room to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price/Night</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Room Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => {
                  return (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.roomNumber}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>₦{room.pricePerNight}</TableCell>
                      <TableCell>
                        <Badge className={room.availability ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                          {room.availability ? "Available" : "Not Available"}
                        </Badge>
                      </TableCell>
                      <TableCell>{room.roomCount || 1}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="mr-2" onClick={() => handleEditRoom(room)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRoom(room.id!)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Room Dialog */}
      <Dialog open={isAddRoomDialogOpen} onOpenChange={setIsAddRoomDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Add a new room to the selected branch.
            </DialogDescription>
          </DialogHeader>
          <RoomForm 
            onSuccess={handleRoomSuccess}
            onCancel={() => setIsAddRoomDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={isEditRoomDialogOpen} onOpenChange={setIsEditRoomDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update room details.
            </DialogDescription>
          </DialogHeader>
          {selectedRoom && (
            <RoomForm 
              branchId={selectedBranchId} 
              room={selectedRoom}
              onSuccess={handleRoomSuccess}
              onCancel={() => setIsEditRoomDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomsPage;
