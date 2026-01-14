
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listRooms(branchId) {
  console.log(`Listing rooms for branch: ${branchId}`);
  try {
    const roomsRef = collection(db, 'branches', branchId, 'rooms');
    const snapshot = await getDocs(roomsRef);
    
    if (snapshot.empty) {
      console.log(`No rooms found for ${branchId}.`);
      return;
    }

    const roomTypes = new Map();

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.type && data.pricePerNight) {
          if (!roomTypes.has(data.type)) {
              roomTypes.set(data.type, data.pricePerNight);
          }
      }
    });

    console.log(`Room Types and Prices in DB for ${branchId}:`);
    roomTypes.forEach((price, type) => {
        console.log(`${type}: ${price}`);
    });

  } catch (error) {
    console.error(`Error fetching rooms for ${branchId}:`, error);
  }
}

async function main() {
    await listRooms('evo-road');
    await listRooms('stadium-31');
}

main();
