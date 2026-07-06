// import { Router } from "express";
// import { Order } from "../models/Order";
// import { requireAuth, AuthRequest } from "../middlewares/auth";
// import { getIO } from "../lib/socket";
// import stripe from "../lib/stripe";

// const router = Router();

// // ============================================
// // ORDER SIMULATION
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

// // ============================================
// // CREATE ORDER WITH PAYMENT (Direct Flow)
// // ============================================
// router.post("/create-order-with-payment", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     console.log("📦 Creating order with payment for user:", req.userId);

//     const {
//       restaurantId,
//       restaurantName,
//       items,
//       subtotal,
//       deliveryFee,
//       discount,
//       tax,
//       total,
//       deliveryAddress,
//       paymentMethod,
//     } = req.body;

//     // Validate required fields
//     if (!restaurantId) {
//       res.status(400).json({ 
//         success: false,
//         error: "restaurantId is required" 
//       });
//       return;
//     }

//     if (!items || !items.length) {
//       res.status(400).json({ 
//         success: false,
//         error: "items are required" 
//       });
//       return;
//     }

//     console.log("✅ Validated request data");
//     console.log("💰 Total amount: ₹", total);
//     console.log("👤 User ID:", req.userId);
//     console.log("🏪 Restaurant ID:", restaurantId);
//     console.log("💳 Payment Method:", paymentMethod);

//     // Format items for database
//     const formattedItems = items.map((item: any) => ({
//       itemId: item.itemId || item.id,
//       name: item.name,
//       qty: item.qty || item.quantity || 1,
//       price: item.price,
//       isVeg: item.isVeg !== undefined ? item.isVeg : true,
//     }));

//     // For COD - Create order directly with confirmed status
//     if (paymentMethod === "cod") {
//       const order = await Order.create({
//         userId: req.userId,
//         restaurantId,
//         restaurantName: restaurantName || 'Restaurant',
//         items: formattedItems,
//         status: "confirmed",
//         subtotal: subtotal || 0,
//         deliveryFee: deliveryFee || 0,
//         discount: discount || 0,
//         tax: tax || 0,
//         total: total || 0,
//         deliveryAddress: deliveryAddress || 'Address not provided',
//         paymentMethod: "cod",
//         paymentStatus: "pending",
//         estimatedTime: "30-40 mins",
//         driverName: "Arjun Kumar",
//         driverPhone: "+91 98765 00001",
//       });

//       console.log("✅ COD Order created:", order._id);
      
//       // Notify restaurant
//       try {
//         const io = getIO();
//         if (io) {
//           io.to(`restaurant:${restaurantId}`).emit("new_order", {
//             orderId: order._id,
//             orderNumber: order._id.toString().slice(-6).toUpperCase(),
//             customerName: req.userEmail || 'Customer',
//             total: order.total,
//             itemCount: order.items.length,
//             timestamp: new Date().toISOString(),
//           });
//           console.log("📡 Restaurant notified of new COD order");
//         }
//       } catch (socketErr) {
//         console.error("Socket emit error:", socketErr);
//       }

//       setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

//       res.status(201).json({
//         success: true,
//         order: {
//           _id: order._id,
//           orderId: order._id.toString().slice(-6).toUpperCase(),
//           status: order.status,
//           total: order.total,
//           createdAt: order.createdAt,
//         },
//         message: "Order placed successfully",
//       });
//       return;
//     }

//     // For UPI/Card - Check if Stripe is available
//     if (!stripe || typeof stripe.paymentIntents === 'undefined') {
//       console.log("🔧 Stripe not available, using mock payment");
      
//       const order = await Order.create({
//         userId: req.userId,
//         restaurantId,
//         restaurantName: restaurantName || 'Restaurant',
//         items: formattedItems,
//         status: "confirmed",
//         subtotal: subtotal || 0,
//         deliveryFee: deliveryFee || 0,
//         discount: discount || 0,
//         tax: tax || 0,
//         total: total || 0,
//         deliveryAddress: deliveryAddress || 'Address not provided',
//         paymentMethod: paymentMethod || 'card',
//         paymentStatus: "paid",
//         razorpayOrderId: `mock_${Date.now()}`,
//         razorpayPaymentId: `mock_pay_${Date.now()}`,
//         estimatedTime: "30-40 mins",
//         driverName: "Arjun Kumar",
//         driverPhone: "+91 98765 00001",
//       });

//       console.log("✅ Mock order created:", order._id);
      
//       // Notify restaurant
//       try {
//         const io = getIO();
//         if (io) {
//           io.to(`restaurant:${restaurantId}`).emit("new_order", {
//             orderId: order._id,
//             orderNumber: order._id.toString().slice(-6).toUpperCase(),
//             customerName: req.userEmail || 'Customer',
//             total: order.total,
//             itemCount: order.items.length,
//             timestamp: new Date().toISOString(),
//           });
//           console.log("📡 Restaurant notified of new order");
//         }
//       } catch (socketErr) {
//         console.error("Socket emit error:", socketErr);
//       }

//       setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

//       res.status(201).json({
//         success: true,
//         order: {
//           _id: order._id,
//           orderId: order._id.toString().slice(-6).toUpperCase(),
//           status: order.status,
//           total: order.total,
//           createdAt: order.createdAt,
//         },
//         message: "Order placed successfully",
//       });
//       return;
//     }

//     // Create Stripe Payment Intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(total * 100),
//       currency: "inr",
//       metadata: {
//         restaurantId,
//         userId: req.userId || 'unknown',
//         restaurantName: restaurantName || 'Unknown',
//         deliveryAddress: deliveryAddress || 'Unknown',
//         paymentMethod: paymentMethod || 'card',
//         itemCount: String(items.length),
//       },
//       description: `Order from ${restaurantName || 'Restaurant'}`,
//       receipt_email: req.userEmail,
//       automatic_payment_methods: {
//         enabled: true,
//       },
//     });

//     console.log("✅ PaymentIntent created:", paymentIntent.id);

//     // Create order with pending_payment status
//     const order = await Order.create({
//       userId: req.userId,
//       restaurantId,
//       restaurantName: restaurantName || 'Restaurant',
//       items: formattedItems,
//       status: "pending_payment",
//       subtotal: subtotal || 0,
//       deliveryFee: deliveryFee || 0,
//       discount: discount || 0,
//       tax: tax || 0,
//       total: total || 0,
//       deliveryAddress: deliveryAddress || 'Address not provided',
//       paymentMethod: paymentMethod || 'card',
//       paymentStatus: "pending",
//       razorpayOrderId: paymentIntent.id,
//       estimatedTime: "30-40 mins",
//       driverName: "Arjun Kumar",
//       driverPhone: "+91 98765 00001",
//     });

//     console.log("✅ Order created with pending payment:", order._id);

//     res.status(201).json({
//       success: true,
//       clientSecret: paymentIntent.client_secret,
//       paymentIntentId: paymentIntent.id,
//       publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
//       order: {
//         _id: order._id,
//         orderId: order._id.toString().slice(-6).toUpperCase(),
//         status: order.status,
//         total: order.total,
//         createdAt: order.createdAt,
//       },
//       message: "Order created, please complete payment",
//     });

//   } catch (err: any) {
//     console.error("❌ Error creating order with payment:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to create order",
//       details: err.message || "Unknown error"
//     });
//   }
// });

// // ============================================
// // CONFIRM ORDER PAYMENT
// // ============================================
// router.post("/confirm-order-payment", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     console.log("📦 Confirming payment for order");
    
//     const { 
//       paymentIntentId, 
//       orderId,
//     } = req.body;

//     if (!paymentIntentId || !orderId) {
//       console.log("❌ Missing paymentIntentId or orderId");
//       res.status(400).json({ 
//         success: false,
//         error: "Missing paymentIntentId or orderId" 
//       });
//       return;
//     }

//     console.log("✅ PaymentIntentId:", paymentIntentId);
//     console.log("✅ OrderId:", orderId);

//     // Find the order
//     const order = await Order.findOne({ 
//       _id: orderId, 
//       userId: req.userId 
//     });

//     if (!order) {
//       res.status(404).json({ 
//         success: false,
//         error: "Order not found" 
//       });
//       return;
//     }

//     // ============================================
//     // MOCK PAYMENT - Skip Stripe verification
//     // ============================================
//     if (paymentIntentId.startsWith('pi_mock_') || paymentIntentId.startsWith('pi_test_')) {
//       console.log("🧪 Mock payment detected! Confirming order without Stripe verification");
      
//       order.status = "confirmed";
//       order.paymentStatus = "paid";
//       order.razorpayPaymentId = `pm_mock_${Date.now()}`;
//       await order.save();

//       console.log("✅ Mock order confirmed:", order._id);
      
//       // Notify restaurant
//       try {
//         const io = getIO();
//         if (io) {
//           io.to(`restaurant:${order.restaurantId}`).emit("new_order", {
//             orderId: order._id,
//             orderNumber: order._id.toString().slice(-6).toUpperCase(),
//             customerName: req.userEmail || 'Customer',
//             total: order.total,
//             itemCount: order.items.length,
//             timestamp: new Date().toISOString(),
//           });
//           console.log("📡 Restaurant notified of new mock order");
//         }
//       } catch (socketErr) {
//         console.error("Socket emit error:", socketErr);
//       }

//       setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

//       res.status(201).json({
//         success: true,
//         order: {
//           _id: order._id,
//           orderId: order._id.toString().slice(-6).toUpperCase(),
//           status: order.status,
//           total: order.total,
//           createdAt: order.createdAt,
//         },
//         message: "Order placed successfully",
//       });
//       return;
//     }

//     // ============================================
//     // PRODUCTION MODE - Verify with Stripe
//     // ============================================
//     console.log("🔍 Production mode: Retrieving PaymentIntent from Stripe...");
    
//     if (!stripe || typeof stripe.paymentIntents === 'undefined') {
//       console.log("🔧 Stripe not available, confirming order without verification");
      
//       order.status = "confirmed";
//       order.paymentStatus = "paid";
//       await order.save();

//       // Notify restaurant
//       try {
//         const io = getIO();
//         if (io) {
//           io.to(`restaurant:${order.restaurantId}`).emit("new_order", {
//             orderId: order._id,
//             orderNumber: order._id.toString().slice(-6).toUpperCase(),
//             customerName: req.userEmail || 'Customer',
//             total: order.total,
//             itemCount: order.items.length,
//             timestamp: new Date().toISOString(),
//           });
//           console.log("📡 Restaurant notified of new order");
//         }
//       } catch (socketErr) {
//         console.error("Socket emit error:", socketErr);
//       }

//       res.status(201).json({
//         success: true,
//         order: {
//           _id: order._id,
//           orderId: order._id.toString().slice(-6).toUpperCase(),
//           status: order.status,
//           total: order.total,
//           createdAt: order.createdAt,
//         },
//         message: "Order placed successfully",
//       });
//       return;
//     }
    
//     let paymentIntent;
//     try {
//       paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
//       console.log("✅ PaymentIntent status:", paymentIntent.status);
//     } catch (stripeError: any) {
//       console.error("❌ Stripe error:", stripeError.message);
//       res.status(500).json({ 
//         success: false,
//         error: "Failed to retrieve payment from Stripe",
//         details: stripeError.message || "Unknown Stripe error"
//       });
//       return;
//     }

//     if (paymentIntent.status !== 'succeeded') {
//       console.log("❌ Payment not completed. Status:", paymentIntent.status);
//       res.status(400).json({ 
//         success: false,
//         error: `Payment not completed. Status: ${paymentIntent.status}` 
//       });
//       return;
//     }

//     // Payment successful - Confirm the order
//     console.log("✅ Payment successful, confirming order...");
    
//     order.status = "confirmed";
//     order.paymentStatus = "paid";
//     order.razorpayPaymentId = paymentIntent.payment_method as string || 'unknown';
//     await order.save();

//     console.log("✅ Order confirmed successfully:", order._id);

//     // Notify restaurant
//     try {
//       const io = getIO();
//       if (io) {
//         io.to(`restaurant:${order.restaurantId}`).emit("new_order", {
//           orderId: order._id,
//           orderNumber: order._id.toString().slice(-6).toUpperCase(),
//           customerName: req.userEmail || 'Customer',
//           total: order.total,
//           itemCount: order.items.length,
//           timestamp: new Date().toISOString(),
//         });
//         console.log("📡 Restaurant notified of new order");
//       }
//     } catch (socketErr) {
//       console.error("Socket emit error:", socketErr);
//     }

//     setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

//     res.status(201).json({
//       success: true,
//       order: {
//         _id: order._id,
//         orderId: order._id.toString().slice(-6).toUpperCase(),
//         status: order.status,
//         total: order.total,
//         createdAt: order.createdAt,
//       },
//       message: "Order placed successfully",
//     });

//   } catch (err: any) {
//     console.error("❌ Error confirming order payment:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to confirm order payment",
//       details: err.message || "Unknown error"
//     });
//   }
// });

// // ============================================
// // CREATE PAYMENT INTENT ONLY (For existing orders)
// // ============================================
// router.post("/create-payment-intent", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     console.log("👤 User ID from auth:", req.userId);
//     console.log("📦 Creating payment intent for order");

//     const {
//       restaurantId, restaurantName, items, subtotal,
//       deliveryFee, discount, tax, total,
//       deliveryAddress, paymentMethod,
//       orderId,
//     } = req.body;

//     if (!restaurantId) {
//       res.status(400).json({ 
//         success: false,
//         error: "restaurantId is required" 
//       });
//       return;
//     }

//     if (!items || !items.length) {
//       res.status(400).json({ 
//         success: false,
//         error: "items are required" 
//       });
//       return;
//     }

//     console.log("✅ Validated request data");
//     console.log("💰 Total amount: ₹", total);

//     // Check if stripe is available
//     if (!stripe || typeof stripe.paymentIntents === 'undefined') {
//       console.log("🔧 Using mock payment intent");
//       res.status(201).json({
//         success: true,
//         clientSecret: `secret_mock_${Date.now()}`,
//         paymentIntentId: `pi_mock_${Date.now()}`,
//         publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_mock',
//         amount: total,
//         currency: "inr",
//         orderData: {
//           restaurantId,
//           restaurantName,
//           items,
//           subtotal: subtotal || 0,
//           deliveryFee: deliveryFee || 0,
//           discount: discount || 0,
//           tax: tax || 0,
//           total: total || 0,
//           deliveryAddress,
//           paymentMethod: paymentMethod || 'card',
//         }
//       });
//       return;
//     }

//     // Create a PaymentIntent with Stripe
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(total * 100),
//       currency: "inr",
//       metadata: {
//         restaurantId,
//         userId: req.userId || 'unknown',
//         restaurantName: restaurantName || 'Unknown',
//         deliveryAddress: deliveryAddress || 'Unknown',
//         paymentMethod: paymentMethod || 'card',
//         itemCount: String(items.length),
//         orderId: orderId || 'new',
//       },
//       description: `Order from ${restaurantName || 'Restaurant'}`,
//       receipt_email: req.userEmail,
//       automatic_payment_methods: {
//         enabled: true,
//       },
//     });

//     console.log("✅ PaymentIntent created:", paymentIntent.id);

//     res.status(201).json({
//       success: true,
//       clientSecret: paymentIntent.client_secret,
//       paymentIntentId: paymentIntent.id,
//       publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
//       amount: total,
//       currency: "inr",
//       orderData: {
//         restaurantId,
//         restaurantName,
//         items,
//         subtotal: subtotal || 0,
//         deliveryFee: deliveryFee || 0,
//         discount: discount || 0,
//         tax: tax || 0,
//         total: total || 0,
//         deliveryAddress,
//         paymentMethod: paymentMethod || 'card',
//       }
//     });

//   } catch (err: any) {
//     console.error("❌ Error creating payment intent:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to create payment intent",
//       details: err.message || "Unknown error",
//     });
//   }
// });

// // ============================================
// // COD ORDERS (Direct)
// // ============================================
// router.post("/cod", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     console.log("📦 Creating COD order for user:", req.userId);

//     const {
//       restaurantId, restaurantName, items, subtotal,
//       deliveryFee, discount, tax, total,
//       deliveryAddress, paymentMethod,
//     } = req.body;

//     if (!restaurantId || !items?.length) {
//       res.status(400).json({ error: "restaurantId and items are required" });
//       return;
//     }

//     const order = await Order.create({
//       userId: req.userId,
//       restaurantId,
//       restaurantName: restaurantName || 'Restaurant',
//       items: items || [],
//       subtotal: subtotal || 0,
//       deliveryFee: deliveryFee || 0,
//       discount: discount || 0,
//       tax: tax || 0,
//       total: total || 0,
//       deliveryAddress: deliveryAddress || 'Address not provided',
//       paymentMethod: "cod",
//       paymentStatus: "pending",
//       estimatedTime: "30-40 mins",
//       driverName: "Arjun Kumar",
//       driverPhone: "+91 98765 00001",
//       status: "confirmed",
//     });

//     console.log("✅ COD Order created:", order._id);

//     // Notify restaurant
//     try {
//       const io = getIO();
//       if (io) {
//         io.to(`restaurant:${restaurantId}`).emit("new_order", {
//           orderId: order._id,
//           orderNumber: order._id.toString().slice(-6).toUpperCase(),
//           customerName: req.userEmail || 'Customer',
//           total: order.total,
//           itemCount: order.items.length,
//           timestamp: new Date().toISOString(),
//         });
//         console.log("📡 Restaurant notified of new COD order");
//       }
//     } catch (socketErr) {
//       console.error("Socket emit error:", socketErr);
//     }

//     setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

//     res.status(201).json({
//       success: true,
//       order: {
//         _id: order._id,
//         orderId: order._id.toString().slice(-6).toUpperCase(),
//         status: order.status,
//         total: order.total,
//         createdAt: order.createdAt,
//       },
//       message: "Order placed successfully",
//     });

//   } catch (err) {
//     console.error("Error creating COD order:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to create order" 
//     });
//   }
// });

// // ============================================
// // GET ALL ORDERS (Customer)
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
    
//     if (!["pending_payment", "confirmed", "placed"].includes(order.status)) {
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
//     console.error("Error cancelling order:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Cancellation failed" 
//     });
//   }
// });

// // ============================================
// // TEST ROUTES
// // ============================================
// router.get("/test-auth", requireAuth, async (req: AuthRequest, res) => {
//   console.log("✅ Test auth route called!");
//   res.json({ 
//     success: true, 
//     message: "Authentication works!",
//     userId: req.userId,
//     userEmail: req.userEmail
//   });
// });

// router.get("/debug/orders", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     const allOrders = await Order.find({}).lean();
//     const userOrders = await Order.find({ userId: req.userId }).lean();
//     res.json({
//       success: true,
//       totalOrders: allOrders.length,
//       userOrders: userOrders.length,
//       allOrders: allOrders.map(o => ({
//         id: o._id,
//         userId: o.userId,
//         restaurantName: o.restaurantName,
//         total: o.total,
//         status: o.status,
//         createdAt: o.createdAt
//       }))
//     });
//   } catch (err) {
//     res.status(500).json({ error: String(err) });
//   }
// });

// router.post("/test-create-order", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     console.log("🧪 Test order creation for user:", req.userId);

//     const {
//       restaurantId, restaurantName, items, subtotal,
//       deliveryFee, discount, tax, total,
//       deliveryAddress, paymentMethod,
//     } = req.body;

//     if (!restaurantId) {
//       res.status(400).json({ error: "restaurantId is required" });
//       return;
//     }

//     const order = await Order.create({
//       userId: req.userId,
//       restaurantId,
//       restaurantName: restaurantName || 'Test Restaurant',
//       items: items || [],
//       subtotal: subtotal || 0,
//       deliveryFee: deliveryFee || 0,
//       discount: discount || 0,
//       tax: tax || 0,
//       total: total || 0,
//       deliveryAddress: deliveryAddress || 'Test Address',
//       paymentMethod: paymentMethod || 'test',
//       paymentStatus: "paid",
//       estimatedTime: "30-40 mins",
//       driverName: "Test Driver",
//       driverPhone: "+91 98765 00001",
//       status: "confirmed",
//     });

//     console.log("✅ Test order created:", order._id);

//     res.status(201).json({
//       success: true,
//       order: {
//         _id: order._id,
//         orderId: order._id.toString().slice(-6).toUpperCase(),
//         status: order.status,
//         total: order.total,
//         createdAt: order.createdAt,
//       },
//       message: "Test order created successfully"
//     });

//   } catch (err: any) {
//     console.error("❌ Error creating test order:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to create test order",
//       details: err.message || "Unknown error"
//     });
//   }
// });

// export default router;



import { Router } from "express";
import { Order } from "../models/Order";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { getIO } from "../lib/socket";

const router = Router();

const STATUS_FLOW = [
  "placed", "confirmed", "preparing", "ready", "picked_up", "on_the_way", "delivered",
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

// COD orders — Razorpay handles every online-payment order via /razorpay/*
router.post("/cod", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      restaurantId, restaurantName, items, subtotal,
      deliveryFee, discount, tax, total, deliveryAddress,
    } = req.body;

    if (!restaurantId || !items?.length) {
      res.status(400).json({ success: false, error: "restaurantId and items are required" });
      return;
    }

    const order = await Order.create({
      userId: req.userId,
      restaurantId,
      restaurantName: restaurantName || "Restaurant",
      items,
      subtotal: subtotal || 0,
      deliveryFee: deliveryFee || 0,
      discount: discount || 0,
      tax: tax || 0,
      total: total || 0,
      deliveryAddress: deliveryAddress || "Address not provided",
      paymentMethod: "cod",
      paymentStatus: "pending",
      estimatedTime: "30-40 mins",
      driverName: "Arjun Kumar",
      driverPhone: "+91 98765 00001",
      status: "confirmed",
    });

    try {
      getIO().to(`restaurant:${restaurantId}`).emit("new_order", {
        orderId: order._id,
        orderNumber: order._id.toString().slice(-6).toUpperCase(),
        customerName: req.userEmail || "Customer",
        total: order.total,
        itemCount: order.items.length,
        timestamp: new Date().toISOString(),
      });
    } catch (socketErr) {
      req.log.error({ socketErr }, "Socket emit failed for COD order");
    }

    setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

    res.status(201).json({
      success: true,
      order: {
        _id: order._id,
        orderId: order._id.toString().slice(-6).toUpperCase(),
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      },
      message: "Order placed successfully",
    });
  } catch (err) {
    req.log.error({ err }, "Error creating COD order");
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, orders });
  } catch (err) {
    req.log.error({ err }, "Error fetching orders");
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({ _id: req.params["id"], userId: req.userId }).lean();
    if (!order) { res.status(404).json({ success: false, error: "Order not found" }); return; }
    res.json({ success: true, order });
  } catch (err) {
    req.log.error({ err }, "Error fetching order");
    res.status(500).json({ success: false, error: "Failed to fetch order" });
  }
});

router.post("/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({ _id: req.params["id"], userId: req.userId });
    if (!order) { res.status(404).json({ success: false, error: "Order not found" }); return; }

    if (!["pending_payment", "confirmed", "placed"].includes(order.status)) {
      res.status(400).json({ success: false, error: "Order cannot be cancelled at this stage" });
      return;
    }

    order.status = "cancelled";
    await order.save();
    getIO().to(`order:${order._id}`).emit("order:status", { status: "cancelled" });

    res.json({ success: true, order, message: "Order cancelled successfully" });
  } catch (err) {
    req.log.error({ err }, "Error cancelling order");
    res.status(500).json({ success: false, error: "Cancellation failed" });
  }
});

export default router;

