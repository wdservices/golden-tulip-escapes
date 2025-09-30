import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PaymentLogEntry {
  type: 'verification_success' | 'verification_failed' | 'webhook_received' | 'webhook_failed' | 'booking_created' | 'booking_failed';
  reference: string;
  message: string;
  data?: any;
  error?: string;
  timestamp: Timestamp;
  source: 'frontend' | 'backend' | 'webhook';
  userId?: string;
  bookingId?: string;
}

export class PaymentLogger {
  static async log(entry: Omit<PaymentLogEntry, 'timestamp'>) {
    try {
      const logEntry: PaymentLogEntry = {
        ...entry,
        timestamp: Timestamp.now()
      };

      // Log to console for development
      console.log(`[PaymentLogger] ${entry.type}:`, {
        reference: entry.reference,
        message: entry.message,
        source: entry.source,
        data: entry.data,
        error: entry.error
      });

      // Store in Firestore for production debugging
      await addDoc(collection(db, 'payment_logs'), logEntry);
    } catch (error) {
      console.error('Failed to log payment event:', error);
    }
  }

  static async logVerificationSuccess(reference: string, data: any, source: 'frontend' | 'backend' = 'backend', bookingId?: string) {
    await this.log({
      type: 'verification_success',
      reference,
      message: 'Payment verification successful',
      data,
      source,
      bookingId
    });
  }

  static async logVerificationFailed(reference: string, error: string, data?: any, source: 'frontend' | 'backend' = 'backend') {
    await this.log({
      type: 'verification_failed',
      reference,
      message: 'Payment verification failed',
      error,
      data,
      source
    });
  }

  static async logWebhookReceived(reference: string, event: string, data: any) {
    await this.log({
      type: 'webhook_received',
      reference,
      message: `Webhook received: ${event}`,
      data,
      source: 'webhook'
    });
  }

  static async logWebhookFailed(reference: string, error: string, data?: any) {
    await this.log({
      type: 'webhook_failed',
      reference,
      message: 'Webhook processing failed',
      error,
      data,
      source: 'webhook'
    });
  }

  static async logBookingCreated(reference: string, bookingId: string, source: 'backend' | 'webhook' = 'backend') {
    await this.log({
      type: 'booking_created',
      reference,
      message: 'Booking created successfully',
      bookingId,
      source
    });
  }

  static async logBookingFailed(reference: string, error: string, data?: any, source: 'backend' | 'webhook' = 'backend') {
    await this.log({
      type: 'booking_failed',
      reference,
      message: 'Booking creation failed',
      error,
      data,
      source
    });
  }

  // Helper method to log common verification errors
  static async logCommonErrors(reference: string, error: any, context: string) {
    let errorMessage = 'Unknown error';
    let errorType = 'unknown';

    if (error.message?.includes('Authorization')) {
      errorMessage = 'Invalid Paystack secret key or authorization header';
      errorType = 'auth_error';
    } else if (error.message?.includes('404')) {
      errorMessage = 'Transaction reference not found';
      errorType = 'reference_not_found';
    } else if (error.message?.includes('test') && error.message?.includes('live')) {
      errorMessage = 'Test/Live key mismatch';
      errorType = 'key_mismatch';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Network error connecting to Paystack';
      errorType = 'network_error';
    } else {
      errorMessage = error.message || error.toString();
      errorType = 'general_error';
    }

    await this.log({
      type: 'verification_failed',
      reference,
      message: `${context}: ${errorMessage}`,
      error: errorMessage,
      data: {
        errorType,
        originalError: error.toString(),
        context
      },
      source: 'backend'
    });
  }
}

export default PaymentLogger;