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
    
    // Sort by createdAt desc and apply limit
    return payments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
              const bookingData = bookingDoc.data();
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

      setPayments(paymentDocs);
    } catch (err) {
      console.error('Error fetching payments:', err);
      
      // Check if it's a Firebase index error
      if (err instanceof Error && err.message.includes('index')) {
        console.warn('Firebase index not available for payments query. Using fallback method.');
        
        // Use fallback method to fetch payments from branch subcollections
        if (effectiveBranchId && effectiveBranchId !== 'all') {
          const fallbackPayments = await fetchPaymentsFromBranchSubcollections(effectiveBranchId, queryLimit);
          setPayments(fallbackPayments);
          setError(null);
        } else {
          console.warn('Cannot use fallback method without branchId');
          setPayments([]);
          setError(null);
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