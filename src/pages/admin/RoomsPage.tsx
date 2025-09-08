import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RoomInventory } from "@/components/rooms/RoomInventory";
import { AddRoomForm } from "@/components/rooms/AddRoomForm";
import { Plus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function RoomsPage() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  const handleAddRoom = () => {
    setIsAddRoomOpen(true);
  };

  const handleAddRoomSuccess = () => {
    setIsAddRoomOpen(false);
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Success",
      description: "Room has been added successfully.",
    });
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Room Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all rooms in the hotel
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
          <Button onClick={handleAddRoom}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>
      </div>
      
      {/* Room Inventory Component */}
      <div key={refreshKey}>
        <RoomInventory />
      </div>

      {/* Add Room Dialog */}
      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Room</DialogTitle>
          </DialogHeader>
          <AddRoomForm 
            onSuccess={handleAddRoomSuccess}
            onCancel={() => setIsAddRoomOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
