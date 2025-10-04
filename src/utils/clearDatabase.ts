import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function clearCollection(collectionName: string) {
  console.log(`Clearing collection: ${collectionName}`);
  
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    if (querySnapshot.empty) {
      console.log(`Collection ${collectionName} is already empty.`);
      return 0;
    }

    const batch = writeBatch(db);
    let count = 0;

    querySnapshot.forEach((document) => {
      batch.delete(doc(db, collectionName, document.id));
      count++;
    });

    await batch.commit();
    console.log(`Successfully deleted ${count} documents from ${collectionName}`);
    return count;
  } catch (error) {
    console.error(`Error clearing collection ${collectionName}:`, error);
    throw error;
  }
}

export async function clearBookingData() {
  console.log('🧹 Starting database cleanup...');
  
  // Collections to clear - only booking-related data
  const collectionsToClean = [
    'bookings', // Legacy global bookings (if any remain)
    'payment_logs' // Global payment logs for system debugging
    // Note: payments are now stored as subcollections under bookings (branches/{branchId}/bookings/{bookingId}/payments)
  ];

  let totalDeleted = 0;

  for (const collectionName of collectionsToClean) {
    try {
      const deleted = await clearCollection(collectionName);
      totalDeleted += deleted;
    } catch (error) {
      console.error(`Failed to clear ${collectionName}:`, error);
    }
  }

  console.log('\n✅ Database cleanup completed!');
  console.log(`Total documents deleted: ${totalDeleted}`);
  console.log('The following collections have been cleared:');
  collectionsToClean.forEach(name => console.log(`- ${name}`));
  console.log('\n🎉 Now when real bookings are made through the payment system, they will display properly in the admin dashboard.');
  
  return totalDeleted;
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).clearBookingData = clearBookingData;
  (window as any).clearCollection = clearCollection;
}