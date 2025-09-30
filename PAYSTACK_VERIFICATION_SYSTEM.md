# Paystack Payment Verification System

## Overview
This document outlines the comprehensive Paystack payment verification system implemented for Golden Tulip Hotels. The system ensures secure, reliable payment processing with proper backend verification and admin dashboard integration.

## 🔐 Security Features

### Backend-Only Verification
- **All payment verification happens on the server** using Paystack secret keys
- **Frontend never handles sensitive operations** - only displays UI and collects data
- **Secret keys are never exposed** to the client-side code
- **Proper authorization headers** used for all Paystack API calls

### Webhook Security
- **Signature verification** for all incoming webhooks using HMAC SHA512
- **Automatic booking creation** for payments completed outside the main flow
- **Duplicate prevention** - checks for existing bookings before creating new ones

## 🏗️ System Architecture

### 1. Payment Flow
```
User fills booking form → Paystack payment window → Payment completion → 
Backend verification → Booking creation → Admin dashboard update
```

### 2. API Endpoints

#### `/api/verify-payment` (POST)
- **Purpose**: Verify payment and create booking
- **Security**: Uses Paystack secret key for verification
- **Input**: Payment reference + booking data
- **Output**: Booking ID + verification status
- **Features**:
  - Converts amounts from kobo to naira
  - Creates both booking and payment audit records
  - Comprehensive error handling and logging

#### `/api/paystack/webhook` (POST)
- **Purpose**: Handle automatic payment notifications
- **Security**: Verifies webhook signature
- **Features**:
  - Processes `charge.success` events
  - Updates existing bookings or creates new ones
  - Handles payments completed outside main flow

### 3. Database Structure

#### Bookings Collection
```javascript
{
  // Standard booking fields
  userId: string,
  guestName: string,
  guestEmail: string,
  status: 'confirmed',
  paymentStatus: 'paid',
  
  // Paystack-specific fields
  paystackRef: string,
  paystackTransactionId: number,
  paymentChannel: string,
  paymentGatewayResponse: string,
  paymentFees: number,
  paidAt: Timestamp,
  
  // Audit fields
  paystackResponse: object, // Full Paystack response
  createdViaWebhook: boolean,
  webhookProcessedAt: Timestamp
}
```

#### Payment Logs Collection
```javascript
{
  type: 'verification_success' | 'verification_failed' | 'webhook_received',
  reference: string,
  message: string,
  data: object,
  error: string,
  source: 'frontend' | 'backend' | 'webhook',
  timestamp: Timestamp
}
```

## 📊 Admin Dashboard Integration

### Booking Status Display
- **Confirmed bookings** appear immediately after payment verification
- **Payment status** shows as "Paid" with payment details
- **Transaction information** includes Paystack reference and fees
- **Payment channel** shows how customer paid (card, bank transfer, etc.)

### Audit Trail
- **Complete payment logs** stored in `payment_logs` collection
- **Error tracking** for failed verifications
- **Webhook processing** logs for automatic updates
- **Payment audit records** in `payments` collection

## 🔧 Configuration

### Environment Variables
```env
# Live Paystack Keys (Production)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_1788e59565979a32b6c87507bf7033c57614cce4
PAYSTACK_SECRET_KEY=sk_live_c971f434495a6542b44bce5caa1c5d6ebc116ade
```

### Webhook Setup (Paystack Dashboard)
1. **URL**: `https://yourdomain.com/api/paystack/webhook`
2. **Events**: `charge.success`
3. **Method**: POST
4. **Security**: Automatic signature verification

## 🚨 Error Handling & Debugging

### Common Error Types
1. **Authorization Errors**: Invalid secret key
2. **Reference Not Found**: Transaction doesn't exist
3. **Test/Live Key Mismatch**: Using wrong environment keys
4. **Network Errors**: Connection issues with Paystack
5. **Database Errors**: Firestore write failures

### Debugging Tools
- **Payment logs collection** for all verification attempts
- **Console logging** with detailed error messages
- **Error categorization** for quick issue identification
- **Webhook failure tracking** for missed notifications

### Log Analysis
```javascript
// Query payment logs for debugging
const logs = await getDocs(
  query(
    collection(db, 'payment_logs'),
    where('reference', '==', 'PAYMENT_REFERENCE'),
    orderBy('timestamp', 'desc')
  )
);
```

## 📈 Monitoring & Analytics

### Key Metrics to Track
- **Verification success rate**
- **Webhook processing rate**
- **Payment channel distribution**
- **Error frequency by type**
- **Average processing time**

### Admin Dashboard Features
- **Real-time booking updates** after payment
- **Payment status indicators** (Paid/Pending/Failed)
- **Transaction details** with Paystack references
- **Error logs** for troubleshooting
- **Payment audit trail** for compliance

## 🔄 Payment Flow States

### 1. Payment Initiated
- User clicks "Proceed to Payment"
- Paystack modal opens with booking details
- Payment reference generated

### 2. Payment Processing
- User completes payment in Paystack window
- Paystack processes transaction
- Success/failure callback triggered

### 3. Backend Verification
- Payment reference sent to `/api/verify-payment`
- Server verifies with Paystack using secret key
- Booking created if verification successful

### 4. Admin Dashboard Update
- Booking appears in admin dashboard
- Status shows as "Confirmed" with "Paid" payment status
- All transaction details available for review

### 5. Webhook Backup (Optional)
- Paystack sends webhook notification
- System processes webhook if main flow missed
- Ensures no payments are lost

## 🛡️ Security Best Practices

### Implemented Safeguards
- ✅ **Backend-only verification** using secret keys
- ✅ **Webhook signature verification** prevents spoofing
- ✅ **Amount validation** ensures correct payment amounts
- ✅ **Duplicate prevention** avoids double bookings
- ✅ **Error logging** for security monitoring
- ✅ **Audit trails** for compliance and debugging

### Recommendations
- Monitor payment logs regularly for suspicious activity
- Set up alerts for high error rates
- Review webhook failures weekly
- Keep Paystack keys secure and rotate periodically
- Test payment flow after any system changes

## 📞 Support & Troubleshooting

### For Payment Issues
1. Check payment logs in Firestore
2. Verify Paystack dashboard for transaction status
3. Review error messages in console logs
4. Check webhook delivery in Paystack dashboard

### For Booking Issues
1. Verify booking appears in admin dashboard
2. Check payment status and transaction details
3. Review audit trail in payment logs
4. Confirm webhook processing if applicable

This system provides enterprise-grade payment verification with comprehensive logging, security, and admin dashboard integration for Golden Tulip Hotels.