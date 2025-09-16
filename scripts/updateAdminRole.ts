const { db } = require('../src/lib/firebase');
const { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } = require('firebase/firestore');

/**
 * Utility script to update a user's role to admin in Firestore
 * Usage: Run this script with `npx ts-node scripts/updateAdminRole.ts <userEmail>
 */

async function updateUserRole(email: string, role: 'admin' | 'user' = 'admin') {
  try {
    console.log(`Updating role to '${role}' for user: ${email}`);
    
    // Get the user document by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error('No user found with email:', email);
      return;
    }
    
    // Update the user's role
    const userDoc = querySnapshot.docs[0];
    await updateDoc(userDoc.ref, { 
      role,
      updatedAt: new Date() 
    });
    
    console.log(`Successfully updated ${email} to ${role} role`);
  } catch (error) {
    console.error('Error updating user role:', error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address as an argument');
  console.log('Usage: npx ts-node scripts/updateAdminRole.ts <userEmail> [role]');
  process.exit(1);
}

const role = process.argv[3] as 'admin' | 'user' || 'admin';
updateUserRole(email, role).then(() => process.exit(0));
