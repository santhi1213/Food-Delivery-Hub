// lib/payment.ts
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';

// Razorpay Test Keys
const RAZORPAY_KEY_ID = 'rzp_test_T57pzKK2T1l4Yv';
const RAZORPAY_KEY_SECRET = 'Tu1Cd1pmPK19iaGF43oeLVIk';

export interface PaymentOptions {
  orderId: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  error?: string;
}

// For Web - Razorpay Checkout
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const initializeRazorpay = async () => {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return true;
};

export const initiatePayment = (
  options: PaymentOptions,
  onSuccess: (response: PaymentResponse) => void,
  onError: (error: string) => void
) => {
  if (Platform.OS === 'web') {
    initiateWebPayment(options, onSuccess, onError);
  } else {
    initiateMobilePayment(options, onSuccess, onError);
  }
};

// Web Payment
const initiateWebPayment = (
  options: PaymentOptions,
  onSuccess: (response: PaymentResponse) => void,
  onError: (error: string) => void
) => {
  try {
    const razorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: options.amount * 100, // Amount in paise
      currency: options.currency || 'INR',
      name: 'Food Delivery App',
      description: options.description || `Order #${options.orderId}`,
      order_id: options.orderId,
      prefill: {
        name: options.customerName,
        email: options.customerEmail || 'customer@example.com',
        contact: options.customerPhone || '9999999999',
      },
      theme: {
        color: '#ff4757',
      },
      modal: {
        ondismiss: function() {
          onError('Payment cancelled by user');
        },
      },
      handler: function(response: any) {
        // Payment successful
        onSuccess({
          success: true,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
  } catch (error) {
    console.error('Razorpay error:', error);
    onError(error instanceof Error ? error.message : 'Payment initialization failed');
  }
};

// Mobile Payment (React Native)
const initiateMobilePayment = (
  options: PaymentOptions,
  onSuccess: (response: PaymentResponse) => void,
  onError: (error: string) => void
) => {
  try {
    // For React Native, you'd use react-native-razorpay
    // Since we're using Expo, we need to use a different approach
    // For now, we'll simulate payment for testing
    
    Alert.alert(
      'Payment',
      `Test payment for ₹${options.amount}\nOrder ID: ${options.orderId}`,
      [
        {
          text: 'Simulate Success',
          onPress: () => {
            onSuccess({
              success: true,
              razorpayPaymentId: `pay_${Date.now()}`,
              razorpayOrderId: options.orderId,
              razorpaySignature: `sig_${Date.now()}`,
            });
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => onError('Payment cancelled by user'),
        },
      ]
    );
  } catch (error) {
    console.error('Payment error:', error);
    onError(error instanceof Error ? error.message : 'Payment failed');
  }
};

// Verify Payment on Server
export const verifyPayment = async (
  orderId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
) => {
  try {
    // This should be done on your backend
    const response = await fetch('/api/orders/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};