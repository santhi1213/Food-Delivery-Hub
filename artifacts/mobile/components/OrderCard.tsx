import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Order } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface Props {
  order: Order;
}

const STATUS_CONFIG = {
  placed: { label: "Order Placed", color: "#FC8019", icon: "checkmark-circle-outline" as const },
  confirmed: { label: "Confirmed", color: "#FC8019", icon: "storefront-outline" as const },
  preparing: { label: "Preparing", color: "#F59E0B", icon: "flame-outline" as const },
  ready: { label: "Ready", color: "#F59E0B", icon: "bag-check-outline" as const },
  picked_up: { label: "Picked Up", color: "#3B82F6", icon: "bicycle-outline" as const },
  on_the_way: { label: "On The Way", color: "#3B82F6", icon: "navigate-outline" as const },
  delivered: { label: "Delivered", color: "#1E9E4E", icon: "checkmark-done-circle-outline" as const },
  cancelled: { label: "Cancelled", color: "#E23744", icon: "close-circle-outline" as const },
};

export function OrderCard({ order }: Props) {
  const colors = useColors();
  const status = STATUS_CONFIG[order.status];
  const isActive = !["delivered", "cancelled"].includes(order.status);
  const dateStr = new Date(order.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.restaurantName, { color: colors.foreground }]}>{order.restaurantName}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{dateStr}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + "18" }]}>
          <Ionicons name={status.icon} size={13} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.items}>
        {order.items.slice(0, 2).map((item) => (
          <Text key={item.id} style={[styles.itemText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {item.qty}x {item.name}
          </Text>
        ))}
        {order.items.length > 2 && (
          <Text style={[styles.moreText, { color: colors.mutedForeground }]}>
            +{order.items.length - 2} more items
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.total, { color: colors.foreground }]}>₹{order.total}</Text>
        {isActive ? (
          <TouchableOpacity
            style={[styles.trackBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/order-tracking/${order.id}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={14} color="#fff" />
            <Text style={styles.trackText}>Track Order</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.reorderBtn, { borderColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.reorderText, { color: colors.primary }]}>Reorder</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  items: {
    gap: 3,
    marginBottom: 14,
  },
  itemText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  moreText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  trackText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  reorderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  reorderText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
