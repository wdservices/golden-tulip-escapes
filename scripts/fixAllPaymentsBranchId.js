import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = join(__dirname, '../service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixAllPaymentsBranchId() {
  try {
    console.log('🔧 Fixing all payments to add branchId field...');
    console.log('=====================================================');
    
    let totalFixed = 0;
    let totalSkipped = 0;
    
    // Get all branches
    const branchesSnapshot = await db.collection('branches').get();
    console.log(`Found ${branchesSnapshot.size} branches`);
    
    for (const branchDoc of branchesSnapshot.docs) {
      const branchId = branchDoc.id;
      const branchName = branchDoc.data().name;
      
      console.log(`\n📍 Processing branch: ${branchName} (${branchId})`);
      
      // Get all bookings for this branch
      const bookingsSnapshot = await db
        .collection('branches')
        .doc(branchId)
        .collection('bookings')
        .get();
      
      console.log(`  Found ${bookingsSnapshot.size} bookings`);
      
      for (const bookingDoc of bookingsSnapshot.docs) {
        const bookingId = bookingDoc.id;
        
        // Get payments for this booking
        const paymentsSnapshot = await db
          .collection('branches')
          .doc(branchId)
          .collection('bookings')
          .doc(bookingId)
          .collection('payments')
          .get();
        
        if (paymentsSnapshot.size > 0) {
          console.log(`  Booking ${bookingId} has ${paymentsSnapshot.size} payments`);
          
          for (const paymentDoc of paymentsSnapshot.docs) {
            const paymentData = paymentDoc.data();
            
            if (!paymentData.branchId) {
              // Add branchId to payment
              await paymentDoc.ref.update({
                branchId: branchId,
                updatedAt: new Date()
              });
              
              console.log(`    ✅ Fixed payment ${paymentDoc.id}`);
              totalFixed++;
            } else {
              console.log(`    ⏭️  Skipped payment ${paymentDoc.id} (already has branchId)`);
              totalSkipped++;
            }
          }
        }
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`  Total payments fixed: ${totalFixed}`);
    console.log(`  Total payments skipped: ${totalSkipped}`);
    
    console.log('\n🎯 Next step: Create the Firestore composite index');
    console.log('   Go to Firebase Console and create this index:');
    console.log('   Collection: payments (collection group)');
    console.log('   Fields: branchId (Ascending), createdAt (Descending)');
    console.log('   URL: https://console.firebase.google.com/v1/r/project/golden-tulip-34749/firestore/indexes?create_composite=ClNwcm9qZWN0cy9nb2xkZW4tdHVsaXAtMzQ3NDkvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3BheW1lbnRzL2luZGV4ZXMvXxACGgwKCGJyYW5jaElkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg');
    
  } catch (error) {
    console.error('❌ Error fixing payments:', error);
  }
}

fixAllPaymentsBranchId().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});