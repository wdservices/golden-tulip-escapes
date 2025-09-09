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
  const revenueData = generateRevenueReport(bookings);
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
    const date = new Date(booking.checkInDate).toISOString().split('T')[0];
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
    const guestId = booking.guestId || 'unknown';
    if (!acc[guestId]) {
      acc[guestId] = [];
    }
    acc[guestId].push(booking);
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
        (a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime()
      );
      
      guestReports.push({
        guestId,
        name: guestData.name || 'Unknown Guest',
        email: guestData.email || '',
        phone: guestData.phone || '',
        totalStays,
        totalNights,
        totalSpent,
        lastStay: sortedBookings[sortedBookings.length - 1].checkInDate,
        nextStay: guestData.nextStay || undefined
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
  // Group cancellations by date and reason
  const cancellations = bookings.filter(b => b.status === 'cancelled');
  const cancellationsByDate = cancellations.reduce((acc, booking) => {
    const date = booking.updatedAt ? new Date(booking.updatedAt).toISOString().split('T')[0] : 'unknown';
    const reason = booking.cancellationReason || 'No reason provided';
    const key = `${date}-${reason}`;
    
    if (!acc[key]) {
      acc[key] = {
        date,
        reason,
        count: 0,
        revenueLost: 0,
        totalBookings: 0
      };
    }
    
    acc[key].count += 1;
    acc[key].revenueLost += booking.totalAmount || 0;
    
    return acc;
  }, {} as Record<string, {
    date: string;
    reason: string;
    count: number;
    revenueLost: number;
    totalBookings: number;
  }>);

  // Calculate cancellation rates and format results
  return Object.values(cancellationsByDate).map(item => ({
    date: item.date,
    totalBookings: bookings.filter(b => {
      const bookingDate = new Date(b.checkInDate).toISOString().split('T')[0];
      return bookingDate === item.date;
    }).length,
    cancelledBookings: item.count,
    cancellationRate: item.count / (item.count + bookings.length) * 100,
    cancelledRevenue: item.revenueLost,
    reason: item.reason
  }));
};
