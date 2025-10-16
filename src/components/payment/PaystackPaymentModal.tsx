import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Bed,
  Calendar,
  Users
} from "lucide-react";
import { getPaystackPaymentData, getBranchPaymentConfig } from "@/config/paymentConfig";

// Simple currency formatter to avoid import issues
const formatCurrency = (amount: number, currency: string = 'NGN', locale?: string): string => {
  return new Intl.NumberFormat(locale || 'en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  role?: string;
  branchId?: string;
  joinDate?: string;
  lastLogin?: string;
  preferences?: any;
}

// Paystack types
interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
  redirecturl: string;
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
}

interface BookingData {
  roomType: string;
  roomPrice: number;
  checkInDate: Date;
  checkOutDate: Date;
  branchId: string;
  branchName: string;
  adults: number;
  children: number;
  nights: number;
  specialRequests: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

interface PaystackPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: BookingData;
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentError: (error: string) => void;
}

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxxxxxxxxxxxxxxxxxxxxxxx";

// Declare Paystack global
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

export const PaystackPaymentModal: React.FC<PaystackPaymentModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const totalAmount = bookingData.roomPrice * bookingData.nights * (bookingData.adults + bookingData.children);

  // Load Paystack script
  useEffect(() => {
    if (!isOpen) return;

    const loadPaystackScript = () => {
      // Check if Paystack is already loaded
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      
      if (window.PaystackPop) {
        console.log('Paystack already loaded');
        setPaystackLoaded(true);
        return;
      }

      if (existingScript) {
        console.log('Paystack script exists, waiting for load...');
        existingScript.addEventListener('load', () => {
          console.log('Paystack script loaded successfully');
          setPaystackLoaded(true);
        });
        return;
      }

      console.log('Loading Paystack script...');
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        console.log('Paystack script loaded successfully');
        setPaystackLoaded(true);
      };
      script.onerror = (error) => {
        console.error('Failed to load Paystack script:', error);
        onPaymentError('Failed to load payment system. Please try again.');
        setPaystackLoaded(false);
      };
      
      document.head.appendChild(script);
    };

    loadPaystackScript();

    // Cleanup function
    return () => {
      // Cleanup if needed when component unmounts
    };
  }, [isOpen, onPaymentError]);

  const handlePaymentVerification = useCallback(async (response: PaystackResponse) => {
    setIsProcessing(true);

    try {
      const verifyResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: response.reference,
          transactionId: response.transaction,
          amount: totalAmount,
          currency: 'NGN',
          bookingData: {
            userId: currentUser?.id || null,
            guestName: bookingData.guestName,
            guestEmail: bookingData.guestEmail,
            guestPhone: bookingData.guestPhone,
            branchId: bookingData.branchId,
            branchName: bookingData.branchName,
            roomId: bookingData.roomType,
            roomType: bookingData.roomType,
            checkInDate: bookingData.checkInDate.toISOString(),
            checkOutDate: bookingData.checkOutDate.toISOString(),
            adults: bookingData.adults,
            children: bookingData.children,
            nights: bookingData.nights,
            amount: totalAmount,
            totalAmount: totalAmount,
            specialRequests: bookingData.specialRequests,
            paystackRef: response.reference,
            transactionId: response.transaction,
            paymentMethod: 'paystack',
          }
        })
      });

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        throw new Error(errorText || 'Payment verification failed');
      }

      const verifyData = await verifyResponse.json();

      if (verifyData?.status === 'success' || verifyData?.success === true) {
        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed and payment processed.",
        });

        onPaymentSuccess(verifyData.bookingId || response.reference);
      } else if (verifyData?.error) {
        throw new Error(verifyData.error);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      onPaymentError(error?.message || 'Payment verification failed');
      toast({
        title: "Payment Verification Failed",
        description: error?.message || 'We could not verify your payment. Please contact support.',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [bookingData, currentUser, onPaymentError, onPaymentSuccess, totalAmount]);

  const initiatePayment = useCallback(() => {
    if (!paystackLoaded || !window.PaystackPop) {
      toast({
        title: "Payment Unavailable",
        description: "Payment system is still loading. Please try again shortly.",
        variant: "destructive"
      });
      return;
    }

    // Get branch-specific payment configuration
    const branchConfig = getBranchPaymentConfig(bookingData.branchId);

    // Use the payment configuration helper to get proper payment data
    const paymentData = getPaystackPaymentData(
      totalAmount * 100, // Convert to kobo
      currentUser?.email || bookingData.guestEmail,
      bookingData.branchId,
      {
        custom_fields: [
          {
            display_name: "Guest Name",
            variable_name: "guest_name",
            value: bookingData.guestName
          },
          {
            display_name: "Room Type",
            variable_name: "room_type",
            value: bookingData.roomType
          },
          {
            display_name: "Branch",
            variable_name: "branch",
            value: bookingData.branchName
          },
          {
            display_name: "Check-in Date",
            variable_name: "checkin_date",
            value: bookingData.checkInDate.toISOString().split('T')[0]
          },
          {
            display_name: "Check-out Date",
            variable_name: "checkout_date",
            value: bookingData.checkOutDate.toISOString().split('T')[0]
          }
        ]
      }
    );

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: currentUser?.email || bookingData.guestEmail,
      amount: totalAmount * 100,
      currency: 'NGN',
      ref: `hoteleasy_${Date.now()}`,
      metadata: paymentData.metadata,
      // Add subaccount configuration if available
      ...(branchConfig?.type === 'subaccount' && branchConfig.subaccount && {
        subaccount: branchConfig.subaccount,
        bearer: 'subaccount'
      }),
      callback: (response: PaystackResponse) => {
        handlePaymentVerification(response);
      },
      onClose: () => {
        setIsProcessing(false);
        toast({
          title: "Payment Cancelled",
          description: "Payment was cancelled. You can try again anytime.",
        });
      }
    } as PaystackConfig);

    onClose(); // Close the current modal before opening Paystack iframe
    handler.openIframe();
  }, [bookingData, currentUser?.email, handlePaymentVerification, paystackLoaded, totalAmount]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg overflow-y-auto max-h-screen h-full bg-transparent backdrop-blur-md border-white/20 z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-2xl">Complete Your Payment</DialogTitle>
          <DialogDescription className="text-white/60">
            Review your reservation details and proceed to Paystack to finalize payment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Booking Summary */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Bed className="h-5 w-5 mr-2" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center text-white/70">
                    <User className="h-4 w-4 mr-2" />
                    <span>Guest: {bookingData.guestName}</span>
                  </div>
                  <div className="flex items-center text-white/70">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>Email: {bookingData.guestEmail}</span>
                  </div>
                  <div className="flex items-center text-white/70">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>Phone: {bookingData.guestPhone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-white/70">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Branch: {bookingData.branchName}</span>
                  </div>
                  <div className="flex items-center text-white/70">
                    <Bed className="h-4 w-4 mr-2" />
                    <span>Room: {bookingData.roomType}</span>
                  </div>
                  <div className="flex items-center text-white/70">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Guests: {bookingData.adults + bookingData.children}</span>
                  </div>
                </div>
              </div>
              
              <Separator className="bg-white/20" />
              
              <div className="space-y-2">
                <div className="flex items-center text-white/70">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {bookingData.checkInDate.toLocaleDateString()} - {bookingData.checkOutDate.toLocaleDateString()}
                  </span>
                  <Badge variant="secondary" className="ml-2 bg-yellow-400/20 text-yellow-400">
                    {bookingData.nights} night{bookingData.nights > 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-white font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Secure Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center space-x-4 text-white/70">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-400" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                  <span>Secure Payment</span>
                </div>
              </div>
              
              <div className="text-center text-white/70 text-sm">
                Secure payment processing powered by Paystack
              </div>
              
              {!paystackLoaded && (
                <div className="flex items-center justify-center space-x-2 text-yellow-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading payment system...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!isProcessing) {
                  initiatePayment();
                }
              }}
              disabled={isProcessing || !paystackLoaded}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-6 text-lg"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay {formatCurrency(totalAmount, 'NGN', 'en-NG')}
                </div>
              )}
            </Button>
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-white/70">
                <p className="font-medium text-white mb-1">Payment Instructions:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Click "Pay Now" to open the secure Paystack payment window</li>
                  <li>• Complete your payment using card, bank transfer, or USSD</li>
                  <li>• Your booking will be confirmed automatically after successful payment</li>
                  <li>• Please do not close this window until payment is complete</li>
                </ul>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />
                <div className="text-sm text-white/70">
                  <p className="font-medium text-white">Processing Payment...</p>
                  <p className="text-xs">Please complete the payment in the Paystack window</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaystackPaymentModal;