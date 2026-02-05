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
          const rootBranchIds = Array.from(pathsToQuery);
          const rootConstraints: any[] = [];
          if (rootBranchIds.length === 1) {
            rootConstraints.push(where("branchId", "==", rootBranchIds[0]));
          } else if (rootBranchIds.length > 1) {
            rootConstraints.push(where("branchId", "in", rootBranchIds));
          }

          if (rootConstraints.length > 0) {
            const rootQuery = query(collection(db, "bookings"), ...rootConstraints, limit(100));
            promises.push(
              retryWithBackoff(() => getDocs(rootQuery), 2, 1000).then(snapshot => snapshot.docs).catch(e => {
                console.warn("Failed to fetch root bookings:", e);
                return [];
              })
            );
          }

          const results = await Promise.all(promises);
          allDocs = results.flat();
        }
        
        // Deduplicate docs by ID
        const uniqueDocs = Array.from(new Map(allDocs.map(d => [d.id, d])).values());
        
        const bookingsData = uniqueDocs.map(doc => {
          const data = doc.data();
          
          // Convert Firestore Timestamps to JavaScript Dates
          // Handle mobile app bookings which use 'checkIn' string instead of 'checkInDate' timestamp
          const checkInVal = data.checkInDate || data.checkIn;
          const checkOutVal = data.checkOutDate || data.checkOut;

          return {
            id: doc.id,
            ...data,
            checkInDate: checkInVal instanceof Timestamp ? checkInVal.toDate() : new Date(checkInVal),
            checkOutDate: checkOutVal instanceof Timestamp ? checkOutVal.toDate() : new Date(checkOutVal),
            bookingDate: data.bookingDate instanceof Timestamp ? data.bookingDate.toDate() : new Date(data.bookingDate || data.createdAt),
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            cancellationDate: data.cancellationDate instanceof Timestamp ? data.cancellationDate.toDate() : data.cancellationDate ? new Date(data.cancellationDate) : undefined
          } as Booking;
        });

        // Sort bookings by createdAt in descending order (client-side) to ensure all bookings are shown
        bookingsData.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
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
