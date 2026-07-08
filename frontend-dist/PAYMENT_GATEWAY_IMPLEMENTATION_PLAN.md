# Golden Tulip Payment Gateway Implementation Plan
## Paystack Subaccount Integration with Real-time Admin Notifications

### 📋 Overview
This plan outlines the complete implementation of Paystack payment gateway with branch-specific subaccounts, maintaining the current booking flow while adding payment processing and real-time admin notifications with audio alerts.

---

## 🎯 Core Requirements
- ✅ Maintain current booking form flow
- ✅ Branch selection triggers backend subaccount mapping
- ✅ Real-time admin dashboard notifications with beep sound
- ✅ Admin can turn off notification sound when processing
- ✅ Replace current live key with Golden Tulip's Paystack key
- ✅ Payment goes to selected branch's subaccount
- ✅ Branch admin gets immediate notification

---

## 🏗️ Implementation Phases

### **Phase 1: Backend Payment Infrastructure**

#### 1.1 Create Branch-Subaccount Configuration
**File**: `src/config/paymentConfig.ts`
```typescript
// Paystack Configuration
export const paystackConfig = {
  publicKey: 'pk_live_5b8a1cc5108ee14b78f38c309af069f46f59ac83',
  secretKey: 'sk_live_99954e0d12d2a5d90b16c92803f8fd9fff9a3963'
};

export const branchPaymentConfig = {
  // Evo Road Branch
  "evo-road": {
    type: "subaccount",
    subaccount: "ACCT_qly8r7unbtx4mac",
    admin_email: "reservations@goldentulipportharcourt.com",
    branch_name: "GOLDEN TULIP PORT HARCOURT HOTEL"
  },
  
  // Evergreen Branch
  "evergreen": {
    type: "subaccount", 
    subaccount: "ACCT_4d4hq8ovdox9it1",
    admin_email: "reservations@rivotelinternational.com",
    branch_name: "Golden Tulip Evergreen"
  },
  
  // Stadium Road 31 Branch
  "stadium-31": {
    type: "subaccount",
    subaccount: "ACCT_b1eqwfqaj224af3",
    admin_email: "reservationsgt@rivotels.com", 
    branch_name: "Golden Tulip Stadium Road 31"
  },
  
  // Garden City Branch
  "garden-city": {
    type: "subaccount",
    subaccount: "ACCT_cu6y2fdkfr9q8s4",
    admin_email: "fom@rivotels.com",
    branch_name: "Golden Tulip Garden City"
  }
};
```

#### 1.2 Payment Initialization API
**File**: `src/pages/api/payments/initialize.ts`
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { branchPaymentConfig } from '@/config/paymentConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, amount, branchId, bookingData } = req.body;

  // Get branch payment configuration
  const branchConfig = branchPaymentConfig[branchId];
  if (!branchConfig) {
    return res.status(400).json({ message: 'Invalid branch selected' });
  }

  // Prepare payment data
  const paymentData = {
    email: email,
    amount: amount * 100, // Convert to kobo
    callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/verify`,
    metadata: {
      branchId,
      branchName: branchConfig.branch_name,
      bookingData: JSON.stringify(bookingData)
    }
  };

  // Add subaccount if not main account
  if (branchConfig.type === "subaccount" && branchConfig.subaccount) {
    paymentData.subaccount = branchConfig.subaccount;
    paymentData.bearer = "subaccount";
  }

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ 
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference
    });
  } catch (error) {
    console.error('Payment initialization failed:', error);
    res.status(500).json({ message: "Payment initialization failed" });
  }
}
```

#### 1.3 Payment Verification API
**File**: `src/pages/api/payments/verify.ts`
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { branchPaymentConfig } from '@/config/paymentConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ message: 'Payment reference required' });
  }

  try {
    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const paymentData = response.data.data;
    
    if (paymentData.status === 'success') {
      // Extract booking data from metadata
      const { branchId, branchName, bookingData } = paymentData.metadata;
      const parsedBookingData = JSON.parse(bookingData);
      
      // Create booking record
      const newBooking = {
        ...parsedBookingData,
        paymentStatus: 'completed',
        paymentReference: reference,
        paystackTransactionId: paymentData.id,
        amount: paymentData.amount / 100, // Convert back from kobo
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save booking to Firestore
      const docRef = await addDoc(
        collection(db, 'branches', branchId, 'bookings'), 
        newBooking
      );

      // Create payment record
      const paymentRecord = {
        bookingId: docRef.id,
        branchId,
        branchName,
        transactionId: reference,
        paystackTransactionId: paymentData.id,
        amount: paymentData.amount / 100,
        currency: paymentData.currency,
        status: 'successful',
        method: 'paystack',
        channel: paymentData.channel,
        guestName: parsedBookingData.guestName,
        customerEmail: paymentData.customer.email,
        fees: paymentData.fees / 100,
        gatewayResponse: paymentData.gateway_response,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'payments'), paymentRecord);

      // Create real-time notification for admin dashboard
      const notification = {
        type: 'new_booking_payment',
        branchId,
        branchName,
        bookingId: docRef.id,
        amount: paymentData.amount / 100,
        guestName: parsedBookingData.guestName,
        customerEmail: paymentData.customer.email,
        timestamp: serverTimestamp(),
        read: false,
        processed: false
      };

      await addDoc(collection(db, 'admin_notifications'), notification);

      // Redirect to success page
      res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/booking-success?booking=${docRef.id}`);
    } else {
      // Payment failed
      res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/booking-failed?reason=payment_failed`);
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/booking-failed?reason=verification_error`);
  }
}
```

---

### **Phase 2: Frontend Payment Integration**

#### 2.1 Modify Booking Form Submission
**File**: `src/components/ModernBookingForm.tsx`
**Location**: Replace `handleSubmit` function (lines 203-276)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  if (!isAuthenticated || !currentUser) {
    toast({
      title: "Authentication Required",
      description: "Please log in to make a booking",
      variant: "destructive",
    });
    navigate('/login');
    return;
  }

  setIsSubmitting(true);

  try {
    const selectedRoom = roomTypes.find(r => r.id === bookingData.roomType);
    const totalAmount = calculateTotal();
    const nights = Math.ceil((checkOutDate!.getTime() - checkInDate!.getTime()) / (1000 * 60 * 60 * 24));

    // Prepare booking data for payment
    const completeBookingData = {
      userId: currentUser.id,
      branchId: bookingData.branchId,
      roomType: bookingData.roomType,
      checkInDate: checkInDate!,
      checkOutDate: checkOutDate!,
      adults: bookingData.adults,
      children: bookingData.children,
      totalAmount,
      status: 'confirmed',
      guestName: `${bookingData.firstName} ${bookingData.lastName}`,
      guestEmail: bookingData.email,
      guestPhone: bookingData.phone,
      specialRequests: bookingData.specialRequests || undefined,
      nights,
      roomPrice: selectedRoom?.price || 0,
      source: 'website',
      marketSegment: 'leisure',
      rateCode: 'standard'
    };

    // Initialize payment with Paystack
    const response = await fetch('/api/payments/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: bookingData.email,
        amount: totalAmount,
        branchId: bookingData.branchId,
        bookingData: completeBookingData
      }),
    });

    const paymentData = await response.json();

    if (response.ok && paymentData.authorization_url) {
      // Redirect to Paystack payment page
      window.location.href = paymentData.authorization_url;
    } else {
      throw new Error(paymentData.message || 'Payment initialization failed');
    }
  } catch (error) {
    console.error('Payment initialization failed:', error);
    toast({
      title: "Payment Error",
      description: "Unable to initialize payment. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

#### 2.2 Create Success/Failure Pages
**File**: `src/pages/booking-success.tsx`
**File**: `src/pages/booking-failed.tsx`

---

### **Phase 3: Real-time Admin Notifications**

#### 3.1 Admin Notification Hook
**File**: `src/hooks/useAdminNotifications.ts`
```typescript
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminNotification {
  id: string;
  type: 'new_booking_payment' | 'payment_failed' | 'booking_cancelled';
  branchId: string;
  branchName: string;
  bookingId?: string;
  amount?: number;
  guestName?: string;
  customerEmail?: string;
  timestamp: any;
  read: boolean;
  processed: boolean;
}

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { activeBranchId } = useAuth();

  useEffect(() => {
    if (!activeBranchId) return;

    const q = query(
      collection(db, 'admin_notifications'),
      where('branchId', '==', activeBranchId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminNotification[];

      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.read).length);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeBranchId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'admin_notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsProcessed = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'admin_notifications', notificationId), {
        processed: true,
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as processed:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAsProcessed
  };
};
```

#### 3.2 Audio Notification Component
**File**: `src/components/admin/AudioNotification.tsx`
```typescript
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioNotificationProps {
  shouldPlay: boolean;
  onSoundPlayed: () => void;
}

export const AudioNotification = ({ shouldPlay, onSoundPlayed }: AudioNotificationProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (shouldPlay && !isMuted && audioRef.current) {
      audioRef.current.play().catch(console.error);
      onSoundPlayed();
    }
  }, [shouldPlay, isMuted, onSoundPlayed]);

  return (
    <div className="flex items-center">
      <audio ref={audioRef} preload="auto">
        <source src="/notification-beep.mp3" type="audio/mpeg" />
        <source src="/notification-beep.wav" type="audio/wav" />
      </audio>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMuted(!isMuted)}
        className="text-yellow-400 hover:text-yellow-300"
        title={isMuted ? "Enable notification sounds" : "Disable notification sounds"}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
    </div>
  );
};
```

#### 3.3 Admin Notification Panel
**File**: `src/components/admin/NotificationPanel.tsx`
```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CreditCard, User, Clock, CheckCircle } from 'lucide-react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { AudioNotification } from './AudioNotification';
import { formatCurrency } from '@/utils/currencyUtils';

export const NotificationPanel = () => {
  const { notifications, unreadCount, markAsRead, markAsProcessed } = useAdminNotifications();
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const [shouldPlaySound, setShouldPlaySound] = useState(false);

  // Trigger sound when new notifications arrive
  useEffect(() => {
    if (unreadCount > lastNotificationCount && lastNotificationCount > 0) {
      setShouldPlaySound(true);
    }
    setLastNotificationCount(unreadCount);
  }, [unreadCount, lastNotificationCount]);

  const handleProcessNotification = async (notificationId: string) => {
    await markAsProcessed(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_booking_payment':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card className="bg-white/5 border-white/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          <Bell className="h-5 w-5 mr-2 text-yellow-400" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <AudioNotification 
          shouldPlay={shouldPlaySound}
          onSoundPlayed={() => setShouldPlaySound(false)}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.slice(0, 10).map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${
                notification.read 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-yellow-400/10 border-yellow-400/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">
                        New Payment Received
                      </span>
                      {!notification.read && (
                        <Badge variant="secondary" className="text-xs">New</Badge>
                      )}
                    </div>
                    <div className="text-sm text-white/70 mt-1">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{notification.guestName}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <CreditCard className="h-3 w-3" />
                        <span>{formatCurrency(notification.amount || 0)}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {notification.timestamp?.toDate?.()?.toLocaleTimeString() || 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {!notification.processed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleProcessNotification(notification.id)}
                    className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Process
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {notifications.length === 0 && (
            <div className="text-center py-6 text-white/50">
              No notifications yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

#### 3.4 Integrate Notifications into Admin Dashboard
**File**: `src/pages/AdminDashboard.tsx`
**Location**: Add to the main dashboard content (around line 376-380)

```typescript
// Import the NotificationPanel
import { NotificationPanel } from "@/components/admin/NotificationPanel";

// Add to the dashboard content
{activeTab === 'dashboard' ? (
  <div className="p-6">
    <NetworkStatus />
    <div className="grid lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2">
        <AnalyticsDashboard />
      </div>
      <div className="lg:col-span-1">
        <NotificationPanel />
      </div>
    </div>
  </div>
) : (
  // ... existing code
)}
```

---

### **Phase 4: Audio Assets & Environment Setup**

#### 4.1 Audio Files
**Location**: `public/`
- Add `notification-beep.mp3` and `notification-beep.wav` files
- Ensure files are short (1-2 seconds) and not too loud

#### 4.2 Environment Variables
**File**: `.env.local`
```env
# Replace with Golden Tulip's actual Paystack keys
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

---

### **Phase 5: Testing & Deployment Checklist**

#### 5.1 Pre-Implementation Checklist
- [ ] Obtain actual subaccount codes for all branches
- [ ] Get Golden Tulip's Paystack live keys
- [ ] Collect branch admin email addresses
- [ ] Set up room pricing in the system
- [ ] Create audio notification files

#### 5.2 Testing Checklist
- [ ] Test payment initialization for each branch
- [ ] Verify subaccount routing works correctly
- [ ] Test payment success/failure flows
- [ ] Verify booking creation after successful payment
- [ ] Test real-time notifications
- [ ] Test audio notification system
- [ ] Test notification mute/unmute functionality
- [ ] Test admin notification processing

#### 5.3 Deployment Steps
1. Update environment variables with live keys
2. Deploy backend API endpoints
3. Deploy frontend changes
4. Test with small amounts first
5. Monitor payment flows
6. Set up error monitoring and logging

---

### **Phase 6: Additional Enhancements (Future)**

#### 6.1 Advanced Features
- Payment retry mechanism for failed payments
- Partial payment support
- Refund processing through admin dashboard
- Payment analytics and reporting
- SMS notifications to branch admins
- WhatsApp integration for notifications

#### 6.2 Security Enhancements
- Payment webhook signature verification
- Rate limiting on payment endpoints
- Enhanced fraud detection
- PCI compliance measures

---

## 🚀 Implementation Timeline

**Week 1**: Backend payment infrastructure (Phase 1)
**Week 2**: Frontend payment integration (Phase 2)  
**Week 3**: Real-time notifications system (Phase 3)
**Week 4**: Testing, audio setup, and deployment (Phase 4-5)

---

## 📞 Support & Maintenance

- Monitor Paystack dashboard for transaction issues
- Set up automated alerts for failed payments
- Regular testing of notification system
- Monthly review of payment flows and success rates

---

**Note**: This plan maintains your current booking flow while seamlessly integrating payment processing. The branch selection dropdown will automatically trigger the correct subaccount routing in the background, providing a smooth user experience.
