import { Booking, BookingStatus } from './booking';
import { RoomStatus } from './room';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ReportFilter {
  dateRange: DateRange;
  roomTypes?: string[];
  bookingStatuses?: BookingStatus[];
  roomStatuses?: RoomStatus[];
  branchId?: string;
}

export interface OccupancyReport {
  date: string;
  totalRooms: number;
  occupied: number;
  available: number;
  occupancyRate: number;
  revenue: number;
  adr: number; // Average Daily Rate
  revPar: number; // Revenue Per Available Room
}

export interface RevenueReport {
  date: string;
  totalRevenue: number;
  roomRevenue: number;
  serviceRevenue: number;
  tax: number;
  discount: number;
  bookingCount: number;
  averageStay: number;
}

export interface RoomTypePerformance {
  roomType: string;
  totalRooms: number;
  occupied: number;
  revenue: number;
  occupancyRate: number;
  adr: number;
  revPar: number;
}

export interface GuestReport {
  guestId: string;
  name: string;
  email: string;
  phone: string;
  totalStays: number;
  totalNights: number;
  totalSpent: number;
  lastStay: string;
  nextStay?: string;
  averageRating?: number;
}

export interface CancellationReport {
  date: string;
  totalBookings: number;
  cancelledBookings: number;
  cancellationRate: number;
  cancelledRevenue: number;
  reason?: string;
}

export interface ReportData {
  occupancyData: OccupancyReport[];
  revenueData: RevenueReport[];
  roomTypeData: RoomTypePerformance[];
  guestData: GuestReport[];
  cancellationData: CancellationReport[];
  generatedAt: Date;
  filter: ReportFilter;
}

export type ReportType = 
  | 'occupancy'
  | 'revenue'
  | 'room-performance'
  | 'guest'
  | 'cancellation'
  | 'custom';

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeDataTables: boolean;
  emailRecipient?: string;
}
