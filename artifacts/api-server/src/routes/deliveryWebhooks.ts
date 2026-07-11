import { Router } from "express";
import { Order } from "../models/Order";
import { getIO } from "../lib/socket";

const router = Router();

router.post("/webhooks/shadowfax", async (req, res) => {
  const { sfx_order_number, client_order_number, status, rider_name, rider_phone, latitude, longitude } = req.body;

  try {
    const order = await Order.findOne({
      $or: [{ shadowfaxJobId: sfx_order_number }, { _id: client_order_number }]
    });

    if (!order) return res.status(404).json({ success: false, message: "Order unmapped" });
    const io = getIO();

    switch (status?.toLowerCase()) {
      case "allocated":
      case "accepted":
        order.status = "confirmed";
        break;
      case "arrived":
        order.status = "preparing";
        break;
      case "picked_up":
        order.status = "picked_up";
        break;
      case "delivered":
        order.status = "delivered";
        order.paymentStatus = "paid";
        break;
      case "cancelled":
        order.status = "cancelled";
        break;
    }

    if (rider_name) order.driverName = rider_name;
    if (rider_phone) order.driverPhone = rider_phone;
    if (latitude && longitude) {
      order.driverLocation = { lat: Number(latitude), lng: Number(longitude) };
      io.to(`order:${order._id}`).emit("order:location", { lat: Number(latitude), lng: Number(longitude) });
    }

    await order.save();
    io.to(`order:${order._id}`).emit("order:status", { status: order.status });

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: "Webhook ingest error" });
  }
});

export default router;