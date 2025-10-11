import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PaymentLogger } from '../../utils/paymentLogger';

interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    log: any;
    fees: number;
    fees_split: any;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: any;
      risk_action: string;
      international_format_phone: string | null;
    };
    plan: any;
    split: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
  };
}

interface BookingData {
  userId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  branchId: string;
  branchName: string;
  roomType: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children: number;
  nights: number;
  amount: number;
  totalAmount: number;
  specialRequests: string;
  paystackRef: string;
  transactionId: string;
  paymentMethod: string;
}

// Set CORS headers
const allowCors = (fn: Function) => async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  return await fn(req, res);
};

// Helper function to send consistent JSON responses
const sendJsonResponse = (res: NextApiResponse, status: number, data: any) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(status).json(data);
};

export default allowCors(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ensure we only handle POST requests
  if (req.method !== 'POST') {
    return sendJsonResponse(res, 405, { 
      status: 'error', 
      message: 'Method not allowed',
      code: 'method_not_allowed'
    });
  }

  // Parse and validate request body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return sendJsonResponse(res, 400, {
      status: 'error',
      message: 'Invalid JSON payload',
      code: 'invalid_json'
    });
  }

  const { reference, bookingData } = body;

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

    let verificationData;
    try {
      const responseText = await response.text();
      
      if (!responseText) {
        console.error('Empty response from Paystack API');
        return sendJsonResponse(res, 502, {
          status: 'error',
          message: 'Empty response from payment processor',
          code: 'empty_response'
        });
      }
      
      try {
        verificationData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Error parsing Paystack JSON response:', {
          error: jsonError,
          responseText: responseText.length > 500 ? responseText.substring(0, 500) + '...' : responseText
        });
        return sendJsonResponse(res, 502, {
          status: 'error',
          message: 'Invalid JSON response from payment processor',
          code: 'invalid_json_response',
          details: process.env.NODE_ENV === 'development' ? responseText : undefined
        });
      }
    } catch (error) {
      console.error('Unexpected error processing Paystack response:', error);
      return sendJsonResponse(res, 500, {
        status: 'error',
        message: 'Failed to process payment verification',
        code: 'processing_error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    if (!response.ok) {
      const errorMessage = verificationData?.message || 'Unknown error';
      console.error(`❌ Paystack API error (${response.status}):`, errorMessage);
      
      // Log the API error
      await PaymentLogger.logVerificationFailed(
        reference, 
        `Paystack API error: ${response.status} - ${errorMessage}`,
        { 
          status: response.status, 
          error: errorMessage,
          response: verificationData 
        }
      );
      
      return sendJsonResponse(res, 400, {
        status: 'error',
        message: errorMessage,
        code: 'payment_verification_failed',
        details: verificationData
      });
    }

    const verificationData: PaystackVerificationResponse = await response.json();
    console.log('Paystack verification response:', verificationData);

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

        // Save booking to branch subcollection
        // Add service account flag to the document data for Firestore rules
        const docRef = await addDoc(collection(db, 'branches', bookingData.branchId, 'bookings'), {
          ...bookingRecord,
          serviceAccount: true
        });
        console.log('Booking created successfully with ID:', docRef.id);

        // Log successful verification and booking creation
        await PaymentLogger.logVerificationSuccess(reference, verificationData.data, 'backend', docRef.id);
        await PaymentLogger.logBookingCreated(reference, docRef.id, 'backend');

        // Also create a payment record for audit in branch subcollection
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
          verificationData: verificationData.data,
          branchId: bookingData.branchId // Add branchId for reference
        };

        await addDoc(collection(db, 'branches', bookingData.branchId, 'bookings', docRef.id, 'payments'), {
          ...paymentRecord,
          serviceAccount: true
        });
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

      } catch (dbError: any) {
        console.error('Database error while creating booking:', dbError);
        
        // Log database error
        await PaymentLogger.logBookingFailed(reference, dbError.message || 'Unknown database error', { 
          bookingData, 
          verificationData: verificationData?.data,
          error: dbError.stack || dbError.toString()
        });
        
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
      
      // Log verification failure
      await PaymentLogger.logVerificationFailed(
        reference, 
        failureMessage,
        {
          status: verificationData.status,
          data: verificationData.data,
          gatewayResponse: verificationData.data?.gateway_response
        }
      );
      
      return sendJsonResponse(res, 400, { 
        status: 'failed', 
        message: failureMessage,
        code: 'payment_failed',
        data: {
          status: verificationData.data?.status,
          reference: verificationData.data?.reference,
          amount: verificationData.data?.amount,
          currency: verificationData.data?.currency,
          gatewayResponse: verificationData.data?.gateway_response
        }
      });
    }

  } catch (error: any) {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    console.error(`🔥 [${errorId}] Unhandled error in payment verification:`, {
      error: error.message,
      stack: error.stack,
      reference,
      timestamp: new Date().toISOString()
    });
    
    // Log common errors with context
    try {
      await PaymentLogger.logCommonErrors(reference, error, `Payment Verification - ${errorId}`);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return sendJsonResponse(res, 500, {
      status: 'error',
      message: 'An unexpected error occurred',
      code: 'unexpected_error',
      errorId,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});