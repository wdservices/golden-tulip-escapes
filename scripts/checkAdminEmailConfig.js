import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function checkAdminEmailConfig() {
  try {
    console.log('🔍 Checking admin email configurations...');
    
    // Check for Stadium Road admin email
    const stadiumAdminEmail = 'reservationsgt@rivotels.com';
    const q = query(
      collection(db, 'adminEmails'),
      where('email', '==', stadiumAdminEmail)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No admin email configuration found for:', stadiumAdminEmail);
      
      // Check all admin email configurations
      const allAdmins = await getDocs(collection(db, 'adminEmails'));
      console.log('\n📋 All admin email configurations:');
      allAdmins.forEach((doc) => {
        const data = doc.data();
        console.log(`  - Email: ${data.email}`);
        console.log(`    Branch ID: ${data.branchId}`);
        console.log(`    Role: ${data.role}`);
        console.log('');
      });
      
      if (allAdmins.empty) {
        console.log('  No admin email configurations found at all!');
      }
      
      console.log('\n💡 SOLUTION: Need to create admin email configuration for Stadium Road');
      console.log('   The admin email should map to the correct Firestore branch ID: UShvwSYpMNpuNaS32MxZ');
      
    } else {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      console.log('✅ Found admin email configuration:');
      console.log(`  - Email: ${data.email}`);
      console.log(`  - Branch ID: ${data.branchId}`);
      console.log(`  - Role: ${data.role}`);
      
      if (data.branchId !== 'UShvwSYpMNpuNaS32MxZ') {
        console.log('\n⚠️  WARNING: Branch ID mismatch!');
        console.log(`   Admin config uses: ${data.branchId}`);
        console.log(`   But Firestore branch ID is: UShvwSYpMNpuNaS32MxZ`);
        console.log('   This is why the booking is not showing up in the admin dashboard!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking admin email config:', error);
  }
}

checkAdminEmailConfig().then(() => {
  console.log('Check completed');
}).catch(error => {
  console.error('Script failed:', error);
});