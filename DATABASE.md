# Database Integration Guide

This document provides an overview of the database integration in the Golden Tulip Escapes application.

## Overview

The application uses Firebase Firestore as its database solution, with a comprehensive set of utilities and hooks to interact with the database in a type-safe and efficient manner.

## Database Structure

The database is organized into the following main collections:

- `users` - User accounts and profiles
- `rooms` - Room types and availability
- `bookings` - Guest reservations
- `branches` - Hotel branch locations
- `payments` - Payment records
- `reviews` - Guest reviews and ratings
- `promotions` - Special offers and discounts
- `settings` - Application settings

## Key Files

### `src/lib/firebase.ts`

Firebase configuration and initialization. This file sets up the Firebase app and exports the Firestore database instance.

### `src/contexts/DatabaseContext.tsx`

Provides database operations through a React context. Includes methods for CRUD operations and querying documents.

### `src/hooks/useCollection.ts`

A custom hook for working with Firestore collections. Provides methods for querying, adding, updating, and deleting documents.

### `src/types/index.ts`

TypeScript type definitions for all database models.

## Usage Examples

### Using the Database Context

```typescript
import { useDatabase } from '@/contexts/DatabaseContext';
import { useEffect, useState } from 'react';
import { Room } from '@/types';

const RoomsList = () => {
  const { getDocument, queryDocuments } = useDatabase();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Query all available rooms
        const availableRooms = await queryDocuments<Room>('rooms', [
          ['isAvailable', '==', true]
        ]);
        setRooms(availableRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [queryDocuments]);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {rooms.map((room) => (
        <div key={room.id}>
          <h3>{room.name}</h3>
          <p>{room.description}</p>
          <p>Price: ${room.pricePerNight}/night</p>
        </div>
      ))}
    </div>
  );
};
```

### Using the useCollection Hook

```typescript
import { useCollection } from '@/hooks/useCollection';
import { Booking } from '@/types';

const UserBookings = ({ userId }: { userId: string }) => {
  const { 
    data: bookings, 
    loading, 
    error 
  } = useCollection<Booking>(
    'bookings',
    [['userId', '==', userId]],
    { orderBy: ['checkInDate', 'desc'] }
  );

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>Your Bookings</h2>
      {bookings.map((booking) => (
        <div key={booking.id}>
          <h3>Booking #{booking.id.slice(0, 6)}</h3>
          <p>Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</p>
          <p>Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
          <p>Status: {booking.status}</p>
        </div>
      ))}
    </div>
  );
};
```

## Form Handling

The application includes a powerful form handling system with validation:

```typescript
import { useForm } from '@/hooks/useForm';

const BookingForm = ({ roomId, onSubmit }) => {
  const { 
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(
    {
      checkInDate: '',
      checkOutDate: '',
      guestCount: 1,
      specialRequests: '',
    },
    {
      checkInDate: { required: true },
      checkOutDate: { required: true },
      guestCount: { 
        required: true,
        min: 1,
        max: 4
      },
    },
    async (formValues) => {
      await onSubmit(formValues);
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Check-in Date</label>
        <input
          type="date"
          name="checkInDate"
          value={values.checkInDate}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.checkInDate && errors.checkInDate && (
          <div className="error">{errors.checkInDate}</div>
        )}
      </div>
      
      {/* Other form fields */}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Booking...' : 'Book Now'}
      </button>
    </form>
  );
};
```

## Security Rules

Firestore security rules are defined in `firestore.rules`. These rules control read and write access to collections and documents.

## Best Practices

1. **Type Safety**: Always use the provided TypeScript types when working with database documents.
2. **Error Handling**: Always handle potential errors when making database calls.
3. **Loading States**: Show appropriate loading states when fetching data.
4. **Pagination**: For large collections, implement pagination using the `limit` and `startAfter` query constraints.
5. **Offline Support**: The database is configured for offline persistence. Handle offline states gracefully in the UI.

## Development

To work with the database locally:

1. Make sure you have the Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```bash
   firebase login
   ```

3. Start the Firebase emulator suite:
   ```bash
   firebase emulators:start
   ```

4. The Firestore emulator UI will be available at http://localhost:4000/firestore

## Deployment

To deploy Firestore rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Testing

Write tests for your database operations using the Firebase emulator. Example test setup:

```typescript
import { initializeTestApp, clearFirestoreData } from '@firebase/rules-unit-testing';

beforeEach(async () => {
  await clearFirestoreData({ projectId: 'your-project-id' });
});

test('can create booking', async () => {
  const testApp = initializeTestApp({
    projectId: 'your-project-id',
    auth: { uid: 'test-user' }
  });
  
  const db = testApp.firestore();
  const bookingRef = await db.collection('bookings').add({
    userId: 'test-user',
    roomId: 'room-123',
    checkInDate: '2023-12-01',
    checkOutDate: '2023-12-05',
    guestCount: 2,
    status: 'confirmed'
  });
  
  const doc = await bookingRef.get();
  expect(doc.exists).toBe(true);
  expect(doc.data().status).toBe('confirmed');
});
```

## Troubleshooting

- **Permission Denied**: Check your Firestore security rules and ensure the user is authenticated if required.
- **Missing Index**: If you see an error about a missing index, create it using the Firebase Console or by running `firebase deploy --only firestore:indexes`.
- **Offline Data**: If you're experiencing issues with offline data, ensure you've called `enableIndexedDbPersistence` in your Firebase initialization.
