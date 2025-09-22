import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, 
  Calendar, 
  MapPin, 
  Users, 
  Bed, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { paymentService } from '@/services/paymentService';

// Flutterwave types
interface FlutterwaveResponse {
  status: 'successful' | 'cancelled';
  transaction_id: string;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    phone_number: string;
    name: string;
  };
  payment_type: string;
}

interface PaymentData {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phonenumber: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  callback: (response: FlutterwaveResponse) => void;
  onclose: () => void;
}

interface BookingData {
  branchId: string;
  branchName: string;
  roomType: string;
  roomPrice: number;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
}

interface FlutterwavePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: BookingData;
  onPaymentSuccess: (bookingId: string, transactionData: any) => void;
  onPaymentError: (error: string) => void;
}

// Flutterwave configuration
const FLUTTERWAVE_PUBLIC_KEY = "FLWPUBK-a8b7e524d918d3cfb55789b1969d35a1-X";

// Declare Flutterwave global
declare global {
  interface Window {
    FlutterwaveCheckout: (data: PaymentData) => void;
  }
}

export const FlutterwavePaymentModal: React.FC<FlutterwavePaymentModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'review' | 'processing' | 'success' | 'error'>('review');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [flutterwaveLoaded, setFlutterwaveLoaded] = useState(false);

  // Calculate total amount
  const totalAmount = bookingData.roomPrice * bookingData.nights;
  const serviceCharge = Math.round(totalAmount * 0.05); // 5% service charge
  const tax = Math.round(totalAmount * 0.075); // 7.5% VAT
  const finalAmount = totalAmount + serviceCharge + tax;

  // Load Flutterwave script
  useEffect(() => {
    const loadFlutterwaveScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://checkout.flutterwave.com/v3.js"]');
      
      if (window.FlutterwaveCheckout) {
        console.log('Flutterwave already loaded');
        setFlutterwaveLoaded(true);
        return;
      }

      if (existingScript) {
        console.log('Flutterwave script exists, waiting for load...');
        existingScript.addEventListener('load', () => {
          console.log('Flutterwave script loaded successfully');
          setFlutterwaveLoaded(true);
        });
        return;
      }

      console.log('Loading Flutterwave script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      script.onload = () => {
        console.log('Flutterwave script loaded successfully');
        setFlutterwaveLoaded(true);
      };
      script.onerror = (error) => {
        console.error('Failed to load Flutterwave script:', error);
        toast({
          title: "Payment System Error",
          description: "Failed to load payment system. Please check your internet connection and try again.",
          variant: "destructive"
        });
        setFlutterwaveLoaded(false);
      };
      document.head.appendChild(script);
    };

    if (isOpen) {
      loadFlutterwaveScript();
    }
  }, [isOpen, toast]);

  // Generate unique transaction reference
  const generateTxRef = () => {
    return `golden_tulip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Create booking in database
  const createBooking = async (transactionData: FlutterwaveResponse) => {
    try {
      const newBooking = {
        userId: currentUser?.uid,
        branchId: bookingData.branchId,
        branchName: bookingData.branchName,
        roomType: bookingData.roomType,
        checkInDate: Timestamp.fromDate(bookingData.checkInDate),
        checkOutDate: Timestamp.fromDate(bookingData.checkOutDate),
        status: 'confirmed' as const,
        totalAmount: finalAmount,
        paymentStatus: 'paid' as const,
        bookingDate: Timestamp.fromDate(new Date()),
        guests: bookingData.adults + bookingData.children,
        nights: bookingData.nights,
        specialRequests: bookingData.specialRequests || '',
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        
        // Payment details
        paymentMethod: 'flutterwave',
        paymentDate: Timestamp.fromDate(new Date()),
        transactionId: transactionData.transaction_id,
        transactionRef: transactionData.tx_ref,
        flutterwaveRef: transactionData.flw_ref,
        
        // Financial breakdown
        baseRate: totalAmount,
        serviceCharge: serviceCharge,
        tax: tax,
        roomPrice: bookingData.roomPrice,
        
        // Additional fields
        source: 'website' as const,
        marketSegment: 'leisure' as const,
      };

      const bookingRef = await addDoc(collection(db, 'bookings'), newBooking);
      return bookingRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  // Handle payment initiation
  const handlePayment = async () => {
    if (!flutterwaveLoaded) {
      toast({
        title: "Payment System Loading",
        description: "Please wait for the payment system to load.",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete payment.",
        variant: "destructive"
      });
      return;
    }

    // Validate booking data
    if (!bookingData.roomType || !bookingData.roomPrice || bookingData.roomPrice <= 0) {
      toast({
        title: "Invalid Room Selection",
        description: "Please select a valid room type with pricing.",
        variant: "destructive"
      });
      return;
    }

    if (!bookingData.guestEmail || !bookingData.guestName || !bookingData.guestPhone) {
      toast({
        title: "Missing Guest Information",
        description: "Please provide complete guest information.",
        variant: "destructive"
      });
      return;
    }

    if (finalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Unable to calculate booking amount. Please check your selection.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');
    
    const txRef = generateTxRef();
    setTransactionRef(txRef);

    const paymentData: PaymentData = {
      public_key: FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: txRef,
      amount: finalAmount,
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      customer: {
        email: bookingData.guestEmail,
        phonenumber: bookingData.guestPhone,
        name: bookingData.guestName,
      },
      customizations: {
        title: "Golden Tulip Hotel Booking",
        description: `${bookingData.roomType} for ${bookingData.nights} night(s) at ${bookingData.branchName}`,
        logo: "https://golden-tulip-hotels.com/logo.png",
      },
      callback: async (response: FlutterwaveResponse) => {
        console.log('Payment response:', response);
        
        if (response.status === 'successful') {
          try {
            setPaymentStep('processing');
            
            // First create the booking
            const bookingId = await createBooking(response);
            
            // Create payment record
            const paymentRecordId = await paymentService.createPaymentRecord({
              bookingId,
              transactionId: response.transaction_id.toString(),
              flutterwaveRef: response.flw_ref,
              amount: finalAmount,
              currency: 'NGN',
              status: 'pending',
              paymentMethod: 'flutterwave',
              customerEmail: bookingData.guestEmail,
              customerName: bookingData.guestName,
              customerPhone: bookingData.guestPhone,
            });

            // Verify payment with Flutterwave
            const verificationResult = await paymentService.processPaymentVerification(
              response.transaction_id.toString(),
              bookingId,
              finalAmount
            );

            if (verificationResult.success) {
              // Update payment record
              await paymentService.updatePaymentRecord(
                paymentRecordId,
                verificationResult.verificationData!,
                'successful'
              );

              setPaymentStep('success');
              
              toast({
                title: "Payment Successful!",
                description: "Your booking has been confirmed. You will receive a confirmation email shortly.",
              });
              
              // Call success callback
              onPaymentSuccess(bookingId, response);
              
              // Close modal after a delay
              setTimeout(() => {
                onClose();
                setPaymentStep('review');
                setIsProcessing(false);
              }, 3000);
            } else {
              // Update payment record as failed
              await paymentService.updatePaymentRecord(
                paymentRecordId,
                verificationResult.verificationData!,
                'failed'
              );

              setPaymentStep('error');
              onPaymentError(`Payment verification failed: ${verificationResult.message}`);
            }
            
          } catch (error) {
            console.error('Error processing successful payment:', error);
            setPaymentStep('error');
            onPaymentError('Failed to process payment. Please contact support.');
          }
        } else {
          setPaymentStep('error');
          onPaymentError('Payment was not completed successfully.');
        }
        
        setIsProcessing(false);
      },
      onclose: () => {
        if (paymentStep === 'processing') {
          setPaymentStep('review');
          setIsProcessing(false);
        }
      }
    };

    try {
      window.FlutterwaveCheckout(paymentData);
    } catch (error) {
      console.error('Error initiating payment:', error);
      setPaymentStep('error');
      setIsProcessing(false);
      onPaymentError('Failed to initiate payment. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPaymentStep('review');
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {paymentStep === 'review' && 'Complete Your Payment'}
              {paymentStep === 'processing' && 'Processing Payment...'}
              {paymentStep === 'success' && 'Booking Confirmed!'}
              {paymentStep === 'error' && 'Payment Error'}
            </DialogTitle>
            {!isProcessing && (
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <DialogDescription className="text-center text-muted-foreground">
            Secure payment processing powered by Flutterwave
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Bed className="h-5 w-5 mr-2 text-primary" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{bookingData.branchName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Bed className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{bookingData.roomType}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{bookingData.adults} Adult{bookingData.adults > 1 ? 's' : ''}</span>
                    {bookingData.children > 0 && (
                      <span>, {bookingData.children} Child{bookingData.children > 1 ? 'ren' : ''}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Check-in: {format(bookingData.checkInDate, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Check-out: {format(bookingData.checkOutDate, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{bookingData.nights} Night{bookingData.nights > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Room Rate ({bookingData.nights} night{bookingData.nights > 1 ? 's' : ''})</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge (5%)</span>
                <span>{formatCurrency(serviceCharge)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (7.5%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-primary">{formatCurrency(finalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guest Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{bookingData.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{bookingData.guestEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{bookingData.guestPhone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          {paymentStep === 'processing' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-blue-800 font-medium">Processing your payment...</span>
                </div>
                <p className="text-center text-blue-600 text-sm mt-2">
                  Please complete the payment in the Flutterwave window
                </p>
              </CardContent>
            </Card>
          )}

          {paymentStep === 'success' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-800 font-medium">Payment Successful!</span>
                </div>
                <p className="text-center text-green-600 text-sm mt-2">
                  Your booking has been confirmed. Transaction ID: {transactionRef}
                </p>
              </CardContent>
            </Card>
          )}

          {paymentStep === 'error' && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <span className="text-red-800 font-medium">Payment Failed</span>
                </div>
                <p className="text-center text-red-600 text-sm mt-2">
                  Please try again or contact support if the problem persists
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            {paymentStep === 'review' && (
              <>
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handlePayment} 
                  disabled={!flutterwaveLoaded || isProcessing}
                  className="flex-1"
                >
                  {!flutterwaveLoaded ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay {formatCurrency(finalAmount)}
                    </>
                  )}
                </Button>
              </>
            )}
            
            {paymentStep === 'error' && (
              <>
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Close
                </Button>
                <Button onClick={() => setPaymentStep('review')} className="flex-1">
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlutterwavePaymentModal;