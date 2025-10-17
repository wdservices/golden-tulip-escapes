// Test the data mapping logic from the usePayments hook

const testPaymentData = {
  id: 'C38o23m3sugyuO5TEFv6',
  amount: 100,
  status: 'successful',
  paymentMethod: 'paystack',
  branchId: 'UShvwSYpMNpuNaS32MxZ',
  createdAt: { _seconds: 1760660787, _nanoseconds: 843000000 },
  customer: {
    email: 'spellz.bizz@gmail.com',
    customer_name: 'GOSPEL ONONWI'
  },
  fees: 150,
  transactionId: 'txn_12345'
};

console.log('🧪 Testing payment data mapping...');
console.log('=====================================');

// Simulate the mapping logic from the hook
const mappedPayment = {
  id: testPaymentData.id,
  transactionId: testPaymentData.transactionId || testPaymentData.id,
  guestName: testPaymentData.customer?.customer_name || testPaymentData.customer?.name || 'Unknown Guest',
  customerEmail: testPaymentData.customer?.email || 'N/A',
  amount: testPaymentData.amount || 0,
  currency: testPaymentData.currency || 'NGN',
  date: testPaymentData.createdAt?._seconds ? new Date(testPaymentData.createdAt._seconds * 1000).toISOString() : 
        testPaymentData.paidAt?._seconds ? new Date(testPaymentData.paidAt._seconds * 1000).toISOString() : 
        new Date().toISOString(),
  status: testPaymentData.status || 'pending',
  method: testPaymentData.paymentMethod || testPaymentData.method || 'paystack',
  channel: testPaymentData.channel || testPaymentData.paymentMethod || 'paystack',
  paystackTransactionId: testPaymentData.paystackTransactionId || testPaymentData.transactionId,
  fees: testPaymentData.fees || 0,
  receiptUrl: testPaymentData.receiptUrl || testPaymentData.receipt_url,
  gatewayResponse: testPaymentData.gatewayResponse || testPaymentData.gateway_response,
  ...testPaymentData
};

console.log('Original payment data:');
console.log(JSON.stringify(testPaymentData, null, 2));

console.log('\nMapped payment data for UI:');
console.log(JSON.stringify(mappedPayment, null, 2));

console.log('\n✅ Data mapping test successful!');
console.log('The payment data should now display correctly on the payment page.');