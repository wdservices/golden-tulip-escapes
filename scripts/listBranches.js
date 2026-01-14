
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

async function listBranches() {
  console.log(`Listing branches...`);
  try {
    const branchesRef = collection(db, 'branches');
    const snapshot = await getDocs(branchesRef);
    
    if (snapshot.empty) {
      console.log('No branches found.');
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Branch ID: ${doc.id}`);
      console.log(`Name: ${data.name}`);
      console.log(`Full Name: ${data.fullName}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error fetching branches:', error);
  }
}

listBranches();
