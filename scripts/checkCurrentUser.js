import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ",
  authDomain: "golden-tulip-34749.firebaseapp.com",
  projectId: "golden-tulip-34749",
  storageBucket: "golden-tulip-34749.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log('🔍 Checking current user authentication...');

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('✅ User is signed in:');
    console.log('   UID:', user.uid);
    console.log('   Email:', user.email);
    console.log('   Display Name:', user.displayName);
    console.log('   Email Verified:', user.emailVerified);
    
    // Check if this UID matches any of the booking UIDs
    const bookingUIDs = ['32C17pYhpD5xuaf1RcSq', 'IQKSYR7043diVAdUrkYaTO2Iw7K2'];
    const isMatch = bookingUIDs.includes(user.uid);
    console.log('   Matches booking UID:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Current user UID does not match any booking UIDs');
      console.log('   Current UID:', user.uid);
      console.log('   Booking UIDs:', bookingUIDs);
    }
  } else {
    console.log('❌ No user is signed in');
  }
  
  process.exit(0);
});