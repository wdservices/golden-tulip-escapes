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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error', 
      message: 'Method not allowed' 
    });
  }

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

  try {
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
      
      // Log the API error
      await PaymentLogger.logVerificationFailed(
        reference, 
        `Paystack API error: ${response.status} - ${errorText}`,
        { status: response.status, errorText }
      );
      
      throw new Error(`Paystack API error: ${response.status}`);
    }

    const verificationData: PaystackVerificationResponse = await response.json();
    console.log('Paystack verification response:', verificationData);

    if (verificationData.status && verificationData.data.status === 'success') {
      // Payment successful - create booking and update status
      console.log('Payment verified successfully:', verificationData.data);
      
      try {
        // Convert amount from kobo to naira
        const paidAmount = verificationData.data.amount / 100;
        
        // Create booking record in Firestore
        const bookingRecord = {
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

        const docRef = await addDoc(collection(db, 'bookings'), bookingRecord);
        console.log('Booking created successfully with ID:', docRef.id);

        // Log successful verification and booking creation
        await PaymentLogger.logVerificationSuccess(reference, verificationData.data, 'backend', docRef.id);
        await PaymentLogger.logBookingCreated(reference, docRef.id, 'backend');

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

        await addDoc(collection(db, 'payments'), paymentRecord);
        console.log('Payment record created successfully');

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
        await PaymentLogger.logBookingFailed(reference, dbError.message, { 
          bookingData, 
          verificationData: verificationData.data 
        });
        
        return res.status(500).json({ 
          status: 'error', 
          message: 'Payment verified but failed to create booking record',
          error: dbError.message 
        });
      }

    } else {
      // Payment failed or not successful
      console.log('Payment verification failed:', verificationData);
      
      // Log verification failure
      await PaymentLogger.logVerificationFailed(
        reference, 
        verificationData.message || 'Payment verification failed',
        verificationData.data
      );
      
      return res.status(400).json({ 
        status: 'failed', 
        message: verificationData.message || 'Payment verification failed',
        data: verificationData.data 
      });
    }

  } catch (error: any) {
    console.error('Payment verification error:', error);
    
    // Log common errors with context
    await PaymentLogger.logCommonErrors(reference, error, 'Payment verification');
    
    return res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Payment verification failed',
      error: error.toString()
    });
  }
}