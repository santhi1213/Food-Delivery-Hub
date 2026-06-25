import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Get the correct base URL based on environment
const getBaseUrl = (): string => {
  // Use environment variable if available
  if (process.env["EXPO_PUBLIC_DOMAIN"]) {
    // return `https://${process.env["EXPO_PUBLIC_DOMAIN"]}/api`;
    return "http://localhost:5000/api";
  }

  // For production builds
  if (!__DEV__) {
    // return "https://your-production-domain.com/api";
    return "http://localhost:5000/api";
  }

  // For Android Emulator
  if (Platform.OS === "android") {
    // return "http://10.0.2.2:5000/api";
    return "http://localhost:5000/api";
  }

  // For iOS Simulator
  if (Platform.OS === "ios") {
    return "http://localhost:5000/api";
  }

  // For physical devices (use your computer's IP)
  // return "http://192.168.1.100:5000/api"; // Change this to your IP
  return "http://localhost:5000/api"; // Change this to your IP
};

// Dynamic base URL
const BASE = getBaseUrl();

console.log(`API Base URL: ${BASE}`);

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses?: Address[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id?: string;
  type: string;
  address: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface Restaurant {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  cuisine: string[];
  rating: number;
  totalRatings?: number;
  totalReviews?: number;
  averageRating?: number;
  priceRange: string;
  deliveryTime: number;
  minimumOrder: number;
  deliveryFee: number;
  isActive: boolean;
  isFeatured: boolean;
  isOpen: boolean;
  address: {
    street: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: { lat: number; lng: number };
  };
  images: string[];
  logo?: string;
  coverImage?: string;
  phone?: string;
  email?: string;
  menu: MenuCategory[];
  tags?: string[];
  location?: {
    lat: number;
    lng: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  image?: string;
  popular?: boolean;
  rating?: number;
  customizations?: Customization[];
}

export interface Customization {
  name: string;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  name: string;
  price: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurant: Restaurant;
  userId: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'upi' | 'razorpay';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  deliveryAddress: Address;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: {
    name: string;
    option: string;
    price: number;
  }[];
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName?: string;
  customizations?: any[];
  image?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  restaurantId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}


export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function getHeaders(): Promise<Record<string, string>> {
  try {
    const token = await AsyncStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  } catch (error) {
    console.error("Error getting headers:", error);
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  try {
    const headers = await getHeaders();
    const url = `${BASE}${path}`;
    
    console.log(`🌐 API Request: ${options?.method || 'GET'} ${url}`);
    
    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options?.headers ?? {}),
      },
    });

    // Try to parse response as JSON
    let responseData: any;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await res.json();
    } else {
      responseData = await res.text();
    }

    // Handle non-OK responses
    if (!res.ok) {
      console.error(`❌ API Error ${res.status}:`, responseData);
      
      const errorMessage = responseData?.error 
        || responseData?.message 
        || responseData 
        || `Request failed with status ${res.status}`;
      
      throw new ApiError(errorMessage, res.status, responseData);
    }

    console.log(`✅ API Success: ${res.status} ${url}`);
    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message === "Network request failed") {
      console.error("🌐 Network Error: Unable to connect to server");
      throw new ApiError(
        "Network connection failed. Please check your internet connection.",
        0,
        { networkError: true }
      );
    }
    
    console.error("❌ Unexpected API Error:", error);
    throw new ApiError(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500,
      { originalError: error }
    );
  }
}

export const api = {
 
  auth: {
    register: (data: { name: string; email: string; phone: string; password: string }) =>
      request<{ success: boolean; token: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    login: (email: string, password: string) =>
      request<{ success: boolean; token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    me: () =>
      request<{ success: boolean; user: User }>("/auth/me"),

    updateProfile: (data: { name: string; phone: string }) =>
      request<{ success: boolean; user: User }>("/auth/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    addAddress: (data: { type: string; address: string; lat?: number; lng?: number }) =>
      request<{ success: boolean; addresses: Address[] }>("/auth/addresses", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateAddress: (addressId: string, data: Partial<Address>) =>
      request<{ success: boolean; addresses: Address[] }>(`/auth/addresses/${addressId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    deleteAddress: (addressId: string) =>
      request<{ success: boolean }>(`/auth/addresses/${addressId}`, {
        method: "DELETE",
      }),

    setDefaultAddress: (addressId: string) =>
      request<{ success: boolean; addresses: Address[] }>(`/auth/addresses/${addressId}/default`, {
        method: "PUT",
      }),

    logout: () =>
      request<{ success: boolean }>("/auth/logout", {
        method: "POST",
      }),

    forgotPassword: (email: string) =>
      request<{ success: boolean; message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),

    resetPassword: (token: string, password: string) =>
      request<{ success: boolean; message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      }),

    changePassword: (oldPassword: string, newPassword: string) =>
      request<{ success: boolean; message: string }>("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ oldPassword, newPassword }),
      }),
  },

  restaurants: {
    list: (params?: {
      search?: string;
      category?: string;
      featured?: boolean;
      latitude?: number;
      longitude?: number;
      radius?: number;
      page?: number;
      limit?: number;
      sortBy?: 'rating' | 'deliveryTime' | 'distance' | 'price';
      sortOrder?: 'asc' | 'desc';
    }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set("search", params.search);
      if (params?.category) q.set("category", params.category);
      if (params?.featured) q.set("featured", "true");
      if (params?.latitude) q.set("latitude", params.latitude.toString());
      if (params?.longitude) q.set("longitude", params.longitude.toString());
      if (params?.radius) q.set("radius", params.radius.toString());
      if (params?.page) q.set("page", params.page.toString());
      if (params?.limit) q.set("limit", params.limit.toString());
      if (params?.sortBy) q.set("sortBy", params.sortBy);
      if (params?.sortOrder) q.set("sortOrder", params.sortOrder);
      
      const queryString = q.toString();
      return request<{
        success: boolean;
        data: Restaurant[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/restaurants${queryString ? `?${queryString}` : ''}`);
    },

    get: (id: string) =>
      request<{ success: boolean; data: Restaurant }>(`/restaurants/${id}`),

    getByCuisine: (cuisineType: string) =>
      request<{ success: boolean; data: Restaurant[]; count: number }>(`/restaurants/cuisine/${cuisineType}`),

    getFeatured: () =>
      request<{ success: boolean; data: Restaurant[] }>("/restaurants/featured"),

    search: (query: string) =>
      request<{ success: boolean; data: Restaurant[] }>(`/restaurants/search?q=${encodeURIComponent(query)}`),

    getMenu: (restaurantId: string) =>
      request<{ success: boolean; menu: MenuCategory[] }>(`/restaurants/${restaurantId}/menu`),

    getReviews: (restaurantId: string, page?: number, limit?: number) => {
      const q = new URLSearchParams();
      if (page) q.set("page", page.toString());
      if (limit) q.set("limit", limit.toString());
      return request<{ success: boolean; reviews: Review[]; total: number }>(
        `/restaurants/${restaurantId}/reviews${q.toString() ? `?${q.toString()}` : ''}`
      );
    },

    addReview: (restaurantId: string, data: { rating: number; comment: string }) =>
      request<{ success: boolean; review: Review }>(`/restaurants/${restaurantId}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getCategories: () =>
      request<{ success: boolean; categories: string[] }>("/restaurants/categories"),

    create: (data: Partial<Restaurant>) =>
      request<{ success: boolean; message: string; restaurant: Restaurant }>("/restaurants", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Restaurant>) =>
      request<{ success: boolean; message: string; restaurant: Restaurant }>(`/restaurants/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/restaurants/${id}`, {
        method: "DELETE",
      }),
  },
  
   orders: {
    create: (data: {
      restaurantId: string;
      restaurantName: string;
      items: {
        itemId: string;
        name: string;
        qty: number;
        price: number;
        isVeg: boolean;
      }[];
      subtotal: number;
      deliveryFee: number;
      tax: number;
      total: number;
      deliveryAddress: string;
      paymentMethod: string;
      instructions?: string;
    }) =>
      request<{
        success: boolean;
        order: {
          _id: string;
          orderId: string;
          status: string;
          total: number;
          createdAt: string;
        };
        razorpayOrderId?: string;
        razorpayKeyId?: string;
      }>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    get: (id: string) =>
      request<{
        success: boolean;
        order: {
          _id: string;
          orderId: string;
          status: string;
          items: any[];
          total: number;
          deliveryAddress: string;
          createdAt: string;
          estimatedDelivery?: string;
        };
      }>(`/orders/${id}`),

    list: (params?: { status?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set("status", params.status);
      if (params?.page) q.set("page", params.page?.toString() || "1");
      if (params?.limit) q.set("limit", params.limit?.toString() || "10");
      return request<{
        success: boolean;
        orders: any[];
        total: number;
      }>(`/orders${q.toString() ? `?${q.toString()}` : ''}`);
    },

    cancel: (id: string) =>
      request<{
        success: boolean;
        message: string;
      }>(`/orders/${id}/cancel`, {
        method: "POST",
      }),

    track: (id: string) =>
      request<{
        success: boolean;
        status: string;
        location?: { lat: number; lng: number };
        estimatedDelivery?: string;
      }>(`/orders/${id}/track`),

      verifyPayment: (data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) =>
    request<{
      success: boolean;
      order: any;
    }>("/orders/verify-payment", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  },

  cart: {
    get: () =>
      request<{ success: boolean; cart: Cart }>("/cart"),

    add: (data: { menuItemId: string; quantity: number; customizations?: any[] }) =>
      request<{ success: boolean; cart: Cart }>("/cart/items", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (itemId: string, quantity: number) =>
      request<{ success: boolean; cart: Cart }>(`/cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      }),

    remove: (itemId: string) =>
      request<{ success: boolean; cart: Cart }>(`/cart/items/${itemId}`, {
        method: "DELETE",
      }),

    clear: () =>
      request<{ success: boolean }>("/cart", {
        method: "DELETE",
      }),

    applyCoupon: (code: string) =>
      request<{ success: boolean; discount: number; total: number }>("/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
  },

  // ==========================================
  // SEED ENDPOINTS (for development)
  // ==========================================
  seed: {
    restaurants: () =>
      request<{ success: boolean; message: string }>("/seed/restaurants", {
        method: "POST",
      }),

    users: () =>
      request<{ success: boolean; message: string }>("/seed/users", {
        method: "POST",
      }),

    orders: () =>
      request<{ success: boolean; message: string }>("/seed/orders", {
        method: "POST",
      }),

    all: () =>
      request<{ success: boolean; message: string }>("/seed/all", {
        method: "POST",
      }),
  },

  // ==========================================
  // UTILITY ENDPOINTS
  // ==========================================
  util: {
    health: () =>
      request<{ status: string; timestamp: string }>("/health"),

    getTime: () =>
      request<{ serverTime: string; timezone: string }>("/time"),
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const apiHelpers = {
  // Store token after login
  setToken: async (token: string) => {
    try {
      await AsyncStorage.setItem("token", token);
      console.log("🔑 Token stored successfully");
    } catch (error) {
      console.error("Error storing token:", error);
    }
  },

  // Get stored token
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  // Remove token on logout
  removeToken: async () => {
    try {
      await AsyncStorage.removeItem("token");
      console.log("🔑 Token removed successfully");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  },

  // Store user data
  setUser: async (user: User) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Error storing user:", error);
    }
  },

  // Get stored user
  getUser: async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  // Clear all user data on logout
  clearUserData: async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user", "cart"]);
      console.log("🧹 User data cleared");
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await apiHelpers.getToken();
    return !!token;
  },

  // Store cart data
  setCart: async (cart: Cart) => {
    try {
      await AsyncStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error storing cart:", error);
    }
  },

  // Get stored cart
  getCart: async (): Promise<Cart | null> => {
    try {
      const cartJson = await AsyncStorage.getItem("cart");
      return cartJson ? JSON.parse(cartJson) : null;
    } catch (error) {
      console.error("Error getting cart:", error);
      return null;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      await AsyncStorage.removeItem("cart");
      console.log("🧹 Cart cleared");
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  },
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default api;