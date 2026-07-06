// import { Router } from "express";
// import crypto from "crypto";
// import { razorpay, keyId } from "../lib/razorpay";
// import { Order } from "../models/Order";
// import { requireAuth, AuthRequest } from "../middlewares/auth";
// import { getIO } from "../lib/socket";

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
// // CREATE RAZORPAY ORDER
// // ============================================
// router.post("/create-razorpay-order", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     console.log("📦 Creating Razorpay order for user:", req.userId);

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

//     if (!restaurantId || !items || !items.length) {
//       res.status(400).json({ 
//         success: false,
//         error: "Restaurant ID and items are required" 
//       });
//       return;
//     }

//     console.log("💰 Total amount: ₹", total);

//     const formattedItems = items.map((item: any) => ({
//       itemId: item.itemId || item.id,
//       name: item.name,
//       qty: item.qty || item.quantity || 1,
//       price: item.price,
//       isVeg: item.isVeg !== undefined ? item.isVeg : true,
//     }));

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
//       paymentMethod: "razorpay",
//       paymentStatus: "pending",
//       estimatedTime: "30-40 mins",
//       driverName: "Arjun Kumar",
//       driverPhone: "+91 98765 00001",
//     });

//     console.log("✅ Order created:", order._id);

//     // Create Razorpay Order
//     const razorpayOrder = await razorpay.orders.create({
//       amount: Math.round(total * 100),
//       currency: "INR",
//       receipt: order._id.toString(),
//       payment_capture: true,
//       notes: {
//         orderId: order._id.toString(),
//         restaurantId: restaurantId,
//         userId: req.userId || 'unknown',
//         restaurantName: restaurantName || 'Restaurant',
//         itemCount: String(items.length),
//       },
//     });

//     console.log("✅ Razorpay order created:", razorpayOrder.id);

//     await Order.findByIdAndUpdate(order._id, {
//       razorpayOrderId: razorpayOrder.id,
//     });

//     res.status(201).json({
//       success: true,
//       razorpayOrderId: razorpayOrder.id,
//       razorpayKeyId: keyId,
//       amount: razorpayOrder.amount,
//       currency: razorpayOrder.currency,
//       order: {
//         _id: order._id,
//         orderId: order._id.toString().slice(-6).toUpperCase(),
//         status: order.status,
//         total: order.total,
//         createdAt: order.createdAt,
//       },
//       message: "Razorpay order created successfully",
//     });

//   } catch (err: any) {
//     console.error("❌ Error creating Razorpay order:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to create Razorpay order",
//       details: err.message || "Unknown error"
//     });
//   }
// });

// // ============================================
// // VERIFY RAZORPAY PAYMENT - FIXED
// // ============================================
// router.post("/verify-razorpay-payment", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     console.log("🔐 Verifying Razorpay payment");
//     console.log("📦 Request body:", JSON.stringify(req.body, null, 2));

//     const {
//       razorpayOrderId,
//       razorpayPaymentId,
//       razorpaySignature,
//       orderId,
//     } = req.body;

//     if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
//       console.error("❌ Missing required fields");
//       res.status(400).json({ 
//         success: false,
//         error: "Missing required fields" 
//       });
//       return;
//     }

//     console.log("📦 Order ID:", orderId);
//     console.log("📦 Razorpay Order ID:", razorpayOrderId);
//     console.log("📦 Razorpay Payment ID:", razorpayPaymentId);
//     console.log("📦 Signature:", razorpaySignature);

//     // Find the order in our database
//     const order = await Order.findOne({ 
//       _id: orderId, 
//       userId: req.userId 
//     });

//     if (!order) {
//       console.error("❌ Order not found in database");
//       res.status(404).json({ 
//         success: false,
//         error: "Order not found" 
//       });
//       return;
//     }

//     // Verify the payment signature
//     const secret = process.env.RAZORPAY_KEY_SECRET || '';
//     const body = `${razorpayOrderId}|${razorpayPaymentId}`;
//     const expectedSignature = crypto
//       .createHmac("sha256", secret)
//       .update(body)
//       .digest("hex");

//     console.log("🔐 Expected signature:", expectedSignature);
//     console.log("🔐 Received signature:", razorpaySignature);

//     // Check if signature matches
//     const isSignatureValid = expectedSignature === razorpaySignature;
//     console.log("🔐 Signature valid:", isSignatureValid);

//     if (!isSignatureValid) {
//       console.error("❌ Invalid payment signature");
//       res.status(400).json({ 
//         success: false,
//         error: "Invalid payment signature" 
//       });
//       return;
//     }

//     // Verify payment status with Razorpay
//     try {
//       const payment = await razorpay.payments.fetch(razorpayPaymentId);
//       console.log("✅ Payment status from Razorpay:", payment.status);

//       if (payment.status !== "captured") {
//         console.error("❌ Payment not captured:", payment.status);
//         res.status(400).json({ 
//           success: false,
//           error: `Payment not completed. Status: ${payment.status}` 
//         });
//         return;
//       }
//     } catch (paymentErr) {
//       console.error("❌ Error fetching payment from Razorpay:", paymentErr);
//       // Even if Razorpay fetch fails, if signature is valid, we can still confirm
//       console.warn("⚠️ Razorpay fetch failed but signature is valid, confirming order");
//     }

//     // Update order status to confirmed
//     order.status = "confirmed";
//     order.paymentStatus = "paid";
//     order.razorpayPaymentId = razorpayPaymentId;
//     await order.save();

//     console.log("✅ Order confirmed:", order._id);

//     // Notify restaurant via socket
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

//     // Start order simulation
//     setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

//     // Return success with order data
//     res.json({
//       success: true,
//       order: {
//         _id: order._id,
//         orderId: order._id.toString().slice(-6).toUpperCase(),
//         status: order.status,
//         total: order.total,
//         createdAt: order.createdAt,
//       },
//       message: "Payment successful! Order placed.",
//     });

//   } catch (err: any) {
//     console.error("❌ Error verifying Razorpay payment:", err);
//     console.error("❌ Error stack:", err.stack);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to verify payment",
//       details: err.message || "Unknown error"
//     });
//   }
// });

// // ============================================
// // COD ORDERS
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

// export default router;


import { Router } from "express";
import "dotenv/config";
import crypto from "crypto";
import { razorpay, keySecret } from "../lib/razorpay";
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

router.post("/create-razorpay-order", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      restaurantId, restaurantName, items, subtotal,
      deliveryFee, discount, tax, total, deliveryAddress,
    } = req.body;

    if (!restaurantId || !items?.length) {
      res.status(400).json({ success: false, error: "Restaurant ID and items are required" });
      return;
    }

    const formattedItems = items.map((item: any) => ({
      itemId: item.itemId || item.id,
      name: item.name,
      qty: item.qty || item.quantity || 1,
      price: item.price,
      isVeg: item.isVeg !== undefined ? item.isVeg : true,
    }));

    const order = await Order.create({
      userId: req.userId,
      restaurantId,
      restaurantName: restaurantName || "Restaurant",
      items: formattedItems,
      status: "pending_payment",
      subtotal: subtotal || 0,
      deliveryFee: deliveryFee || 0,
      discount: discount || 0,
      tax: tax || 0,
      total: total || 0,
      deliveryAddress: deliveryAddress || "Address not provided",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      estimatedTime: "30-40 mins",
      driverName: "Arjun Kumar",
      driverPhone: "+91 98765 00001",
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: order._id.toString(),
      payment_capture: true,
      notes: {
        orderId: order._id.toString(),
        restaurantId,
        userId: req.userId || "unknown",
      },
    });

    await Order.findByIdAndUpdate(order._id, { razorpayOrderId: razorpayOrder.id });

    res.status(201).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order: {
        _id: order._id,
        orderId: order._id.toString().slice(-6).toUpperCase(),
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      },
      message: "Razorpay order created successfully",
    });
  } catch (err: any) {
    req.log.error({ err }, "Error creating Razorpay order");
    res.status(500).json({ success: false, error: "Failed to create Razorpay order" });
  }
});

router.post("/verify-razorpay-payment", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }

    const order = await Order.findOne({ _id: orderId, userId: req.userId });
    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    // Constant-time signature comparison — avoids timing side-channels.
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const receivedBuf = Buffer.from(razorpaySignature, "utf8");
    const isSignatureValid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isSignatureValid) {
      res.status(400).json({ success: false, error: "Invalid payment signature" });
      return;
    }

    // Always confirm with Razorpay directly — never trust signature alone,
    // and never fall back to "confirm anyway" if this call fails.
    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    if (payment.status !== "captured" && payment.status !== "authorized") {
      res.status(400).json({ success: false, error: `Payment not completed. Status: ${payment.status}` });
      return;
    }

    order.status = "confirmed";
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    try {
      getIO().to(`restaurant:${order.restaurantId}`).emit("new_order", {
        orderId: order._id,
        orderNumber: order._id.toString().slice(-6).toUpperCase(),
        customerName: req.userEmail || "Customer",
        total: order.total,
        itemCount: order.items.length,
        timestamp: new Date().toISOString(),
      });
    } catch (socketErr) {
      req.log.error({ socketErr }, "Socket emit failed after payment verification");
    }

    setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);

    res.json({
      success: true,
      order: {
        _id: order._id,
        orderId: order._id.toString().slice(-6).toUpperCase(),
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      },
      message: "Payment successful! Order placed.",
    });
  } catch (err: any) {
    req.log.error({ err }, "Error verifying Razorpay payment");
    res.status(500).json({ success: false, error: "Failed to verify payment" });
  }
});

export default router;

