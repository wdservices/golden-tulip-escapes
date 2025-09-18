import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Create a query to get all bookings, ordered by check-in date
        const q = query(
          collection(db, "bookings"),
          orderBy("checkInDate", "desc")
        );

        const querySnapshot = await getDocs(q);
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

        setBookings(bookingsData);
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        setError(err.message || "Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return {
    bookings,
    isLoading,
    error
  };
};