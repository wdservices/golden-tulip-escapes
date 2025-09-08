import { collection, query, where, getDocs, getDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  type ReportData, 
  type ReportFilter, 
  type OccupancyReport, 
  type RevenueReport, 
  type RoomTypePerformance, 
  type GuestReport, 
  type CancellationReport,
  type ReportType,
  type DateRange as DateRangeType
} from '@/types/report';
import { Booking, BookingStatus } from '@/types/booking';
import { Room, RoomStatus, RoomType } from '@/types/room';

// Export types for use in other files
export type { ReportData, ReportType, DateRangeType };

export const generateReport = async (filter: ReportFilter): Promise<ReportData> => {
  // Generate date range for queries
  const startDate = Timestamp.fromDate(new Date(filter.dateRange.start));
  const endDate = Timestamp.fromDate(new Date(filter.dateRange.end));
  
  // Fetch all necessary data in parallel
  const [bookings, rooms] = await Promise.all([
    fetchBookings(startDate, endDate, filter.bookingStatuses, filter.branchId),
    fetchRooms(filter.roomStatuses, filter.roomTypes, filter.branchId)
  ]);

  // Generate reports
  const occupancyData = generateOccupancyReport(bookings, rooms, filter);
  const revenueData = generateRevenueReport(bookings, filter);
  const roomTypeData = generateRoomTypePerformance(bookings, rooms, filter);
  const guestData = await generateGuestReport(bookings, filter);
  const cancellationData = generateCancellationReport(bookings, filter);

  return {
    occupancyData,
    revenueData,
    roomTypeData,
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
  const bookingsRef = collection(db, 'bookings');
  let q = query(
    bookingsRef,
    where('checkInDate', '<=', endDate),
    where('checkOutDate', '>=', startDate)
  );

  // Add status filter if provided
  if (statuses && statuses.length > 0) {
    q = query(q, where('status', 'in', statuses));
  }

  // Add branch filter if provided
  if (branchId) {
    q = query(q, where('branchId', '==', branchId));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Convert Firestore timestamps to Date objects
    checkInDate: doc.data().checkInDate?.toDate().toISOString(),
    checkOutDate: doc.data().checkOutDate?.toDate().toISOString(),
    bookingDate: doc.data().bookingDate?.toDate().toISOString(),
  })) as Booking[];
};

// Helper function to fetch rooms with filters
const fetchRooms = async (
  statuses?: RoomStatus[],
  types?: string[],
  branchId?: string
): Promise<Room[]> => {
  const roomsRef = collection(db, 'rooms');
  let q = query(roomsRef);

  // Add status filter if provided
  if (statuses && statuses.length > 0) {
    q = query(q, where('status', 'in', statuses));
  }

  // Add type filter if provided
  if (types && types.length > 0) {
    q = query(q, where('type', 'in', types));
  }

  // Add branch filter if provided
  if (branchId) {
    q = query(q, where('branchId', '==', branchId));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Convert Firestore timestamps to Date objects if needed
    lastCleaned: doc.data().lastCleaned?.toDate().toISOString(),
    nextMaintenance: doc.data().nextMaintenance?.toDate().toISOString(),
  })) as Room[];
};

// Generate occupancy report data
const generateOccupancyReport = (
  bookings: Booking[], 
  rooms: Room[],
  filter: ReportFilter
): OccupancyReport[] => {
  const result: OccupancyReport[] = [];
  const date = new Date(filter.dateRange.start);
  const endDate = new Date(filter.dateRange.end);
  
  // Group bookings by date
  const bookingsByDate = new Map<string, Booking[]>();
  
  // Initialize date range with empty arrays
  while (date <= endDate) {
    const dateStr = date.toISOString().split('T')[0];
    bookingsByDate.set(dateStr, []);
    date.setDate(date.getDate() + 1);
  }
  
  // Populate bookings for each date
  for (const booking of bookings) {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    
    // Reset date to start of range
    date.setTime(checkIn.getTime());
    
    // For each day of the booking, add to the corresponding date
    while (date < checkOut && date <= endDate) {
      const dateStr = date.toISOString().split('T')[0];
      if (bookingsByDate.has(dateStr)) {
        bookingsByDate.get(dateStr)?.push(booking);
      }
      date.setDate(date.getDate() + 1);
    }
  }
  
  // Calculate metrics for each date
  bookingsByDate.forEach((dateBookings, dateStr) => {
    const occupied = dateBookings.length;
    const totalRooms = rooms.length;
    const available = totalRooms - occupied;
    const occupancyRate = totalRooms > 0 ? (occupied / totalRooms) * 100 : 0;
    
    const revenue = dateBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    const adr = occupied > 0 ? revenue / occupied : 0;
    const revPar = totalRooms > 0 ? revenue / totalRooms : 0;
    
    result.push({
      date: dateStr,
      totalRooms,
      occupied,
      available,
      occupancyRate: parseFloat(occupancyRate.toFixed(2)),
      revenue: parseFloat(revenue.toFixed(2)),
      adr: parseFloat(adr.toFixed(2)),
      revPar: parseFloat(revPar.toFixed(2))
    });
  });
  
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Generate revenue report data
const generateRevenueReport = (bookings: Booking[], filter: ReportFilter): RevenueReport[] => {
  // Group bookings by date
  const bookingsByDate = new Map<string, Booking[]>();
  
  for (const booking of bookings) {
    const date = new Date(booking.checkInDate).toISOString().split('T')[0];
    if (!bookingsByDate.has(date)) {
      bookingsByDate.set(date, []);
    }
    bookingsByDate.get(date)?.push(booking);
  }
  
  // Calculate metrics for each date
  return Array.from(bookingsByDate.entries()).map(([date, dateBookings]) => {
    const totalRevenue = dateBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const roomRevenue = dateBookings.reduce((sum, b) => sum + (b.roomCharge || b.totalAmount || 0), 0);
    const serviceRevenue = dateBookings.reduce((sum, b) => sum + (b.serviceCharge || 0), 0);
    const tax = dateBookings.reduce((sum, b) => sum + (b.tax || 0), 0);
    const discount = dateBookings.reduce((sum, b) => sum + (b.discount || 0), 0);
    const bookingCount = dateBookings.length;
    
    // Calculate average stay length
    const totalNights = dateBookings.reduce((sum, b) => {
      const checkIn = new Date(b.checkInDate);
      const checkOut = new Date(b.checkOutDate);
      return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    
    const averageStay = bookingCount > 0 ? totalNights / bookingCount : 0;
    
    return {
      date,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      roomRevenue: parseFloat(roomRevenue.toFixed(2)),
      serviceRevenue: parseFloat(serviceRevenue.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      bookingCount,
      averageStay: parseFloat(averageStay.toFixed(1))
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Generate room type performance data
const generateRoomTypePerformance = (
  bookings: Booking[],
  rooms: Room[],
  filter: ReportFilter
): RoomTypePerformance[] => {
  // Count total rooms by type
  const roomCountByType = new Map<string, number>();
  const roomTypeMap = new Map<string, RoomType>();
  
  for (const room of rooms) {
    const count = roomCountByType.get(room.type) || 0;
    roomCountByType.set(room.type, count + 1);
    if (!roomTypeMap.has(room.type)) {
      roomTypeMap.set(room.type, room as unknown as RoomType);
    }
  }
  
  // Group bookings by room type
  const bookingsByType = new Map<string, Booking[]>();
  
  for (const booking of bookings) {
    const roomType = booking.roomType;
    if (!bookingsByType.has(roomType)) {
      bookingsByType.set(roomType, []);
    }
    bookingsByType.get(roomType)?.push(booking);
  }
  
  // Calculate metrics for each room type
  return Array.from(roomCountByType.entries()).map(([type, totalRooms]) => {
    const typeBookings = bookingsByType.get(type) || [];
    const occupied = typeBookings.length;
    const revenue = typeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const occupancyRate = totalRooms > 0 ? (occupied / totalRooms) * 100 : 0;
    const adr = occupied > 0 ? revenue / occupied : 0;
    const revPar = totalRooms > 0 ? revenue / totalRooms : 0;
    
    return {
      roomType: type,
      totalRooms,
      occupied,
      revenue: parseFloat(revenue.toFixed(2)),
      occupancyRate: parseFloat(occupancyRate.toFixed(2)),
      adr: parseFloat(adr.toFixed(2)),
      revPar: parseFloat(revPar.toFixed(2))
    };
  });
};

// Generate guest report data
const generateGuestReport = async (
  bookings: Booking[],
  filter: ReportFilter
): Promise<GuestReport[]> => {
  // Group bookings by guest
  const bookingsByGuest = new Map<string, Booking[]>();
  
  for (const booking of bookings) {
    const guestId = booking.userId;
    if (!bookingsByGuest.has(guestId)) {
      bookingsByGuest.set(guestId, []);
    }
    bookingsByGuest.get(guestId)?.push(booking);
  }
  
  // Fetch guest details and calculate metrics
  const guestReports: GuestReport[] = [];
  
  for (const [guestId, guestBookings] of bookingsByGuest.entries()) {
    // In a real app, you would fetch the guest details from your users collection
    // For now, we'll use placeholder data
    const guestDoc = await getDoc(doc(db, 'users', guestId));
    const guestData = guestDoc.data();
    
    const totalStays = guestBookings.length;
    const totalNights = guestBookings.reduce((sum, booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    
    const totalSpent = guestBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    
    // Find most recent and next stay
    const sortedBookings = [...guestBookings].sort((a, b) => 
      new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()
    );
    
    const lastStay = sortedBookings[0]?.checkInDate || '';
    const nextStay = sortedBookings.find(b => new Date(b.checkInDate) > new Date())?.checkInDate;
    
    guestReports.push({
      guestId,
      name: guestData?.name || 'Unknown Guest',
      email: guestData?.email || 'No email',
      phone: guestData?.phone || 'No phone',
      totalStays,
      totalNights,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      lastStay,
      nextStay,
      averageRating: guestData?.averageRating
    });
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
      const date = new Date(booking.updatedAt || booking.bookingDate).toISOString().split('T')[0];
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
