import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = `https://${process.env["EXPO_PUBLIC_DOMAIN"]}/api`;

async function getHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${BASE}${path}`, { ...options, headers: { ...headers, ...(options?.headers ?? {}) } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; phone: string; password: string }) =>
      request<{ token: string; user: any }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (email: string, password: string) =>
      request<{ token: string; user: any }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    me: () => request<{ user: any }>("/auth/me"),
    updateProfile: (data: { name: string; phone: string }) =>
      request<{ user: any }>("/auth/me", { method: "PUT", body: JSON.stringify(data) }),
    addAddress: (data: { type: string; address: string; lat?: number; lng?: number }) =>
      request<{ addresses: any[] }>("/auth/addresses", { method: "POST", body: JSON.stringify(data) }),
  },
  restaurants: {
    list: (params?: { search?: string; category?: string; featured?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set("search", params.search);
      if (params?.category) q.set("category", params.category);
      if (params?.featured) q.set("featured", "true");
      return request<{ restaurants: any[]; total: number }>(`/restaurants?${q.toString()}`);
    },
    get: (id: string) => request<{ restaurant: any }>(`/restaurants/${id}`),
  },
  orders: {
    create: (data: any) => request<{ order: any; razorpayOrderId?: string; razorpayKeyId?: string }>("/orders", { method: "POST", body: JSON.stringify(data) }),
    list: () => request<{ orders: any[] }>("/orders"),
    get: (id: string) => request<{ order: any }>(`/orders/${id}`),
    cancel: (id: string) => request<{ order: any }>(`/orders/${id}/cancel`, { method: "POST" }),
    verifyPayment: (data: { orderId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
      request<{ order: any }>("/orders/verify-payment", { method: "POST", body: JSON.stringify(data) }),
  },
  seed: {
    restaurants: () => request<{ message: string }>("/seed/restaurants", { method: "POST" }),
  },
};
