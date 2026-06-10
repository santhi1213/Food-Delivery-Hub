import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MenuItem } from "@/data/mockData";

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  getQuantity: (itemId: string) => number;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>({ items: [], restaurantId: null, restaurantName: null });

  useEffect(() => {
    AsyncStorage.getItem("cart").then((data) => {
      if (data) setCart(JSON.parse(data));
    });
  }, []);

  const persist = useCallback((state: CartState) => {
    AsyncStorage.setItem("cart", JSON.stringify(state));
  }, []);

  const addItem = useCallback(
    (item: MenuItem, rId: string, rName: string) => {
      setCart((prev) => {
        const isDifferentRestaurant = prev.restaurantId !== null && prev.restaurantId !== rId;
        let newItems: CartItem[];

        if (isDifferentRestaurant) {
          newItems = [{ item, quantity: 1 }];
        } else {
          const existing = prev.items.find((c) => c.item.id === item.id);
          if (existing) {
            newItems = prev.items.map((c) =>
              c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
            );
          } else {
            newItems = [...prev.items, { item, quantity: 1 }];
          }
        }

        const newCart = { items: newItems, restaurantId: rId, restaurantName: rName };
        persist(newCart);
        return newCart;
      });
    },
    [persist]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      setCart((prev) => {
        const newItems = prev.items.filter((c) => c.item.id !== itemId);
        const newCart: CartState = {
          items: newItems,
          restaurantId: newItems.length > 0 ? prev.restaurantId : null,
          restaurantName: newItems.length > 0 ? prev.restaurantName : null,
        };
        persist(newCart);
        return newCart;
      });
    },
    [persist]
  );

  const updateQuantity = useCallback(
    (itemId: string, delta: number) => {
      setCart((prev) => {
        const newItems = prev.items
          .map((c) => (c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c))
          .filter((c) => c.quantity > 0);
        const newCart: CartState = {
          items: newItems,
          restaurantId: newItems.length > 0 ? prev.restaurantId : null,
          restaurantName: newItems.length > 0 ? prev.restaurantName : null,
        };
        persist(newCart);
        return newCart;
      });
    },
    [persist]
  );

  const clearCart = useCallback(() => {
    const empty: CartState = { items: [], restaurantId: null, restaurantName: null };
    setCart(empty);
    AsyncStorage.removeItem("cart");
  }, []);

  const getQuantity = useCallback(
    (itemId: string) => {
      return cart.items.find((c) => c.item.id === itemId)?.quantity ?? 0;
    },
    [cart.items]
  );

  const itemCount = cart.items.reduce((sum, c) => sum + c.quantity, 0);
  const subtotal = cart.items.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        restaurantId: cart.restaurantId,
        restaurantName: cart.restaurantName,
        addItem,
        removeItem,
        updateQuantity,
        getQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
