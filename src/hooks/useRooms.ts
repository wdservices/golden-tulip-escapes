import { useState, useEffect, useCallback, useRef } from 'react';
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
  const versionRef = useRef(0);

  const { queryDocuments } = useDatabase();

  const fetchRooms = useCallback(async () => {
    if (!branchId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const roomsData = await queryDocuments<Room>(`branches/${branchId}/rooms`, []);
      setRooms(roomsData);

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
  }, [branchId, queryDocuments]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms, versionRef.current]);

  useEffect(() => {
    const handleDatabaseUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.collectionPath?.startsWith('branches/') && detail?.collectionPath?.includes('/rooms')) {
        if (branchId && detail.collectionPath.includes(branchId)) {
          fetchRooms();
        }
      }
    };

    window.addEventListener('database-update', handleDatabaseUpdate);
    return () => window.removeEventListener('database-update', handleDatabaseUpdate);
  }, [branchId, fetchRooms]);

  return {
    rooms,
    roomTypes,
    isLoading,
    error,
    refetch: () => {
      versionRef.current += 1;
      fetchRooms();
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
  const versionRef = useRef(0);

  const { queryDocuments } = useDatabase();
  const { userMeta, activeBranchId } = useAuth();

  const fetchAllRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const branches = await queryDocuments('branches', []);

      let branchesToFetch = branches;

      if (activeBranchId) {
        branchesToFetch = branches.filter((branch: any) => branch.id === activeBranchId);
      }

      const allRoomsPromises = branchesToFetch.map(async (branch: any) => {
        try {
          const branchRooms = await queryDocuments<Room>(`branches/${branch.id}/rooms`, []);
          return branchRooms.map((room: any) => ({ ...room, branchId: branch.id }));
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
  }, [queryDocuments, userMeta, activeBranchId]);

  useEffect(() => {
    fetchAllRooms();
  }, [fetchAllRooms, versionRef.current]);

  useEffect(() => {
    const handleDatabaseUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.collectionPath?.startsWith('branches/') && detail?.collectionPath?.includes('/rooms')) {
        fetchAllRooms();
      }
    };

    window.addEventListener('database-update', handleDatabaseUpdate);
    return () => window.removeEventListener('database-update', handleDatabaseUpdate);
  }, [fetchAllRooms]);

  return {
    rooms: allRooms,
    isLoading,
    error,
    refetch: () => {
      versionRef.current += 1;
      fetchAllRooms();
    }
  };
};
