import { useState, useEffect } from 'react';
import { collection, collectionGroup, query, where, orderBy, limit, getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Payment } from '@/types';

interface UsePaymentsOptions {
  branchId?: string;
  limit?: number;
}

interface UsePaymentsResult {
  payments: Payment[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePayments({ branchId, limit: queryLimit = 100 }: UsePaymentsOptions = {}): UsePaymentsResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { activeBranchId } = useAuth();

  // Use the provided branchId or fall back to activeBranchId from AuthContext
  const effectiveBranchId = branchId || activeBranchId;

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we have a branch ID for subcollection query
      if (!effectiveBranchId) {
        console.warn('No branch ID provided for payments query');
        setPayments([]);
        setIsLoading(false);
        return;
      }

      // Query payments from all bookings in the branch using collection group
      const paymentsQuery = collectionGroup(db, 'payments');

      // Add filters
      const constraints = [];
      
      // Filter by branch ID (unless it's 'all' for HQ admins)
      if (effectiveBranchId !== 'all') {
        constraints.push(where('branchId', '==', effectiveBranchId));
      }

      // Add ordering and limit
      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(queryLimit));

      // Apply all constraints
      const q = query(paymentsQuery, ...constraints);

      // Execute query
      const querySnapshot = await getDocs(q);

      // Process results
      const paymentDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];

      setPayments(paymentDocs);
    } catch (err) {
      console.error('Error fetching payments:', err);
      
      // Check if it's a Firebase index error
      if (err instanceof Error && err.message.includes('index')) {
        console.warn('Firebase index not available for payments query. This is expected in development.');
        console.warn('To create the required index, visit the Firebase Console and create a composite index for:');
        console.warn('Collection: payments (collection group)');
        console.warn('Fields: branchId (Ascending), createdAt (Descending)');
        
        // Set empty payments array instead of showing error to user
        setPayments([]);
        setError(null);
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch payments'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [effectiveBranchId, queryLimit]);

  return {
    payments,
    isLoading,
    error,
    refetch: fetchPayments
  };
}