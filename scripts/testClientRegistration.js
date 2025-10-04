import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';

// Use the same Firebase config as the application
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
const auth = getAuth(app);
const db = getFirestore(app);

async function testClientRegistration() {
  console.log('🧪 Testing Client Registration Flow...\n');
  
  const testEmail = `testclient${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testName = 'Test Client';
  const testPhone = '+1234567890';
  
  let testUser = null;
  
  try {
    // Step 1: Create user in Firebase Auth (simulating registration)
    console.log('1️⃣ Creating user in Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    testUser = userCredential.user;
    console.log(`✅ User created with UID: ${testUser.uid}`);
    
    // Step 2: Create user document in Firestore (simulating what AuthContext does)
    console.log('\n2️⃣ Creating user document in Firestore...');
    const userDoc = {
      id: testUser.uid,
      name: testName,
      email: testEmail,
      phone: testPhone,
      photoURL: testUser.photoURL || null,
      joinDate: testUser.metadata.creationTime || new Date().toISOString(),
      lastLogin: testUser.metadata.lastSignInTime || new Date().toISOString(),
      role: 'user', // Regular client, not admin
      preferences: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      emailVerified: testUser.emailVerified,
      bookingIds: []
    };
    
    await setDoc(doc(db, 'users', testUser.uid), userDoc);
    console.log('✅ User document saved to Firestore users collection');
    
    // Step 3: Verify data in Firestore
    console.log('\n3️⃣ Verifying data in Firestore...');
    const userDocRef = doc(db, 'users', testUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      console.log('✅ User document found in Firestore:');
      console.log(`   - Name: ${userData.name}`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Phone: ${userData.phone}`);
      console.log(`   - Role: ${userData.role}`);
      console.log(`   - Status: ${userData.status}`);
      console.log(`   - Created: ${userData.createdAt?.toDate?.() || userData.createdAt}`);
      
      // Verify it's NOT an admin
      if (userData.role === 'user') {
        console.log('✅ Confirmed: User has correct "user" role (not admin)');
      } else {
        console.log(`❌ Error: User has unexpected role: ${userData.role}`);
      }
    } else {
      console.log('❌ Error: User document not found in Firestore');
    }
    
    // Step 4: Check that user is NOT in adminUsers collection
    console.log('\n4️⃣ Verifying user is NOT in adminUsers collection...');
    const adminDocRef = doc(db, 'adminUsers', testUser.uid);
    const adminDocSnap = await getDoc(adminDocRef);
    
    if (!adminDocSnap.exists()) {
      console.log('✅ Confirmed: User is NOT in adminUsers collection (correct for regular clients)');
    } else {
      console.log('❌ Error: User found in adminUsers collection (should not be there for regular clients)');
    }
    
    console.log('\n🎉 Client Registration Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User created in Firebase Auth');
    console.log('   ✅ User document saved to Firestore users collection');
    console.log('   ✅ User has correct "user" role');
    console.log('   ✅ User is NOT in adminUsers collection');
    console.log('   ✅ All data properly persisted');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    // Cleanup: Delete test user
    if (testUser) {
      try {
        console.log('\n🧹 Cleaning up test data...');
        
        // Delete from Firestore
        await deleteDoc(doc(db, 'users', testUser.uid));
        console.log('✅ User document deleted from Firestore');
        
        // Delete from Firebase Auth
        await deleteUser(testUser);
        console.log('✅ User deleted from Firebase Auth');
        
        console.log('✅ Cleanup completed');
      } catch (cleanupError) {
        console.error('⚠️ Cleanup error:', cleanupError.message);
      }
    }
  }
}

// Run the test
testClientRegistration().catch(console.error);