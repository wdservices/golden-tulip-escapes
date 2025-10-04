import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';

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
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as AdminEmailConfig[];
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    return [];
  }
};

// Get admin configuration for a specific email
export const getAdminEmailConfig = async (email: string): Promise<AdminEmailConfig | null> => {
  try {
    const adminEmails = await getAdminEmails();
    return adminEmails.find(config => config.email.toLowerCase() === email.toLowerCase()) || null;
  } catch (error) {
    console.error('Error fetching admin email config:', error);
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
    const defaultAdmins = [
      { email: 'reservations@rivotelinternational.com', branchId: 'evergreen', role: 'branch-admin' as const },
      { email: 'fom@rivotels.com', branchId: 'garden-city', role: 'branch-admin' as const },
      { email: 'reservationsgt@rivotels.com', branchId: 'stadium-31', role: 'branch-admin' as const },
      { email: 'hello.goldentulip@gmail.com', branchId: 'evo-road', role: 'branch-admin' as const },
    ];

    for (const admin of defaultAdmins) {
      await setAdminEmail(admin.email, admin.branchId, admin.role);
    }
    
    console.log('Default admin emails initialized successfully');
  } catch (error) {
    console.error('Error initializing default admin emails:', error);
    throw error;
  }
};

// Get branch assignment based on email (replaces the hard-coded function in AuthContext)
export const getBranchFromEmail = async (email: string): Promise<{ branchId: string; role: 'branch-admin' | 'hq-admin' | 'user' }> => {
  try {
    const emailLower = email.toLowerCase();
    console.log('🔍 getBranchFromEmail called with email:', email, 'normalized:', emailLower);
    
    const adminConfig = await getAdminEmailConfig(emailLower);
    
    if (adminConfig) {
      console.log('✅ Email found in admin config:', adminConfig);
      return {
        branchId: adminConfig.role === 'hq-admin' ? 'all' : adminConfig.branchId,
        role: adminConfig.role
      };
    }
    
    // Default to user role with no specific branch
    console.log('❌ Email not found in admin configs, defaulting to user role');
    return { branchId: '', role: 'user' };
  } catch (error) {
    console.error('Error getting branch from email:', error);
    // Fallback to user role on error
    return { branchId: '', role: 'user' };
  }
};