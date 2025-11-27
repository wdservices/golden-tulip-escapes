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
          <h2 className="text-2xl font-bold tracking-tight text-yellow-400">
            {currentBranchName ? `${currentBranchName} - Rooms Management` : "Rooms Management"}
          </h2>
          {currentBranchName && (
            <div className="flex items-center text-white/70 mb-2">
              <Building className="h-4 w-4 mr-2" />
              <span>{currentBranchName}</span>
            </div>
          )}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="branch-select" className="text-sm font-medium text-white">
                Branch:
              </label>
              <Select
                value={selectedBranchId}
                onValueChange={setSelectedBranchId}
                disabled={branchesLoading || !branches || branches.length === 0}
              >
                <SelectTrigger id="branch-select" className="w-[200px] bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id} className="text-white hover:bg-yellow-400/20">
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {branchesError && (
              <div className="flex items-center text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                Error loading branches
              </div>
            )}
          </div>
        </div>
        <Button onClick={handleAddRoom} disabled={!selectedBranchId} className="bg-yellow-400 text-[hsl(var(--royal-blue-dark))] border-yellow-400 hover:bg-yellow-300">
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>
      
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <CardTitle className="text-lg text-yellow-400">All Rooms</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-yellow-400" />
                <Input
                  type="search"
                  placeholder="Search rooms..."
                  className="w-full pl-8 sm:w-[250px] bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-yellow-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-yellow-400 hover:text-[hsl(var(--royal-blue-dark))]">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {branchesLoading ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-white/70">Loading branches...</p>
            </div>
          ) : !branches || branches.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <p className="text-white/70">No branches found.</p>
              </div>
              <p className="text-sm text-white/50">You need to create a branch first before adding rooms.</p>
            </div>
          ) : !selectedBranchId ? (
            <div className="text-center py-8">
              <p className="text-white/70">Please select a branch to view rooms.</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-white/70">Loading rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70">No rooms found for this branch. Add a room to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-yellow-400">Room Number</TableHead>
                  <TableHead className="text-yellow-400">Type</TableHead>
                  <TableHead className="text-yellow-400">Price/Night</TableHead>
                  <TableHead className="text-yellow-400">Availability</TableHead>
                  <TableHead className="text-yellow-400">Room Count</TableHead>
                  <TableHead className="text-right text-yellow-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => {
                  return (
                    <TableRow key={room.id} className="border-white/20 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{room.roomNumber}</TableCell>
                      <TableCell className="text-white/70">{room.type}</TableCell>
                      <TableCell className="text-white/70">₦{room.pricePerNight}</TableCell>
                      <TableCell>
                        <Badge className={room.availability ? "bg-green-500/20 text-green-400 border-green-400/30" : "bg-red-500/20 text-red-400 border-red-400/30"}>
                          {room.availability ? "Available" : "Not Available"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/70">{room.roomCount || 1}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="mr-2 text-white hover:bg-yellow-400 hover:text-[hsl(var(--royal-blue-dark))]" onClick={() => handleEditRoom(room)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-red-400 hover:text-white" onClick={() => handleDeleteRoom(room.id!)}>
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
        <DialogContent className="max-w-3xl bg-white/10 backdrop-blur-md border-white/20">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">Add New Room</DialogTitle>
            <DialogDescription className="text-white/70">
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
        <DialogContent className="max-w-3xl bg-white/10 backdrop-blur-md border-white/20">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">Edit Room</DialogTitle>
            <DialogDescription className="text-white/70">
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
