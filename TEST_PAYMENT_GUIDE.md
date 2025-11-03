# Test Payment Guide - Golden Tulip Hotel

## What Should Happen with Test Payments

Yes, you are absolutely correct! With test keys configured, here's exactly what should happen:

### ✅ Expected Behavior

1. **Booking Creation**: Test payments should create real bookings in your system
2. **Admin Dashboard**: The booking should appear in your admin dashboard
3. **Payment Status**: Shows as "paid" even though it's a test transaction
4. **No Real Money**: No actual money is charged or transferred

### 🧪 Test Card Numbers to Use

Use these Paystack test card numbers for successful payments:

**Successful Test Cards:**
- **4084084084084081** (Visa) - Always successful
- **5060666666666666666** (Verve) - Always successful  
- **4187427415564246** (Visa) - Always successful
- **5531886652142950** (Mastercard) - Always successful

**Card Details for Testing:**
- **CVV**: Any 3 digits (e.g., 408)
- **Expiry**: Any future date (e.g., 12/25)
- **PIN**: 1234 (for cards that require PIN)

### 🔍 Troubleshooting Steps

If test payments aren't going through:

1. **Check Browser Console**: 
   - Open Developer Tools (F12)
   - Look for any JavaScript errors
   - Check Network tab for failed API calls

2. **Verify Environment Variables**:
   - Ensure server restarted after updating .env
   - Check that both public and secret keys are test keys

3. **Test Payment Flow**:
   - Go to booking page
   - Fill out booking form
   - Click "Pay Now"
   - Use test card: **4084084084084081**
   - Complete payment

### 🎯 What Happens After Successful Payment

1. **Paystack Popup**: Shows "Payment Successful"
2. **Booking Confirmation**: You get redirected to confirmation page
3. **Database**: Booking is saved to Firestore
4. **Admin Dashboard**: Booking appears with "paid" status
5. **Email**: Confirmation email is sent (if configured)

### 🚨 Common Issues

**If payment popup doesn't appear:**
- Check browser console for errors
- Verify public key is correct
- Ensure no ad blockers are interfering

**If payment succeeds but booking doesn't save:**
- Check server logs for errors
- Verify secret key is correct
- Check Firestore permissions

**If you get "Invalid subaccount" error:**
- This is expected with test keys and live subaccounts
- Our system automatically disables subaccounts in test mode
- Payments will go to your main test account

### 📊 Checking Results

**In Admin Dashboard:**
- Navigate to bookings section
- Look for your test booking
- Status should show "confirmed" and "paid"

**In Paystack Dashboard:**
- Login to your Paystack test dashboard
- Check transactions section
- You should see the test payment

### 🔄 Current Configuration

Your system is now configured with:
- ✅ Test public key: `pk_test_0fe36bf5c04270028d65b233cf71d3afbf5be00b`
- ✅ Test secret key: `sk_test_ff017576aea4a490d6d2d9eb6c78ea520acb34e0`
- ✅ Subaccounts disabled in test mode
- ✅ Server restarted with new keys

## Next Steps

1. Try making a test booking with the test card number above
2. Check if the booking appears in your admin dashboard
3. If issues persist, check browser console and server logs
4. Let me know what specific error messages you see

The test payment should definitely create a booking and show up in your admin dashboard - that's the whole point of test mode!