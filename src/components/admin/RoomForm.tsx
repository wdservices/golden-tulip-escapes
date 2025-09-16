import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { toast } from "sonner";

interface RoomFormProps {
  branchId: string;
  room?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type RoomType = 'standard' | 'deluxe' | 'suite' | 'family' | 'executive';
type BedType = 'single' | 'double' | 'queen' | 'king' | 'twin' | 'double-double';
type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

export const RoomForm = ({ branchId, room, onSuccess, onCancel }: RoomFormProps) => {
  const { addDocument, updateDocument } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: room?.name || '',
    type: (room?.type as RoomType) || 'standard',
    description: room?.description || '',
    price: room?.price || '',
    capacity: room?.capacity || 2,
    size: room?.size || '',
    view: room?.view || '',
    bedType: (room?.bedType as BedType) || 'double',
    amenities: room?.amenities || [],
    status: (room?.status as RoomStatus) || 'available',
  });

  const roomTypes = [
    { value: 'standard', label: 'Standard' },
    { value: 'deluxe', label: 'Deluxe' },
    { value: 'suite', label: 'Suite' },
    { value: 'family', label: 'Family' },
    { value: 'executive', label: 'Executive' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const roomData = {
        ...formData,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        updatedAt: new Date().toISOString(),
      };

      if (room) {
        await updateDocument(`branches/${branchId}/rooms`, room.id, roomData);
        toast.success('Room updated successfully');
      } else {
        roomData.createdAt = new Date().toISOString();
        await addDocument(`branches/${branchId}/rooms`, roomData);
        toast.success('Room added successfully');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error('Failed to save room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Room Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Room Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value: RoomType) => setFormData({...formData, type: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              {roomTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price per Night (₦) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 1})}
            required
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Room Size (sqm)</Label>
          <Input
            id="size"
            type="number"
            value={formData.size}
            onChange={(e) => setFormData({...formData, size: e.target.value})}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="view">View</Label>
          <Input
            id="view"
            value={formData.view}
            onChange={(e) => setFormData({...formData, view: e.target.value})}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {room ? 'Update Room' : 'Add Room'}
        </Button>
      </div>
    </form>
  );
};
