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

// router.post("/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     const order = await Order.findOne({ _id: req.params["id"], userId: req.userId });
//     if (!order) { res.status(404).json({ success: false, error: "Order not found" }); return; }

//     if (!["pending_payment", "confirmed", "placed"].includes(order.status)) {
//       res.status(400).json({ success: false, error: "Order cannot be cancelled at this stage" });
//       return;
//     }

//     order.status = "cancelled";
//     await order.save();
//     getIO().to(`order:${order._id}`).emit("order:status", { status: "cancelled" });

//     res.json({ success: true, order, message: "Order cancelled successfully" });
//   } catch (err) {
//     req.log.error({ err }, "Error cancelling order");
//     res.status(500).json({ success: false, error: "Cancellation failed" });
//   }
// });

// 1. GET Delivery Quote Pre-Checkout Route

router.post("/delivery/quote", requireAuth, async (req, res) => {
  const { restaurantId, latitude, longitude } = req.body;
  if (!restaurantId || !latitude || !longitude) {
    return res.status(400).json({ success: false, error: "Missing required calculation parameters" });
  }
  const quote = await getDeliveryQuote(restaurantId, { lat: latitude, lng: longitude });
  res.json({ success: true, ...quote });
});

// 2. Customer Cancellation Route with Rider Allocation Protection Safeguard
router.post("/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });

    // Enforce business rules: stop cancellation if dispatched or picked up
    const BLOCKED_STATES = ["picked_up", "on_the_way", "delivered"];
    if (BLOCKED_STATES.includes(order.status) || order.shadowfaxJobId) {
      return res.status(400).json({ 
        success: false, 
        error: "Order cannot be cancelled as a delivery agent is already assigned or dispatch has begun." 
      });
    }

    order.status = "cancelled";
    await order.save();
    
    getIO().to(`order:${order._id}`).emit("order:status", { status: "cancelled" });
    res.json({ success: true, order, message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Cancellation failed" });
  }
});

export default router;

