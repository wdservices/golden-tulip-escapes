import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert('./service-account.json'),
  });
}

const db = getFirestore();

// Migration configuration
const COLLECTIONS_TO_MIGRATE = [
  {
    sourceCollection: 'payments',
    targetSubcollection: 'payments',
    branchIdField: 'branchId'
  },
  {
    sourceCollection: 'bookings', 
    targetSubcollection: 'bookings',
    branchIdField: 'branchId'
  }
];

// Function to get all available branch IDs
async function getAvailableBranches() {
  try {
    const branchesSnapshot = await db.collection('branches').get();
    const branchIds = branchesSnapshot.docs.map(doc => doc.id);
    console.log('Available branches:', branchIds);
    return branchIds;
  } catch (error) {
    console.error('Error fetching branches:', error);
    // Fallback to known branch IDs
    return ['evo-road', 'garden-city', 'stadium-31', 'evergreen'];
  }
}

// Function to migrate a single collection to branch subcollections
async function migrateCollection(sourceCollection, targetSubcollection, branchIdField) {
  console.log(`\n=== Migrating ${sourceCollection} to branch subcollections ===`);
  
  try {
    // Get all documents from source collection
    const sourceSnapshot = await db.collection(sourceCollection).get();
    
    if (sourceSnapshot.empty) {
      console.log(`No documents found in ${sourceCollection} collection`);
      return { migrated: 0, errors: 0 };
    }

    console.log(`Found ${sourceSnapshot.docs.length} documents in ${sourceCollection}`);
    
    let migratedCount = 0;
    let errorCount = 0;
    const batchSize = 500; // Firestore batch limit
    let batch = db.batch();
    let batchCount = 0;

    for (const docSnapshot of sourceSnapshot.docs) {
      try {
        const data = docSnapshot.data();
        const branchId = data[branchIdField];
        
        if (!branchId) {
          console.warn(`Document ${docSnapshot.id} has no ${branchIdField}, skipping`);
          errorCount++;
          continue;
        }

        // Create reference to new location in branch subcollection
        const newDocRef = db.collection('branches').doc(branchId).collection(targetSubcollection).doc(docSnapshot.id);
        
        // Add to batch
        batch.set(newDocRef, {
          ...data,
          migratedAt: new Date().toISOString(),
          originalCollection: sourceCollection
        });
        
        batchCount++;
        
        // Execute batch when it reaches the limit
        if (batchCount >= batchSize) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} documents`);
          batch = db.batch();
          batchCount = 0;
        }
        
        migratedCount++;
        
        if (migratedCount % 100 === 0) {
          console.log(`Migrated ${migratedCount} documents...`);
        }
        
      } catch (error) {
        console.error(`Error migrating document ${docSnapshot.id}:`, error);
        errorCount++;
      }
    }
    
    // Commit remaining documents in batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} documents`);
    }
    
    console.log(`Migration completed for ${sourceCollection}:`);
    console.log(`- Migrated: ${migratedCount} documents`);
    console.log(`- Errors: ${errorCount} documents`);
    
    return { migrated: migratedCount, errors: errorCount };
    
  } catch (error) {
    console.error(`Error migrating ${sourceCollection}:`, error);
    return { migrated: 0, errors: 1 };
  }
}

// Function to verify migration by counting documents
async function verifyMigration(branchIds, subcollectionName) {
  console.log(`\n=== Verifying ${subcollectionName} migration ===`);
  
  for (const branchId of branchIds) {
    try {
      const subcollectionSnapshot = await db.collection('branches').doc(branchId).collection(subcollectionName).get();
      console.log(`Branch ${branchId}: ${subcollectionSnapshot.docs.length} documents in ${subcollectionName}`);
    } catch (error) {
      console.error(`Error verifying ${branchId}/${subcollectionName}:`, error);
    }
  }
}

// Function to create backup of original collections (optional)
async function createBackup(collectionName) {
  console.log(`\n=== Creating backup of ${collectionName} ===`);
  
  try {
    const sourceSnapshot = await db.collection(collectionName).get();
    const backupCollectionName = `${collectionName}_backup_${Date.now()}`;
    
    let batch = db.batch();
    let batchCount = 0;
    
    for (const docSnapshot of sourceSnapshot.docs) {
      const backupDocRef = db.collection(backupCollectionName).doc(docSnapshot.id);
      batch.set(backupDocRef, {
        ...docSnapshot.data(),
        backedUpAt: new Date().toISOString()
      });
      
      batchCount++;
      
      if (batchCount >= 500) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log(`Backup created: ${backupCollectionName} with ${sourceSnapshot.docs.length} documents`);
    return backupCollectionName;
    
  } catch (error) {
    console.error(`Error creating backup for ${collectionName}:`, error);
    return null;
  }
}

// Main migration function
async function migrateToBranchSubcollections() {
  console.log('🚀 Starting migration to branch-based subcollections...\n');
  
  try {
    // Get available branches
    const branchIds = await getAvailableBranches();
    
    if (branchIds.length === 0) {
      console.error('No branches found! Please ensure branches collection exists.');
      return;
    }
    
    // Create backups (optional - comment out if not needed)
    console.log('Creating backups of original collections...');
    for (const config of COLLECTIONS_TO_MIGRATE) {
      await createBackup(config.sourceCollection);
    }
    
    // Migrate each collection
    const migrationResults = {};
    
    for (const config of COLLECTIONS_TO_MIGRATE) {
      const result = await migrateCollection(
        config.sourceCollection,
        config.targetSubcollection,
        config.branchIdField
      );
      migrationResults[config.sourceCollection] = result;
    }
    
    // Verify migrations
    console.log('\n=== Verification Phase ===');
    for (const config of COLLECTIONS_TO_MIGRATE) {
      await verifyMigration(branchIds, config.targetSubcollection);
    }
    
    // Summary
    console.log('\n=== Migration Summary ===');
    let totalMigrated = 0;
    let totalErrors = 0;
    
    for (const [collection, result] of Object.entries(migrationResults)) {
      console.log(`${collection}: ${result.migrated} migrated, ${result.errors} errors`);
      totalMigrated += result.migrated;
      totalErrors += result.errors;
    }
    
    console.log(`\nTotal: ${totalMigrated} documents migrated, ${totalErrors} errors`);
    
    if (totalErrors === 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Update your application code to query branch subcollections');
      console.log('2. Update Firestore security rules');
      console.log('3. Test the application with the new structure');
      console.log('4. Once verified, you can delete the original collections');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Please review the logs.');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Function to clean up original collections (run only after verification)
async function cleanupOriginalCollections() {
  console.log('\n🧹 Cleaning up original collections...');
  console.log('⚠️  WARNING: This will delete the original collections!');
  console.log('Make sure you have verified the migration and have backups!');
  
  // Uncomment the following code only when you're ready to delete original collections
  /*
  for (const config of COLLECTIONS_TO_MIGRATE) {
    try {
      const snapshot = await getDocs(collection(db, config.sourceCollection));
      let batch = writeBatch(db);
      let batchCount = 0;
      
      for (const docSnapshot of snapshot.docs) {
        batch.delete(docSnapshot.ref);
        batchCount++;
        
        if (batchCount >= 500) {
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }
      }
      
      if (batchCount > 0) {
        await batch.commit();
      }
      
      console.log(`Deleted ${snapshot.docs.length} documents from ${config.sourceCollection}`);
    } catch (error) {
      console.error(`Error cleaning up ${config.sourceCollection}:`, error);
    }
  }
  */
  
  console.log('Cleanup function is commented out for safety.');
  console.log('Uncomment the cleanup code in the script when ready to delete original collections.');
}

// Run the migration
console.log('Script starting...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);
console.log('Comparison:', import.meta.url === `file://${process.argv[1]}`);

migrateToBranchSubcollections()
  .then(() => {
    console.log('\nMigration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

export {
  migrateToBranchSubcollections,
  cleanupOriginalCollections
};