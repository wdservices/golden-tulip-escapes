# Golden Tulip Development Guide

## Payment System Configuration

### Issue: Payment Verification Failures in Development

**Problem**: The application was experiencing payment verification failures and JSON parsing errors during development.

**Root Cause**: The application is configured with **live Paystack keys** in the development environment, which causes:
- Test payment references to fail (they don't exist in the live Paystack system)
- JSON parsing errors due to failed API responses
- Inability to test payment flows without real transactions

### Solution: Configure Test Keys for Development

To properly test payments in development, you need to:

1. **Login to your Paystack Dashboard**
   - Go to [https://dashboard.paystack.com](https://dashboard.paystack.com)

2. **Switch to Test Mode**
   - Click the toggle at the top-right corner to switch from "Live" to "Test" mode

3. **Get Test API Keys**
   - Go to Settings > API Keys & Webhooks
   - Under "API Configuration - Test Mode", copy:
     - Test Public Key (starts with `pk_test_`)
     - Test Secret Key (starts with `sk_test_`)

4. **Update Environment Variables**
   - Replace the keys in `.env` file:
   ```env
   VITE_NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_test_key_here
   VITE_PAYSTACK_SECRET_KEY=sk_test_your_actual_test_secret_here
   ```

5. **Restart Development Servers**
   - Stop both Express server and Vite dev server
   - Restart them to pick up new environment variables

### Testing Payment Flow

With test keys configured, you can:
- Use Paystack's test card numbers for testing
- Create test transactions that can be verified
- Test the complete booking and payment flow safely

### Test Card Numbers (Paystack)

For testing successful payments:
- **Card Number**: 4084084084084081
- **Expiry**: Any future date
- **CVV**: Any 3 digits

For testing failed payments:
- **Card Number**: 4084084084084084
- **Expiry**: Any future date  
- **CVV**: Any 3 digits

### Production Deployment

When deploying to production:
1. Switch back to live Paystack keys
2. Ensure webhook URLs are configured for production domain
3. Test with small real transactions before going live

## Current Status

- ✅ Payment verification flow identified and documented
- ⚠️ Currently using live keys (test payments will fail)
- 📋 Need to obtain actual test keys from Paystack dashboard
- 📋 Need to test complete payment flow with test keys

## Next Steps

1. Get actual Paystack test keys from dashboard
2. Update environment configuration
3. Test complete payment flow end-to-end
4. Resolve any remaining frontend timeout errors