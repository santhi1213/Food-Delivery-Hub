import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import restaurantsRouter from "./restaurants";
import ordersRouter from "./orders";
import razorpayRouter from "./razorpay";
import seedRouter from "./seed";
import deliveryWebhookRouter from "./deliveryWebhooks"; 
import { getDeliveryQuote } from "../lib/deliveryEngine";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// Debug: Log when routes are registered
console.log("🔧 Registering routes...");

router.use(healthRouter);
console.log("✅ Health routes registered");

router.use("/auth", authRouter);
console.log("✅ Auth routes registered");

router.use(deliveryWebhookRouter);
console.log("✅ Shadowfax Webhook route registered");

router.use("/restaurants", restaurantsRouter);
console.log("✅ Restaurants routes registered");

router.use("/orders", ordersRouter);
console.log("✅ Orders routes registered");

router.use("/razorpay", razorpayRouter);
console.log("✅ Razorpay routes registered");

// router.use("/seed", seedRouter);
// console.log("✅ Seed routes registered");

// 👈 Add the missing server-side delivery pricing engine route here
router.post("/delivery/quote", requireAuth, async (req, res) => {
  const { restaurantId, latitude, longitude } = req.body;
  if (!restaurantId || !latitude || !longitude) {
    return res.status(400).json({ success: false, error: "Missing calculation parameters" });
  }
  try {
    const quote = await getDeliveryQuote(restaurantId, { lat: latitude, lng: longitude });
    res.json({ success: true, ...quote });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch quote" });
  }
});
console.log("✅ Server-side Delivery Quote route registered");


// Debug route to test if router is working
router.get("/test", (req, res) => {
  res.json({ 
    message: "API router is working!",
    timestamp: new Date().toISOString()
  });
});

console.log("✅ All routes registered");

export default router;