import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();

const razorpay = new Razorpay({
  key_id: "rzp_test_T0cnpwfJWdXQvy",
  key_secret: "itm6sotg1tiTppIv9GaeRahE",
});

// Create a payment order (doesn't save to database)
router.post("/create-order", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { amount, currency = "INR" } = req.body;
    
    if (!amount || amount <= 0) {
      res.status(400).json({ error: "Valid amount is required" });
      return;
    }

    const rpOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: `payment_${Date.now()}`,
    });
    
    res.json({
      orderId: rpOrder.id,
      keyId: "rzp_test_T0cnpwfJWdXQvy",
    });
  } catch (error) {
    console.error("Payment order creation failed:", error);
    req.log.error({ error });
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// Verify payment
router.post("/verify", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({ error: "Missing required payment verification fields" });
      return;
    }

    const secret = "itm6sotg1tiTppIv9GaeRahE";
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSig = crypto.createHmac("sha256", secret).update(body).digest("hex");
    
    if (expectedSig !== razorpaySignature) {
      res.status(400).json({ error: "Invalid payment signature" });
      return;
    }

    // Verify payment with Razorpay
    try {
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      if (payment.status !== "captured") {
        res.status(400).json({ error: "Payment not completed" });
        return;
      }
    } catch (paymentErr) {
      console.error("Payment verification error:", paymentErr);
      res.status(400).json({ error: "Payment verification failed" });
      return;
    }
    
    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Payment verification failed:", error);
    req.log.error({ error });
    res.status(500).json({ error: "Payment verification failed" });
  }
});

export default router;