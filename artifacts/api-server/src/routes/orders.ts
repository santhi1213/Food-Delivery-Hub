import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../models/Order";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { getIO } from "../lib/socket";

const router = Router();

const razorpay = new Razorpay({
  key_id: "rzp_test_T0cnpwfJWdXQvy",
  key_secret: "itm6sotg1tiTppIv9GaeRahE",
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      restaurantId, restaurantName, items, subtotal,
      deliveryFee, discount, tax, total,
      deliveryAddress, paymentMethod,
    } = req.body;

    if (!restaurantId || !items?.length) {
      res.status(400).json({ error: "restaurantId and items are required" });
      return;
    }

    let razorpayOrderId: string | undefined;

    if (paymentMethod !== "cod") {
      try {
        const rpOrder = await razorpay.orders.create({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: `order_${Date.now()}`,
        });
        razorpayOrderId = rpOrder.id;
      } catch (rpErr) {
        req.log.warn({ err: rpErr }, "Razorpay order creation failed — proceeding without payment ID");
      }
    }

    const order = await Order.create({
      userId: req.userId,
      restaurantId,
      restaurantName,
      items,
      subtotal,
      deliveryFee: deliveryFee ?? 0,
      discount: discount ?? 0,
      tax: tax ?? 0,
      total,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      razorpayOrderId,
      estimatedTime: "30-40 mins",
      driverName: "Arjun Kumar",
      driverPhone: "+91 98765 00001",
      status: "placed",
    });

    res.status(201).json({
      order,
      razorpayOrderId,
      razorpayKeyId: "rzp_test_T0cnpwfJWdXQvy",
    });

    setTimeout(() => simulateOrderProgress(order._id.toString()), 3000);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.post("/verify-payment", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const secret = "itm6sotg1tiTppIv9GaeRahE";
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSig = crypto.createHmac("sha256", secret).update(body).digest("hex");

    if (expectedSig !== razorpaySignature) {
      res.status(400).json({ error: "Invalid payment signature" });
      return;
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId: req.userId },
      { $set: { paymentStatus: "paid", razorpayPaymentId } },
      { new: true }
    );
    res.json({ order });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Payment verification failed" });
  }
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ orders });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({ _id: req.params["id"], userId: req.userId }).lean();
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    res.json({ order });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.post("/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({ _id: req.params["id"], userId: req.userId });
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    if (!["placed", "confirmed"].includes(order.status)) {
      res.status(400).json({ error: "Order cannot be cancelled at this stage" });
      return;
    }
    order.status = "cancelled";
    await order.save();
    getIO().to(`order:${order._id}`).emit("order:status", { status: "cancelled" });
    res.json({ order });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Cancellation failed" });
  }
});

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
