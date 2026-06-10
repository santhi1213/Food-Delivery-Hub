import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("user").then((data) => {
      if (data) setUser(JSON.parse(data));
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 900));
    const mockUser: User = {
      id: "u1",
      name: "Rahul Sharma",
      email,
      phone: "+91 98765 43210",
    };
    setUser(mockUser);
    await AsyncStorage.setItem("user", JSON.stringify(mockUser));
  };

  const register = async (name: string, email: string, phone: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 900));
    const mockUser: User = {
      id: "u_" + Date.now().toString(),
      name,
      email,
      phone,
    };
    setUser(mockUser);
    await AsyncStorage.setItem("user", JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("cart");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
