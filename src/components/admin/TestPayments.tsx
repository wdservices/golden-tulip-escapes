import React from 'react';
import { usePayments } from '@/hooks/usePayments';

const TestPayments: React.FC = () => {
  const { payments, isLoading, error } = usePayments();

  if (isLoading) {
    return <div>Loading payments...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h3>Payments ({payments.length})</h3>
      {payments.length === 0 ? (
        <p>No payments found</p>
      ) : (
        <div>
          {payments.map((payment) => (
            <div key={payment.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <p><strong>ID:</strong> {payment.id}</p>
              <p><strong>Amount:</strong> {payment.amount}</p>
              <p><strong>Status:</strong> {payment.status}</p>
              <p><strong>Method:</strong> {payment.paymentMethod}</p>
              <p><strong>Created:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
              <p><strong>Booking ID:</strong> {payment.bookingId}</p>
              <p><strong>Branch ID:</strong> {payment.branchId}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestPayments;