import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_EMAILS_COLLECTION = 'adminEmails';

// Define admin emails
const adminEmails = [
  { 
    email: 'hello.goldentulip@gmail.com', 
    branchId: 'evo-road', 
    role: 'hq-admin' as const 
  },
  { 
    email: 'reservations@rivotelinternational.com', 
    branchId: 'evergreen', 
    role: 'branch-admin' as const 
  },
  { 
    email: 'fom@rivotels.com', 
    branchId: 'garden-city', 
    role: 'branch-admin' as const 
  },
  { 
    email: 'reservationsgt@rivotels.com', 
    branchId: 'stadium-31', 
    role: 'branch-admin' as const 
  }
];

async function initializeAdminEmails() {
  console.log('🚀 Starting admin email initialization...');
  
  try {
    for (const admin of adminEmails) {
      const emailLower = admin.email.toLowerCase();
      const emailId = emailLower.replace(/[^a-z0-9]/g, '_');
      const adminRef = doc(db, ADMIN_EMAILS_COLLECTION, emailId);
      
      // Check if admin already exists
      const adminDoc = await getDocs(query(collection(db, ADMIN_EMAILS_COLLECTION), where('email', '==', emailLower)));
      
      if (adminDoc.empty) {
        // Create new admin
        await setDoc(adminRef, {
          email: emailLower,
          branchId: admin.branchId,
          role: admin.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✅ Created admin: ${emailLower} (${admin.branchId})`);
      } else {
        // Update existing admin
        await setDoc(adminRef, {
          email: emailLower,
          branchId: admin.branchId,
          role: admin.role,
          updatedAt: new Date(),
        }, { merge: true });
        console.log(`✅ Updated admin: ${emailLower} (${admin.branchId})`);
      }
    }
    
    console.log('🎉 Admin email initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing admin emails:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeAdminEmails();
