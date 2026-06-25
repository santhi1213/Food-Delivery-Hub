import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

const ORDER_STATUSES = [
  { key: "confirmed", label: "Confirmed", icon: "checkmark-circle" },
  { key: "preparing", label: "Preparing", icon: "restaurant" },
  { key: "ready", label: "Ready for Pickup", icon: "cube" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "bicycle" },
  { key: "delivered", label: "Delivered", icon: "home" },
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.orders.get(id);
      if (response.success && response.order) {
        setOrder(response.order);
        // Find current status index
        const statusIndex = ORDER_STATUSES.findIndex(
          s => s.key === response.order.status
        );
        setCurrentStatus(statusIndex >= 0 ? statusIndex : 0);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading order details...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.primary} />
        <Text style={[styles.errorText, { color: colors.foreground }]}>Order not found</Text>
        <TouchableOpacity
          style={[styles.goHomeBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.goHomeBtnText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/orders")} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Order Tracking</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {/* Order ID */}
        <View style={[styles.orderIdContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.orderIdLabel, { color: colors.mutedForeground }]}>Order #{order.orderId || order._id?.slice(-8).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: order.status === 'delivered' ? colors.success + '20' : colors.primary + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: order.status === 'delivered' ? colors.success : colors.primary }]}>
              {order.status?.toUpperCase() || 'CONFIRMED'}
            </Text>
          </View>
        </View>

        {/* Tracking Timeline */}
        <View style={[styles.timelineContainer, { backgroundColor: colors.card }]}>
          {ORDER_STATUSES.map((status, index) => (
            <View key={status.key}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    {
                      backgroundColor: index <= currentStatus ? colors.primary : colors.border,
                      borderColor: index <= currentStatus ? colors.primary : colors.border,
                    }
                  ]}>
                    {index < currentStatus ? (
                      <Ionicons name="checkmark" size={14} color="white" />
                    ) : index === currentStatus ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : null}
                  </View>
                  {index < ORDER_STATUSES.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      { backgroundColor: index < currentStatus ? colors.primary : colors.border }
                    ]} />
                  )}
                </View>
                <View style={styles.timelineRight}>
                  <Text style={[
                    styles.timelineLabel,
                    {
                      color: index <= currentStatus ? colors.foreground : colors.mutedForeground,
                      fontWeight: index === currentStatus ? '600' : '400',
                    }
                  ]}>
                    {status.label}
                  </Text>
                  {index === currentStatus && (
                    <Text style={[styles.timelineStatus, { color: colors.primary }]}>
                      In Progress
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={[styles.summaryContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Order Summary</Text>
          {order.items?.map((item: any, index: number) => (
            <View key={index} style={styles.summaryRow}>
              <Text style={[styles.summaryItem, { color: colors.mutedForeground }]}>
                {item.qty || item.quantity}× {item.name}
              </Text>
              <Text style={[styles.summaryPrice, { color: colors.foreground }]}>
                ₹{item.price * (item.qty || item.quantity || 1)}
              </Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryTotalLabel, { color: colors.foreground }]}>Total</Text>
            <Text style={[styles.summaryTotalPrice, { color: colors.primary }]}>₹{order.total}</Text>
          </View>
          <Text style={[styles.deliveryAddress, { color: colors.mutedForeground }]}>
            Delivery: {order.deliveryAddress}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {order.status !== 'delivered' && (
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.accent }]}
              onPress={() => {
                Alert.alert(
                  "Cancel Order",
                  "Are you sure you want to cancel this order?",
                  [
                    { text: "No", style: "cancel" },
                    { 
                      text: "Yes, Cancel", 
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await api.orders.cancel(order._id);
                          Alert.alert("Cancelled", "Your order has been cancelled");
                          router.replace("/(tabs)/orders");
                        } catch (error) {
                          Alert.alert("Error", "Failed to cancel order");
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={[styles.cancelBtnText, { color: colors.accent }]}>Cancel Order</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.supportBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="headset-outline" size={20} color={colors.primary} />
            <Text style={[styles.supportBtnText, { color: colors.primary }]}>Contact Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.homeBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 12 },
  orderIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  orderIdLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  timelineContainer: { padding: 16, borderRadius: 12 },
  timelineItem: { flexDirection: 'row', marginBottom: 4 },
  timelineLeft: { width: 30, alignItems: 'center', marginRight: 12 },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineRight: { flex: 1, paddingVertical: 4 },
  timelineLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  timelineStatus: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  summaryContainer: { padding: 16, borderRadius: 12, gap: 8 },
  summaryTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryPrice: { fontSize: 13, fontFamily: "Inter_500Medium" },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  summaryTotalLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  summaryTotalPrice: { fontSize: 16, fontFamily: "Inter_700Bold" },
  deliveryAddress: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  actionContainer: { gap: 10 },
  cancelBtn: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  supportBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  homeBtn: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeBtnText: { color: 'white', fontSize: 15, fontFamily: "Inter_600SemiBold" },
  loadingText: { marginTop: 12, fontSize: 16, fontFamily: "Inter_400Regular" },
  errorText: { fontSize: 16, fontFamily: "Inter_400Regular", marginBottom: 20 },
  goHomeBtn: { paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10 },
  goHomeBtnText: { color: 'white', fontSize: 16, fontFamily: "Inter_600SemiBold" },
});