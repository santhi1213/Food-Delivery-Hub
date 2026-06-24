// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   isVeg: boolean;
//   restaurantId: string;
//   restaurantName: string;
//   image?: string;
// }

// interface CartContextType {
//   items: CartItem[];
//   restaurantId: string | null;
//   restaurantName: string | null;
//   subtotal: number;
//   totalItems: number;
//   addToCart: (item: Omit<CartItem, 'quantity'>) => void;
//   updateQuantity: (itemId: string, change: number) => void;
//   removeItem: (itemId: string) => void;
//   clearCart: () => void;
//   getCartCount: () => number;
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
//   return context;
// };

// interface CartProviderProps {
//   children: ReactNode;
// }

// export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
//   const [items, setItems] = useState<CartItem[]>([]);
//   const [restaurantId, setRestaurantId] = useState<string | null>(null);
//   const [restaurantName, setRestaurantName] = useState<string | null>(null);

//   // Load cart from storage on mount
//   useEffect(() => {
//     loadCart();
//   }, []);

//   // Save cart to storage whenever it changes
//   useEffect(() => {
//     saveCart();
//   }, [items, restaurantId, restaurantName]);

//   const loadCart = async () => {
//     try {
//       const stored = await AsyncStorage.getItem('cart');
//       if (stored) {
//         const data = JSON.parse(stored);
//         setItems(data.items || []);
//         setRestaurantId(data.restaurantId || null);
//         setRestaurantName(data.restaurantName || null);
//       }
//     } catch (error) {
//       console.error('Error loading cart:', error);
//     }
//   };

//   const saveCart = async () => {
//     try {
//       await AsyncStorage.setItem('cart', JSON.stringify({
//         items,
//         restaurantId,
//         restaurantName,
//       }));
//     } catch (error) {
//       console.error('Error saving cart:', error);
//     }
//   };

//   const addToCart = (item: Omit<CartItem, 'quantity'>) => {
//     // If cart has items from a different restaurant, ask to clear
//     if (restaurantId && restaurantId !== item.restaurantId) {
//       // This should be handled with an alert in the component
//       // For now, we'll clear and add new
//       setItems([]);
//       setRestaurantId(item.restaurantId);
//       setRestaurantName(item.restaurantName);
//       setItems([{ ...item, quantity: 1 }]);
//       return;
//     }

//     // If cart is empty, set restaurant
//     if (items.length === 0) {
//       setRestaurantId(item.restaurantId);
//       setRestaurantName(item.restaurantName);
//     }

//     // Check if item already exists
//     const existingIndex = items.findIndex(i => i.id === item.id);
//     if (existingIndex >= 0) {
//       const updated = [...items];
//       updated[existingIndex].quantity += 1;
//       setItems(updated);
//     } else {
//       setItems([...items, { ...item, quantity: 1 }]);
//     }
//   };

//   const updateQuantity = (itemId: string, change: number) => {
//     const updated = items.map(item => {
//       if (item.id === itemId) {
//         const newQty = item.quantity + change;
//         if (newQty <= 0) return null;
//         return { ...item, quantity: newQty };
//       }
//       return item;
//     }).filter(Boolean) as CartItem[];
    
//     setItems(updated);
//     if (updated.length === 0) {
//       setRestaurantId(null);
//       setRestaurantName(null);
//     }
//   };

//   const removeItem = (itemId: string) => {
//     const updated = items.filter(item => item.id !== itemId);
//     setItems(updated);
//     if (updated.length === 0) {
//       setRestaurantId(null);
//       setRestaurantName(null);
//     }
//   };

//   const clearCart = () => {
//     setItems([]);
//     setRestaurantId(null);
//     setRestaurantName(null);
//     AsyncStorage.removeItem('cart');
//   };

//   const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//   const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

//   const getCartCount = () => totalItems;

//   return (
//     <CartContext.Provider value={{
//       items,
//       restaurantId,
//       restaurantName,
//       subtotal,
//       totalItems,
//       addToCart,
//       updateQuantity,
//       removeItem,
//       clearCart,
//       getCartCount,
//     }}>
//       {children}
//     </CartContext.Provider>
//   );
// };


// context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  restaurantId: string;
  restaurantName: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  subtotal: number;
  totalItems: number;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (itemId: string, change: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    saveCart();
  }, [items, restaurantId, restaurantName]);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      if (stored) {
        const data = JSON.parse(stored);
        setItems(data.items || []);
        setRestaurantId(data.restaurantId || null);
        setRestaurantName(data.restaurantName || null);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify({
        items,
        restaurantId,
        restaurantName,
      }));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    // If cart has items from a different restaurant, ask to clear
    if (restaurantId && restaurantId !== item.restaurantId) {
      // For now, we'll clear and add new
      setItems([]);
      setRestaurantId(item.restaurantId);
      setRestaurantName(item.restaurantName);
      setItems([{ ...item, quantity: 1 }]);
      return;
    }

    // If cart is empty, set restaurant
    if (items.length === 0) {
      setRestaurantId(item.restaurantId);
      setRestaurantName(item.restaurantName);
    }

    // Check if item already exists
    const existingIndex = items.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      setItems(updated);
    } else {
      setItems([...items, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, change: number) => {
    const updated = items.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + change;
        if (newQty <= 0) return null;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[];
    
    setItems(updated);
    if (updated.length === 0) {
      setRestaurantId(null);
      setRestaurantName(null);
    }
  };

  const removeItem = (itemId: string) => {
    const updated = items.filter(item => item.id !== itemId);
    setItems(updated);
    if (updated.length === 0) {
      setRestaurantId(null);
      setRestaurantName(null);
    }
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    AsyncStorage.removeItem('cart');
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const getCartCount = () => totalItems;

  return (
    <CartContext.Provider value={{
      items,
      restaurantId,
      restaurantName,
      subtotal,
      totalItems,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      getCartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};