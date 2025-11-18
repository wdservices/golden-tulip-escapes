export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved';

export interface RoomAmenity {
  id: string;
  name: string;
  icon: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  size: number;
  capacity: number;
  bedType: string;
  amenities: string[];
  images: string[];
  vrTourUrl?: string;
  // Additional properties
  maxOccupancy?: number;
  bedCount?: number;
  roomNumber?: string;
  floor?: number;
  status?: RoomStatus;
  lastCleaned?: string | null;
  nextMaintenance?: string | null;
  currentBookingId?: string | null;
  notes?: string;
  isSmoking?: boolean;
  isAccessible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room extends RoomType {
  id: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  lastCleaned?: string | null;
  nextMaintenance?: string | null;
  currentBookingId?: string | null;
  notes?: string;
  isSmoking: boolean;
  isAccessible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomTypeConfig {
  id: string;
  name: string;
  description: string;
  priceRange: string;
  maxOccupancy: number;
  capacity: number;
  basePrice?: number;
  amenities?: RoomAmenity[];
  features?: string[];
  imageUrl?: string;
  image?: string;
  size?: string; // e.g., '30 sqm'
  bedType?: 'single' | 'double' | 'queen' | 'king' | 'twin' | 'bunk';
  bedCount?: number;
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
