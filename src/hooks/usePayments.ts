import { useState, useEffect } from 'react';
import { collection, collectionGroup, query, where, orderBy, limit, getDocs, getDoc, doc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Payment } from '@/types';

// Fallback function to fetch payments from branch subcollections directly
async function fetchPaymentsFromBranchSubcollections(branchId: string, queryLimit: number): Promise<Payment[]> {
  try {
    const payments: Payment[] = [];
    
    // Get all bookings for this branch
    const bookingsSnapshot = await getDocs(
      collection(db, 'branches', branchId, 'bookings')
    );
    
    // Create a map of booking data for quick lookup
    const bookingDataMap = new Map();
    for (const bookingDoc of bookingsSnapshot.docs) {
      bookingDataMap.set(bookingDoc.id, bookingDoc.data());
    }
    
    // For each booking, get its payments
    for (const bookingDoc of bookingsSnapshot.docs) {
      const bookingData = bookingDataMap.get(bookingDoc.id);
      const paymentsSnapshot = await getDocs(
        query(
          collection(db, 'branches', branchId, 'bookings', bookingDoc.id, 'payments'),
          orderBy('createdAt', 'desc'),
          limit(queryLimit)
        )
      );
      
      paymentsSnapshot.forEach(paymentDoc => {
        const paymentData = paymentDoc.data();
        
        // Get guest name from booking data first, then fall back to payment data
        const guestName = bookingData?.guestName || 
                         paymentData.customer?.customer_name || 
                         paymentData.customer?.name || 
                         'Unknown Guest';
        
        const customerEmail = bookingData?.customerEmail || 
                              paymentData.customer?.email || 
                              'N/A';
        
        // Map the payment data to match the UI expectations
        const mappedPayment = {
          id: paymentDoc.id,
          bookingId: bookingDoc.id,
          branchId: branchId,
          transactionId: paymentData.transactionId || paymentDoc.id,
          guestName: guestName,
          customerEmail: customerEmail,
          amount: paymentData.amount || 0,
          currency: paymentData.currency || 'NGN',
          date: paymentData.createdAt?._seconds ? new Date(paymentData.createdAt._seconds * 1000).toISOString() : 
                paymentData.paidAt?._seconds ? new Date(paymentData.paidAt._seconds * 1000).toISOString() : 
                new Date().toISOString(),
          status: paymentData.status || 'pending',
          method: paymentData.paymentMethod || paymentData.method || 'paystack',
          channel: paymentData.channel || paymentData.paymentMethod || 'paystack',
          paystackTransactionId: paymentData.paystackTransactionId || paymentData.transactionId,
          fees: paymentData.fees || 0,
          receiptUrl: paymentData.receiptUrl || paymentData.receipt_url,
          gatewayResponse: paymentData.gatewayResponse || paymentData.gateway_response,
          ...paymentData
        };
        
        payments.push(mappedPayment as Payment);
      });
    }
    
    // Sort by mapped date desc and apply limit
    return payments
      .sort((a: any, b: any) => new Date((b as any).date).getTime() - new Date((a as any).date).getTime())
      .slice(0, queryLimit);
  } catch (error) {
    console.error('Error in fallback payment fetch:', error);
    return [];
  }
}

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

      // Query payments from collection group 'payments'
      // If effectiveBranchId is provided and not 'all', include a filter; otherwise query all
      const paymentsQuery = collectionGroup(db, 'payments');

      const constraints = [] as any[];
      if (effectiveBranchId && effectiveBranchId !== 'all') {
        constraints.push(where('branchId', '==', effectiveBranchId));
      }
      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(queryLimit));
      const q = query(paymentsQuery, ...constraints);

      // Execute query
      const querySnapshot = await getDocs(q);

      // Process results and map to UI expectations
      const paymentDocs = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const paymentData = doc.data();
        
        // Try to get guest name from multiple sources
        let guestName = paymentData.customer?.customer_name || paymentData.customer?.name || 'Unknown Guest';
        let customerEmail = paymentData.customer?.email || 'N/A';
        
        // If guest name is still "Unknown Guest", try to fetch booking data
        if (guestName === 'Unknown Guest' && paymentData.bookingId) {
          try {
            const bookingDoc = await getDoc(
              doc(db, 'branches', paymentData.branchId, 'bookings', paymentData.bookingId)
            );
            
            if (bookingDoc.exists()) {
              const bookingData = bookingDoc.data() as { guestName?: string; customerEmail?: string };
              guestName = bookingData.guestName || guestName;
              customerEmail = bookingData.customerEmail || customerEmail;
            }
          } catch (bookingError) {
            console.warn(`Failed to fetch booking data for payment ${doc.id}:`, bookingError);
          }
        }
        
        // Map the payment data to match the UI expectations
        return {
          id: doc.id,
          transactionId: paymentData.transactionId || doc.id,
          guestName: guestName,
          customerEmail: customerEmail,
          amount: paymentData.amount || 0,
          currency: paymentData.currency || 'NGN',
          date: paymentData.createdAt?._seconds ? new Date(paymentData.createdAt._seconds * 1000).toISOString() : 
                paymentData.paidAt?._seconds ? new Date(paymentData.paidAt._seconds * 1000).toISOString() : 
                new Date().toISOString(),
          status: paymentData.status || 'pending',
          method: paymentData.paymentMethod || paymentData.method || 'paystack',
          channel: paymentData.channel || paymentData.paymentMethod || 'paystack',
          paystackTransactionId: paymentData.paystackTransactionId || paymentData.transactionId,
          fees: paymentData.fees || 0,
          receiptUrl: paymentData.receiptUrl || paymentData.receipt_url,
          gatewayResponse: paymentData.gatewayResponse || paymentData.gateway_response,
          ...paymentData
        } as Payment;
      }));

      // Fallbacks: if no results, try branch subcollections; if no branch context, scan all branches
      if (paymentDocs.length === 0) {
        if (effectiveBranchId && effectiveBranchId !== 'all') {
          const fallbackPayments = await fetchPaymentsFromBranchSubcollections(effectiveBranchId, queryLimit);
          if (fallbackPayments.length > 0) {
            setPayments(fallbackPayments);
          } else {
            // If still empty, expand search to all branches
            const branchesSnapshot = await getDocs(collection(db, 'branches'));
            const aggregated: Payment[] = [] as any;
            for (const branchDoc of branchesSnapshot.docs) {
              const branchIdAll = branchDoc.id;
              const branchPayments = await fetchPaymentsFromBranchSubcollections(branchIdAll, Math.ceil(queryLimit / branchesSnapshot.docs.length) || 25);
              aggregated.push(...branchPayments);
            }
            setPayments(aggregated.slice(0, queryLimit));
          }
        } else {
          // Scan all branches for payments
          const branchesSnapshot = await getDocs(collection(db, 'branches'));
          const aggregated: Payment[] = [] as any;
          for (const branchDoc of branchesSnapshot.docs) {
            const branchIdAll = branchDoc.id;
            const branchPayments = await fetchPaymentsFromBranchSubcollections(branchIdAll, Math.ceil(queryLimit / branchesSnapshot.docs.length) || 25);
            aggregated.push(...branchPayments);
          }
          // Sort aggregated by paid date or createdAt
          aggregated.sort((a: any, b: any) => {
            const ta = new Date((a as any).date || (a as any).paidAt || (a as any).createdAt || 0).getTime();
            const tb = new Date((b as any).date || (b as any).paidAt || (b as any).createdAt || 0).getTime();
            return tb - ta;
          });
          setPayments(aggregated.slice(0, queryLimit));
        }
      } else {
        setPayments(paymentDocs);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      
      // Check for permission or index errors and fallback to backend
      const isPermissionError = err instanceof Error && (
        err.message.toLowerCase().includes('permission') ||
        err.message.toLowerCase().includes('unauthorized')
      );
      const isIndexError = err instanceof Error && err.message.includes('index');
      if (isPermissionError || isIndexError) {
        console.warn('Firebase index not available for payments query. Using fallback method.');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://rivotels.com/api';
        const url = effectiveBranchId ? `${API_BASE_URL}/admin/payments?branchId=${effectiveBranchId}&limit=${queryLimit}` : `${API_BASE_URL}/admin/payments?limit=${queryLimit}`;
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            const data = await resp.json();
            setPayments((data?.payments || []) as Payment[]);
            setError(null);
          } else {
            // Fallback to client-side subcollection scanning
            if (effectiveBranchId && effectiveBranchId !== 'all') {
              const fallbackPayments = await fetchPaymentsFromBranchSubcollections(effectiveBranchId, queryLimit);
              setPayments(fallbackPayments);
              setError(null);
            } else {
              const branchesSnapshot = await getDocs(collection(db, 'branches'));
              const aggregated: Payment[] = [] as any;
              for (const branchDoc of branchesSnapshot.docs) {
                const branchIdAll = branchDoc.id;
                const branchPayments = await fetchPaymentsFromBranchSubcollections(branchIdAll, Math.ceil(queryLimit / branchesSnapshot.docs.length) || 25);
                aggregated.push(...branchPayments);
              }
              setPayments(aggregated.slice(0, queryLimit));
              setError(null);
            }
          }
        } catch (apiErr) {
          // Last resort fallback
          if (effectiveBranchId && effectiveBranchId !== 'all') {
            const fallbackPayments = await fetchPaymentsFromBranchSubcollections(effectiveBranchId, queryLimit);
            setPayments(fallbackPayments);
            setError(null);
          } else {
            const branchesSnapshot = await getDocs(collection(db, 'branches'));
            const aggregated: Payment[] = [] as any;
            for (const branchDoc of branchesSnapshot.docs) {
              const branchIdAll = branchDoc.id;
              const branchPayments = await fetchPaymentsFromBranchSubcollections(branchIdAll, Math.ceil(queryLimit / branchesSnapshot.docs.length) || 25);
              aggregated.push(...branchPayments);
            }
            setPayments(aggregated.slice(0, queryLimit));
            setError(null);
          }
        }
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
