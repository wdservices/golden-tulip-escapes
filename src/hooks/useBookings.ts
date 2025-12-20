import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, Timestamp, where, limit, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { handleFirebaseError, retryWithBackoff } from '@/utils/firebaseErrorHandler';
import { getDatabaseBranchId, getStaticBranchId } from '@/config/branchMappings';

export const useBookings = (branchId?: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);
  const { userMeta, activeBranchId } = useAuth();

  // Use provided branchId or fall back to activeBranchId from context
  const effectiveBranchId = branchId || activeBranchId;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Determine paths to query
        const pathsToQuery = new Set<string>();
        let isAllBranches = false;
        
        if (effectiveBranchId === 'all') {
          isAllBranches = true;
        } else if (effectiveBranchId) {
          const databaseBranchId = getDatabaseBranchId(effectiveBranchId);
          pathsToQuery.add(databaseBranchId);
          
          if (effectiveBranchId !== databaseBranchId) {
            pathsToQuery.add(effectiveBranchId);
          }
          const staticBranchId = getStaticBranchId(effectiveBranchId);
          if (staticBranchId === 'evo-road') {
            pathsToQuery.add('AS5mYsGNnvA4cxLIPL3W');
            pathsToQuery.add('evo-road');
            pathsToQuery.add('URcvGkmbfrOFInlOS4I9');
          }
        } else {
          console.warn('No branch ID provided for bookings query');
          setBookings([]);
          setIsLoading(false);
          return;
        }

        let allDocs: any[] = [];

        if (isAllBranches) {
          const q = query(
            collectionGroup(db, "bookings"),
            limit(100)
          );
          const snapshot = await retryWithBackoff(() => getDocs(q), 2, 1000);
          allDocs = snapshot.docs;
        } else {
          // Fetch from all identified paths in parallel
          const promises = Array.from(pathsToQuery).map(async (branchId) => {
            const q = query(
              collection(db, "branches", branchId, "bookings"),
              limit(100)
            );
            try {
              const snapshot = await retryWithBackoff(() => getDocs(q), 2, 1000);
              return snapshot.docs;
            } catch (e) {
              console.warn(`Failed to fetch bookings for path ${branchId}:`, e);
              return [];
            }
          });
          
          const results = await Promise.all(promises);
          allDocs = results.flat();
        }
        
        // Deduplicate docs by ID
        const uniqueDocs = Array.from(new Map(allDocs.map(d => [d.id, d])).values());
        
        const bookingsData = uniqueDocs.map(doc => {
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
  }, [effectiveBranchId, userMeta, refetchCounter]);

  return {
    bookings,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setRefetchCounter(prev => prev + 1);
    }
  };
};