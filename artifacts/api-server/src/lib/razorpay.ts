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