export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved';
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'family' | 'executive';

export interface RoomAmenity {
  id: string;
  name: string;
  icon: string;
}

export interface RoomTypeConfig {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  basePrice: number;
  amenities: RoomAmenity[];
  imageUrl: string;
  size: string; // e.g., '30 sqm'
  bedType: 'single' | 'double' | 'queen' | 'king' | 'twin' | 'bunk';
  bedCount: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  lastCleaned?: string | null;
  nextMaintenance?: string | null;
  currentBookingId?: string | null;
  notes?: string;
  isSmoking: boolean;
  isAccessible: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional properties for room display
  name: string;
  description: string;
  size: number;
  price: number;
  images: string[];
  amenities: string[];
  maxOccupancy: number;
  bedType: 'single' | 'double' | 'queen' | 'king' | 'twin' | 'bunk';
  bedCount: number;
}

export interface RoomInventoryStats {
  totalRooms: number;
  available: number;
  occupied: number;
  maintenance: number;
  cleaning: number;
  reserved: number;
  occupancyRate: number;
  byType: {
    [key in RoomType]: {
      total: number;
      available: number;
      occupied: number;
    };
  };
  byFloor: {
    [floor: number]: {
      total: number;
      available: number;
      occupied: number;
    };
  };
}

export interface RoomCleaningStatus {
  roomId: string;
  roomNumber: string;
  status: 'clean' | 'dirty' | 'inspected' | 'cleaning';
  lastCleaned?: string;
  cleanedBy?: string;
  notes?: string;
  requiresDeepCleaning: boolean;
}
