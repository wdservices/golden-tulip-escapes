import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, updateDoc, addDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { PaymentLogger } from '../../../utils/paymentLogger';
import crypto from 'crypto';

interface PaystackWebhookEvent {
  event: string;
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
    fees: number;
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: any;
      risk_action: string;
    };
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
    plan: any;
    split: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
  };
}

function verifyPaystackSignature(payload: string, signature: string): boolean {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  
  if (!PAYSTACK_SECRET_KEY) {
    console.error('Paystack secret key not configured for webhook verification');
    return false;
  }

  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payload, 'utf8')
    .digest('hex');

  return hash === signature;
}

async function findBookingByReference(reference: string) {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('paystackRef', '==', reference));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, data: doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error finding booking by reference:', error);
    return null;
  }
}

async function createBookingFromWebhook(webhookData: PaystackWebhookEvent['data']) {
  try {
    const paidAmount = webhookData.amount / 100; // Convert from kobo to naira
    
    // Extract booking info from metadata if available
    const metadata = webhookData.metadata || {};
    
    const bookingRecord = {
      userId: metadata.user_id || '',
      guestName: metadata.guest_name || `${webhookData.customer.first_name || ''} ${webhookData.customer.last_name || ''}`.trim(),
      guestEmail: webhookData.customer.email,
      guestPhone: webhookData.customer.phone || '',
      branchId: metadata.branch_id || '',
      branchName: metadata.branch_name || '',
      roomType: metadata.room_type || '',
      roomId: metadata.room_id || metadata.room_type || '',
      checkInDate: metadata.checkin_date ? Timestamp.fromDate(new Date(metadata.checkin_date)) : Timestamp.now(),
      checkOutDate: metadata.checkout_date ? Timestamp.fromDate(new Date(metadata.checkout_date)) : Timestamp.now(),
      adults: parseInt(metadata.adults) || 1,
      children: parseInt(metadata.children) || 0,
      guests: (parseInt(metadata.adults) || 1) + (parseInt(metadata.children) || 0),
      nights: parseInt(metadata.nights) || 1,
      amount: paidAmount,
      totalAmount: paidAmount,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'paystack',
      specialRequests: metadata.special_requests || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      bookingDate: Timestamp.now(),
      paidAt: Timestamp.fromDate(new Date(webhookData.paid_at)),
      
      // Paystack transaction details
      paystackRef: webhookData.reference,
      transactionId: webhookData.id.toString(),
      paystackTransactionId: webhookData.id,
      paymentChannel: webhookData.channel,
      paymentGatewayResponse: webhookData.gateway_response,
      paymentCurrency: webhookData.currency,
      paymentFees: webhookData.fees / 100,
      
      // Mark as created via webhook
      createdViaWebhook: true,
      webhookProcessedAt: Timestamp.now(),
      
      // Store full webhook data for audit
      webhookData: webhookData
    };

    const docRef = await addDoc(collection(db, 'bookings'), bookingRecord);
    console.log('Booking created from webhook with ID:', docRef.id);

    // Create payment record
    const paymentRecord = {
      bookingId: docRef.id,
      transactionId: webhookData.reference,
      paystackTransactionId: webhookData.id,
      amount: paidAmount,
      currency: webhookData.currency,
      status: 'successful',
      paymentMethod: 'paystack',
      customerEmail: webhookData.customer.email,
      customerName: `${webhookData.customer.first_name || ''} ${webhookData.customer.last_name || ''}`.trim(),
      customerPhone: webhookData.customer.phone || '',
      channel: webhookData.channel,
      gatewayResponse: webhookData.gateway_response,
      fees: webhookData.fees / 100,
      createdAt: Timestamp.now(),
      verifiedAt: Timestamp.now(),
      paidAt: Timestamp.fromDate(new Date(webhookData.paid_at)),
      createdViaWebhook: true,
      webhookProcessedAt: Timestamp.now(),
      verificationData: webhookData
    };

    await addDoc(collection(db, 'payments'), paymentRecord);
    console.log('Payment record created from webhook');

    return docRef.id;
  } catch (error) {
    console.error('Error creating booking from webhook:', error);
    throw error;
  }
}

async function updateBookingStatus(bookingId: string, webhookData: PaystackWebhookEvent['data']) {
  try {
    const paidAmount = webhookData.amount / 100;
    
    const updateData = {
      status: 'confirmed',
      paymentStatus: 'paid',
      paidAt: Timestamp.fromDate(new Date(webhookData.paid_at)),
      updatedAt: Timestamp.now(),
      
      // Update Paystack details
      paystackTransactionId: webhookData.id,
      paymentChannel: webhookData.channel,
      paymentGatewayResponse: webhookData.gateway_response,
      paymentCurrency: webhookData.currency,
      paymentFees: webhookData.fees / 100,
      
      // Webhook processing info
      webhookProcessedAt: Timestamp.now(),
      webhookData: webhookData
    };

    await updateDoc(doc(db, 'bookings', bookingId), updateData);
    console.log('Booking status updated via webhook:', bookingId);
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
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

  try {
    // Get the raw body for signature verification
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-paystack-signature'] as string;

    if (!signature) {
      console.error('No Paystack signature found in webhook');
      return res.status(400).json({ 
        status: 'error', 
        message: 'No signature found' 
      });
    }

    // Verify the webhook signature
    if (!verifyPaystackSignature(payload, signature)) {
      console.error('Invalid Paystack webhook signature');
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid signature' 
      });
    }

    const webhookEvent: PaystackWebhookEvent = req.body;
    console.log('Received Paystack webhook:', webhookEvent.event, webhookEvent.data.reference);

    // Log webhook received
    await PaymentLogger.logWebhookReceived(
      webhookEvent.data.reference, 
      webhookEvent.event, 
      webhookEvent.data
    );

    // Handle different webhook events
    switch (webhookEvent.event) {
      case 'charge.success':
        if (webhookEvent.data.status === 'success') {
          try {
            // Check if booking already exists
            const existingBooking = await findBookingByReference(webhookEvent.data.reference);
            
            if (existingBooking) {
              // Update existing booking
              await updateBookingStatus(existingBooking.id, webhookEvent.data);
              console.log('Updated existing booking via webhook:', existingBooking.id);
              
              await PaymentLogger.logBookingCreated(
                webhookEvent.data.reference, 
                existingBooking.id, 
                'webhook'
              );
            } else {
              // Create new booking from webhook data
              const bookingId = await createBookingFromWebhook(webhookEvent.data);
              console.log('Created new booking via webhook:', bookingId);
              
              await PaymentLogger.logBookingCreated(
                webhookEvent.data.reference, 
                bookingId, 
                'webhook'
              );
            }

            return res.status(200).json({ 
              status: 'success', 
              message: 'Webhook processed successfully' 
            });
          } catch (error: any) {
            console.error('Error processing webhook:', error);
            
            await PaymentLogger.logWebhookFailed(
              webhookEvent.data.reference,
              error.message,
              { event: webhookEvent.event, error: error.toString() }
            );
            
            throw error;
          }
        }
        break;

      case 'transfer.success':
      case 'transfer.failed':
      case 'transfer.reversed':
        // Handle transfer events if needed
        console.log('Transfer event received:', webhookEvent.event);
        break;

      default:
        console.log('Unhandled webhook event:', webhookEvent.event);
    }

    return res.status(200).json({ 
      status: 'success', 
      message: 'Webhook received' 
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    
    return res.status(500).json({ 
      status: 'error', 
      message: 'Webhook processing failed',
      error: error.message 
    });
  }
}

// Disable body parsing to get raw body for signature verification
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}