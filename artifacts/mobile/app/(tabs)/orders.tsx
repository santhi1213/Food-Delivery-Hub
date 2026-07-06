import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { useColors } from "@/hooks/useColors";
import { router } from "expo-router";

const STATUS_COLORS = {
  confirmed: '#FF9800',
  preparing: '#2196F3',
  ready: '#9C27B0',
  out_for_delivery: '#4CAF50',
  delivered: '#4CAF50',
  cancelled: '#f44336',
};

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // useEffect(() => {
  //   fetchOrders();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    try {
      const response = await api.orders.list();
      if (response.success && response.orders) {
        setOrders(response.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const OrderCard = ({ order }: { order: any }) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/order-tracking/${order._id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.orderHeader}>
        <Text style={[styles.orderId, { color: colors.foreground }]}>
          Order #{order.orderId || order._id?.slice(-8).toUpperCase()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] }]}>
            {order.status?.toUpperCase() || 'CONFIRMED'}
          </Text>
        </View>
      </View>

      <Text style={[styles.orderDate, { color: colors.mutedForeground }]}>
        {formatDate(order.createdAt)}
      </Text>

      <View style={styles.orderItems}>
        <Text style={[styles.orderItemsText, { color: colors.mutedForeground }]} numberOfLines={1}>
          {order.items?.map((item: any) => `${item.qty || item.quantity}× ${item.name}`).join(', ')}
        </Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={[styles.orderTotal, { color: colors.foreground }]}>
          ₹{order.total}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading orders...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={72} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Your orders will appear here once you place them
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.browseBtnText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, gap: 12 },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  orderDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  orderItems: {
    marginTop: 4,
  },
  orderItemsText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  orderTotal: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: 'center',
  },
  browseBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  browseBtnText: {
    color: 'white',
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
});