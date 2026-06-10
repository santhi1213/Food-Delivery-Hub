import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OrderCard } from "@/components/OrderCard";
import { MOCK_ORDERS, Order } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const TABS = ["Active", "Past"] as const;

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"Active" | "Past">("Active");
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const loadOrders = useCallback(async () => {
    const stored = await AsyncStorage.getItem("user_orders");
    const userOrders: Order[] = stored ? JSON.parse(stored) : [];
    setOrders([...userOrders, ...MOCK_ORDERS]);
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const past = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));
  const displayed = tab === "Active" ? active : past;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Orders</Text>
        <View style={[styles.tabBar, { backgroundColor: colors.muted }]}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && { backgroundColor: colors.card, shadowColor: "#000" }]}
              onPress={() => setTab(t)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabText, { color: tab === t ? colors.foreground : colors.mutedForeground }]}>
                {t}
              </Text>
              {t === "Active" && active.length > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{active.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {displayed.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={64} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {tab === "Active" ? "No active orders" : "No past orders"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {tab === "Active"
                ? "Your current orders will appear here"
                : "Your order history will appear here"}
            </Text>
          </View>
        ) : (
          displayed.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 14 },
  tabBar: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  content: { padding: 16 },
  empty: { alignItems: "center", gap: 10, paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
