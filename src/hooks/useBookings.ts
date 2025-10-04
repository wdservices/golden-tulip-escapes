import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, Timestamp, where, limit, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { handleFirebaseError, retryWithBackoff } from '@/utils/firebaseErrorHandler';

export const useBookings = (branchId?: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userMeta, activeBranchId } = useAuth();

  // Use provided branchId or fall back to activeBranchId from context
  const effectiveBranchId = branchId || activeBranchId;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Create a query to get bookings from branch subcollections
        let q;
        
        // Query bookings for the specific branch from subcollection
        if (effectiveBranchId && effectiveBranchId !== 'all') {
          q = query(
            collection(db, "branches", effectiveBranchId, "bookings"),
            limit(100) // Limit to 100 most recent bookings for performance
          );
        } else if (effectiveBranchId === 'all') {
          // For HQ admins with 'all' access, use collection group to get bookings from all branches
          q = query(
            collectionGroup(db, "bookings"),
            limit(100) // Limit to 100 most recent bookings for performance
          );
        } else {
          // If no branch ID, we can't query subcollections, so return empty
          console.warn('No branch ID provided for bookings query');
          setBookings([]);
          setIsLoading(false);
          return;
        }

        let querySnapshot;
        try {
          querySnapshot = await retryWithBackoff(() => getDocs(q), 2, 1000);
        } catch (indexError: any) {
          // If the query fails due to missing index, try a simpler query
          if (indexError?.code === 'failed-precondition' && indexError?.message?.includes('index')) {
            console.warn('Composite index not available, falling back to simple query');
            
            // Fallback to a simpler query without orderBy to avoid index requirement
            if (effectiveBranchId && effectiveBranchId !== 'all') {
              q = query(
                collection(db, "branches", effectiveBranchId, "bookings"),
                limit(150) // Limit fallback query for performance
              );
            } else if (effectiveBranchId === 'all') {
              // For HQ admins with 'all' access, use collection group fallback
              q = query(
                collectionGroup(db, "bookings"),
                limit(150) // Limit fallback query for performance
              );
            } else {
              // No fallback for missing branch ID since we can't query subcollections
              throw new Error('Branch ID is required for querying bookings');
            }
            
            querySnapshot = await retryWithBackoff(() => getDocs(q), 2, 1000);
          } else {
            throw indexError;
          }
        }
        
        const bookingsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Convert Firestore Timestamps to JavaScript Dates
          return {
            id: doc.id,
            ...data,
            checkInDate: data.checkInDate instanceof Timestamp ? data.checkInDate.toDate() : new Date(data.checkInDate),
            checkOutDate: data.checkOutDate instanceof Timestamp ? data.checkOutDate.toDate() : new Date(data.checkOutDate),
            bookingDate: data.bookingDate instanceof Timestamp ? data.bookingDate.toDate() : new Date(data.bookingDate),
            cancellationDate: data.cancellationDate instanceof Timestamp ? data.cancellationDate.toDate() : data.cancellationDate ? new Date(data.cancellationDate) : undefined
          } as Booking;
        });

        // Sort bookings by checkInDate in descending order (client-side)
        bookingsData.sort((a, b) => {
          const dateA = new Date(a.checkInDate);
          const dateB = new Date(b.checkInDate);
          return dateB.getTime() - dateA.getTime();
        });

        setBookings(bookingsData);
      } catch (err: any) {
        const errorInfo = handleFirebaseError(err, 'Loading dashboard data');
        setError(errorInfo.userFriendlyMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [effectiveBranchId, userMeta]);

  return {
    bookings,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      // This will trigger the useEffect to run again
    }
  };
};