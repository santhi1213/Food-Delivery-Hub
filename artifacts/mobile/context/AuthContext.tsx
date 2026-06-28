import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface Address {
  _id?: string;
  type: string;
  address: string;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  addresses?: Address[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addAddress: (type: string, address: string, lat?: number, lng?: number) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("user"),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveSession = async (t: string, u: User) => {
    await Promise.all([
      AsyncStorage.setItem("token", t),
      AsyncStorage.setItem("user", JSON.stringify(u)),
    ]);
    setToken(t);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const { token: t, user: u } = await api.auth.login(email, password);
    const normalized: User = { ...(u as any), id: (u as any)._id ?? (u as any).id };
    await saveSession(t, normalized);
    // Seed DB on first login if needed
    api.seed.restaurants().catch(() => { });
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const { token: t, user: u } = await api.auth.register({ name, email, phone, password });
    const normalized: User = { ...(u as any), id: (u as any)._id ?? (u as any).id };
    await saveSession(t, normalized);
    api.seed.restaurants().catch(() => { });
  };

  // const logout = async () => {
  //   setUser(null);
  //   setToken(null);
  //   await AsyncStorage.multiRemove(["token", "user", "cart"]);
  // };

  const logout = async () => {
    // Clear user-specific cart
    if (user?.id) {
      await AsyncStorage.removeItem(`cart_${user.id}`);
    }

    // Clear other user data
    await AsyncStorage.multiRemove(["token", "user"]);

    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    if (!user) {
      // Clear cart when user is null
      AsyncStorage.removeItem('cart_guest');
    }
  }, [user]);

  const addAddress = async (type: string, address: string, lat?: number, lng?: number) => {
    const { addresses } = await api.auth.addAddress({ type, address, lat, lng });
    setUser((prev) => prev ? { ...prev, addresses } : prev);
    const updated = user ? { ...user, addresses } : null;
    if (updated) await AsyncStorage.setItem("user", JSON.stringify(updated));
  };

  const refreshUser = async () => {
    try {
      const { user: u } = await api.auth.me();
      const normalized: User = { ...(u as any), id: (u as any)._id ?? (u as any).id };
      setUser(normalized);
      await AsyncStorage.setItem("user", JSON.stringify(normalized));
    } catch { }
  };

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!user, isLoading,
      login, register, logout, addAddress, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
