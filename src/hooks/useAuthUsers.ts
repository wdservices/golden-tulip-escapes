import { useState, useEffect } from 'react';
import { getAuth, User as FirebaseUser } from 'firebase/auth';
import { useDatabase } from '../contexts/DatabaseContext';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

interface AuthUser extends FirebaseUser {
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export const useAuthUsers = () => {
  // This state will store all users from Firebase Auth and Firestore
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [firestoreUsers, setFirestoreUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getDocument, queryDocuments } = useDatabase();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const { getAuth, onAuthStateChanged } = await import('firebase/auth');
        const { reconnectFirebase } = await import('@/lib/firebase');
        const auth = getAuth();
        const db = getFirestore();
        
        // Fetch all users from Firestore 'users' collection
        try {
          const usersCollection = collection(db, 'users');
          const usersSnapshot = await getDocs(usersCollection);
          const fetchedFirestoreUsers = usersSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            uid: doc.id
          }));
          setFirestoreUsers(fetchedFirestoreUsers);
          
          // Get current authenticated user to merge with Firestore data
          const currentUser = auth.currentUser as AuthUser | null;
          if (currentUser) {
            setAuthUsers([currentUser]);
          } else {
            setAuthUsers([]);
          }
          
          setError(null);
        } catch (firestoreError) {
          console.error('Error fetching users from Firestore:', firestoreError);
          setError(firestoreError as Error);
          
          // Check if it's a permission or connection error
          if (firestoreError instanceof Error && firestoreError.message && 
              (firestoreError.message.includes('permission') || 
               firestoreError.message.includes('network') || 
               firestoreError.message.includes('unavailable') ||
               firestoreError.message.includes('unauthorized'))) {
            
            console.warn('Firebase error detected, attempting to reconnect...');
            try {
              const reconnected = await reconnectFirebase();
              if (reconnected) {
                console.log('Successfully reconnected to Firebase');
                
                // Retry fetching users after reconnection
                const retrySnapshot = await getDocs(collection(db, 'users'));
                const retryUsers = retrySnapshot.docs.map(doc => ({
                  ...doc.data(),
                  id: doc.id,
                  uid: doc.id
                }));
                setFirestoreUsers(retryUsers);
                setError(null);
              } else {
                console.error('Failed to reconnect to Firebase');
              }
            } catch (reconnectError) {
              console.error('Error during Firebase reconnection:', reconnectError);
            }
          }
        }
        
        // Listen for auth state changes for current user
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setAuthUsers([user as AuthUser]);
          } else {
            setAuthUsers([]);
          }
        }, async (error) => {
          console.error('Auth state change error:', error);
          
          // Check if it's a permission or connection error
          if (error.message && (error.message.includes('permission') || 
              error.message.includes('network') || 
              error.message.includes('unavailable') ||
              error.message.includes('unauthorized'))) {
            
            console.warn('Firebase auth error detected, attempting to reconnect...');
            try {
              const reconnected = await reconnectFirebase();
              if (!reconnected) {
                console.error('Failed to reconnect to Firebase Auth');
              }
            } catch (reconnectError) {
              console.error('Error during Firebase reconnection:', reconnectError);
            }
          }
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  // Function to merge auth users with Firestore users
  const mergeWithFirestoreUsers = async (firestoreUsersParam: any[]) => {
    try {
      // Use provided Firestore users or the ones we fetched earlier
      let allFirestoreUsers = firestoreUsersParam && firestoreUsersParam.length > 0 
        ? firestoreUsersParam 
        : firestoreUsers;
      
      // If we still don't have Firestore users, fetch them now
      if (!allFirestoreUsers || allFirestoreUsers.length === 0) {
        try {
          const db = getFirestore();
          const usersSnapshot = await getDocs(collection(db, 'users'));
          allFirestoreUsers = usersSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            uid: doc.id
          }));
        } catch (fetchError) {
          console.error('Error fetching users from Firestore in mergeWithFirestoreUsers:', fetchError);
        }
      }

      // First, process any authenticated users we have
      const mergedAuthUsers = await Promise.all(
        authUsers.map(async (authUser) => {
          // Find matching Firestore user
          const firestoreUser = allFirestoreUsers.find(u => u.uid === authUser.uid) || {};
          
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

      // Process all Firestore users
      // This includes users that might not be in the current auth session
      const processedFirestoreUsers = allFirestoreUsers.map(user => {
        // Skip users that are already processed through auth
        if (authUsers.some(au => au.uid === user.uid)) {
          return null; // Will be filtered out later
        }
        
        return {
          ...user,
          id: user.id || user.uid,
          uid: user.uid || user.id,
          email: user.email || '',
          displayName: user.displayName || '',
          phoneNumber: user.phoneNumber || '',
          photoURL: user.photoURL || '',
          status: user.status || 'active',
          role: user.role || 'user',
          emailVerified: user.emailVerified || false,
          lastSignInAt: user.lastSignInAt?.toDate ? user.lastSignInAt.toDate() : 
                       (user.lastSignInAt instanceof Date ? user.lastSignInAt : null),
          createdAt: user.createdAt?.toDate ? user.createdAt.toDate() : 
                    (user.createdAt instanceof Date ? user.createdAt : new Date()),
          updatedAt: new Date()
        };
      }).filter(Boolean); // Remove null entries

      // Return all users - both authenticated and Firestore-only
      return [...mergedAuthUsers, ...processedFirestoreUsers];
    } catch (err) {
      console.error('Error merging users:', err);
      throw err;
    }
  };

  return { authUsers, loading, error, mergeWithFirestoreUsers };
};
