import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';

type QueryCondition = [string, string, unknown];

export const useCollection = <T extends { id: string }>(collectionPath: string) => {
  const { 
    getDocument, 
    setDocument, 
    updateDocument, 
    deleteDocument, 
    queryDocuments,
    addDocument
  } = useDatabase();
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all documents in the collection
  const fetchAll = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await queryDocuments<T>(collectionPath, []);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error(`Error fetching ${collectionPath}:`, err);
      
      // Check if it's a permission or connection error
      if (err instanceof Error && err.message && 
          (err.message.includes('permission') || 
           err.message.includes('network') || 
           err.message.includes('unavailable') ||
           err.message.includes('unauthorized') ||
           err.message.includes('400') ||
           err.message.includes('ERR_ABORTED'))) {
        
        console.warn(`Firebase error detected in useCollection for ${collectionPath}, attempting to reconnect...`);
        try {
          // Import and use the reconnectFirebase function
          const { reconnectFirebase } = await import('@/lib/firebase');
          const reconnected = await reconnectFirebase();
          
          if (reconnected) {
            console.log(`Successfully reconnected to Firebase, retrying fetch for ${collectionPath}`);
            // Retry the operation after successful reconnection
            const retryResult = await queryDocuments<T>(collectionPath, []);
            setData(retryResult);
            setError(null);
          } else {
            console.error(`Failed to reconnect to Firebase for ${collectionPath}`);
          }
        } catch (reconnectError) {
          console.error('Error during Firebase reconnection:', reconnectError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [collectionPath, queryDocuments]);

  // Query documents with conditions
  const query = useCallback(async (conditions: QueryCondition[] = []): Promise<void> => {
    setLoading(true);
    try {
      const result = await queryDocuments<T>(collectionPath, conditions);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error(`Error querying ${collectionPath}:`, err);
      
      // Check if it's a permission or connection error
      if (err instanceof Error && err.message && 
          (err.message.includes('permission') || 
           err.message.includes('network') || 
           err.message.includes('unavailable') ||
           err.message.includes('unauthorized') ||
           err.message.includes('400') ||
           err.message.includes('ERR_ABORTED'))) {
        
        console.warn(`Firebase error detected in useCollection query for ${collectionPath}, attempting to reconnect...`);
        try {
          // Import and use the reconnectFirebase function
          const { reconnectFirebase } = await import('@/lib/firebase');
          const reconnected = await reconnectFirebase();
          
          if (reconnected) {
            console.log(`Successfully reconnected to Firebase, retrying query for ${collectionPath}`);
            // Retry the operation after successful reconnection
            const retryResult = await queryDocuments<T>(collectionPath, conditions);
            setData(retryResult);
            setError(null);
          } else {
            console.error(`Failed to reconnect to Firebase for ${collectionPath} query`);
          }
        } catch (reconnectError) {
          console.error('Error during Firebase reconnection:', reconnectError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [collectionPath, queryDocuments]);

  // Get a single document by ID
  const get = useCallback(async (id: string): Promise<T | null> => {
    setLoading(true);
    try {
      const result = await getDocument<T>(collectionPath, id);
      setError(null);
      return result;
    } catch (err) {
      setError(err as Error);
      console.error(`Error getting document ${id} from ${collectionPath}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [collectionPath, getDocument]);

  // Add a new document
  const add = useCallback(async (item: Omit<T, 'id'>): Promise<string | null> => {
    setLoading(true);
    try {
      const id = await addDocument(collectionPath, item);
      await fetchAll(); // Refresh the data
      setError(null);
      return id;
    } catch (err) {
      setError(err as Error);
      console.error(`Error adding to ${collectionPath}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [addDocument, collectionPath, fetchAll]);

  // Update an existing document
  const update = useCallback(async (id: string, updates: Partial<T>): Promise<boolean> => {
    setLoading(true);
    try {
      await updateDocument(collectionPath, id, updates);
      await fetchAll(); // Refresh the data
      setError(null);
      return true;
    } catch (err) {
      setError(err as Error);
      console.error(`Error updating document ${id} in ${collectionPath}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [collectionPath, fetchAll, updateDocument]);

  // Delete a document
  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await deleteDocument(collectionPath, id);
      await fetchAll(); // Refresh the data
      setError(null);
      return true;
    } catch (err) {
      setError(err as Error);
      console.error(`Error deleting document ${id} from ${collectionPath}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [collectionPath, deleteDocument, fetchAll]);

  return {
    data,
    loading,
    error,
    fetchAll,
    query,
    get,
    add,
    update,
    remove,
  };
};
