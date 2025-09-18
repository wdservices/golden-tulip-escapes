import { createContext, useContext, ReactNode } from 'react';
import { Firestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, reconnectFirebase } from '../lib/firebase';

type DatabaseContextType = {
  db: Firestore;
  getDocument: <T>(collectionPath: string, docId: string) => Promise<T | null>;
  setDocument: <T>(collectionPath: string, docId: string, data: T) => Promise<void>;
  updateDocument: (collectionPath: string, docId: string, data: Partial<unknown>) => Promise<void>;
  deleteDocument: (collectionPath: string, docId: string) => Promise<void>;
  queryDocuments: <T>(collectionPath: string, conditions: [string, string, unknown][]) => Promise<T[]>;
  addDocument: <T>(collectionPath: string, data: T) => Promise<string>;
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  console.log('DatabaseProvider initialized');
  // Get a document by ID
  const getDocument = async <T,>(collectionPath: string, docId: string): Promise<T | null> => {
    try {
      const docRef = doc(db, collectionPath, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  };

  // Set a document with a specific ID
  const setDocument = async <T,>(collectionPath: string, docId: string, data: T): Promise<void> => {
    console.log(`Setting document in ${collectionPath}/${docId}:`, data);
    const startTime = performance.now();
    
    try {
      await setDoc(doc(db, collectionPath, docId), data, { merge: true });
      
      // Emit an event to notify components that data has been updated
      const customEvent = new CustomEvent('database-update', {
        detail: { collectionPath, docId, data }
      });
      window.dispatchEvent(customEvent);
      
      const endTime = performance.now();
      console.log(`Document set successfully in ${Math.round(endTime - startTime)}ms`);
      console.log(`Performance: Set document operation took ${Math.round(endTime - startTime)}ms`);
    } catch (error) {
      console.error('Error setting document:', error);
      throw error;
    }
  };

  // Update an existing document with retry mechanism and token refresh
  const updateDocument = async (
    collectionPath: string,
    docId: string,
    data: Partial<unknown>
  ): Promise<void> => {
    console.log(`Updating document in ${collectionPath}/${docId}:`, data);
    const startTime = performance.now();
    
    try {
      // Try to refresh auth token before database operations
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          await currentUser.getIdToken(true); // Force token refresh
          console.log('Auth token refreshed before database operation');
        }
      } catch (tokenError) {
        console.warn('Failed to refresh token before database operation:', tokenError);
        // Continue anyway, the operation might still succeed
      }
      
      const docRef = doc(db, collectionPath, docId);
      
      try {
        await updateDoc(docRef, data);
      } catch (initialError: any) {
        // Check if it's a session error
        if (initialError.message && 
            (initialError.message.includes('400') || 
             initialError.message.includes('Bad Request') || 
             initialError.message.includes('permission') ||
             initialError.message.includes('ERR_ABORTED'))) {
          
          console.warn('Firebase session issue detected, attempting to reconnect...');
          
          // Use the global reconnect function
          const reconnected = await reconnectFirebase();
          
          if (!reconnected) {
            console.error('Failed to reconnect to Firebase');
            throw initialError;
          }
          
          console.log('Firebase reconnected, retrying update operation');
          
          // Try to refresh token again before retry
          try {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (currentUser) {
              await currentUser.getIdToken(true); // Force token refresh
              console.log('Auth token refreshed before retry');
            }
          } catch (tokenError) {
            console.warn('Failed to refresh token before retry:', tokenError);
          }
          
          // Wait a moment before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Retry the operation
          try {
            await updateDoc(docRef, data);
            console.log('Document update succeeded on retry');
          } catch (retryError) {
            console.error('Document update failed on retry:', retryError);
            throw retryError;
          }
        } else {
          // If it's not a session error, rethrow
          throw initialError;
        }
      }
      
      // Emit an event to notify components that data has been updated
      const customEvent = new CustomEvent('database-update', {
        detail: { collectionPath, docId, data }
      });
      window.dispatchEvent(customEvent);
      
      const endTime = performance.now();
      console.log(`Document updated successfully in ${Math.round(endTime - startTime)}ms`);
      console.log(`Performance: Update operation took ${Math.round(endTime - startTime)}ms`);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };

  // Delete a document
  const deleteDocument = async (collectionPath: string, docId: string): Promise<void> => {
    console.log(`Deleting document: ${collectionPath}/${docId}`);
    const startTime = performance.now();
    
    try {
      await deleteDoc(doc(db, collectionPath, docId));
      
      // Emit an event to notify components that data has been deleted
      const customEvent = new CustomEvent('database-update', {
        detail: { collectionPath, docId, operation: 'delete' }
      });
      window.dispatchEvent(customEvent);
      
      const endTime = performance.now();
      console.log(`Document deleted successfully: ${collectionPath}/${docId}`);
      console.log(`Performance: Delete operation took ${Math.round(endTime - startTime)}ms`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  // Query documents with conditions
  const queryDocuments = async <T,>(
    collectionPath: string,
    conditions: [string, string, unknown][] = []
  ): Promise<T[]> => {
    try {
      let q = query(collection(db, collectionPath));
      
      // Apply all conditions
      conditions.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator as any, value));
      });
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  };

  // Add a new document with auto-generated ID and retry mechanism
  const addDocument = async <T,>(collectionPath: string, data: T): Promise<string> => {
    console.log(`Adding document to collection: ${collectionPath}`, data);
    const startTime = performance.now();
    
    // Check if this is a restricted collection that requires admin permissions
    if (collectionPath === 'branches' || collectionPath === 'rooms') {
      console.log('Attempting to add document to restricted collection:', collectionPath);
    }
    
    try {
      // Try to refresh auth token before database operations
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          await currentUser.getIdToken(true); // Force token refresh
          console.log('Auth token refreshed before database operation');
        }
      } catch (tokenError) {
        console.warn('Failed to refresh token before database operation:', tokenError);
        // Continue anyway, the operation might still succeed
      }
      
      const collectionRef = collection(db, collectionPath);
      let docRef;
      
      try {
        docRef = await addDoc(collectionRef, data);
      } catch (initialError: any) {
        // Check if it's a session error
        if (initialError.message && 
            (initialError.message.includes('400') || 
             initialError.message.includes('Bad Request') || 
             initialError.message.includes('permission') ||
             initialError.message.includes('ERR_ABORTED'))) {
          
          console.warn('Firebase session issue detected, attempting to reconnect...');
          
          // Use the global reconnect function
          const reconnected = await reconnectFirebase();
          
          if (!reconnected) {
            console.error('Failed to reconnect to Firebase');
            throw initialError;
          }
          
          console.log('Firebase reconnected, retrying add operation');
          
          // Wait a moment before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Retry the operation
          try {
            docRef = await addDoc(collectionRef, data);
            console.log('Document add succeeded on retry');
          } catch (retryError) {
            console.error('Document add failed on retry:', retryError);
            throw retryError;
          }
        } else {
          // If it's not a session error, rethrow
          throw initialError;
        }
      }
      
      // Emit an event to notify components that data has been added
      const customEvent = new CustomEvent('database-update', {
        detail: { collectionPath, docId: docRef.id, data }
      });
      window.dispatchEvent(customEvent);
      
      const endTime = performance.now();
      console.log(`Document added successfully in ${Math.round(endTime - startTime)}ms with ID: ${docRef.id}`);
      console.log(`Performance: Add document operation took ${Math.round(endTime - startTime)}ms`);
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  };

  const value = {
    db,
    getDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
    addDocument,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
