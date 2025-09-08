export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface Booking {
  id: string;
  userId: string;
  branchId: string;
  branchName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  bookingDate: string;
  guests: number;
  specialRequests?: string;
  createdAt?: string;
  updatedAt?: string;
  actualCheckOutDate?: string; // For tracking actual check-out time
  
  // Additional fields for reporting
  roomCharge?: number; // Base room rate
  serviceCharge?: number; // Additional services
  tax?: number; // Tax amount
  discount?: number; // Discount amount
  cancellationReason?: string; // Reason for cancellation
  roomNumber?: string; // Assigned room number
  roomId?: string; // Reference to room document
  
  // Financial breakdown
  baseRate?: number;
  extraPersonFee?: number;
  resortFee?: number;
  cityTax?: number;
  vat?: number;
  
  // Guest information
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  
  // Payment information
  paymentMethod?: string;
  paymentDate?: string;
  lastPaymentAmount?: number;
  
  // Housekeeping
  housekeepingNotes?: string;
  roomStatus?: 'clean' | 'dirty' | 'inspected' | 'out-of-order';
  
  // Metadata
  source?: 'website' | 'phone' | 'walk-in' | 'ota' | 'agent';
  marketSegment?: 'leisure' | 'corporate' | 'group' | 'other';
  rateCode?: string; // For different rate plans (BAR, CORP, PACK, etc.)
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
