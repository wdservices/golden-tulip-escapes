import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { PaystackProvider as NativeProvider, usePaystack as useNativePaystack } from 'react-native-paystack-webview';

// Hardcoded key to match App.js. In a real app, use environment variables or a config file.
const PAYSTACK_PUBLIC_KEY = "pk_live_5b8a1cc5108ee14b78f38c309af069f46f59ac83";

export const PaystackProvider = ({ children, ...props }) => {
  if (Platform.OS === 'web') {
    // For Web, we don't need the native provider logic, just render children
    // But we should load the script here to be ready
    useEffect(() => {
        if (!document.getElementById('paystack-script')) {
            const script = document.createElement("script");
            script.src = "https://js.paystack.co/v1/inline.js";
            script.async = true;
            script.id = 'paystack-script';
            document.body.appendChild(script);
        }
    }, []);
    return <>{children}</>;
  }
  return <NativeProvider {...props}>{children}</NativeProvider>;
};

export const usePaystack = () => {
  if (Platform.OS === 'web') {
    return {
      popup: {
        checkout: (props) => {
          console.log('Paystack Web Checkout Initiated', props);
          
          if (!window.PaystackPop) {
              console.error("Paystack script not loaded yet");
              alert("Payment system is loading, please try again in a moment.");
              return;
          }

          const handler = window.PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: props.email || props.billingEmail,
            amount: props.amount * 100, // Convert to kobo for Paystack Inline
            ref: props.reference, // Use the reference generated in BookingScreen
            metadata: props.metadata,
            subaccount: props.subaccount,
            channels: props.channels,
            currency: 'NGN', // Default to NGN
            callback: function(response) {
                console.log('Paystack Web Success:', response);
                // Transform response to match Native SDK structure if necessary, 
                // but processBooking mainly needs the reference.
                // Inline JS response: { reference: "...", message: "...", status: "success", trans: "..." }
                // BookingScreen expects: paymentData?.transactionRef?.reference || paymentData?.reference
                
                if (props.onSuccess) {
                    props.onSuccess({
                        reference: response.reference,
                        status: response.status,
                        transaction: response.trans,
                        transactionRef: response // Pass full response as transactionRef for compatibility
                    });
                }
            },
            onClose: function() {
                console.log('Paystack Web Closed');
                if (props.onCancel) {
                    props.onCancel();
                }
            }
          });

          handler.openIframe();
        },
        newTransaction: (props) => {
            // Similar implementation for newTransaction if needed
            // For now, checkout is the main one used
            this.popup.checkout(props);
        }
      }
    };
  }
  return useNativePaystack();
};
