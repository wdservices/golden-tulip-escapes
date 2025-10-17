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

async function createStadiumRoadAdminConfig() {
  try {
    console.log('🔧 Creating admin email configuration for Stadium Road 31...');
    
    const adminEmailConfig = {
      email: 'reservationsgt@rivotels.com',
      branchId: 'UShvwSYpMNpuNaS32MxZ', // Correct Firestore branch ID
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if config already exists
    const existingConfig = await db.collection('adminEmails')
      .where('email', '==', adminEmailConfig.email)
      .get();
    
    if (!existingConfig.empty) {
      console.log('⚠️  Admin email configuration already exists. Updating...');
      const docId = existingConfig.docs[0].id;
      await db.collection('adminEmails').doc(docId).update({
        branchId: adminEmailConfig.branchId,
        role: adminEmailConfig.role,
        updatedAt: new Date()
      });
      console.log('✅ Updated existing admin email configuration');
    } else {
      // Create new configuration
      await db.collection('adminEmails').add(adminEmailConfig);
      console.log('✅ Created new admin email configuration');
    }
    
    console.log('\n📋 Configuration details:');
    console.log(`  - Email: ${adminEmailConfig.email}`);
    console.log(`  - Branch ID: ${adminEmailConfig.branchId}`);
    console.log(`  - Role: ${adminEmailConfig.role}`);
    
    console.log('\n🎯 This should fix the issue where Stadium Road 31 bookings are not showing in the admin dashboard!');
    console.log('   The admin will now be mapped to the correct Firestore branch ID.');
    
  } catch (error) {
    console.error('❌ Error creating admin email config:', error);
  }
}

createStadiumRoadAdminConfig().then(() => {
  console.log('Configuration completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});