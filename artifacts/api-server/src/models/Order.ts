// import mongoose, { Document, Schema } from "mongoose";

// export type OrderStatus =
//   | "placed"
//   | "confirmed"
//   | "preparing"
//   | "ready"
//   | "picked_up"
//   | "on_the_way"
//   | "delivered"
//   | "cancelled"
//   | "pending_payment";

// export interface IOrderItem {
//   itemId: string;
//   name: string;
//   qty: number;
//   price: number;
//   isVeg: boolean;
// }

// export interface IOrder extends Document {
//   userId: mongoose.Types.ObjectId;
//   restaurantId: mongoose.Types.ObjectId;
//   restaurantName: string;
//   items: IOrderItem[];
//   status: OrderStatus;
//   subtotal: number;
//   deliveryFee: number;
//   discount: number;
//   tax: number;
//   total: number;
//   deliveryAddress: string;
//   paymentMethod: string;
//   paymentStatus: "pending" | "paid" | "failed" | "refunded";
//   razorpayOrderId?: string;
//   razorpayPaymentId?: string;
//   estimatedTime?: string;
//   driverLocation?: { lat: number; lng: number };
//   driverName?: string;
//   driverPhone?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const OrderSchema = new Schema<IOrder>(
//   {
//     userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true }, // was String
//     restaurantName: { type: String, required: true },
//     items: [
//       {
//         itemId: String,
//         name: String,
//         qty: Number,
//         price: Number,
//         isVeg: Boolean,
//       },
//     ],
//     status: {
//       type: String,
//       enum: ["placed", "confirmed", "preparing", "ready", "picked_up", "on_the_way", "delivered", "cancelled", "pending_payment"],
//       default: "placed",
//     },
//     subtotal: Number,
//     deliveryFee: { type: Number, default: 0 },
//     discount: { type: Number, default: 0 },
//     tax: { type: Number, default: 0 },
//     total: Number,
//     deliveryAddress: String,
//     paymentMethod: { type: String, default: "cod" },
//     paymentStatus: {
//       type: String,
//       enum: ["pending", "paid", "failed", "refunded"],
//       default: "pending",
//     },
//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//     estimatedTime: String,
//     driverLocation: { lat: Number, lng: Number },
//     driverName: String,
//     driverPhone: String,
//   },
//   { timestamps: true }
// );

// OrderSchema.index({ userId: 1, createdAt: -1 });

// export const Order = mongoose.model<IOrder>("Order", OrderSchema);


import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled"
  | "pending_payment";

export interface IOrderItem {
  itemId: string;
  name: string;
  qty: number;
  price: number;
  isVeg: boolean;
}

export interface IOrder extends Document {
  orderNumber?: string;
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  restaurantName: string;
  customer?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    email: string;
  };
  items: IOrderItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  deliveryAddress: string;
  paymentMethod: "cod" | "razorpay";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  
  // Razorpay Route Data
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpayTransferId?: string;
  restaurantShare?: number;
  commissionEarned?: number;
  payoutStatus?: "held" | "released" | "reversed";

  // Shadowfax Delivery Data
  shadowfaxJobId?: string;
  deliveryMode: "shadowfax" | "manual";
  cancelReason?: string;
  estimatedTime?: string;
  driverLocation?: { lat: number; lng: number };
  driverName?: string;
  driverPhone?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: String,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
    restaurantName: { type: String, required: true },
    customer: {
      _id: { type: Schema.Types.ObjectId },
      name: String,
      phone: String,
      email: String,
    },
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
      enum: ["placed", "confirmed", "preparing", "ready", "picked_up", "on_the_way", "delivered", "cancelled", "pending_payment"],
      default: "placed",
    },
    subtotal: Number,
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: Number,
    deliveryAddress: String,
    paymentMethod: { type: String, enum: ["cod", "razorpay"], default: "cod" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpayTransferId: String,
    restaurantShare: Number,
    commissionEarned: Number,
    payoutStatus: { type: String, enum: ["held", "released", "reversed"], default: "held" },
    shadowfaxJobId: String,
    deliveryMode: { type: String, enum: ["shadowfax", "manual"], default: "shadowfax" },
    cancelReason: String,
    estimatedTime: String,
    driverLocation: { lat: Number, lng: Number },
    driverName: String,
    driverPhone: String,
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ restaurantId: 1, createdAt: -1 });
OrderSchema.index({ shadowfaxJobId: 1 }, { sparse: true });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);

