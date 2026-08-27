import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getFirestoreBranchId } from "@/lib/branchIds";

export interface BranchRoom {
  id: string;
  type: string;
  pricePerNight: number;
  availability: boolean;
  roomNumber: string;
  amenities: string[];
  images: string[];
  roomCount?: number;
}

export interface BranchRoomDisplay {
  name: string;
  pricePerNight: number;
  priceRange: string;
  description: string;
  capacity: number;
  features: string[];
  image?: string;
  type: string;
}

export const useBranchRooms = (branchId?: string) => {
  const [rooms, setRooms] = useState<BranchRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firestoreBranchId = branchId ? getFirestoreBranchId(branchId) : null;

  useEffect(() => {
    if (!firestoreBranchId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const roomsRef = collection(db, "branches", firestoreBranchId, "rooms");
    const unsubscribe = onSnapshot(
      roomsRef,
      (snapshot) => {
        const roomData: BranchRoom[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          roomData.push({
            id: doc.id,
            type: data.type || "",
            pricePerNight: Number(data.pricePerNight) || 0,
            availability: data.availability !== false,
            roomNumber: data.roomNumber || "",
            amenities: data.amenities || [],
            images: data.images || [],
            roomCount: data.roomCount,
          });
        });
        setRooms(roomData);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error listening to branch rooms:", err);
        setError("Failed to load rooms");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestoreBranchId]);

  const getRoomsByType = useCallback(
    (typeName: string): BranchRoom[] => {
      const lower = typeName.toLowerCase().trim();
      return rooms.filter(
        (r) =>
          r.type.toLowerCase() === lower ||
          r.type.toLowerCase().replace(/\s+/g, "-") === lower ||
          r.type.toLowerCase().replace(/\s+/g, "") === lower.replace(/\s+/g, "")
      );
    },
    [rooms]
  );

  const getRoomPrice = useCallback(
    (typeName: string): number | null => {
      const matches = getRoomsByType(typeName);
      if (matches.length === 0) return null;
      return matches[0].pricePerNight;
    },
    [getRoomsByType]
  );

  const formatPrice = (price: number): string => {
    return `₦${price.toLocaleString()}`;
  };

  return {
    rooms,
    isLoading,
    error,
    getRoomsByType,
    getRoomPrice,
    formatPrice,
  };
};
