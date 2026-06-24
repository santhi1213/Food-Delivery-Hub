// import mongoose, { Document, Schema } from "mongoose";

// export interface IMenuItem {
//   _id?: mongoose.Types.ObjectId;
//   name: string;
//   description: string;
//   price: number;
//   isVeg: boolean;
//   popular?: boolean;
//   calories?: number;
//   rating?: number;
// }

// export interface IMenuSection {
//   title: string;
//   items: IMenuItem[];
// }

// export interface IRestaurant extends Document {
//   name: string;
//   cuisine: string;
//   rating: number;
//   reviewCount: number;
//   deliveryTime: string;
//   distance: string;
//   minOrder: number;
//   deliveryFee: number;
//   isOpen: boolean;
//   isFeatured?: boolean;
//   tags: string[];
//   gradientColors: [string, string];
//   iconName: string;
//   menu: IMenuSection[];
//   location: { lat: number; lng: number };
//   address: string;
// }

// const MenuItemSchema = new Schema<IMenuItem>({
//   name: { type: String, required: true },
//   description: String,
//   price: { type: Number, required: true },
//   isVeg: { type: Boolean, default: false },
//   popular: Boolean,
//   calories: Number,
//   rating: Number,
// });

// const RestaurantSchema = new Schema<IRestaurant>(
//   {
//     name: { type: String, required: true },
//     cuisine: String,
//     rating: { type: Number, default: 4.0 },
//     reviewCount: { type: Number, default: 0 },
//     deliveryTime: { type: String, default: "30-40" },
//     distance: String,
//     minOrder: { type: Number, default: 99 },
//     deliveryFee: { type: Number, default: 29 },
//     isOpen: { type: Boolean, default: true },
//     isFeatured: Boolean,
//     tags: [String],
//     gradientColors: { type: [String], default: ["#FC8019", "#FF5722"] },
//     iconName: { type: String, default: "restaurant" },
//     menu: [{ title: String, items: [MenuItemSchema] }],
//     location: { lat: Number, lng: Number },
//     address: String,
//   },
//   { timestamps: true }
// );

// export const Restaurant = mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);


// // models/Restaurant.js
// import mongoose from "mongoose";

// const restaurantSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   cuisine: [{
//     type: String,
//     required: true
//   }],
//   rating: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 5
//   },
//   totalRatings: {
//     type: Number,
//     default: 0
//   },
//   priceRange: {
//     type: String,
//     enum: ['₹', '₹₹', '₹₹₹', '₹₹₹₹'],
//     default: '₹₹'
//   },
//   deliveryTime: {
//     type: Number, // in minutes
//     required: true
//   },
//   minimumOrder: {
//     type: Number,
//     default: 0
//   },
//   deliveryFee: {
//     type: Number,
//     default: 0
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   isFeatured: {
//     type: Boolean,
//     default: false
//   },
//   isOpen: {
//     type: Boolean,
//     default: true
//   },
//   openingHours: {
//     open: String,
//     close: String
//   },
//   address: {
//     street: String,
//     locality: String,
//     city: String,
//     state: String,
//     pincode: String,
//     coordinates: {
//       lat: Number,
//       lng: Number
//     }
//   },
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: 'Point'
//     },
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//       default: [0, 0]
//     }
//   },
//   images: [{
//     type: String,
//     default: []
//   }],
//   logo: String,
//   coverImage: String,
//   phone: String,
//   email: String,
//   website: String,
//   tags: [String],
//   menu: [{
//     category: String,
//     items: [{
//       name: String,
//       description: String,
//       price: Number,
//       isVeg: Boolean,
//       isAvailable: Boolean,
//       image: String,
//       customizations: [{
//         name: String,
//         options: [{
//           name: String,
//           price: Number
//         }]
//       }]
//     }]
//   }],
//   reviews: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Review'
//   }],
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Create geospatial index for location-based queries
// restaurantSchema.index({ location: '2dsphere' });

// // Text index for search
// restaurantSchema.index({ 
//   name: 'text', 
//   description: 'text', 
//   cuisine: 'text',
//   'address.locality': 'text',
//   'address.city': 'text'
// });

// export const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// models/Restaurant.ts
import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  cuisine: {
    type: [String], // Make sure this is an array
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  priceRange: {
    type: String,
    enum: ['₹', '₹₹', '₹₹₹', '₹₹₹₹'],
    default: '₹₹'
  },
  deliveryTime: {
    type: Number,
    required: true,
    default: 30
  },
  minimumOrder: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  openingHours: {
    open: String,
    close: String
  },
  address: {
    street: String,
    locality: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  images: [{
    type: String,
    default: []
  }],
  logo: String,
  coverImage: String,
  phone: String,
  email: String,
  website: String,
  tags: [String],
  menu: [{
    category: String,
    items: [{
      name: String,
      description: String,
      price: Number,
      isVeg: Boolean,
      isAvailable: Boolean,
      image: String,
      customizations: [{
        name: String,
        options: [{
          name: String,
          price: Number
        }]
      }]
    }]
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ 
  name: 'text', 
  description: 'text', 
  cuisine: 'text',
  'address.locality': 'text',
  'address.city': 'text'
});

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);