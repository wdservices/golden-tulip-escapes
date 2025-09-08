import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { Room, RoomStatus, RoomType } from '@/types/room';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const roomFormSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  floor: z.number().min(0, 'Floor must be 0 or higher'),
  type: z.enum(['standard', 'deluxe', 'suite', 'family', 'executive']),
  status: z.enum(['available', 'occupied', 'maintenance', 'cleaning', 'reserved']),
  isSmoking: z.boolean().default(false),
  isAccessible: z.boolean().default(false),
  notes: z.string().optional(),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

interface AddRoomFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddRoomForm({ onSuccess, onCancel }: AddRoomFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      status: 'available',
      isSmoking: false,
      isAccessible: false,
      type: 'standard',
      floor: 1,
    },
  });

  const onSubmit = async (data: RoomFormValues) => {
    try {
      setIsSubmitting(true);
      
      const roomData = {
        ...data,
        roomNumber: data.roomNumber.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastCleaned: null,
        nextMaintenance: null,
        currentBookingId: null,
      };

      await addDoc(collection(db, 'rooms'), roomData);
      
      toast({
        title: 'Room added',
        description: 'The room has been successfully added to the inventory.',
      });
      
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error adding room:', error);
      toast({
        title: 'Error',
        description: 'Failed to add room. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Room Number */}
        <div className="space-y-2">
          <Label htmlFor="roomNumber">Room Number *</Label>
          <Input
            id="roomNumber"
            {...register('roomNumber')}
            placeholder="e.g., 101"
            disabled={isSubmitting}
          />
          {errors.roomNumber && (
            <p className="text-sm text-red-500">{errors.roomNumber.message}</p>
          )}
        </div>

        {/* Floor */}
        <div className="space-y-2">
          <Label htmlFor="floor">Floor *</Label>
          <Input
            id="floor"
            type="number"
            min="0"
            {...register('floor', { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {errors.floor && (
            <p className="text-sm text-red-500">{errors.floor.message}</p>
          )}
        </div>

        {/* Room Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Room Type *</Label>
          <Select
            value={watch('type')}
            onValueChange={(value) => setValue('type', value as RoomType)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="deluxe">Deluxe</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={watch('status')}
            onValueChange={(value) => setValue('status', value as RoomStatus)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-500">{errors.status.message}</p>
          )}
        </div>

        {/* Checkboxes */}
        <div className="space-y-4 col-span-full">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSmoking"
              checked={watch('isSmoking')}
              onCheckedChange={(checked) => setValue('isSmoking', checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="isSmoking">Smoking Room</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAccessible"
              checked={watch('isAccessible')}
              onCheckedChange={(checked) => setValue('isAccessible', checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="isAccessible">Wheelchair Accessible</Label>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2 col-span-full">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Any special notes about this room..."
            disabled={isSubmitting}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Room'
          )}
        </Button>
      </div>
    </form>
  );
}
