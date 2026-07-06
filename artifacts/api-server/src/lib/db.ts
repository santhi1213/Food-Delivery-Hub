import mongoose from "mongoose";
import { logger } from "./logger";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGO_URI || 'mongodb+srv://santhiraju32_db_user:AJKUlUtr6alE8cu3@cluster0.dekolvy.mongodb.net/?appName=Cluster0';
  if (!uri) throw new Error("MONGODB_URI is not set");

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    isConnected = true;
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed — check Atlas IP whitelist (Network Access → Allow from anywhere: 0.0.0.0/0)");
    // Don't exit — server still starts, DB calls will fail gracefully
  }
}
