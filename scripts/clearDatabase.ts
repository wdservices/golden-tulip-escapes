import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLhJJQNJQNJQNJQNJQNJQNJQNJQNJQNJQ",
  authDomain: "golden-tulip-34749.firebaseapp.com",
  projectId: "golden-tulip-34749",
  storageBucket: "golden-tulip-34749.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(collectionName: string) {
  console.log(`Clearing collection: ${collectionName}`);
  
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    if (querySnapshot.empty) {
      console.log(`Collection ${collectionName} is already empty.`);
      return;
    }

    const batch = writeBatch(db);
    let count = 0;

    querySnapshot.forEach((document) => {
      batch.delete(doc(db, collectionName, document.id));
      count++;
    });

    await batch.commit();
    console.log(`Successfully deleted ${count} documents from ${collectionName}`);
  } catch (error) {
    console.error(`Error clearing collection ${collectionName}:`, error);
  }
}

async function clearAllData() {
  console.log('Starting database cleanup...');
  
  // Collections to clear
  const collectionsToClean = [
    'bookings',
    'payments',
    'payment_logs',
    // Add other collections if needed, but be careful not to delete essential data
    // 'users', // Don't delete users
    // 'branches', // Don't delete branches
    // 'rooms', // Don't delete rooms
  ];

  for (const collectionName of collectionsToClean) {
    await clearCollection(collectionName);
  }

  console.log('Database cleanup completed!');
  console.log('The following collections have been cleared:');
  collectionsToClean.forEach(name => console.log(`- ${name}`));
  console.log('\nNow when real bookings are made, they will display properly in the admin dashboard.');
}

// Run the cleanup
clearAllData().catch(console.error);