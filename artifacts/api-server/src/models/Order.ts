import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface IOrderItem {
  itemId: string;
  name: string;
  qty: number;
  price: number;
  isVeg: boolean;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  restaurantName: string;
  items: IOrderItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  estimatedTime?: string;
  driverLocation?: { lat: number; lng: number };
  driverName?: string;
  driverPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    restaurantId: { type: String, required: true },
    restaurantName: { type: String, required: true },
    items: [
      {
        itemId: String,
        name: String,
        qty: Number,
        price: Number,
        isVeg: Boolean,
      },
    ],
    status: {
      type: String,
      enum: ["placed", "confirmed", "preparing", "ready", "picked_up", "on_the_way", "delivered", "cancelled"],
      default: "placed",
    },
    subtotal: Number,
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: Number,
    deliveryAddress: String,
    paymentMethod: { type: String, default: "cod" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    estimatedTime: String,
    driverLocation: { lat: Number, lng: Number },
    driverName: String,
    driverPhone: String,
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
