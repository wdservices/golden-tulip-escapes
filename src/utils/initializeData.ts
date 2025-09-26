import { collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Sample room data
const sampleRooms = [
  {
    roomNumber: "101",
    type: "deluxe",
    pricePerNight: 45000,
    availability: true,
    amenities: ["WiFi", "Air Conditioning", "Mini Bar", "TV", "Room Service"],
    images: ["/images/rooms/deluxe-1.jpg", "/images/rooms/deluxe-2.jpg"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    roomNumber: "102",
    type: "deluxe",
    pricePerNight: 45000,
    availability: false,
    amenities: ["WiFi", "Air Conditioning", "Mini Bar", "TV", "Room Service"],
    images: ["/images/rooms/deluxe-1.jpg", "/images/rooms/deluxe-2.jpg"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    roomNumber: "201",
    type: "executive",
    pricePerNight: 75000,
    availability: true,
    amenities: ["WiFi", "Air Conditioning", "Mini Bar", "TV", "Room Service", "Balcony", "Work Desk"],
    images: ["/images/rooms/executive-1.jpg", "/images/rooms/executive-2.jpg"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    roomNumber: "301",
    type: "presidential",
    pricePerNight: 150000,
    availability: true,
    amenities: ["WiFi", "Air Conditioning", "Mini Bar", "TV", "Room Service", "Balcony", "Work Desk", "Jacuzzi", "Butler Service"],
    images: ["/images/rooms/presidential-1.jpg", "/images/rooms/presidential-2.jpg"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    roomNumber: "103",
    type: "standard",
    pricePerNight: 25000,
    availability: true,
    amenities: ["WiFi", "Air Conditioning", "TV"],
    images: ["/images/rooms/standard-1.jpg", "/images/rooms/standard-2.jpg"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample booking data
const sampleBookings = [
  {
    userId: "sample-user-1",
    branchId: "main",
    branchName: "Golden Tulip GRA",
    roomType: "deluxe",
    checkInDate: Timestamp.fromDate(new Date('2024-01-15')),
    checkOutDate: Timestamp.fromDate(new Date('2024-01-20')),
    status: 'completed',
    totalAmount: 225000,
    paymentStatus: 'paid',
    bookingDate: Timestamp.fromDate(new Date('2024-01-10')),
    guests: 2,
    nights: 5,
    guestName: "John Doe",
    guestEmail: "john.doe@example.com",
    guestPhone: "+234 801 234 5678",
    specialRequests: "Late checkout requested",
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
    paymentMethod: 'flutterwave',
    paymentDate: Timestamp.fromDate(new Date('2024-01-10')),
    transactionId: 'tx_sample_001'
  },
  {
    userId: "sample-user-2",
    branchId: "main",
    branchName: "Golden Tulip GRA",
    roomType: "executive",
    checkInDate: Timestamp.fromDate(new Date('2024-01-25')),
    checkOutDate: Timestamp.fromDate(new Date('2024-01-28')),
    status: 'confirmed',
    totalAmount: 225000,
    paymentStatus: 'paid',
    bookingDate: Timestamp.fromDate(new Date('2024-01-20')),
    guests: 2,
    nights: 3,
    guestName: "Jane Smith",
    guestEmail: "jane.smith@example.com",
    guestPhone: "+234 802 345 6789",
    specialRequests: "High floor preferred",
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
    paymentMethod: 'flutterwave',
    paymentDate: Timestamp.fromDate(new Date('2024-01-20')),
    transactionId: 'tx_sample_002'
  },
  {
    userId: "sample-user-3",
    branchId: "main",
    branchName: "Golden Tulip GRA",
    roomType: "presidential",
    checkInDate: Timestamp.fromDate(new Date('2024-02-01')),
    checkOutDate: Timestamp.fromDate(new Date('2024-02-03')),
    status: 'pending',
    totalAmount: 300000,
    paymentStatus: 'pending',
    bookingDate: Timestamp.fromDate(new Date('2024-01-28')),
    guests: 2,
    nights: 2,
    guestName: "Michael Johnson",
    guestEmail: "michael.johnson@example.com",
    guestPhone: "+234 803 456 7890",
    specialRequests: "Anniversary celebration",
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
    paymentMethod: 'pending',
    transactionId: 'tx_sample_003'
  }
];

// Sample branch data
const sampleBranch = {
  id: "main",
  name: "Golden Tulip GRA",
  address: "123 GRA Phase 2, Port Harcourt, Rivers State",
  email: "gra@goldentulip.com",
  phone: "+234 84 123 4567",
  location: "Port Harcourt GRA",
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const initializeSampleData = async () => {
  try {
    console.log('Starting data initialization...');

    // 1. Create branch first
    await setDoc(doc(db, 'branches', 'main'), sampleBranch);
    console.log('Branch created successfully');

    // 2. Add rooms to the branch
    for (const room of sampleRooms) {
      await addDoc(collection(db, 'branches', 'main', 'rooms'), room);
    }
    console.log(`${sampleRooms.length} rooms added successfully`);

    // 3. Add bookings
    for (const booking of sampleBookings) {
      await addDoc(collection(db, 'bookings'), booking);
    }
    console.log(`${sampleBookings.length} bookings added successfully`);

    console.log('Sample data initialization completed!');
    return { success: true, message: 'Sample data added successfully' };
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return { success: false, error: error };
  }
};

export const checkDataExists = async () => {
  try {
    // This is a simple check - in a real app you'd query the collections
    console.log('Checking if data exists...');
    return { hasData: false }; // For now, assume no data exists
  } catch (error) {
    console.error('Error checking data:', error);
    return { hasData: false };
  }
};