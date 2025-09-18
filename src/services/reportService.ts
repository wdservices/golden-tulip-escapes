import { collection, query, where, getDocs, getDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  type ReportData, 
  type ReportFilter, 
  type RevenueReport, 
  type GuestReport, 
  type CancellationReport,
  type ReportType,
  type DateRange as DateRangeType
} from '@/types/report';
import { Booking, BookingStatus } from '@/types/booking';

// Export types for use in other files
export type { ReportData, ReportType, DateRangeType };

export const generateReport = async (filter: ReportFilter): Promise<ReportData> => {
  // Generate date range for queries
  const startDate = Timestamp.fromDate(new Date(filter.dateRange.start));
  const endDate = Timestamp.fromDate(new Date(filter.dateRange.end));
  
  // Fetch bookings data
  const bookings = await fetchBookings(startDate, endDate, filter.bookingStatuses, filter.branchId);

  // Generate reports
  const revenueData = generateRevenueReport(bookings, filter);
  const guestData = await generateGuestReport(bookings, filter);
  const cancellationData = generateCancellationReport(bookings, filter);

  return {
    revenueData,
    guestData,
    cancellationData,
    generatedAt: new Date(),
    filter
  };
};

// Helper function to fetch bookings with filters
const fetchBookings = async (
  startDate: Timestamp,
  endDate: Timestamp,
  statuses?: BookingStatus[],
  branchId?: string
): Promise<Booking[]> => {
  let q = query(
    collection(db, 'bookings'),
    where('checkInDate', '>=', startDate),
    where('checkInDate', '<=', endDate),
    orderBy('checkInDate')
  );

  if (statuses && statuses.length > 0) {
    q = query(q, where('status', 'in', statuses));
  }

  if (branchId) {
    q = query(q, where('branchId', '==', branchId));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as unknown as Booking));
};

// Generate revenue report data
const generateRevenueReport = (bookings: Booking[]): RevenueReport[] => {
  // Group bookings by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const date = booking.checkInDate.toDate().toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  // Calculate revenue metrics for each date
  return Object.entries(bookingsByDate).map(([date, dailyBookings]) => {
    const totalRevenue = dailyBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    const serviceRevenue = dailyBookings.reduce((sum, booking) => sum + (booking.serviceCharge || 0), 0);
    const tax = dailyBookings.reduce((sum, booking) => sum + (booking.tax || 0), 0);
    const discount = dailyBookings.reduce((sum, booking) => sum + (booking.discount || 0), 0);
    const averageStay = dailyBookings.length > 0 
      ? dailyBookings.reduce((sum, booking) => sum + (booking.nights || 1), 0) / dailyBookings.length 
      : 0;

    return {
      date,
      totalRevenue,
      serviceRevenue,
      tax,
      discount,
      bookingCount: dailyBookings.length,
      averageStay: parseFloat(averageStay.toFixed(1))
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Generate guest report data
const generateGuestReport = async (
  bookings: Booking[],
  filter: ReportFilter
): Promise<GuestReport[]> => {
  // Group bookings by guest
  const bookingsByGuest = bookings.reduce((acc, booking) => {
    if (!booking.guestId) return acc;
    if (!acc[booking.guestId]) {
      acc[booking.guestId] = [];
    }
    acc[booking.guestId].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  // Get guest details and calculate metrics
  const guestReports: GuestReport[] = [];
  
  for (const [guestId, guestBookings] of Object.entries(bookingsByGuest)) {
    try {
      const guestDoc = await getDoc(doc(db, 'guests', guestId));
      if (!guestDoc.exists()) continue;
      
      const guestData = guestDoc.data();
      const totalStays = guestBookings.length;
      const totalNights = guestBookings.reduce((sum, booking) => sum + (booking.nights || 1), 0);
      const totalSpent = guestBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      
      // Sort bookings by check-in date to find first and last stay
      const sortedBookings = [...guestBookings].sort(
        (a, b) => a.checkInDate.toMillis() - b.checkInDate.toMillis()
      );
      
      guestReports.push({
        guestId,
        name: (guestData as any).name || 'Unknown Guest',
        email: (guestData as any).email || '',
        phone: (guestData as any).phone || '',
        totalStays,
        totalNights,
        totalSpent,
        lastStay: sortedBookings[sortedBookings.length - 1].checkInDate.toDate().toISOString(),
        nextStay: (guestData as any).nextStay || undefined
      });
    } catch (error) {
      console.error(`Error processing guest ${guestId}:`, error);
    }
  }
  
  return guestReports;
};

// Generate cancellation report data
const generateCancellationReport = (
  bookings: Booking[],
  filter: ReportFilter
): CancellationReport[] => {
  // Group bookings by date
  const bookingsByDate = new Map<string, Booking[]>();
  
  for (const booking of bookings) {
    if (booking.status === 'cancelled') {
      const date = (booking.updatedAt || booking.bookingDate || booking.checkInDate).toDate().toISOString().split('T')[0];
      if (!bookingsByDate.has(date)) {
        bookingsByDate.set(date, []);
      }
      bookingsByDate.get(date)?.push(booking);
    }
  }
  
  // Calculate metrics for each date
  return Array.from(bookingsByDate.entries()).map(([date, dateBookings]) => {
    const totalBookings = dateBookings.length;
    const cancelledBookings = dateBookings.filter(b => b.status === 'cancelled').length;
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
    const cancelledRevenue = dateBookings
      .filter(b => b.status === 'cancelled')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    // Count cancellation reasons if available
    const reasons = dateBookings
      .filter(b => b.status === 'cancelled' && b.cancellationReason)
      .reduce((acc: Record<string, number>, b) => {
        const reason = b.cancellationReason || 'No reason provided';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {});
    
    // Find most common reason
    let mostCommonReason: string | undefined;
    let maxCount = 0;
    
    for (const [reason, count] of Object.entries(reasons)) {
      if (count > maxCount) {
        mostCommonReason = reason;
        maxCount = count;
      }
    }
    
    return {
      date,
      totalBookings,
      cancelledBookings,
      cancellationRate: parseFloat(cancellationRate.toFixed(2)),
      cancelledRevenue: parseFloat(cancelledRevenue.toFixed(2)),
      reason: mostCommonReason
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
