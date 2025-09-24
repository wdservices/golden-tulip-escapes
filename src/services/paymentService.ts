import { doc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FlutterwaveVerificationResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
  };
}

export interface PaymentRecord {
  id?: string;
  bookingId: string;
  transactionId: string;
  flutterwaveRef: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed' | 'cancelled';
  paymentMethod: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  createdAt: Timestamp;
  verifiedAt?: Timestamp;
  verificationData?: any;
}

class PaymentService {
  private readonly FLUTTERWAVE_SECRET_KEY = import.meta.env.FLUTTERWAVE_SECRET_KEY || 'FLWSECK-43b08a6ed3ef3838b8058cf3ed06c67b-19971079b77vt-X';
  private readonly FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

  /**
   * Verify payment with Flutterwave
   */
  async verifyPayment(transactionId: string): Promise<FlutterwaveVerificationResponse> {
    try {
      const response = await fetch(`${this.FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw new Error('Failed to verify payment with Flutterwave');
    }
  }

  /**
   * Create payment record in database
   */
  async createPaymentRecord(paymentData: Omit<PaymentRecord, 'id' | 'createdAt'>): Promise<string> {
    try {
      const paymentRecord: Omit<PaymentRecord, 'id'> = {
        ...paymentData,
        createdAt: Timestamp.fromDate(new Date()),
      };

      const docRef = await addDoc(collection(db, 'payments'), paymentRecord);
      return docRef.id;
    } catch (error) {
      console.error('Failed to create payment record:', error);
      throw new Error('Failed to create payment record');
    }
  }

  /**
   * Update payment record with verification data
   */
  async updatePaymentRecord(
    paymentId: string, 
    verificationData: FlutterwaveVerificationResponse,
    status: PaymentRecord['status']
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        status,
        verifiedAt: Timestamp.fromDate(new Date()),
        verificationData: verificationData.data,
      });
    } catch (error) {
      console.error('Failed to update payment record:', error);
      throw new Error('Failed to update payment record');
    }
  }

  /**
   * Update booking payment status
   */
  async updateBookingPaymentStatus(
    bookingId: string, 
    paymentStatus: 'paid' | 'pending' | 'refunded',
    transactionRef?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        paymentStatus,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      if (transactionRef) {
        updateData.transactionRef = transactionRef;
      }

      if (paymentStatus === 'paid') {
        updateData.paidAt = Timestamp.fromDate(new Date());
      }

      await updateDoc(doc(db, 'bookings', bookingId), updateData);
    } catch (error) {
      console.error('Failed to update booking payment status:', error);
      throw new Error('Failed to update booking payment status');
    }
  }

  /**
   * Process payment verification and update records
   */
  async processPaymentVerification(
    transactionId: string,
    bookingId: string,
    expectedAmount: number
  ): Promise<{ success: boolean; message: string; verificationData?: FlutterwaveVerificationResponse }> {
    try {
      // Verify payment with Flutterwave
      const verificationData = await this.verifyPayment(transactionId);

      if (verificationData.status !== 'success') {
        return {
          success: false,
          message: 'Payment verification failed',
          verificationData,
        };
      }

      const { data } = verificationData;

      // Check if payment was successful
      if (data.status !== 'successful') {
        return {
          success: false,
          message: `Payment status: ${data.status}`,
          verificationData,
        };
      }

      // Verify amount matches
      if (data.amount !== expectedAmount) {
        return {
          success: false,
          message: `Amount mismatch. Expected: ${expectedAmount}, Received: ${data.amount}`,
          verificationData,
        };
      }

      // Update booking payment status to paid
      await this.updateBookingPaymentStatus(bookingId, 'paid', data.flw_ref);

      return {
        success: true,
        message: 'Payment verified successfully',
        verificationData,
      };
    } catch (error) {
      console.error('Payment verification process failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment verification failed',
      };
    }
  }

  /**
   * Handle payment webhook (for server-side verification)
   */
  async handlePaymentWebhook(webhookData: any): Promise<void> {
    try {
      const { event, data } = webhookData;

      if (event === 'charge.completed') {
        const { tx_ref, status, amount, flw_ref } = data;
        
        // Extract booking ID from transaction reference
        const bookingId = tx_ref.replace('hoteleasy_', '').split('_')[1];

        if (status === 'successful') {
          await this.updateBookingPaymentStatus(bookingId, 'paid', flw_ref);
        }
      }
    } catch (error) {
      console.error('Webhook processing failed:', error);
      throw new Error('Failed to process payment webhook');
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;