import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration (matching the main app config)
const firebaseConfig = {
  apiKey: "AIzaSyBqcue6P_Gcl8E9mGLsxDLdJRlSAbSwVoI",
  authDomain: "golden-tulip-34749.firebaseapp.com",
  projectId: "golden-tulip-34749",
  storageBucket: "golden-tulip-34749.firebasestorage.app",
  messagingSenderId: "101687023536",
  appId: "1:101687023536:web:5ecb99a06a824ca219e875"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample user data
const sampleUsers = [
  {
    id: 'user1',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    phoneNumber: '+1234567890',
    emailVerified: true,
    status: 'active',
    role: 'user',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    lastSignInAt: new Date('2024-01-20'),
    bookingIds: ['booking1', 'booking2']
  },
  {
    id: 'user2',
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    phoneNumber: '+1987654321',
    emailVerified: true,
    status: 'active',
    role: 'user',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    lastSignInAt: new Date('2024-01-18'),
    bookingIds: ['booking3']
  },
  {
    id: 'user3',
    email: 'mike.johnson@example.com',
    displayName: 'Mike Johnson',
    phoneNumber: '+1555123456',
    emailVerified: false,
    status: 'active',
    role: 'user',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    lastSignInAt: null,
    bookingIds: []
  },
  {
    id: 'user4',
    email: 'sarah.wilson@example.com',
    displayName: 'Sarah Wilson',
    phoneNumber: '+1444987654',
    emailVerified: true,
    status: 'active',
    role: 'user',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19'),
    lastSignInAt: new Date('2024-01-19'),
    bookingIds: ['booking4', 'booking5', 'booking6']
  },
  {
    id: 'user5',
    email: 'admin@goldentulip.com',
    displayName: 'Admin User',
    phoneNumber: '+1333555777',
    emailVerified: true,
    status: 'active',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-21'),
    lastSignInAt: new Date('2024-01-21'),
    bookingIds: []
  }
];

async function addSampleUsers() {
  try {
    console.log('Adding sample users to Firestore...');
    
    for (const user of sampleUsers) {
      // Use setDoc with specific document ID to ensure consistent IDs
      await setDoc(doc(db, 'users', user.id), user);
      console.log(`✅ Added user: ${user.displayName} (${user.email})`);
    }
    
    console.log('🎉 All sample users added successfully!');
    console.log('You can now view them on the clients page.');
    
  } catch (error) {
    console.error('❌ Error adding sample users:', error);
  }
}

// Run the script
addSampleUsers().then(() => {
  console.log('Script completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});