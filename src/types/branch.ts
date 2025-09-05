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
  roomTypes?: {
    name: string;
    description: string;
    priceRange: string;
    capacity: number;
  }[];
  gallery?: string[];
  checkInTime?: string;
  checkOutTime?: string;
}
