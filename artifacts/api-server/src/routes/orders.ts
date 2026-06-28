// import { Router } from "express";
// import Razorpay from "razorpay";
// import crypto from "crypto";
// import { Order } from "../models/Order";
// import { requireAuth, AuthRequest } from "../middlewares/auth";
// import { getIO } from "../lib/socket";

// const router = Router();

// const razorpay = new Razorpay({
//   key_id: "rzp_test_T0cnpwfJWdXQvy",
//   key_secret: "itm6sotg1tiTppIv9GaeRahE",
// });

// // ============================================
// // STEP 1: CREATE RAZORPAY PAYMENT ORDER
// // (No order saved in database yet)
// // ============================================
// // router.post("/create-payment-order", requireAuth, async (req: AuthRequest, res) => {
// //   try {
// //     const {
// //       restaurantId, restaurantName, items, subtotal,
// //       deliveryFee, discount, tax, total,
// //       deliveryAddress, paymentMethod,
// //     } = req.body;

// //     if (!restaurantId || !items?.length) {
// //       res.status(400).json({ error: "restaurantId and items are required" });
// //       return;
// //     }

// //     // Create Razorpay order
// //     const rpOrder = await razorpay.orders.create({
// //       amount: Math.round(total * 100),
// //       currency: "INR",
// //       receipt: `order_${Date.now()}`,
// //       notes: {
// //         restaurantId,
// //         userId: req.userId,
// //         subtotal: String(subtotal),
// //         deliveryFee: String(deliveryFee || 0),
// //         discount: String(discount || 0),
// //         tax: String(tax || 0),
// //         total: String(total),
// //         deliveryAddress,
// //         paymentMethod,
// //         restaurantName,
// //         items: JSON.stringify(items),
// //       },
// //     });

// //     res.status(201).json({
// //       success: true,
// //       razorpayOrderId: rpOrder.id,
// //       razorpayKeyId: "rzp_test_T0cnpwfJWdXQvy",
// //       amount: total,
// //       currency: "INR",
// //       orderData: {
// //         restaurantId,
// //         restaurantName,
// //         items,
// //         subtotal,
// //         deliveryFee: deliveryFee || 0,
// //         discount: discount || 0,
// //         tax: tax || 0,
// //         total,
// //         deliveryAddress,
// //         paymentMethod,
// //       }
// //     });

// //   } catch (err) {
// //     req.log?.error({ err });
// //     console.error("Error creating payment order:", err);
// //     res.status(500).json({ 
// //       success: false,
// //       error: "Failed to create payment order" 
// //     });
// //   }
// // });

// router.post("/create-payment-order", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     // Log the user ID from the request
//     console.log("👤 User ID from auth:", req.userId);
//     console.log("📦 Request body:", req.body);

//     const {
//       restaurantId, restaurantName, items, subtotal,
//       deliveryFee, discount, tax, total,
//       deliveryAddress, paymentMethod,
//     } = req.body;

//     if (!restaurantId || !items?.length) {
//       res.status(400).json({ error: "restaurantId and items are required" });
//       return;
//     }

//     // Create Razorpay order
//     const rpOrder = await razorpay.orders.create({
//       amount: Math.round(total * 100),
//       currency: "INR",
//       receipt: `order_${Date.now()}`,
//       notes: {
//         restaurantId,
//         userId: req.userId,
//         subtotal: String(subtotal),
//         deliveryFee: String(deliveryFee || 0),
//         discount: String(discount || 0),
//         tax: String(tax || 0),
//         total: String(total),
//         deliveryAddress,
//         paymentMethod,
//         restaurantName,
//         items: JSON.stringify(items),
//       },
//     });

//     console.log("✅ Razorpay order created:", rpOrder.id);

//     res.status(201).json({
//       success: true,
//       razorpayOrderId: rpOrder.id,
//       razorpayKeyId: "rzp_test_T0cnpwfJWdXQvy",
//       amount: total,
//       currency: "INR",
//       orderData: {
//         restaurantId,
//         restaurantName,
//         items,
//         subtotal,
//         deliveryFee: deliveryFee || 0,
//         discount: discount || 0,
//         tax: tax || 0,
//         total,
//         deliveryAddress,
//         paymentMethod,
//       }
//     });

//   } catch (err) {
//     console.error("Error creating payment order:", err);
//     req.log?.error({ err });
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to create payment order",
//       details: err instanceof Error ? err.message : "Unknown error"
//     });
//   }
// });

// // ============================================
// // STEP 2: VERIFY PAYMENT AND CREATE ORDER
// // (Order saved only after successful payment)
// // ============================================
// router.post("/verify-payment", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     const { 
//       razorpayOrderId, 
//       razorpayPaymentId, 
//       razorpaySignature,
//       orderData 
//     } = req.body;

//     if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderData) {
//       res.status(400).json({ 
//         success: false,
//         error: "Missing required payment verification data" 
//       });
//       return;
//     }

//     const secret = "itm6sotg1tiTppIv9GaeRahE";
//     const body = `${razorpayOrderId}|${razorpayPaymentId}`;
//     const expectedSig = crypto.createHmac("sha256", secret).update(body).digest("hex");

//     if (expectedSig !== razorpaySignature) {
//       res.status(400).json({ 
//         success: false,
//         error: "Invalid payment signature" 
//       });
//       return;
//     }

//     // Payment verified successfully - NOW create the order
//     const {
//       restaurantId, restaurantName, items, subtotal,
//       deliveryFee, discount, tax, total,
//       deliveryAddress, paymentMethod,
//     } = orderData;

//     // Create the order with payment status as "paid"
//     const order = await Order.create({
//       userId: req.userId,
//       restaurantId,
//       restaurantName,
//       items,
//       subtotal,
//       deliveryFee: deliveryFee ?? 0,
//       discount: discount ?? 0,
//       tax: tax ?? 0,
//       total,
//       deliveryAddress,
//       paymentMethod,
//       paymentStatus: "paid",
//       razorpayOrderId,
//       razorpayPaymentId,
//       estimatedTime: "30-40 mins",
//       driverName: "Arjun Kumar",
//       driverPhone: "+91 98765 00001",
//       status: "placed",
//     });

//     // Start order simulation
//     setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

//     res.status(201).json({
//       success: true,
//       order: {
//         _id: order._id,
//         orderId: ((order as any).orderId as string) || order._id.toString().slice(-6).toUpperCase(),
//         status: order.status,
//         total: order.total,
//         createdAt: order.createdAt,
//       },
//       message: "Order placed successfully"
//     });

//   } catch (err) {
//     req.log?.error({ err });
//     console.error("Error verifying payment:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Payment verification or order creation failed" 
//     });
//   }
// });

// // ============================================
// // COD ORDERS - Create order directly
// // ============================================
// router.post("/cod", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     const {
//       restaurantId, restaurantName, items, subtotal,
//       deliveryFee, discount, tax, total,
//       deliveryAddress, paymentMethod,
//     } = req.body;

//     if (!restaurantId || !items?.length) {
//       res.status(400).json({ error: "restaurantId and items are required" });
//       return;
//     }

//     // For COD, create order directly with payment status as "pending"
//     const order = await Order.create({
//       userId: req.userId,
//       restaurantId,
//       restaurantName,
//       items,
//       subtotal,
//       deliveryFee: deliveryFee ?? 0,
//       discount: discount ?? 0,
//       tax: tax ?? 0,
//       total,
//       deliveryAddress,
//       paymentMethod: "cod",
//       paymentStatus: "pending",
//       estimatedTime: "30-40 mins",
//       driverName: "Arjun Kumar",
//       driverPhone: "+91 98765 00001",
//       status: "placed",
//     });

//     setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

//     res.status(201).json({
//       success: true,
//       order: {
//         _id: order._id,
//         orderId: ((order as any).orderId as string) || order._id.toString().slice(-6).toUpperCase(),
//         status: order.status,
//         total: order.total,
//         createdAt: order.createdAt,
//       },
//       message: "Order placed successfully"
//     });

//   } catch (err) {
//     req.log?.error({ err });
//     console.error("Error creating COD order:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to create order" 
//     });
//   }
// });

// // ============================================
// // LEGACY CREATE ORDER (kept for backward compatibility)
// // ============================================
// router.post("/", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     const {
//       restaurantId, restaurantName, items, subtotal,
//       deliveryFee, discount, tax, total,
//       deliveryAddress, paymentMethod,
//     } = req.body;

//     if (!restaurantId || !items?.length) {
//       res.status(400).json({ error: "restaurantId and items are required" });
//       return;
//     }

//     // For non-COD, use the new flow
//     if (paymentMethod !== "cod") {
//       // Create Razorpay order first
//       try {
//         const rpOrder = await razorpay.orders.create({
//           amount: Math.round(total * 100),
//           currency: "INR",
//           receipt: `order_${Date.now()}`,
//         });

//         // Return payment order details without creating the order
//         res.status(201).json({
//           razorpayOrderId: rpOrder.id,
//           razorpayKeyId: "rzp_test_T0cnpwfJWdXQvy",
//           amount: total,
//           currency: "INR",
//           orderData: {
//             restaurantId,
//             restaurantName,
//             items,
//             subtotal,
//             deliveryFee: deliveryFee || 0,
//             discount: discount || 0,
//             tax: tax || 0,
//             total,
//             deliveryAddress,
//             paymentMethod,
//           }
//         });
//         return;
//       } catch (rpErr) {
//         req.log?.warn({ err: rpErr }, "Razorpay order creation failed");
//         res.status(500).json({ error: "Payment initialization failed" });
//         return;
//       }
//     }

//     // For COD, create order directly
//     const order = await Order.create({
//       userId: req.userId,
//       restaurantId,
//       restaurantName,
//       items,
//       subtotal,
//       deliveryFee: deliveryFee ?? 0,
//       discount: discount ?? 0,
//       tax: tax ?? 0,
//       total,
//       deliveryAddress,
//       paymentMethod,
//       paymentStatus: "pending",
//       estimatedTime: "30-40 mins",
//       driverName: "Arjun Kumar",
//       driverPhone: "+91 98765 00001",
//       status: "placed",
//     });

//     res.status(201).json({
//       order: {
//         _id: order._id,
//         orderId: order.orderId || order._id.toString().slice(-6).toUpperCase(),
//         status: order.status,
//         total: order.total,
//         createdAt: order.createdAt,
//       },
//       razorpayKeyId: "rzp_test_T0cnpwfJWdXQvy",
//     });

//     setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);
//   } catch (err) {
//     req.log?.error({ err });
//     console.error("Error creating order:", err);
//     res.status(500).json({ error: "Failed to create order" });
//   }
// });

// // ============================================
// // GET ALL ORDERS FOR USER
// // ============================================
// router.get("/", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     const orders = await Order.find({ userId: req.userId })
//       .sort({ createdAt: -1 })
//       .lean();
//     res.json({ 
//       success: true,
//       orders 
//     });
//   } catch (err) {
//     req.log?.error({ err });
//     console.error("Error fetching orders:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to fetch orders" 
//     });
//   }
// });

// // ============================================
// // GET SINGLE ORDER
// // ============================================
// router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     const order = await Order.findOne({ 
//       _id: req.params["id"], 
//       userId: req.userId 
//     }).lean();
    
//     if (!order) { 
//       res.status(404).json({ 
//         success: false,
//         error: "Order not found" 
//       }); 
//       return; 
//     }
    
//     res.json({ 
//       success: true,
//       order 
//     });
//   } catch (err) {
//     req.log?.error({ err });
//     console.error("Error fetching order:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to fetch order" 
//     });
//   }
// });

// // ============================================
// // CANCEL ORDER
// // ============================================
// router.post("/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     const order = await Order.findOne({ 
//       _id: req.params["id"], 
//       userId: req.userId 
//     });
    
//     if (!order) { 
//       res.status(404).json({ 
//         success: false,
//         error: "Order not found" 
//       }); 
//       return; 
//     }
    
//     if (!["placed", "confirmed"].includes(order.status)) {
//       res.status(400).json({ 
//         success: false,
//         error: "Order cannot be cancelled at this stage" 
//       });
//       return;
//     }
    
//     order.status = "cancelled";
//     await order.save();
//     getIO().to(`order:${order._id}`).emit("order:status", { status: "cancelled" });
    
//     res.json({ 
//       success: true,
//       order,
//       message: "Order cancelled successfully"
//     });
//   } catch (err) {
//     req.log?.error({ err });
//     console.error("Error cancelling order:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Cancellation failed" 
//     });
//   }
// });

// // ============================================
// // TRACK ORDER (for real-time updates)
// // ============================================
// router.get("/:id/track", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     const order = await Order.findOne({ 
//       _id: req.params["id"], 
//       userId: req.userId 
//     }).lean();
    
//     if (!order) { 
//       res.status(404).json({ 
//         success: false,
//         error: "Order not found" 
//       }); 
//       return; 
//     }
    
//     res.json({
//       success: true,
//       status: order.status,
//       location: order.driverLocation,
//       estimatedDelivery: order.estimatedTime,
//     });
//   } catch (err) {
//     req.log?.error({ err });
//     console.error("Error tracking order:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to track order" 
//     });
//   }
// });

// // ============================================
// // ORDER SIMULATION (for demo purposes)
// // ============================================
// const STATUS_FLOW = [
//   "placed", "confirmed", "preparing", "ready", "picked_up", "on_the_way", "delivered"
// ] as const;

// const DRIVER_PATH = [
//   { lat: 12.9352, lng: 77.6245 },
//   { lat: 12.9340, lng: 77.6230 },
//   { lat: 12.9325, lng: 77.6215 },
//   { lat: 12.9310, lng: 77.6200 },
//   { lat: 12.9295, lng: 77.6185 },
// ];

// async function simulateOrderProgress(orderId: string) {
//   for (let i = 1; i < STATUS_FLOW.length; i++) {
//     await new Promise((r) => setTimeout(r, 15000));
//     const status = STATUS_FLOW[i];
//     await Order.findByIdAndUpdate(orderId, { $set: { status } });
//     const io = getIO();
//     io.to(`order:${orderId}`).emit("order:status", { status });

//     if (i >= 4 && DRIVER_PATH[i - 4]) {
//       const loc = DRIVER_PATH[i - 4];
//       await Order.findByIdAndUpdate(orderId, { $set: { driverLocation: loc } });
//       io.to(`order:${orderId}`).emit("order:location", { lat: loc.lat, lng: loc.lng });
//     }

//     if (status === "delivered") break;
//   }
// }

// router.get("/ping", (req, res) => {
//   console.log("🏓 Orders router ping received!");
//   res.json({ 
//     success: true, 
//     message: "Orders router is working!",
//     timestamp: new Date().toISOString()
//   });
// });

// // Test auth route
// router.get("/test-auth", requireAuth, async (req: AuthRequest, res) => {
//   console.log("✅ Test auth route called!");
//   console.log("👤 User ID:", req.userId);
//   console.log("📧 User Email:", req.userEmail);
  
//   res.json({ 
//     success: true, 
//     message: "Authentication works!",
//     userId: req.userId,
//     userEmail: req.userEmail
//   });
// });

// export default router;


// src/routes/orders-stripe.ts
import { Router } from "express";
import { Order } from "../models/Order";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { getIO } from "../lib/socket";
import stripe, { STRIPE_PUBLISHABLE_KEY } from "../lib/stripe";

const router = Router();

// ============================================
// TEST ROUTES
// ============================================

// Test auth route
router.get("/test-auth", requireAuth, async (req: AuthRequest, res) => {
  console.log("✅ Test auth route called!");
  res.json({ 
    success: true, 
    message: "Authentication works!",
    userId: req.userId,
    userEmail: req.userEmail
  });
});

router.get("/debug/orders", requireAuth, async (req: AuthRequest, res) => {
  try {
    const allOrders = await Order.find({}).lean();
    const userOrders = await Order.find({ userId: req.userId }).lean();
    res.json({
      success: true,
      totalOrders: allOrders.length,
      userOrders: userOrders.length,
      allOrders: allOrders.map(o => ({
        id: o._id,
        userId: o.userId,
        restaurantName: o.restaurantName,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ============================================
// CREATE PAYMENT INTENT (Step 1)
// ============================================
router.post("/create-payment-intent", requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log("👤 User ID from auth:", req.userId);
    console.log("📦 Creating payment intent for order");

    const {
      restaurantId, restaurantName, items, subtotal,
      deliveryFee, discount, tax, total,
      deliveryAddress, paymentMethod,
    } = req.body;

    // Validate required fields
    if (!restaurantId) {
      res.status(400).json({ 
        success: false,
        error: "restaurantId is required" 
      });
      return;
    }

    if (!items || !items.length) {
      res.status(400).json({ 
        success: false,
        error: "items are required" 
      });
      return;
    }

    console.log("✅ Validated request data");
    console.log("💰 Total amount: ₹", total);

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Amount in paise (cents for INR)
      currency: "inr",
      metadata: {
        restaurantId,
        userId: req.userId || 'unknown',
        restaurantName: restaurantName || 'Unknown',
        deliveryAddress: deliveryAddress || 'Unknown',
        paymentMethod: paymentMethod || 'card',
        itemCount: String(items.length),
      },
      description: `Order from ${restaurantName || 'Restaurant'}`,
      receipt_email: req.userEmail,
      // Add automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("✅ PaymentIntent created:", paymentIntent.id);
    console.log("✅ Client Secret:", paymentIntent.client_secret ? "Present" : "Missing");

    res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      amount: total,
      currency: "inr",
      orderData: {
        restaurantId,
        restaurantName,
        items,
        subtotal: subtotal || 0,
        deliveryFee: deliveryFee || 0,
        discount: discount || 0,
        tax: tax || 0,
        total: total || 0,
        deliveryAddress,
        paymentMethod: paymentMethod || 'card',
      }
    });

  } catch (err: any) {
    console.error("❌ Error creating payment intent:", err);
    console.error("Error details:", err.message);
    console.error("Error type:", err.type);
    console.error("Error code:", err.code);
    res.status(500).json({ 
      success: false,
      error: "Failed to create payment intent",
      details: err.message || "Unknown error",
      code: err.code || "unknown_error"
    });
  }
});

// src/routes/orders-stripe.ts - Complete confirm-payment route with test mode support

router.post("/confirm-payment", requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log("📦 Confirming payment and creating order");
    console.log("📦 Request body:", JSON.stringify(req.body, null, 2));
    
    const { 
      paymentIntentId, 
      orderData,
    } = req.body;

    // Validate input
    if (!paymentIntentId) {
      console.log("❌ Missing paymentIntentId");
      res.status(400).json({ 
        success: false,
        error: "Missing paymentIntentId" 
      });
      return;
    }

    if (!orderData) {
      console.log("❌ Missing orderData");
      res.status(400).json({ 
        success: false,
        error: "Missing orderData" 
      });
      return;
    }

    console.log("✅ PaymentIntentId:", paymentIntentId);

    // ========================================
    // CHECK IF ORDER ALREADY EXISTS
    // ========================================
    console.log("🔍 Checking for existing order...");
    const existingOrder = await Order.findOne({ 
      razorpayOrderId: paymentIntentId 
    });
    
    if (existingOrder) {
      console.log("ℹ️ Order already exists for payment:", paymentIntentId);
      res.status(200).json({
        success: true,
        order: {
          _id: existingOrder._id,
          orderId: existingOrder.orderId || existingOrder._id.toString().slice(-6).toUpperCase(),
          status: existingOrder.status,
          total: existingOrder.total,
          createdAt: existingOrder.createdAt,
        },
        message: "Order already exists"
      });
      return;
    }

    // ========================================
    // TEST MODE - Skip Stripe verification for test IDs
    // ========================================
    if (paymentIntentId.startsWith('pi_test_')) {
      console.log("🧪 Test mode detected! Creating order without Stripe verification");
      
      const {
        restaurantId, restaurantName, items, subtotal,
        deliveryFee, discount, tax, total,
        deliveryAddress, paymentMethod,
      } = orderData;

      // Validate order data
      if (!restaurantId) {
        console.log("❌ Missing restaurantId");
        res.status(400).json({ 
          success: false,
          error: "Missing restaurantId in order data" 
        });
        return;
      }

      if (!items || items.length === 0) {
        console.log("❌ Missing items");
        res.status(400).json({ 
          success: false,
          error: "No items in order" 
        });
        return;
      }

      console.log("📦 Creating test order for user:", req.userId);
      console.log("📦 Order details:", {
        restaurantId,
        restaurantName,
        itemCount: items.length,
        total: total
      });

      // Create the order directly
      const order = await Order.create({
        userId: req.userId,
        restaurantId,
        restaurantName: restaurantName || 'Restaurant',
        items: items || [],
        subtotal: subtotal || 0,
        deliveryFee: deliveryFee || 0,
        discount: discount || 0,
        tax: tax || 0,
        total: total || 0,
        deliveryAddress: deliveryAddress || 'Address not provided',
        paymentMethod: "stripe_test",
        paymentStatus: "paid",
        razorpayOrderId: paymentIntentId,
        razorpayPaymentId: `pm_test_${Date.now()}`,
        estimatedTime: "30-40 mins",
        driverName: "Arjun Kumar",
        driverPhone: "+91 98765 00001",
        status: "placed",
      });

      console.log("✅ Test order created successfully:", order._id);

      // Start order simulation
      setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

      res.status(201).json({
        success: true,
        order: {
          _id: order._id,
          orderId: order.orderId || order._id.toString().slice(-6).toUpperCase(),
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
        },
        message: "Test order placed successfully",
      });
      return;
    }

    // ========================================
    // PRODUCTION MODE - Verify with Stripe
    // ========================================
    console.log("🔍 Production mode: Retrieving PaymentIntent from Stripe...");
    
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      console.log("✅ PaymentIntent status:", paymentIntent.status);
    } catch (stripeError: any) {
      console.error("❌ Stripe error:", stripeError.message);
      res.status(500).json({ 
        success: false,
        error: "Failed to retrieve payment from Stripe",
        details: stripeError.message || "Unknown Stripe error"
      });
      return;
    }

    if (paymentIntent.status !== 'succeeded') {
      console.log("❌ Payment not completed. Status:", paymentIntent.status);
      res.status(400).json({ 
        success: false,
        error: `Payment not completed. Status: ${paymentIntent.status}` 
      });
      return;
    }

    // Payment successful - Create the order
    console.log("✅ Payment successful, creating order...");
    
    const {
      restaurantId, restaurantName, items, subtotal,
      deliveryFee, discount, tax, total,
      deliveryAddress, paymentMethod,
    } = orderData;

    const order = await Order.create({
      userId: req.userId,
      restaurantId,
      restaurantName: restaurantName || 'Restaurant',
      items: items || [],
      subtotal: subtotal || 0,
      deliveryFee: deliveryFee || 0,
      discount: discount || 0,
      tax: tax || 0,
      total: total || 0,
      deliveryAddress: deliveryAddress || 'Address not provided',
      paymentMethod: "stripe",
      paymentStatus: "paid",
      razorpayOrderId: paymentIntentId,
      razorpayPaymentId: paymentIntent.payment_method as string || 'unknown',
      estimatedTime: "30-40 mins",
      driverName: "Arjun Kumar",
      driverPhone: "+91 98765 00001",
      status: "placed",
    });

    console.log("✅ Order created successfully:", order._id);

    // Start order simulation
    setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

    res.status(201).json({
      success: true,
      order: {
        _id: order._id,
        orderId: order.orderId || order._id.toString().slice(-6).toUpperCase(),
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      },
      message: "Order placed successfully",
    });

  } catch (err: any) {
    console.error("❌ Error confirming payment:");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    
    // Check for specific errors
    if (err.name === 'ValidationError') {
      console.error("Validation error:", err.errors);
      res.status(400).json({ 
        success: false,
        error: "Invalid data",
        details: err.message 
      });
      return;
    }
    
    if (err.code === 11000) {
      console.error("Duplicate key error");
      res.status(409).json({ 
        success: false,
        error: "Order already exists" 
      });
      return;
    }
    
    res.status(500).json({ 
      success: false,
      error: "Payment confirmation or order creation failed",
      details: err.message || "Unknown error"
    });
  }
});

// ============================================
// COD ORDERS (No payment required)
// ============================================
router.post("/cod", requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log("📦 Creating COD order for user:", req.userId);

    const {
      restaurantId, restaurantName, items, subtotal,
      deliveryFee, discount, tax, total,
      deliveryAddress, paymentMethod,
    } = req.body;

    if (!restaurantId || !items?.length) {
      res.status(400).json({ error: "restaurantId and items are required" });
      return;
    }

    const order = await Order.create({
      userId: req.userId,
      restaurantId,
      restaurantName: restaurantName || 'Restaurant',
      items: items || [],
      subtotal: subtotal || 0,
      deliveryFee: deliveryFee || 0,
      discount: discount || 0,
      tax: tax || 0,
      total: total || 0,
      deliveryAddress: deliveryAddress || 'Address not provided',
      paymentMethod: "cod",
      paymentStatus: "pending",
      estimatedTime: "30-40 mins",
      driverName: "Arjun Kumar",
      driverPhone: "+91 98765 00001",
      status: "placed",
    });

    console.log("✅ COD Order created:", order._id);

    setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

    res.status(201).json({
      success: true,
      order: {
        _id: order._id,
        orderId: order.orderId || order._id.toString().slice(-6).toUpperCase(),
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      },
      message: "Order placed successfully",
    });

  } catch (err) {
    console.error("Error creating COD order:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to create order" 
    });
  }
});

// ============================================
// GET ALL ORDERS
// ============================================
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ 
      success: true,
      orders 
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch orders" 
    });
  }
});

// ============================================
// GET SINGLE ORDER - MUST BE LAST!
// ============================================
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params["id"], 
      userId: req.userId 
    }).lean();
    
    if (!order) { 
      res.status(404).json({ 
        success: false,
        error: "Order not found" 
      }); 
      return; 
    }
    
    res.json({ 
      success: true,
      order 
    });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch order" 
    });
  }
});

// ============================================
// CANCEL ORDER
// ============================================
router.post("/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params["id"], 
      userId: req.userId 
    });
    
    if (!order) { 
      res.status(404).json({ 
        success: false,
        error: "Order not found" 
      }); 
      return; 
    }
    
    if (!["placed", "confirmed"].includes(order.status)) {
      res.status(400).json({ 
        success: false,
        error: "Order cannot be cancelled at this stage" 
      });
      return;
    }
    
    order.status = "cancelled";
    await order.save();
    getIO().to(`order:${order._id}`).emit("order:status", { status: "cancelled" });
    
    res.json({ 
      success: true,
      order,
      message: "Order cancelled successfully"
    });
  } catch (err) {
    console.error("Error cancelling order:", err);
    res.status(500).json({ 
      success: false,
      error: "Cancellation failed" 
    });
  }
});

// Test endpoint to verify order creation works
router.post("/test-create-order", requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log("🧪 Test order creation for user:", req.userId);
    console.log("📦 Test data:", JSON.stringify(req.body, null, 2));

    const {
      restaurantId, restaurantName, items, subtotal,
      deliveryFee, discount, tax, total,
      deliveryAddress, paymentMethod,
    } = req.body;

    // Validate
    if (!restaurantId) {
      res.status(400).json({ error: "restaurantId is required" });
      return;
    }

    // Create order directly
    const order = await Order.create({
      userId: req.userId,
      restaurantId,
      restaurantName: restaurantName || 'Test Restaurant',
      items: items || [],
      subtotal: subtotal || 0,
      deliveryFee: deliveryFee || 0,
      discount: discount || 0,
      tax: tax || 0,
      total: total || 0,
      deliveryAddress: deliveryAddress || 'Test Address',
      paymentMethod: paymentMethod || 'test',
      paymentStatus: "paid",
      estimatedTime: "30-40 mins",
      driverName: "Test Driver",
      driverPhone: "+91 98765 00001",
      status: "placed",
    });

    console.log("✅ Test order created:", order._id);

    res.status(201).json({
      success: true,
      order: {
        _id: order._id,
        orderId: order._id.toString().slice(-6).toUpperCase(),
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      },
      message: "Test order created successfully"
    });

  } catch (err: any) {
    console.error("❌ Error creating test order:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to create test order",
      details: err.message || "Unknown error"
    });
  }
});

// ============================================
// ORDER SIMULATION
// ============================================
const STATUS_FLOW = [
  "placed", "confirmed", "preparing", "ready", "picked_up", "on_the_way", "delivered"
] as const;

const DRIVER_PATH = [
  { lat: 12.9352, lng: 77.6245 },
  { lat: 12.9340, lng: 77.6230 },
  { lat: 12.9325, lng: 77.6215 },
  { lat: 12.9310, lng: 77.6200 },
  { lat: 12.9295, lng: 77.6185 },
];

async function simulateOrderProgress(orderId: string) {
  for (let i = 1; i < STATUS_FLOW.length; i++) {
    await new Promise((r) => setTimeout(r, 15000));
    const status = STATUS_FLOW[i];
    await Order.findByIdAndUpdate(orderId, { $set: { status } });
    const io = getIO();
    io.to(`order:${orderId}`).emit("order:status", { status });

    if (i >= 4 && DRIVER_PATH[i - 4]) {
      const loc = DRIVER_PATH[i - 4];
      await Order.findByIdAndUpdate(orderId, { $set: { driverLocation: loc } });
      io.to(`order:${orderId}`).emit("order:location", { lat: loc.lat, lng: loc.lng });
    }

    if (status === "delivered") break;
  }
}

export default router;