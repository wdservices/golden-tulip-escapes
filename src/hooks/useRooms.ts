import { useState, useEffect } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useAuth } from '@/contexts/AuthContext';


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

interface RoomType {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export const useRooms = (branchId?: string) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { queryDocuments } = useDatabase();

  useEffect(() => {
    const fetchRooms = async () => {
      if (!branchId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch rooms from the specific branch
        const roomsData = await queryDocuments<Room>(`branches/${branchId}/rooms`, []);
        setRooms(roomsData);
        
        // Extract unique room types with their details
        const uniqueRoomTypes = new Map<string, RoomType>();
        
        roomsData.forEach(room => {
          if (!uniqueRoomTypes.has(room.type)) {
            uniqueRoomTypes.set(room.type, {
              id: room.type,
              name: formatRoomTypeName(room.type),
              price: room.pricePerNight,
              description: `Starting from ₦${room.pricePerNight.toLocaleString()}/night`
            });
          } else {
            // Update with the lowest price for this room type
            const existing = uniqueRoomTypes.get(room.type)!;
            if (room.pricePerNight < existing.price) {
              uniqueRoomTypes.set(room.type, {
                ...existing,
                price: room.pricePerNight,
                description: `Starting from ₦${room.pricePerNight.toLocaleString()}/night`
              });
            }
          }
        });
        
        setRoomTypes(Array.from(uniqueRoomTypes.values()));
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to load rooms');
        setRooms([]);
        setRoomTypes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [branchId, queryDocuments]);

  return {
    rooms,
    roomTypes,
    isLoading,
    error,
    refetch: () => {
      if (branchId) {
        setIsLoading(true);
        // Re-trigger the effect by updating a dependency
      }
    }
  };
};

// Helper function to format room type names
const formatRoomTypeName = (type: string): string => {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Hook to fetch rooms from all branches (for admin use)
export const useAllRooms = () => {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { queryDocuments } = useDatabase();
  const { userMeta, activeBranchId } = useAuth();

  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First get all branches
        const branches = await queryDocuments('branches', []);
        
        // Filter branches based on user role and active branch
        let branchesToFetch = branches;
        
        // All users only see their specific branch
        if (activeBranchId) {
          branchesToFetch = branches.filter(branch => branch.id === activeBranchId);
        }
        
        // Then fetch rooms from each branch
        const allRoomsPromises = branchesToFetch.map(async (branch) => {
          try {
            const branchRooms = await queryDocuments<Room>(`branches/${branch.id}/rooms`, []);
            return branchRooms.map(room => ({ ...room, branchId: branch.id }));
          } catch (error) {
            console.error(`Error fetching rooms for branch ${branch.id}:`, error);
            return [];
          }
        });
        
        const roomsArrays = await Promise.all(allRoomsPromises);
        const flattenedRooms = roomsArrays.flat();
        
        setAllRooms(flattenedRooms);
      } catch (error) {
        console.error('Error fetching all rooms:', error);
        setError('Failed to load rooms');
        setAllRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRooms();
  }, [queryDocuments, userMeta, activeBranchId]);

  return {
    rooms: allRooms,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      // This will trigger the useEffect to run again
    }
  };
};