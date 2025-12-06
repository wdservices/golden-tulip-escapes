import express from 'express';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import crypto from 'crypto';

const require = createRequire(import.meta.url);
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  const serviceAccount = require('./service-account.json');

  initializeApp({
    credential: cert(serviceAccount)
  });
}

// Initialize Firestore
const db = getFirestore();

// Create a router to handle routes
const router = express.Router();

// Helper to normalize Firestore Timestamp values into JS Dates
const normalizeFirestoreDate = (value) => {
  if (value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  return value;
};

// Fallback query when collection group indexes are missing
const fetchUserBookingsByBranchFallback = async (userId) => {
  const branchesSnapshot = await db.collection('branches').get();
  if (branchesSnapshot.empty) {
    return [];
  }

  const bookingSnapshots = await Promise.all(
    branchesSnapshot.docs.map(branchDoc =>
      branchDoc.ref.collection('bookings').where('userId', '==', userId).get()
    )
  );

  const bookings = [];
  bookingSnapshots.forEach(snapshot => {
    snapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
  });

  return bookings;
};

// Root route for health check
router.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Golden Tulip API is running' });
});

router.post('/init-admin', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get user by email
    const userRecord = await getAuth().getUserByEmail(email);

    // Set admin role claim
    await getAuth().setCustomUserClaims(userRecord.uid, { role: 'admin' });

    return res.status(200).json({ message: 'Admin role assigned successfully' });
  } catch (error) {
    console.error('Error initializing admin:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Payment verification endpoint
router.post('/verify-payment', async (req, res) => {
  try {
    const { reference, bookingData } = req.body;

    if (!reference) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Payment reference is required' 
      });
    }

    // Support both legacy Vite-prefixed env vars and backend-specific ones
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || process.env.VITE_PAYSTACK_SECRET_KEY;

    if (!PAYSTACK_SECRET_KEY) {
      console.error('Paystack secret key not configured');
      return res.status(500).json({ 
        status: 'error', 
        message: 'Payment system not configured' 
      });
    }

    console.log(`Verifying payment with reference: ${reference}`);
    
    // Verify payment with Paystack using the secret key
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Paystack API error: ${response.status} - ${errorText}`);
      return res.status(400).json({
        status: 'failed',
        message: 'Payment verification failed',
        error: `Paystack API error: ${response.status}`
      });
    }

    const verificationData = await response.json();
    console.log('Paystack verification response:', verificationData);

    if (verificationData.status && verificationData.data.status === 'success') {
      // Payment successful - create booking and update status
      console.log('Payment verified successfully:', verificationData.data);
      
      try {
        // Convert amount from kobo to naira
        const paidAmount = verificationData.data.amount / 100;
        
        // Create booking record in Firestore
         // Ensure userId is never empty - use customer email as fallback identifier
         const userId = bookingData?.userId || verificationData.data.customer.email || 'unknown';
         
         if (!bookingData?.userId) {
           console.warn('Warning: No userId provided in booking data, using fallback:', userId);
         }
         
          const branchId = bookingData?.branchId;
          if (!branchId) {
            console.error('Error: branchId is missing from bookingData.');
            return res.status(400).json({
              status: 'error',
              message: 'Branch ID is required to create a booking.'
            });
          }

          const bookingRecord = {
            userId: userId,
          guestName: bookingData?.guestName || verificationData.data.customer.first_name + ' ' + verificationData.data.customer.last_name || '',
          guestEmail: bookingData?.guestEmail || verificationData.data.customer.email,
          guestPhone: bookingData?.guestPhone || verificationData.data.customer.phone || '',
          branchId: branchId,
          branchName: bookingData?.branchName || '',
          roomType: bookingData?.roomType || '',
          roomId: bookingData?.roomId || bookingData?.roomType || '',
          checkInDate: bookingData?.checkInDate ? Timestamp.fromDate(new Date(bookingData.checkInDate)) : Timestamp.now(),
          checkOutDate: bookingData?.checkOutDate ? Timestamp.fromDate(new Date(bookingData.checkOutDate)) : Timestamp.now(),
          adults: bookingData?.adults || 1,
          children: bookingData?.children || 0,
          guests: (bookingData?.adults || 1) + (bookingData?.children || 0),
          nights: bookingData?.nights || 1,
          amount: paidAmount,
          totalAmount: paidAmount,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'paystack',
          specialRequests: bookingData?.specialRequests || '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          bookingDate: Timestamp.now(),
          paidAt: Timestamp.fromDate(new Date(verificationData.data.paid_at)),
          
          // Paystack transaction details
          paystackRef: verificationData.data.reference,
          transactionId: verificationData.data.id.toString(),
          paystackTransactionId: verificationData.data.id,
          paymentChannel: verificationData.data.channel,
          paymentGatewayResponse: verificationData.data.gateway_response,
          paymentCurrency: verificationData.data.currency,
          paymentFees: verificationData.data.fees / 100, // Convert from kobo
          
          // Store full Paystack response for audit
          paystackResponse: verificationData.data
        };

        const docRef = await db.collection('branches').doc(branchId).collection('bookings').add(bookingRecord);
        console.log('Booking created successfully with ID:', docRef.id);

        // Also create a payment record for audit
        const paymentRecord = {
          bookingId: docRef.id,
          branchId: branchId,
          branchName: bookingData?.branchName || '',
          transactionId: verificationData.data.reference,
          paystackTransactionId: verificationData.data.id,
          amount: paidAmount,
          currency: verificationData.data.currency,
          status: 'successful',
          paymentMethod: 'paystack',
          customerEmail: verificationData.data.customer.email,
          customerName: `${verificationData.data.customer.first_name || ''} ${verificationData.data.customer.last_name || ''}`.trim(),
          customerPhone: verificationData.data.customer.phone || '',
          channel: verificationData.data.channel,
          gatewayResponse: verificationData.data.gateway_response,
          fees: verificationData.data.fees / 100,
          createdAt: Timestamp.now(),
          verifiedAt: Timestamp.now(),
          paidAt: Timestamp.fromDate(new Date(verificationData.data.paid_at)),
          verificationData: verificationData.data
        };

        await db.collection('branches').doc(branchId).collection('bookings').doc(docRef.id).collection('payments').add(paymentRecord);
        console.log('Payment record created successfully as subcollection under booking:', docRef.id);

        return res.status(200).json({ 
          status: 'success', 
          message: 'Payment verified and booking created successfully',
          bookingId: docRef.id,
          data: {
            reference: verificationData.data.reference,
            amount: paidAmount,
            currency: verificationData.data.currency,
            transaction_date: verificationData.data.paid_at,
            status: verificationData.data.status
          }
        });

      } catch (dbError) {
        console.error('Database error creating booking:', dbError);
        // Note: Payment was successful but booking creation failed
        return res.status(500).json({ 
          status: 'partial_success',
          message: 'Payment verified but booking creation failed. Please contact support.',
          reference: verificationData.data.reference,
          error: dbError.message 
        });
      }
    } else {
      return res.status(400).json({
        status: 'failed',
        message: 'Payment verification failed or payment was not successful',
        data: verificationData.data
      });
    }
  } catch (error) {
    console.error('Server error verifying payment:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error during payment verification',
      error: error.message 
    });
  }
});

// Route to fetch user bookings
router.get('/user-bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`Fetching bookings for user: ${userId}`);

    let rawBookings = [];
    try {
      const bookingsSnapshot = await db.collectionGroup('bookings')
        .where('userId', '==', userId)
        .get();

      rawBookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (queryError) {
      const needsIndex = queryError && (
        queryError.code === 9 ||
        (typeof queryError.message === 'string' && queryError.message.includes('requires an index'))
      );

      if (needsIndex) {
        console.warn('Collection group query for user bookings requires an index. Falling back to per-branch scan.');
        rawBookings = await fetchUserBookingsByBranchFallback(userId);
      } else {
        throw queryError;
      }
    }

    const bookings = [];
    let totalNights = 0;
    let upcomingBookings = 0;
    let pastBookings = 0;
    const branchCounts = {};

    rawBookings.forEach(rawBooking => {
      const booking = { ...rawBooking };
      
      // Convert Timestamps to Dates/Strings
      booking.checkInDate = normalizeFirestoreDate(booking.checkInDate);
      booking.checkOutDate = normalizeFirestoreDate(booking.checkOutDate);
      booking.createdAt = normalizeFirestoreDate(booking.createdAt);
      booking.updatedAt = normalizeFirestoreDate(booking.updatedAt);
      
      bookings.push(booking);

      // Calculate stats
      if (booking.nights) totalNights += booking.nights;
      
      if (booking.branchName) {
        branchCounts[booking.branchName] = (branchCounts[booking.branchName] || 0) + 1;
      }

      const now = new Date();
      const checkOut = new Date(booking.checkOutDate);
      if (checkOut >= now) {
        upcomingBookings++;
      } else {
        pastBookings++;
      }
    });

    bookings.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    // Determine favorite branch
    let favoriteBranch = 'No bookings yet';
    let maxCount = 0;
    Object.entries(branchCounts).forEach(([branch, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteBranch = branch;
      }
    });

    const stats = {
      totalBookings: bookings.length,
      totalNights,
      loyaltyPoints: 100 + totalNights,
      upcomingBookings,
      pastBookings,
      favoriteBranch
    };

    return res.status(200).json({ 
      status: 'success', 
      bookings,
      stats
    });

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error fetching bookings',
      error: error.message 
    });
  }
});

// Route to fetch payments (admin)
router.get('/admin/payments', async (req, res) => {
  try {
    const { branchId, limit: queryLimit } = req.query;
    const limitVal = parseInt(queryLimit) || 100;

    console.log(`Fetching admin payments. Branch: ${branchId || 'All'}, Limit: ${limitVal}`);

    let snapshot;
    try {
      let query = db.collectionGroup('payments');
      if (branchId && branchId !== 'all') {
        query = query.where('branchId', '==', branchId);
      }
      query = query.orderBy('createdAt', 'desc').limit(limitVal);
      snapshot = await query.get();
    } catch (e) {
      const needsIndex = (e && (e.code === 9 || (typeof e.message === 'string' && e.message.includes('requires an index'))));
      if (needsIndex) {
        let query = db.collectionGroup('payments');
        if (branchId && branchId !== 'all') {
          query = query.where('branchId', '==', branchId);
        }
        snapshot = await query.limit(limitVal).get();
      } else {
        throw e;
      }
    }
    const payments = [];

    snapshot.forEach(doc => {
      const payment = { id: doc.id, ...doc.data() };
      
      // Convert Timestamps
      if (payment.createdAt && payment.createdAt.toDate) payment.createdAt = payment.createdAt.toDate();
      if (payment.paidAt && payment.paidAt.toDate) payment.paidAt = payment.paidAt.toDate();
      
      payments.push(payment);
    });

    payments.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return res.status(200).json({
      status: 'success',
      data: payments
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error fetching payments',
      error: error.message
    });
  }
});

// Mount the router on both root and /api paths to handle different cPanel configurations
app.use('/', router);
app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
