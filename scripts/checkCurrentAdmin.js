import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBqcue6P_Gcl8E9mGLsxDLdJRlSAbSwVoI",
  authDomain: "golden-tulip-34749.firebaseapp.com",
  projectId: "golden-tulip-34749",
  storageBucket: "golden-tulip-34749.firebasestorage.app",
  messagingSenderId: "101687023536",
  appId: "1:101687023536:web:5ecb99a06a824ca219e875"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCurrentAdmin() {
  try {
    console.log('🔍 Checking current admin configuration...');
    
    // Check the user who made the booking
    const userId = 'IQKSYR7043diVAdUrkYaTO2Iw7K2';
    console.log(`\n👤 Checking user: ${userId}`);
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ User found:');
      console.log(`   Email: ${userData.email}`);
      console.log(`   Name: ${userData.name}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Branch: ${userData.branch || 'Not set'}`);
      
      // Check admin email configuration for this user
      if (userData.email) {
        console.log(`\n🔍 Checking admin email config for: ${userData.email}`);
        const adminEmailQuery = query(
          collection(db, 'adminEmails'),
          where('email', '==', userData.email.toLowerCase())
        );
        
        const adminEmailSnapshot = await getDocs(adminEmailQuery);
        if (!adminEmailSnapshot.empty) {
          const adminEmailDoc = adminEmailSnapshot.docs[0];
          const adminEmailData = adminEmailDoc.data();
          console.log('✅ Admin email config found:');
          console.log(`   Email: ${adminEmailData.email}`);
          console.log(`   Branch ID: ${adminEmailData.branchId}`);
          console.log(`   Role: ${adminEmailData.role}`);
        } else {
          console.log('❌ No admin email configuration found');
          
          // Check all admin email configurations
          console.log('\n📋 All admin email configurations:');
          const allAdminEmails = await getDocs(collection(db, 'adminEmails'));
          if (allAdminEmails.empty) {
            console.log('   No admin email configurations exist!');
          } else {
            allAdminEmails.forEach((doc) => {
              const data = doc.data();
              console.log(`   - ${data.email} -> ${data.branchId} (${data.role})`);
            });
          }
        }
      }
    } else {
      console.log('❌ User not found');
    }
    
    // Check the branch where the booking was created
    console.log('\n🏢 Checking branch URcvGkmbfrOFInlOS4I9 (where booking was created):');
    const branchDoc = await getDoc(doc(db, 'branches', 'URcvGkmbfrOFInlOS4I9'));
    if (branchDoc.exists()) {
      const branchData = branchDoc.data();
      console.log('✅ Branch found:');
      console.log(`   Name: ${branchData.name}`);
      console.log(`   Location: ${branchData.location}`);
      console.log(`   Admin Email: ${branchData.adminEmail || 'Not set'}`);
    } else {
      console.log('❌ Branch not found');
    }
    
    // Check bookings in this branch
    console.log('\n📋 Checking bookings in branch URcvGkmbfrOFInlOS4I9:');
    const bookingsSnapshot = await getDocs(collection(db, 'branches', 'URcvGkmbfrOFInlOS4I9', 'bookings'));
    console.log(`   Found ${bookingsSnapshot.size} bookings`);
    
    bookingsSnapshot.forEach((doc) => {
      const booking = doc.data();
      console.log(`   - ${doc.id}: ${booking.guestName} (${booking.status})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking current admin:', error);
  }
}

checkCurrentAdmin().then(() => {
  console.log('\n✅ Check completed');
}).catch(error => {
  console.error('❌ Script failed:', error);
});