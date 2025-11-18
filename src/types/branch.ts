export interface Branch {
  id: string;
  name: string;
  fullName: string;
  location: string;
  description: string;
  image: string;
  address?: string;
  phone?: string;
  email?: string;
  amenities?: string[];
  diningOptions?: {
    name: string;
    type: string;
    cuisine: string;
    hours: string;
    features: string[];
  }[];
  spaServices?: {
    name: string;
    duration: string;
    price: string;
    description: string;
  }[];
  roomTypes?: {
    name: string;
    description: string;
    priceRange: string;
    capacity: number;
    features?: string[];
  }[];
  events?: {
    type: string;
    capacity: string;
    priceRange: string;
    features: string[];
  }[];
  operatingHours?: {
    checkIn: string;
    checkOut: string;
    frontDesk: string;
    restaurant: string;
    bar: string;
  };
  paymentMethods?: string[];
  policies?: string[];
  gallery?: string[];
  checkInTime?: string;
  checkOutTime?: string;
}

// Lightweight branch metadata for branch selector
export interface BranchMeta {
  id: string;
  name: string;
  fullName: string;
  logo?: string;
  color?: string;
}

export type BranchStatus = 'active' | 'inactive' | 'maintenance';

// Legacy enum for backwards compatibility
export const BranchStatus = {
  Active: 'active' as const,
  Inactive: 'inactive' as const,
  Maintenance: 'maintenance' as const,
};
