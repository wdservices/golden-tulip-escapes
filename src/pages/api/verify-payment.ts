import { NextApiRequest, NextApiResponse } from 'next';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Paystack verification response type
interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    paid_at: string;
    created_at: string;
    channel: string;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
    gateway_response: string;
    fees: number;
  };
}

// Response type for the API
interface ApiResponse {
  status: 'success' | 'error';
  message: string;
  bookingId?: string;
  error?: string;
  [key: string]: any;
}

// Helper function to send JSON responses
const sendJsonResponse = (res: NextApiResponse<ApiResponse>, status: number, data: Omit<ApiResponse, 'status'>) => {
  return res.status(status).json({
    status: status >= 200 && status < 300 ? 'success' : 'error',
    ...data
  });
};

// Set CORS headers
const allowCors = (fn: Function) => async (req: NextApiRequest, res: NextApiResponse) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Set content type for all responses
  res.setHeader('Content-Type', 'application/json');

  return await fn(req, res);
};

export default allowCors(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Ensure we only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
      error: 'Only POST method is supported',
      code: 'method_not_allowed'
    });
  }

  // Parse and validate request body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON payload',
      code: 'invalid_json'
    });
  }

  const { reference, transactionId, amount, currency, bookingData } = body;

  // Validate required fields
  if (!reference) {
    return sendJsonResponse(res, 400, {
      status: 'error',
      message: 'Payment reference is required',
      code: 'missing_reference'
    });
  }

  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    console.error('Paystack secret key not configured');
    return sendJsonResponse(res, 500, {
      status: 'error',
      message: 'Payment system not configured',
      code: 'server_error'
    });
  }

  try {
    console.log(`🔍 Verifying payment with reference: ${reference}`);

    // Verify payment with Paystack using the secret key
    let response;
    try {
      response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (networkError) {
      console.error('Network error verifying payment:', networkError);
      return sendJsonResponse(res, 503, {
        status: 'error',
        message: 'Unable to connect to payment processor',
        code: 'network_error'
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Paystack API error (${response.status}):`, errorText);

      return sendJsonResponse(res, 400, {
        status: 'error',
        message: 'Payment verification failed',
        code: 'payment_verification_failed'
      });
    }

    let verificationData;
    try {
      verificationData = await response.json();
    } catch (jsonError) {
      console.error('Error parsing Paystack JSON response:', jsonError);
      return sendJsonResponse(res, 502, {
        status: 'error',
        message: 'Invalid JSON response from payment processor',
        code: 'invalid_json_response'
      });
    }

    if (!verificationData.status || !verificationData.data) {
      console.error('Invalid verification data structure:', verificationData);
      return sendJsonResponse(res, 502, {
        status: 'error',
        message: 'Invalid response format from payment processor',
        code: 'invalid_response_format'
      });
    }

    if (verificationData.status === true && verificationData.data.status === 'success') {
      // Payment successful - create booking and update status
      console.log('Payment verified successfully:', verificationData.data);

      try {
        // Convert amount from kobo to naira
        const paidAmount = verificationData.data.amount / 100;

        // Create booking record in Firestore
        const bookingRecord = {
          // Add service account flag for Firestore rules
          serviceAccount: true,
          userId: bookingData?.userId || '',
          guestName: bookingData?.guestName || `${verificationData.data.customer.first_name} ${verificationData.data.customer.last_name}`.trim(),
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

        // Save booking to branch subcollection
        const docRef = await addDoc(collection(db, 'branches', bookingData.branchId, 'bookings'), {
          ...bookingRecord,
          serviceAccount: true
        });
        console.log('Booking created successfully with ID:', docRef.id);

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

      } catch (dbError: any) {
        console.error('Database error while creating booking:', dbError);

        return sendJsonResponse(res, 500, {
          status: 'error',
          message: 'Payment verified but failed to create booking record',
          code: 'database_error',
          error: process.env.NODE_ENV === 'development' ? dbError.message : 'Internal server error'
        });
      }
    } else {
      // Payment failed or not successful
      const failureMessage = verificationData.message || 'Payment verification failed';
      console.log(`❌ Payment verification failed (${verificationData.data?.status}):`, failureMessage);

      return sendJsonResponse(res, 400, {
        status: 'failed',
        message: failureMessage,
        code: 'payment_failed',
        data: {
          status: verificationData.data?.status,
          reference: verificationData.data?.reference,
          amount: verificationData.data?.amount,
          currency: verificationData.data?.currency,
          gatewayResponse: verificationData.data?.gateway_response || null
        }
      });
    }
  } catch (error: any) {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const errorMessage = error.message || 'An unexpected error occurred';

    console.error(`🔥 [${errorId}] Unhandled error in payment verification:`, {
      error: errorMessage,
      stack: error.stack,
      reference: req.body?.reference,
      body: req.body
    });

    // Return a clean error response
    return res.status(500).json({
      status: 'error',
      message: 'Payment processing failed',
      error: errorMessage,
      errorId
    });
  }
});