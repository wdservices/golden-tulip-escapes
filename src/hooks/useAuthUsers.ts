import { useState, useEffect } from 'react';
import { getAuth, User as FirebaseUser } from 'firebase/auth';
import { useDatabase } from '../contexts/DatabaseContext';

interface AuthUser extends FirebaseUser {
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export const useAuthUsers = () => {
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getDocument } = useDatabase();

  useEffect(() => {
    const fetchAuthUsers = async () => {
      try {
        setLoading(true);
        const { getAuth, onAuthStateChanged } = await import('firebase/auth');
        const auth = getAuth();
        
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Get all users (this requires a Cloud Function in production)
            // For now, we'll just get the current user
            setAuthUsers(user ? [user as AuthUser] : []);
          }
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('Error fetching auth users:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthUsers();
  }, []);

  // Function to merge auth users with Firestore users
  const mergeWithFirestoreUsers = async (firestoreUsers: any[]) => {
    try {
      const mergedUsers = await Promise.all(
        authUsers.map(async (authUser) => {
          // Find matching Firestore user
          const firestoreUser = firestoreUsers.find(u => u.uid === authUser.uid) || {};
          
          return {
            id: authUser.uid,
            uid: authUser.uid,
            email: authUser.email || '',
            displayName: authUser.displayName || firestoreUser.displayName || '',
            phoneNumber: authUser.phoneNumber || firestoreUser.phoneNumber || '',
            photoURL: authUser.photoURL || firestoreUser.photoURL || '',
            emailVerified: authUser.emailVerified || false,
            status: firestoreUser.status || 'active',
            role: firestoreUser.role || 'user',
            lastSignInAt: authUser.metadata?.lastSignInTime 
              ? new Date(authUser.metadata.lastSignInTime) 
              : firestoreUser.lastSignInAt,
            createdAt: authUser.metadata?.creationTime 
              ? new Date(authUser.metadata.creationTime) 
              : firestoreUser.createdAt || new Date(),
            updatedAt: new Date(),
            // Include any additional fields from Firestore
            ...firestoreUser
          };
        })
      );

      // Add any Firestore users that don't have auth records
      const firestoreOnlyUsers = firestoreUsers
        .filter(firestoreUser => !authUsers.some(au => au.uid === firestoreUser.uid))
        .map(user => ({
          ...user,
          id: user.id || user.uid,
          status: user.status || 'inactive',
          role: user.role || 'user',
          emailVerified: user.emailVerified || false,
          createdAt: user.createdAt?.toDate ? user.createdAt.toDate() : new Date(),
          updatedAt: new Date()
        }));

      return [...mergedUsers, ...firestoreOnlyUsers];
    } catch (err) {
      console.error('Error merging users:', err);
      throw err;
    }
  };

  return { authUsers, loading, error, mergeWithFirestoreUsers };
};
