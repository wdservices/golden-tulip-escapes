import { useState, useEffect } from 'react';
import { getAuth, User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import { handleFirebaseError, retryWithBackoff, checkNetworkConnectivity } from '../utils/firebaseErrorHandler';

interface AuthUser extends FirebaseUser {
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

interface UserData {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  emailVerified: boolean;
  status: string;
  role: string;
  lastSignInAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  bookingIds?: string[];
  branchId?: string;
  [key: string]: any;
}

export const useAuthUsers = (branchId?: string, refreshKey?: number) => {
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [firestoreUsers, setFirestoreUsers] = useState<UserData[]>([]);
  const [mergedUsers, setMergedUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { db, queryDocuments } = useDatabase();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is admin
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'branch-admin' && currentUser.role !== 'hq-admin')) {
          console.warn('useAuthUsers - User is not admin, cannot fetch all users');
          setLoading(false);
          setFirestoreUsers([]);
          setMergedUsers([]);
          return;
        }
        
        // Check network connectivity first
        const isConnected = await checkNetworkConnectivity();
        if (!isConnected) {
          throw new Error('Network connection failed. Please check your internet connection.');
        }
        
        console.log('useAuthUsers - Fetching users...');
        console.log('useAuthUsers - branchId parameter:', branchId);
        
        // Use DatabaseContext to query users
        const usersSnapshot = await retryWithBackoff(async () => {
          return await queryDocuments('users', []);
        }, 3, 1000);
        
        console.log('useAuthUsers - Raw users snapshot:', usersSnapshot);
        
        // Process users data
        let allUsers = usersSnapshot.map((user: any) => {
          const data = user;
          console.log('Fetched user document:', {
            id: user.id,
            data: data,
            branchId: data.branchId,
            email: data.email,
            displayName: data.displayName || data.name,
            role: data.role
          });
          
          return {
            id: user.id,
            uid: user.id,
            email: data.email || '',
            displayName: data.displayName || data.name || '',
            phoneNumber: data.phoneNumber || '',
            photoURL: data.photoURL || '',
            emailVerified: data.emailVerified || false,
            status: data.status || 'active',
            role: data.role || 'user',
            branchId: data.branchId,
            lastSignInAt: data.lastSignInAt?.toDate ? data.lastSignInAt.toDate() : 
                         (data.lastSignInAt instanceof Date ? data.lastSignInAt : null),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : 
                      (data.createdAt instanceof Date ? data.createdAt : new Date()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : 
                      (data.updatedAt instanceof Date ? data.updatedAt : new Date()),
            bookingIds: data.bookingIds || [],
            ...data // Include any additional fields
          };
        });
        
        console.log('All users processed:', allUsers.length, 'users');
        console.log('User IDs:', allUsers.map(u => ({ id: u.id, email: u.email, displayName: u.displayName })));
        
        // Apply client-side branch filtering if branchId is provided
        let filteredUsers = allUsers;
        if (branchId) {
          filteredUsers = allUsers.filter(user => user.branchId === branchId);
          console.log('useAuthUsers - Client-side branch filtering applied:', { 
            totalUsers: allUsers.length, 
            filteredUsers: filteredUsers.length, 
            branchId: branchId 
          });
        }
        
        console.log('Total users fetched:', filteredUsers.length);
        setFirestoreUsers(filteredUsers);
        setMergedUsers(filteredUsers);
        setLoading(false);
        
      } catch (err) {
        const errorInfo = handleFirebaseError(err, 'Fetching users');
        console.error('Error fetching users:', err);
        console.error('Error details:', errorInfo);
        setError(err as Error);
        setLoading(false);
        setFirestoreUsers([]);
        setMergedUsers([]);
      }
    };

    // Listen for auth state changes
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUsers([user as AuthUser]);
      } else {
        setAuthUsers([]);
      }
      
      // Fetch users when auth state changes
      fetchUsers();
    });

    return () => {
      unsubscribe();
    };
  }, [branchId, currentUser, queryDocuments, refreshKey]);

  return { 
    authUsers, 
    firestoreUsers, 
    mergedUsers, 
    loading, 
    error 
  };
};