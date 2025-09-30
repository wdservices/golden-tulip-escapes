import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// You'll need to replace this with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(collectionName) {
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
  
  // Collections to clear - only booking-related data
  const collectionsToClean = [
    'bookings',
    'payments', 
    'payment_logs'
  ];

  for (const collectionName of collectionsToClean) {
    await clearCollection(collectionName);
  }

  console.log('\n✅ Database cleanup completed!');
  console.log('The following collections have been cleared:');
  collectionsToClean.forEach(name => console.log(`- ${name}`));
  console.log('\n🎉 Now when real bookings are made through the payment system, they will display properly in the admin dashboard.');
  
  process.exit(0);
}

// Run the cleanup
clearAllData().catch((error) => {
  console.error('Error during cleanup:', error);
  process.exit(1);
});