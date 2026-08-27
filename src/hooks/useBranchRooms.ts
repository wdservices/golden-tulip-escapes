import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";

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

const slugToFirestoreIdCache = new Map<string, string>();

async function resolveFirestoreBranchId(urlSlug: string): Promise<string> {
  const cached = slugToFirestoreIdCache.get(urlSlug);
  if (cached) return cached;

  try {
    const branchesSnap = await getDocs(collection(db, "branches"));
    for (const doc of branchesSnap.docs) {
      const data = doc.data();
      const name: string = (data.name || "").toLowerCase().trim();
      const fullName: string = (data.fullName || "").toLowerCase().trim();
      const slug = urlSlug.toLowerCase().replace(/-/g, " ");

      if (
        name === slug ||
        name.includes(slug) ||
        slug.includes(name) ||
        fullName.includes(slug) ||
        slug.includes(fullName)
      ) {
        slugToFirestoreIdCache.set(urlSlug, doc.id);
        return doc.id;
      }
    }
  } catch (err) {
    console.error("Error resolving Firestore branch ID:", err);
  }

  slugToFirestoreIdCache.set(urlSlug, urlSlug);
  return urlSlug;
}

export const useBranchRooms = (branchId?: string) => {
  const [rooms, setRooms] = useState<BranchRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedId, setResolvedId] = useState<string | null>(null);

  useEffect(() => {
    if (!branchId) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setup = async () => {
      setIsLoading(true);
      setError(null);

      const firestoreId = await resolveFirestoreBranchId(branchId);
      setResolvedId(firestoreId);

      const roomsRef = collection(db, "branches", firestoreId, "rooms");
      unsubscribe = onSnapshot(
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
    };

    setup();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [branchId]);

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
    resolvedId,
    getRoomsByType,
    getRoomPrice,
    formatPrice,
  };
};
