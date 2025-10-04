import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert('./service-account.json'),
  });
}

const db = getFirestore();

async function findUserByEmail() {
  try {
    console.log('🔍 Looking for user with email: spellz49@gmail.com');
    
    // Get all users and find the one with matching email
    const usersSnapshot = await db.collection('users').get();
    
    let foundUser = null;
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email === 'spellz49@gmail.com') {
        foundUser = {
          uid: doc.id,
          ...data
        };
      }
    });
    
    if (foundUser) {
      console.log('✅ Found user:');
      console.log('   UID:', foundUser.uid);
      console.log('   Email:', foundUser.email);
      console.log('   Name:', foundUser.name);
      console.log('   Role:', foundUser.role);
      
      // Check if this UID matches any booking UIDs
      const bookingUIDs = ['32C17pYhpD5xuaf1RcSq', 'IQKSYR7043diVAdUrkYaTO2Iw7K2'];
      const isMatch = bookingUIDs.includes(foundUser.uid);
      console.log('   Matches booking UID:', isMatch);
      
      if (!isMatch) {
        console.log('❌ User UID does not match booking UIDs');
        console.log('   User UID:', foundUser.uid);
        console.log('   Booking UIDs:', bookingUIDs);
        console.log('\n💡 This explains why total stays shows 0!');
        console.log('   The user account and the bookings have different UIDs.');
      } else {
        console.log('✅ User UID matches booking data!');
      }
    } else {
      console.log('❌ No user found with email: spellz49@gmail.com');
      console.log('   This means the user needs to be created or logged in.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findUserByEmail();