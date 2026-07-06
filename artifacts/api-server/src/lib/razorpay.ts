// import Razorpay from 'razorpay';

// const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_T8h3mZNOBzodtp';
// const keySecret = process.env.RAZORPAY_KEY_SECRET || 'frnUtPJOH2ROId2yjDILdEh2';
// const mode = process.env.RAZORPAY_MODE || 'test';

// // Validate credentials
// if (!keyId || !keySecret) {
//   console.error('❌ Razorpay credentials not set!');
//   console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
//   console.error('Get your keys from: https://dashboard.razorpay.com/app/keys');
  
//   // In development, we'll use a mock implementation
//   if (process.env.NODE_ENV === 'development') {
//     console.warn('⚠️ Using mock Razorpay implementation for development');
//   }
// }

// // Initialize Razorpay with proper error handling
// let razorpay: any;

// try {
//   if (keyId && keySecret) {
//     razorpay = new Razorpay({
//       key_id: keyId,
//       key_secret: keySecret,
//     });
//     console.log(`✅ Razorpay initialized in ${mode} mode`);
//     console.log(`📡 Key ID: ${keyId ? 'Set' : 'Not Set'}`);
//   } else {
//     // Create a mock Razorpay instance for development
//     console.warn('⚠️ Creating mock Razorpay instance for development');
//     razorpay = {
//       orders: {
//         create: async (params: any) => {
//           console.log('🔧 Mock Razorpay: Creating order', params);
//           return {
//             id: `mock_order_${Date.now()}`,
//             amount: params.amount,
//             currency: params.currency || 'INR',
//             receipt: params.receipt || 'mock_receipt',
//             status: 'created',
//           };
//         },
//       },
//       payments: {
//         fetch: async (paymentId: string) => {
//           console.log('🔧 Mock Razorpay: Fetching payment', paymentId);
//           return {
//             id: paymentId,
//             status: 'captured',
//             amount: 1000,
//             currency: 'INR',
//           };
//         },
//       },
//     };
//   }
// } catch (error) {
//   console.error('❌ Failed to initialize Razorpay:', error);
//   // Create mock instance as fallback
//   razorpay = {
//     orders: {
//       create: async (params: any) => {
//         console.log('🔧 Fallback Mock Razorpay: Creating order', params);
//         return {
//           id: `mock_order_${Date.now()}`,
//           amount: params.amount,
//           currency: params.currency || 'INR',
//           receipt: params.receipt || 'mock_receipt',
//           status: 'created',
//         };
//       },
//     },
//     payments: {
//       fetch: async (paymentId: string) => {
//         console.log('🔧 Fallback Mock Razorpay: Fetching payment', paymentId);
//         return {
//           id: paymentId,
//           status: 'captured',
//           amount: 1000,
//           currency: 'INR',
//         };
//       },
//     },
//   };
// }

// export { razorpay, keyId, keySecret, mode };


import Razorpay from "razorpay";
import "dotenv/config";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const mode = process.env.RAZORPAY_MODE || "test";

if (!keyId || !keySecret) {
  throw new Error(
    "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in the environment. " +
    "Get your keys from https://dashboard.razorpay.com/app/keys"
  );
}

const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

export { razorpay, keyId, keySecret, mode };