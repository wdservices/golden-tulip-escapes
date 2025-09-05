import { Booking, UserBookingStats } from "@/types/booking";
import { User } from "@/types/auth";

// Mock user profile data
export const mockUserProfile: User = {
  id: "user-123",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  joinDate: "2023-01-15T10:30:00Z",
  lastLogin: new Date().toISOString(),
  preferences: {
    roomType: "Deluxe King",
    floorPreference: "High floor",
    specialNeeds: ["Late checkout", "Extra towels"]
  }
};

// Mock booking history
export const mockBookings: Booking[] = [
  {
    id: "book-001",
    userId: "user-123",
    branchId: "branch-nyc",
    branchName: "Golden Tulip New York",
    roomType: "Deluxe King",
    checkInDate: "2024-03-15T14:00:00Z",
    checkOutDate: "2024-03-20T11:00:00Z",
    status: "completed",
    totalAmount: 1250.00,
    paymentStatus: "paid",
    bookingDate: "2024-02-10T08:30:00Z",
    guests: 2,
    specialRequests: "High floor with city view"
  },
  {
    id: "book-002",
    userId: "user-123",
    branchId: "branch-paris",
    branchName: "Golden Tulip Paris",
    roomType: "Executive Suite",
    checkInDate: "2024-06-10T15:00:00Z",
    checkOutDate: "2024-06-17T11:00:00Z",
    status: "confirmed",
    totalAmount: 2100.00,
    paymentStatus: "paid",
    bookingDate: "2024-05-01T10:15:00Z",
    guests: 2,
    specialRequests: "Anniversary celebration"
  },
  {
    id: "book-003",
    userId: "user-123",
    branchId: "branch-nyc",
    branchName: "Golden Tulip New York",
    roomType: "Deluxe King",
    checkInDate: "2024-12-20T16:00:00Z",
    checkOutDate: "2024-12-27T11:00:00Z",
    status: "confirmed",
    totalAmount: 1800.00,
    paymentStatus: "pending",
    bookingDate: "2024-11-15T14:30:00Z",
    guests: 2,
    specialRequests: "Early check-in if possible"
  }
];

// Calculate user booking statistics
export const getUserBookingStats = (userId: string): UserBookingStats => {
  const userBookings = mockBookings.filter(booking => booking.userId === userId);
  const completedBookings = userBookings.filter(b => b.status === 'completed');
  
  // Calculate total nights
  const totalNights = completedBookings.reduce((total, booking) => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return total + diffDays;
  }, 0);

  // Find favorite branch
  const branchCounts = completedBookings.reduce((acc, booking) => {
    acc[booking.branchId] = (acc[booking.branchId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const favoriteBranch = Object.entries(branchCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const favoriteBranchName = completedBookings.find(b => b.branchId === favoriteBranch)?.branchName;

  // Find upcoming stay
  const now = new Date();
  const upcomingStay = userBookings
    .filter(b => new Date(b.checkInDate) > now && b.status === 'confirmed')
    .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())[0];

  return {
    totalBookings: userBookings.length,
    totalNights,
    favoriteBranch: favoriteBranchName,
    lastStay: completedBookings[0]?.checkOutDate,
    upcomingStay: upcomingStay ? {
      checkIn: upcomingStay.checkInDate,
      checkOut: upcomingStay.checkOutDate,
      branch: upcomingStay.branchName
    } : undefined
  };
};

// Get user profile with stats
export const getUserProfile = (userId: string): { profile: User; stats: UserBookingStats } => {
  const profile = mockUserProfile;
  const stats = getUserBookingStats(userId);
  return { profile, stats };
};
