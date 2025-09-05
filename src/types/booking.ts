export interface Booking {
  id: string;
  userId: string;
  branchId: string;
  branchName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  bookingDate: string;
  guests: number;
  specialRequests?: string;
}

export interface UserBookingStats {
  totalBookings: number;
  totalNights: number;
  favoriteBranch?: string;
  lastStay?: string;
  upcomingStay?: {
    checkIn: string;
    checkOut: string;
    branch: string;
  };
}

import { User } from "./auth";

export interface UserProfile extends User {
  // This interface now extends the User type from auth.ts
  // All user-related fields are now consolidated in the User type
}
