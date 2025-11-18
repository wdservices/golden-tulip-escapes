import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useBranches } from "@/hooks/useBranches";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface RoomFormProps {
  branchId?: string;
  room?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

export const RoomForm = ({ branchId, room, onSuccess, onCancel }: RoomFormProps) => {
  const { addDocument, updateDocument } = useDatabase();
  const { branches, isLoading } = useBranches();
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(branchId || '');
  
  const [formData, setFormData] = useState({
    type: room?.type || 'standard-room',
    pricePerNight: room?.pricePerNight || '',
    roomNumber: room?.roomNumber || '',
    availability: room?.availability || true,
    amenities: room?.amenities || [],
    images: room?.images || [],
    roomCount: room?.roomCount || 1, // Default to 1 room
  });

  const roomTypes = [
    { value: 'test-room', label: 'Test Room' },
    { value: 'junior-suite', label: 'Junior Suite' },
    { value: 'standard-room', label: 'Standard Room' },
    { value: 'superior-room', label: 'Superior Room' },
    { value: 'premium-standard-room', label: 'Premium Standard Room' },
    { value: 'premium-superior-room', label: 'Premium Superior Room' },
    { value: 'deluxe', label: 'Deluxe' },
    { value: 'executive-suite', label: 'Executive Suite' },
    { value: 'executive-deluxe-room', label: 'Executive Deluxe Room' },
    { value: 'executive-twin-room', label: 'Executive Twin Room' },
    { value: 'super-executive-room', label: 'Super Executive Room' },
    { value: 'premium-diplomatic-suite', label: 'Premium Diplomatic Suite' },
    { value: 'ambassadorial-suite', label: 'Ambassadorial Suite' },
    { value: 'presidential-suite', label: 'Presidential Suite' },
    { value: 'royal-suites-room', label: 'Royal Suites Room' },
  ];

  const availableAmenities = [
    { id: 'king-size-bed', label: 'King-size bed' },
    { id: 'city-view', label: 'City view' },
    { id: 'free-wifi', label: 'Free WiFi' },
    { id: 'continental-services', label: 'Continental services' },
    { id: 'air-conditioning', label: 'Air conditioning' },
    { id: 'smart-tv', label: 'Smart TV' },
    { id: 'work-desk', label: 'Work desk' },
    { id: 'coffee-tea-maker', label: 'Coffee/tea maker' },
    { id: 'complimentary-breakfast', label: 'Complimentary breakfast' },
  ];

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityId]
      });
    } else {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(id => id !== amenityId)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);
    console.log('Submitting room form with data:', formData);
    const startTime = performance.now();

    try {
      // Ensure availability is explicitly a boolean
      const availability = formData.availability === true;
      console.log('Room availability set to:', availability, 'Type:', typeof availability);
      
      const roomData = {
        type: formData.type,
        pricePerNight: Number(formData.pricePerNight),
        roomNumber: formData.roomNumber,
        availability: availability,
        amenities: formData.amenities,
        images: formData.images,
        roomCount: Number(formData.roomCount),
        updatedAt: new Date().toISOString(),
      };

      console.log('Submitting room data:', roomData);

      if (room) {
        console.log(`Updating room ${room.id} in branch ${selectedBranchId}`);
        const updateStartTime = performance.now();
        await updateDocument(`branches/${selectedBranchId}/rooms`, room.id, roomData);
        const updateEndTime = performance.now();
        console.log(`Room update operation took ${Math.round(updateEndTime - updateStartTime)}ms`);
        toast.success("Room updated successfully");
      } else {
        console.log(`Adding new room to branch ${selectedBranchId}`);
        roomData.createdAt = new Date().toISOString();
        roomData.updatedAt = new Date().toISOString();
        const addStartTime = performance.now();
        await addDocument(`branches/${selectedBranchId}/rooms`, roomData);
        const addEndTime = performance.now();
        console.log(`Room add operation took ${Math.round(addEndTime - addStartTime)}ms`);
        toast.success("Room added successfully");
      }

      const endTime = performance.now();
      console.log(`Room ${room ? 'updated' : 'added'} in ${Math.round(endTime - startTime)}ms`);
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error("Failed to save room");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="branch" className="text-white">Branch *</Label>
          <Select
            value={selectedBranchId}
            onValueChange={setSelectedBranchId}
            disabled={branchesLoading || !!branchId}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder={branchesLoading ? "Loading branches..." : "Select branch"} />
            </SelectTrigger>
            <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
              {branches?.map((branch) => (
                <SelectItem key={branch.id} value={branch.id!} className="text-white hover:bg-yellow-400/20">
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="roomNumber" className="text-white">Room Number *</Label>
          <Input
            id="roomNumber"
            value={formData.roomNumber}
            onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
            required
            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-yellow-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-white">Room Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({...formData, type: value})}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
              {roomTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-white hover:bg-yellow-400/20">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricePerNight" className="text-white">Price per Night (₦) *</Label>
          <Input
            id="pricePerNight"
            type="number"
            value={formData.pricePerNight}
            onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
            required
            min="0"
            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-yellow-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability" className="text-white">Availability</Label>
          <Select
            value={formData.availability ? "true" : "false"}
            onValueChange={(value) => setFormData({...formData, availability: value === "true"})}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent className="bg-white/10 backdrop-blur-md border-white/20">
              <SelectItem value="true" className="text-white hover:bg-yellow-400/20">Available</SelectItem>
              <SelectItem value="false" className="text-white hover:bg-yellow-400/20">Not Available</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="roomCount" className="text-white">Number of Rooms *</Label>
          <Input
            id="roomCount"
            type="number"
            value={formData.roomCount}
            onChange={(e) => setFormData({...formData, roomCount: e.target.value})}
            required
            min="1"
            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-yellow-400"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-white">Amenities</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableAmenities.map((amenity) => (
            <div key={amenity.id} className="flex items-center space-x-2">
              <Checkbox 
                id={amenity.id}
                checked={formData.amenities.includes(amenity.id)}
                onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked === true)}
                className="border-white/20 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
              />
              <Label htmlFor={amenity.id} className="cursor-pointer text-white">{amenity.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="bg-white/5 border-white/20 text-white hover:bg-yellow-400/10 hover:text-yellow-300 hover:border-yellow-400/30">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !selectedBranchId} className="bg-yellow-400 text-blue-900 border-yellow-400 hover:bg-yellow-300">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {room ? 'Update Room' : 'Add Room'}
        </Button>
      </div>
    </form>
  );
};
