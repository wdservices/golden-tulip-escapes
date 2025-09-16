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
