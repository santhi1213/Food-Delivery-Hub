// test-razorpay-official.mjs
import Razorpay from 'razorpay';

// Razorpay's official test keys (from their documentation)
const razorpay = new Razorpay({
  key_id: "rzp_test_1DP5mmOlF5G5ag",
  key_secret: "s7g6GgKtQvJ8Hz2nE3hxZ7P3",
});

async function testRazorpay() {
  try {
    console.log("🔑 Testing with official test keys...");
    
    const order = await razorpay.orders.create({
      amount: 10000,
      currency: "INR",
      receipt: "test_receipt_" + Date.now(),
    });
    
    console.log("✅ Razorpay order created successfully!");
    console.log("Order ID:", order.id);
    
  } catch (error) {
    console.error("❌ Razorpay error:");
    console.error("Status Code:", error.statusCode);
    console.error("Error:", error.error);
    console.error("Message:", error.message);
  }
}

testRazorpay();