import { Booking, BookingStatus } from './booking';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ReportFilter {
  dateRange: DateRange;
  bookingStatuses?: BookingStatus[];
  branchId?: string;
}

export interface RevenueReport {
  date: string;
  totalRevenue: number;
  serviceRevenue: number;
  tax: number;
  discount: number;
  bookingCount: number;
  averageStay: number;
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
  revenueData: RevenueReport[];
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
