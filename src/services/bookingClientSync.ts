import { db } from '@/lib/firebase';
import { collection, query, getDocs, setDoc, doc, where, updateDoc, getDoc } from 'firebase/firestore';
import { Booking } from '@/types/booking';

/**
 * Extracts client information from bookings and creates/updates user profiles
 * This ensures that clients who make bookings appear in the users collection
 */
export const syncBookingClientsWithUsers = async (branchId?: string): Promise<{ created: number; updated: number; errors: string[] }> => {
  const results = { created: 0, updated: 0, errors: [] as string[] };
  
  try {
    console.log('🔄 Starting booking clients sync for branch:', branchId);
    
    let allBookings: Booking[] = [];
    
    if (branchId) {
      // Get bookings for specific branch - try both static and Firestore paths
      console.log('📍 Processing specific branch:', branchId);
      
      // Try as Firestore branch document ID first
      try {
        const bookingsQuery = query(
          collection(db, 'branches', branchId, 'bookings'),
          where('guestEmail', '!=', null)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookings = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Booking));
        allBookings.push(...bookings);
        console.log(`✅ Found ${bookings.length} bookings from Firestore branch ${branchId}`);
      } catch (firestoreError) {
        console.warn(`⚠️ Could not fetch bookings from Firestore branch ${branchId}:`, firestoreError);
      }
      
      // If no bookings found and it's a static branch ID, try static path
      if (allBookings.length === 0 && ['evo-road', 'stadium-31', 'garden-city', 'evergreen'].includes(branchId)) {
        try {
          const bookingsQuery = query(
            collection(db, 'branches', branchId, 'bookings'),
            where('guestEmail', '!=', null)
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);
          const bookings = bookingsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Booking));
          allBookings.push(...bookings);
          console.log(`✅ Found ${bookings.length} bookings from static branch ${branchId}`);
        } catch (staticError) {
          console.warn(`⚠️ Could not fetch bookings from static branch ${branchId}:`, staticError);
        }
      }
    } else {
      // Get all bookings from all branches - query both static and try to discover Firestore branches
      console.log('📍 Processing all branches');
      
      // Try static branches first
      const staticBranches = ['evo-road', 'stadium-31', 'garden-city', 'evergreen'];
      for (const branch of staticBranches) {
        try {
          const branchBookingsQuery = query(
            collection(db, 'branches', branch, 'bookings'),
            where('guestEmail', '!=', null)
          );
          const branchSnapshot = await getDocs(branchBookingsQuery);
          const branchBookings = branchSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Booking));
          allBookings.push(...branchBookings);
          console.log(`✅ Found ${branchBookings.length} bookings from static branch ${branch}`);
        } catch (error) {
          console.warn(`⚠️ Could not fetch bookings for static branch ${branch}:`, error);
        }
      }
      
      // Also try to discover and query any Firestore branches
      try {
        const branchesCollection = collection(db, 'branches');
        const branchesSnapshot = await getDocs(branchesCollection);
        const firestoreBranches = branchesSnapshot.docs.map(doc => doc.id);
        
        for (const branchId of firestoreBranches) {
          if (!staticBranches.includes(branchId)) {
            try {
              const branchBookingsQuery = query(
                collection(db, 'branches', branchId, 'bookings'),
                where('guestEmail', '!=', null)
              );
              const branchSnapshot = await getDocs(branchBookingsQuery);
              const branchBookings = branchSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              } as Booking));
              allBookings.push(...branchBookings);
              console.log(`✅ Found ${branchBookings.length} bookings from Firestore branch ${branchId}`);
            } catch (error) {
              console.warn(`⚠️ Could not fetch bookings for Firestore branch ${branchId}:`, error);
            }
          }
        }
      } catch (discoveryError) {
        console.warn('⚠️ Could not discover Firestore branches:', discoveryError);
      }
    }
    
    console.log(`📊 Total bookings found: ${allBookings.length}`);
    
    // Process all bookings
    for (const booking of allBookings) {
      try {
        const result = await processBookingClient(booking);
        if (result.status === 'created') results.created++;
        else if (result.status === 'updated') results.updated++;
        else if (result.error) results.errors.push(result.error);
      } catch (error) {
        results.errors.push(`Error processing booking ${booking.id}: ${error}`);
      }
    }
    
    console.log(`✅ Booking clients sync completed. Created: ${results.created}, Updated: ${results.updated}, Errors: ${results.errors.length}`);
    return results;
    
  } catch (error) {
    console.error('❌ Error in syncBookingClientsWithUsers:', error);
    results.errors.push(`Sync failed: ${error}`);
    return results;
  }
};

/**
 * Process a single booking and create/update user profile
 */
const processBookingClient = async (booking: Booking): Promise<{ status: 'created' | 'updated' | 'skipped'; error?: string }> => {
  try {
    if (!booking.guestEmail) {
      return { status: 'skipped' };
    }
    
    // Create user ID from email (consistent hashing)
    const userId = createUserIdFromEmail(booking.guestEmail);
    const userRef = doc(db, 'users', userId);
    
    // Check if user already exists
    const userSnapshot = await getDoc(userRef);
    const existingUser = userSnapshot.exists() ? userSnapshot.data() : null;
    
    // Prepare user data from booking
    const userData = {
      id: userId,
      uid: userId,
      email: booking.guestEmail,
      displayName: booking.guestName || booking.guestEmail.split('@')[0],
      phoneNumber: booking.guestPhone || '',
      emailVerified: true, // Assume verified since they made a booking
      role: 'user',
      status: 'active',
      branchId: booking.branchId,
      createdAt: existingUser?.createdAt || booking.bookingDate?.toDate() || new Date(),
      updatedAt: new Date(),
      lastSignInAt: booking.bookingDate?.toDate() || new Date(),
      bookingIds: existingUser?.bookingIds || [],
      // Add booking reference
      ...(existingUser?.bookingIds ? { 
        bookingIds: [...existingUser.bookingIds, booking.id] 
      } : { 
        bookingIds: [booking.id] 
      })
    };
    
    // Remove duplicates from bookingIds
    userData.bookingIds = [...new Set(userData.bookingIds)];
    
    if (existingUser) {
      // Update existing user
      await updateDoc(userRef, userData);
      console.log(`🔄 Updated user ${userId} from booking ${booking.id}`);
      return { status: 'updated' };
    } else {
      // Create new user
      await setDoc(userRef, userData);
      console.log(`✅ Created user ${userId} from booking ${booking.id}`);
      return { status: 'created' };
    }
    
  } catch (error) {
    console.error(`❌ Error processing booking client for booking ${booking.id}:`, error);
    return { status: 'skipped', error: `Processing failed: ${error}` };
  }
};

/**
 * Creates a consistent user ID from email address
 */
const createUserIdFromEmail = (email: string): string => {
  // Simple hash function to create consistent ID from email
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `booking-user-${Math.abs(hash)}`;
};

/**
 * Get client statistics from bookings
 */
export const getBookingClientStats = async (branchId?: string): Promise<{
  totalClients: number;
  uniqueEmails: number;
  clientsWithMultipleBookings: number;
  recentClients: number;
}> => {
  try {
    let allBookings: Booking[] = [];
    
    if (branchId) {
      const bookingsQuery = query(
        collection(db, 'branches', branchId, 'bookings'),
        where('guestEmail', '!=', null)
      );
      const snapshot = await getDocs(bookingsQuery);
      allBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } else {
      const branches = ['evo-road', 'stadium-31', 'garden-city', 'evergreen'];
      for (const branch of branches) {
        try {
          const bookingsQuery = query(
            collection(db, 'branches', branch, 'bookings'),
            where('guestEmail', '!=', null)
          );
          const snapshot = await getDocs(bookingsQuery);
          const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
          allBookings.push(...bookings);
        } catch (error) {
          console.warn(`⚠️ Could not fetch stats for branch ${branch}:`, error);
        }
      }
    }
    
    const uniqueEmails = new Set(allBookings.map(b => b.guestEmail).filter(Boolean));
    const emailBookingCounts = new Map<string, number>();
    
    allBookings.forEach(booking => {
      if (booking.guestEmail) {
        emailBookingCounts.set(booking.guestEmail, (emailBookingCounts.get(booking.guestEmail) || 0) + 1);
      }
    });
    
    const clientsWithMultipleBookings = Array.from(emailBookingCounts.values()).filter(count => count > 1).length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentClients = allBookings.filter(b => 
      b.bookingDate && b.bookingDate.toDate() >= thirtyDaysAgo
    ).length;
    
    return {
      totalClients: allBookings.length,
      uniqueEmails: uniqueEmails.size,
      clientsWithMultipleBookings,
      recentClients
    };
    
  } catch (error) {
    console.error('❌ Error getting booking client stats:', error);
    return {
      totalClients: 0,
      uniqueEmails: 0,
      clientsWithMultipleBookings: 0,
      recentClients: 0
    };
  }
};