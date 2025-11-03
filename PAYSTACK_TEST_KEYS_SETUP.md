# Paystack Test Keys Setup Guide

## 🚨 URGENT: Payment Verification Failures Fixed

The payment verification failures you're experiencing are caused by using **live Paystack keys** in development while making test payments. Test payment references don't exist in the live Paystack system, causing 500 errors.

## ✅ Solution Implemented

I've updated your `.env` file to use test keys, but you need to replace the placeholder keys with your actual Paystack test keys.

## 📋 Steps to Get Your Actual Test Keys

### 1. Login to Paystack Dashboard
- Go to [https://dashboard.paystack.com](https://dashboard.paystack.com)
- Login with your Paystack account credentials

### 2. Switch to Test Mode
- Look for the toggle at the top-right corner of the dashboard
- Click to switch from "Live" to "Test" mode
- The interface should now show "Test Mode" indicator

### 3. Get Your Test API Keys
- Navigate to **Settings** → **API Keys & Webhooks**
- Under "API Configuration - Test Mode", you'll find:
  - **Test Public Key** (starts with `pk_test_`)
  - **Test Secret Key** (starts with `sk_test_`)

### 4. Update Environment Variables
Replace the placeholder keys in your `.env` file:

```env
# Replace these placeholder keys with your actual test keys:
VITE_NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_YOUR_ACTUAL_TEST_PUBLIC_KEY_HERE
VITE_PAYSTACK_SECRET_KEY=sk_test_YOUR_ACTUAL_TEST_SECRET_KEY_HERE
```

### 5. Restart Development Server
After updating the keys:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🧪 Testing Payment Flow

With test keys configured, you can test payments using:

### Test Card Numbers (Successful Payment)
- **Card Number**: `4084084084084081`
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)

### Test Card Numbers (Failed Payment)
- **Card Number**: `4084084084084084`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

## 🔧 Current Status

- ✅ Environment configuration updated to use test keys
- ✅ Development server restarted on port 3001
- ⚠️ **ACTION REQUIRED**: Replace placeholder keys with actual test keys
- 📋 **NEXT**: Test payment flow end-to-end

## 🚀 Production Deployment

When ready for production:

1. **Update .env for production:**
```env
# Uncomment and use live keys:
VITE_NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_5b8a1cc5108ee14b78f38c309af069f46f59ac83
VITE_PAYSTACK_SECRET_KEY=sk_live_99954e0d12d2a5d90b16c92803f8fd9fff9a3963

# Comment out test keys:
# VITE_NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
# VITE_PAYSTACK_SECRET_KEY=sk_test_...
```

2. **Configure webhooks for production domain**
3. **Test with small real transactions first**

## 📞 Support

If you encounter any issues:
1. Verify you're in Test Mode on Paystack dashboard
2. Ensure test keys are correctly copied (no extra spaces)
3. Restart development server after key changes
4. Check browser console for any remaining errors

---

**⚡ Quick Fix Summary:**
The payment verification was failing because live keys were being used with test payments. Now configured for test keys - just replace the placeholders with your actual test keys from Paystack dashboard!