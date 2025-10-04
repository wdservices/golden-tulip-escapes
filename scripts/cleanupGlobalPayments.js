import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function clearCollection(collectionName) {
  const collectionRef = db.collection(collectionName);
  const query = collectionRef.limit(500);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function cleanupGlobalPayments() {
  console.log('🧹 Starting cleanup of global payments collection...');
  
  try {
    // Check if global payments collection has any documents
    const paymentsSnapshot = await db.collection('payments').limit(1).get();
    
    if (paymentsSnapshot.empty) {
      console.log('✅ Global payments collection is already empty or doesn\'t exist.');
      return;
    }
    
    console.log('📋 Found documents in global payments collection. Cleaning up...');
    
    // Clear the global payments collection
    await clearCollection('payments');
    
    console.log('✅ Global payments collection cleanup completed!');
    console.log('💡 All payment data is now properly stored in branch subcollections:');
    console.log('   - branches/{branchId}/payments');
    console.log('   - This provides better organization and security');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupGlobalPayments()
  .then(() => {
    console.log('\n🎉 Cleanup process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });