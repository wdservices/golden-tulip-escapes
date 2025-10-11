import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';

export interface AdminEmailConfig {
  id: string;
  email: string;
  branchId: string;
  role: 'branch-admin' | 'hq-admin';
  createdAt: Date;
  updatedAt: Date;
}

const ADMIN_EMAILS_COLLECTION = 'adminEmails';

// Get all admin email configurations
export const getAdminEmails = async (): Promise<AdminEmailConfig[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, ADMIN_EMAILS_COLLECTION));
    const admins = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      admins.push({
        id: doc.id,
        email: data.email || '',
        branchId: data.branchId || '',
        role: data.role || 'branch-admin',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return admins as AdminEmailConfig[];
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    return [];
  }
};

// Get admin configuration for a specific email
export const getAdminEmailConfig = async (email: string): Promise<AdminEmailConfig | null> => {
  if (!email) {
    console.warn('getAdminEmailConfig called with empty email');
    return null;
  }

  const emailLower = email.trim().toLowerCase();
  
  try {
    console.log(`🔍 Fetching admin config for email: ${emailLower}`);
    
    const q = query(
      collection(db, ADMIN_EMAILS_COLLECTION),
      where('email', '==', emailLower)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`ℹ️ No admin config found for email: ${emailLower}`);
      return null;
    }
    
    // Get the first matching document
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    const adminConfig = {
      id: doc.id,
      email: data.email || '',
      branchId: data.branchId || '',
      role: data.role || 'branch-admin',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
    
    console.log(`✅ Found admin config for ${emailLower}:`, {
      branchId: adminConfig.branchId,
      role: adminConfig.role
    });
    
    return adminConfig;
  } catch (error) {
    console.error(`❌ Error fetching admin config for ${emailLower}:`, error);
    return null;
  }
};

// Add or update admin email configuration
export const setAdminEmail = async (email: string, branchId: string, role: 'branch-admin' | 'hq-admin'): Promise<void> => {
  try {
    const emailId = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const docRef = doc(db, ADMIN_EMAILS_COLLECTION, emailId);
    
    const existingDoc = await getDoc(docRef);
    const now = new Date();
    
    if (existingDoc.exists()) {
      // Update existing configuration
      await updateDoc(docRef, {
        email: email.toLowerCase(),
        branchId,
        role,
        updatedAt: now,
      });
    } else {
      // Create new configuration
      await setDoc(docRef, {
        email: email.toLowerCase(),
        branchId,
        role,
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error('Error setting admin email:', error);
    throw error;
  }
};

// Remove admin email configuration
export const removeAdminEmail = async (email: string): Promise<void> => {
  try {
    const emailId = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const docRef = doc(db, ADMIN_EMAILS_COLLECTION, emailId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error removing admin email:', error);
    throw error;
  }
};

// Initialize default admin emails (run once during setup)
export const initializeDefaultAdminEmails = async (): Promise<void> => {
  try {
    console.log('Initializing default admin emails...');
    
    const defaultAdmins = [
      { 
        email: 'reservations@rivotelinternational.com', 
        branchId: 'evergreen', 
        role: 'branch-admin' as const 
      },
      { 
        email: 'fom@rivotels.com', 
        branchId: 'garden-city', 
        role: 'branch-admin' as const 
      },
      { 
        email: 'reservationsgt@rivotels.com', 
        branchId: 'stadium-31', 
        role: 'branch-admin' as const 
      },
      { 
        email: 'hello.goldentulip@gmail.com', 
        branchId: 'evo-road', 
        role: 'hq-admin' as const // Changed to hq-admin for full access
      },
    ];

    for (const admin of defaultAdmins) {
      console.log(`Setting up admin access for: ${admin.email} (${admin.branchId})`);
      try {
        await setAdminEmail(admin.email, admin.branchId, admin.role);
        console.log(`Successfully set up admin access for: ${admin.email}`);
      } catch (err) {
        console.error(`Error setting up admin for ${admin.email}:`, err);
      }
    }
    
    console.log('Default admin emails initialization completed');
    return;
  } catch (error) {
    console.error('Error in initializeDefaultAdminEmails:', error);
    throw error;
  }
};

// No more hardcoded admins - all admins are stored in Firestore

// Get branch assignment based on email
export const getBranchFromEmail = async (email: string): Promise<{ branchId: string; role: 'branch-admin' | 'hq-admin' | 'user' }> => {
  const defaultResponse = { branchId: '', role: 'user' as const };
  
  if (!email) {
    console.warn('⚠️ getBranchFromEmail called with empty email');
    return defaultResponse;
  }

  const emailLower = email.trim().toLowerCase();
  console.log('🔍 getBranchFromEmail called with email:', email, 'normalized:', emailLower);
  
  try {
    // 1. First try to get from Firestore
    try {
      const adminConfig = await getAdminEmailConfig(emailLower);
      if (adminConfig) {
        return {
          branchId: adminConfig.branchId,
          role: adminConfig.role
        };
      }
    } catch (firestoreError) {
      console.error('⚠️ Firestore error in getBranchFromEmail:', firestoreError);
      // Continue to fallback if Firestore fails
    }
    
    // 2. Fallback to known admins (temporary migration code)
    const knownAdmins = [
      { email: 'hello.goldentulip@gmail.com', branchId: 'evo-road', role: 'hq-admin' as const },
      { email: 'reservations@rivotelinternational.com', branchId: 'evergreen', role: 'branch-admin' as const },
      { email: 'fom@rivotels.com', branchId: 'garden-city', role: 'branch-admin' as const },
      { email: 'reservationsgt@rivotels.com', branchId: 'stadium-31', role: 'branch-admin' as const }
    ];
    
    const knownAdmin = knownAdmins.find(admin => admin.email.toLowerCase() === emailLower);
    if (knownAdmin) {
      console.log(`⚠️ Found known admin email that needs migration: ${emailLower}`);
      
      // Try to migrate to Firestore in the background
      setAdminEmail(knownAdmin.email, knownAdmin.branchId, knownAdmin.role)
        .then(() => console.log(`✅ Auto-migrated admin: ${emailLower} to Firestore`))
        .catch(err => console.error(`❌ Failed to migrate admin ${emailLower}:`, err));
      
      return {
        branchId: knownAdmin.branchId,
        role: knownAdmin.role
      };
    }
    
    console.log(`ℹ️ Email ${emailLower} not found in admin configs, defaulting to user role`);
    return defaultResponse;
    
  } catch (error) {
    console.error('❌ Unhandled error in getBranchFromEmail:', error);
    return defaultResponse;
  }
};