import mongoose, { Document, Schema } from "mongoose";

export interface IMenuItem {
  _id?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  popular?: boolean;
  calories?: number;
  rating?: number;
}

export interface IMenuSection {
  title: string;
  items: IMenuItem[];
}

export interface IRestaurant extends Document {
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  distance: string;
  minOrder: number;
  deliveryFee: number;
  isOpen: boolean;
  isFeatured?: boolean;
  tags: string[];
  gradientColors: [string, string];
  iconName: string;
  menu: IMenuSection[];
  location: { lat: number; lng: number };
  address: string;
}

const MenuItemSchema = new Schema<IMenuItem>({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  isVeg: { type: Boolean, default: false },
  popular: Boolean,
  calories: Number,
  rating: Number,
});

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    cuisine: String,
    rating: { type: Number, default: 4.0 },
    reviewCount: { type: Number, default: 0 },
    deliveryTime: { type: String, default: "30-40" },
    distance: String,
    minOrder: { type: Number, default: 99 },
    deliveryFee: { type: Number, default: 29 },
    isOpen: { type: Boolean, default: true },
    isFeatured: Boolean,
    tags: [String],
    gradientColors: { type: [String], default: ["#FC8019", "#FF5722"] },
    iconName: { type: String, default: "restaurant" },
    menu: [{ title: String, items: [MenuItemSchema] }],
    location: { lat: Number, lng: Number },
    address: String,
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);
