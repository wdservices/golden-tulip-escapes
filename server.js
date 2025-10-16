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

app.post('/api/init-admin', async (req, res) => {
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
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { reference, bookingData } = req.body;

    if (!reference) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Payment reference is required' 
      });
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

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
      throw new Error(`Paystack API error: ${response.status}`);
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
         
          const bookingRecord = {
            userId: userId,
          guestName: bookingData?.guestName || verificationData.data.customer.first_name + ' ' + verificationData.data.customer.last_name || '',
          guestEmail: bookingData?.guestEmail || verificationData.data.customer.email,
          guestPhone: bookingData?.guestPhone || verificationData.data.customer.phone || '',
          branchId: bookingData?.branchId || '',
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

        const docRef = await db.collection('branches').doc(bookingData.branchId).collection('bookings').add(bookingRecord);
        console.log('Booking created successfully with ID:', docRef.id);

        // Also create a payment record for audit
        const paymentRecord = {
          bookingId: docRef.id,
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

        await db.collection('branches').doc(bookingData.branchId).collection('bookings').doc(docRef.id).collection('payments').add(paymentRecord);
        console.log('Payment record created successfully as subcollection under booking:', docRef.id);

        return res.status(200).json({ 
          status: 'success', 
          message: 'Payment verified and booking created successfully',
          bookingId: docRef.id,
          data: {
            reference: verificationData.data.reference,
            amount: paidAmount,
            currency: verificationData.data.currency,
            channel: verificationData.data.channel,
            paid_at: verificationData.data.paid_at,
            customer: verificationData.data.customer
          }
        });

      } catch (dbError) {
        console.error('Database error while creating booking:', dbError);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Payment verified but failed to create booking record',
          error: dbError.message 
        });
      }

    } else {
      // Payment failed or not successful
      console.log('Payment verification failed:', verificationData);
      
      return res.status(400).json({ 
        status: 'failed', 
        message: verificationData.message || 'Payment verification failed',
        data: verificationData.data 
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    
    return res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Payment verification failed',
      error: error.toString()
    });
  }
});

// Paystack webhook endpoint
app.post('/api/paystack/webhook', async (req, res) => {
  try {
    // Get the raw body for signature verification
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-paystack-signature'];

    if (!signature) {
      console.error('No Paystack signature found in webhook');
      return res.status(400).json({ 
        status: 'error', 
        message: 'No signature found' 
      });
    }

    // Verify the webhook signature
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(payload, 'utf8')
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid Paystack webhook signature');
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid signature' 
      });
    }

    const webhookEvent = req.body;
    console.log('Received Paystack webhook:', webhookEvent.event, webhookEvent.data.reference);

    // Handle different webhook events
    if (webhookEvent.event === 'charge.success' && webhookEvent.data.status === 'success') {
      // Process successful payment
      console.log('Processing successful payment webhook:', webhookEvent.data.reference);
      
      return res.status(200).json({ 
        status: 'success', 
        message: 'Webhook processed successfully' 
      });
    }

    return res.status(200).json({ 
      status: 'success', 
      message: 'Webhook received' 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return res.status(500).json({ 
      status: 'error', 
      message: 'Webhook processing failed',
      error: error.message 
    });
  }
});

// User bookings endpoint
app.get('/api/user-bookings/:userId', async (req, res) => {
  console.log('User bookings API route hit.');
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Fetching bookings for user:', userId);

    // Get all branches
    console.log('Attempting to fetch all branches...');
    const branchesSnapshot = await db.collection('branches').get();
    console.log(`Fetched ${branchesSnapshot.docs.length} branches.`);
    const allBookings = [];
    const branchCount = {};

    // Query each branch's bookings subcollection
    for (const branchDoc of branchesSnapshot.docs) {
      const branchId = branchDoc.id;
      const branchData = branchDoc.data();
      
      try {
        console.log(`Attempting to fetch bookings for branch ${branchId} and user ${userId}...`);
        const bookingsSnapshot = await db
          .collection('branches')
          .doc(branchId)
          .collection('bookings')
          .where('userId', '==', userId)
          .limit(20)
          .get();
        console.log(`Fetched ${bookingsSnapshot.docs.length} bookings for branch ${branchId}.`);

        bookingsSnapshot.forEach((doc) => {
          const data = doc.data();
          const booking = {
            ...data,
            id: doc.id,
            branchName: branchData.name || 'Unknown Branch',
            checkInDate: data.checkInDate?.toDate?.()?.toISOString() || data.checkInDate,
            checkOutDate: data.checkOutDate?.toDate?.()?.toISOString() || data.checkOutDate,
            bookingDate: data.bookingDate?.toDate?.()?.toISOString() || data.bookingDate,
          };
          
          allBookings.push(booking);

          // Count branch usage
          if (branchData.name) {
            branchCount[branchData.name] = (branchCount[branchData.name] || 0) + 1;
          }
        });
      } catch (error) {
        console.error(`Error fetching bookings for branch ${branchId}:`, error);
      }
    }

    // Sort bookings by check-in date (most recent first)
    allBookings.sort((a, b) => {
      const dateA = new Date(a.checkInDate);
      const dateB = new Date(b.checkInDate);
      return dateB.getTime() - dateA.getTime();
    });

    // Calculate stats
    const now = new Date();
    const pastBookings = allBookings.filter(booking => new Date(booking.checkOutDate) < now);
    const upcomingBookings = allBookings.filter(booking => new Date(booking.checkInDate) > now);
    
    // Calculate total nights
    const totalNights = allBookings.reduce((total, booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return total + nights;
    }, 0);

    // Calculate loyalty points (assuming 10 points per night)
    const loyaltyPoints = totalNights * 10;

    // Find favorite branch
    const favoriteBranch = Object.keys(branchCount).length > 0 
      ? Object.keys(branchCount).reduce((a, b) => branchCount[a] > branchCount[b] ? a : b)
      : 'No bookings yet';

    const stats = {
      totalBookings: allBookings.length,
      totalNights,
      pastBookings: pastBookings.length,
      upcomingBookings: upcomingBookings.length,
      loyaltyPoints,
      favoriteBranch,
    };

    console.log('User booking stats:', stats);

    res.status(200).json({
      bookings: allBookings.slice(0, 10), // Return latest 10 bookings
      stats,
    });

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});