import { useState, useEffect } from 'react';
import { getAuth, User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { useDatabase } from '../contexts/DatabaseContext';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

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
  [key: string]: any;
}

export const useAuthUsers = () => {
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [firestoreUsers, setFirestoreUsers] = useState<UserData[]>([]);
  const [mergedUsers, setMergedUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { queryDocuments } = useDatabase();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const auth = getAuth();
        const db = getFirestore();
        
        // Fetch all users from Firestore 'users' collection
        const usersCollection = collection(db, 'users');
        // Order by creation date, most recent first, limit for performance
        const usersQuery = query(usersCollection, orderBy('createdAt', 'desc'), limit(200));
        const usersSnapshot = await getDocs(usersQuery);
        
        const fetchedUsers: UserData[] = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            uid: doc.id,
            email: data.email || '',
            displayName: data.displayName || data.name || '',
            phoneNumber: data.phoneNumber || '',
            photoURL: data.photoURL || '',
            emailVerified: data.emailVerified || false,
            status: data.status || 'active',
            role: data.role || 'user',
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
        setFirestoreUsers(fetchedUsers);
        setMergedUsers(fetchedUsers); // For now, just use Firestore users directly
        
        // Listen for auth state changes to get current user info
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setAuthUsers([user as AuthUser]);
          } else {
            setAuthUsers([]);
          }
        });
        
        setLoading(false);
        return unsubscribe;
        
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err as Error);
        setLoading(false);
        setFirestoreUsers([]);
        setMergedUsers([]);
      }
    };

    let unsubscribe: (() => void) | undefined;
    
    fetchAllUsers().then(unsub => {
      unsubscribe = unsub;
    });

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);



  return { 
    authUsers, 
    firestoreUsers, 
    mergedUsers, 
    loading, 
    error 
  };
};
