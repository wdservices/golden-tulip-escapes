import { doc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    created_at: string;
    channel: string;
    gateway_response: string;
    customer: {
      email: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
    };
  };
}

export interface PaymentRecord {
  id?: string;
  bookingId: string;
  transactionId: string;
  paystackRef?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed' | 'cancelled';
  paymentMethod: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  createdAt: Timestamp;
  verifiedAt?: Timestamp;
  notes?: string;
  verificationData?: any;
}

class PaymentService {
  private readonly PAYSTACK_SECRET_KEY = import.meta.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;

  /**
   * Verify payment with Paystack
   */
  async verifyPaystackPayment(reference: string): Promise<PaystackVerificationResponse> {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paystack payment verification failed:', error);
      throw new Error('Failed to verify payment with Paystack');
    }
  }

  /**
   * Process Paystack payment verification and update records
   */
  async processPaystackVerification(
    reference: string,
    bookingId: string,
    branchId: string,
    expectedAmount: number
  ): Promise<{ success: boolean; message: string; verificationData?: PaystackVerificationResponse }> {
    try {
      // Verify payment with Paystack
      const verificationData = await this.verifyPaystackPayment(reference);

      if (!verificationData.status) {
        return {
          success: false,
          message: verificationData.message || 'Payment verification failed',
          verificationData,
        };
      }

      const { data } = verificationData;

      // Check if payment was successful
      if (data.status !== 'success') {
        return {
          success: false,
          message: `Payment status: ${data.status}`,
          verificationData,
        };
      }

      // Verify amount matches (convert from kobo to naira)
      const paidAmount = data.amount / 100;
      if (paidAmount !== expectedAmount) {
        return {
          success: false,
          message: `Amount mismatch. Expected: ₦${expectedAmount}, Received: ₦${paidAmount}`,
          verificationData,
        };
      }

      // Update booking payment status to paid
      await this.updateBookingPaymentStatus(bookingId, branchId, 'paid', data.reference);

      // Create payment record
      await this.createPaymentRecord({
        bookingId,
        branchId,
        transactionId: data.reference,
        paystackRef: data.reference,
        amount: paidAmount,
        currency: data.currency,
        status: 'successful',
        paymentMethod: 'paystack',
        customerEmail: data.customer.email,
        customerName: `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim(),
        customerPhone: data.customer.phone || '',
        verificationData: data
      });

      return {
        success: true,
        message: 'Payment verified successfully',
        verificationData,
      };
    } catch (error) {
      console.error('Paystack payment verification process failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment verification failed',
      };
    }
  }

  /**
   * Create payment record in database
   */
  async createPaymentRecord(paymentData: Omit<PaymentRecord, 'id' | 'createdAt'> & { branchId: string; bookingId: string }): Promise<string> {
    try {
      const { branchId, bookingId, ...recordData } = paymentData;
      const paymentRecord: Omit<PaymentRecord, 'id'> = {
        ...recordData,
        createdAt: Timestamp.fromDate(new Date()),
      };

      const docRef = await addDoc(collection(db, 'branches', branchId, 'bookings', bookingId, 'payments'), paymentRecord);
      return docRef.id;
    } catch (error) {
      console.error('Failed to create payment record:', error);
      throw new Error('Failed to create payment record');
    }
  }

  /**
   * Update payment record status
   */
  async updatePaymentRecord(
    paymentId: string,
    branchId: string,
    status: PaymentRecord['status'],
    notes?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        verifiedAt: Timestamp.fromDate(new Date()),
      };

      if (notes) {
        updateData.notes = notes;
      }

      await updateDoc(doc(db, 'branches', branchId, 'payments', paymentId), updateData);
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
    branchId: string,
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

      await updateDoc(doc(db, 'branches', branchId, 'bookings', bookingId), updateData);
    } catch (error) {
      console.error('Failed to update booking payment status:', error);
      throw new Error('Failed to update booking payment status');
    }
  }

  /**
   * Mark payment as completed manually (for cash/bank transfer payments)
   */
  async markPaymentAsCompleted(
    bookingId: string,
    branchId: string,
    paymentMethod: string = 'manual',
    notes?: string
  ): Promise<void> {
    try {
      // Update booking payment status
      await this.updateBookingPaymentStatus(bookingId, branchId, 'paid');

      // Create payment record
      await this.createPaymentRecord({
        bookingId,
        branchId,
        transactionId: `manual_${Date.now()}`,
        amount: 0, // Amount should be provided by the caller
        currency: 'NGN',
        status: 'successful',
        paymentMethod,
        customerEmail: '',
        customerName: '',
        customerPhone: '',
        notes: notes || 'Payment marked as completed manually'
      });

    } catch (error) {
      console.error('Failed to mark payment as completed:', error);
      throw new Error('Failed to mark payment as completed');
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;