import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync(join(__dirname, '../service-account.json'), 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking admin users structure...');
    
    // Check all users first
    const allUsersSnapshot = await db.collection('users').limit(10).get();
    console.log(`📊 Found ${allUsersSnapshot.size} total users`);
    
    if (allUsersSnapshot.empty) {
      console.log('❌ No users found at all');
      return;
    }
    
    console.log('\n📋 Sample user structure:');
    allUsersSnapshot.forEach(doc => {
      const user = doc.data();
      console.log(`   ID: ${doc.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Branch: ${user.branch || 'No branch'}`);
      console.log('   ---');
    });
    
    // Check for admin users with different role field names
    console.log('\n🔍 Checking for admin users with different field structures...');
    
    // Try different role field names that might be used
    const roleQueries = [
      { field: 'role', operator: 'in', value: ['admin', 'branch-admin', 'hq-admin'] },
      { field: 'role', operator: '==', value: 'admin' },
      { field: 'role', operator: '==', value: 'branch-admin' },
      { field: 'role', operator: '==', value: 'hq-admin' }
    ];
    
    for (const query of roleQueries) {
      try {
        const snapshot = await db
          .collection('users')
          .where(query.field, query.operator, query.value)
          .get();
        
        console.log(`\n🎯 Query: ${query.field} ${query.operator} ${query.value}`);
        console.log(`   Found: ${snapshot.size} users`);
        
        if (!snapshot.empty) {
          snapshot.forEach(doc => {
            const user = doc.data();
            console.log(`   User: ${user.email} (${user.role})`);
          });
        }
      } catch (error) {
        console.log(`   Error: ${error.message}`);
      }
    }
    
    // Check if there are any users with branch assignments
    console.log('\n🏢 Checking users with branch assignments...');
    const branchUsersSnapshot = await db
      .collection('users')
      .where('branch', '!=', null)
      .get();
    
    console.log(`Found ${branchUsersSnapshot.size} users with branch assignments`);
    branchUsersSnapshot.forEach(doc => {
      const user = doc.data();
      console.log(`   ${user.email}: branch ${user.branch}`);
    });
    
    // Check EVO Road branch specific
    console.log('\n🎯 Checking EVO Road branch users...');
    const evoBranchId = 'URcvGkmbfrOFInlOS4I9';
    const evoUsersSnapshot = await db
      .collection('users')
      .where('branch', '==', evoBranchId)
      .get();
    
    console.log(`Found ${evoUsersSnapshot.size} users assigned to EVO Road branch`);
    evoUsersSnapshot.forEach(doc => {
      const user = doc.data();
      console.log(`   ${user.email}: ${user.role} (${doc.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error);
  }
}

checkAdminUsers().then(() => {
  console.log('\n✅ Check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});