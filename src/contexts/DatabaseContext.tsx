import { createContext, useContext, ReactNode } from 'react';
import { Firestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
    try {
      await setDoc(doc(db, collectionPath, docId), data, { merge: true });
    } catch (error) {
      console.error('Error setting document:', error);
      throw error;
    }
  };

  // Update an existing document
  const updateDocument = async (
    collectionPath: string,
    docId: string,
    data: Partial<unknown>
  ): Promise<void> => {
    try {
      const docRef = doc(db, collectionPath, docId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };

  // Delete a document
  const deleteDocument = async (collectionPath: string, docId: string): Promise<void> => {
    try {
      const docRef = doc(db, collectionPath, docId);
      await deleteDoc(docRef);
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

  // Add a new document with auto-generated ID
  const addDocument = async <T,>(collectionPath: string, data: T): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, collectionPath), data);
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
