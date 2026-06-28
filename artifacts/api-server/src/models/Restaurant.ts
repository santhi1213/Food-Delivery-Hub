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