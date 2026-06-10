import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapViewWrapper from "@/components/MapView";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { STATUS_STEPS, getStatusIndex, OrderStatus } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface LiveOrder {
  _id: string;
  restaurantName: string;
  restaurantId: string;
  status: OrderStatus;
  estimatedTime?: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  driverName?: string;
  driverPhone?: string;
  driverLocation?: { lat: number; lng: number };
  deliveryAddress?: string;
}

export default function OrderTrackingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [order, setOrder] = useState<LiveOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverCoord, setDriverCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    if (!id) return;
    api.orders.get(id)
      .then(({ order: o }) => {
        setOrder(o);
        if (o.driverLocation) {
          setDriverCoord({ latitude: o.driverLocation.lat, longitude: o.driverLocation.lng });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !order) return;
    const isActive = !["delivered", "cancelled"].includes(order.status);
    if (!isActive) return;

    let socketInstance: any;
    getSocket()
      .then((s) => {
        socketInstance = s;
        s.emit("join:order", id);
        s.on("order:status", ({ status }: { status: OrderStatus }) => {
          setOrder((prev) => (prev ? { ...prev, status } : prev));
        });
        s.on("order:location", ({ lat, lng }: { lat: number; lng: number }) => {
          const coord = { latitude: lat, longitude: lng };
          setDriverCoord(coord);
          mapRef.current?.animateToRegion({ ...coord, latitudeDelta: 0.03, longitudeDelta: 0.03 }, 800);
        });
      })
      .catch(() => {});

    return () => {
      socketInstance?.emit("leave:order", id);
      socketInstance?.off("order:status");
      socketInstance?.off("order:location");
    };
  }, [id, order?.status]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Ionicons name="bicycle" size={40} color={colors.primary} />
        </Animated.View>
        <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>
          Loading order...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
        <Text style={{ color: colors.foreground, marginTop: 12, fontFamily: "Inter_600SemiBold" }}>Order not found</Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/orders")} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>View All Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusIndex = getStatusIndex(order.status);
  const isActive = !["delivered", "cancelled"].includes(order.status);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/orders")} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isActive ? "Tracking Order" : "Order Details"}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {/* Map */}
        <View style={styles.mapContainer}>
          <MapViewWrapper
            driverCoord={driverCoord}
            primaryColor={colors.primary}
            mapRef={mapRef}
            etaText={order.estimatedTime}
          />
        </View>

        {/* Order info */}
        <View style={[styles.orderCard, { backgroundColor: colors.card }]}>
          <View style={styles.orderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.orderRestaurant, { color: colors.foreground }]}>{order.restaurantName}</Text>
              <Text style={[styles.orderId, { color: colors.mutedForeground }]}>
                Order #{(order._id ?? "").slice(-6).toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isActive ? colors.primary + "18" : "#22c55e18" }]}>
              <Text style={[styles.statusText, { color: isActive ? colors.primary : "#22c55e" }]}>
                {STATUS_STEPS.find((s) => s.key === order.status)?.label ?? order.status}
              </Text>
            </View>
          </View>
          {isActive && (
            <View style={[styles.etaRow, { backgroundColor: colors.secondary }]}>
              <Ionicons name="time-outline" size={15} color={colors.primary} />
              <Text style={[styles.etaRowText, { color: colors.primary }]}>
                Estimated arrival: {order.estimatedTime ?? "30-40 mins"}
              </Text>
            </View>
          )}
        </View>

        {/* Driver */}
        {isActive && order.driverName && (
          <View style={[styles.driverCard, { backgroundColor: colors.card }]}>
            <View style={[styles.driverAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.driverAvatarText}>{order.driverName.charAt(0)}</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={[styles.driverName, { color: colors.foreground }]}>{order.driverName}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={[{ fontSize: 12, fontFamily: "Inter_400Regular" }, { color: colors.mutedForeground }]}>
                  4.8 · Delivery Partner
                </Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.secondary }]}>
              <Ionicons name="call" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Timeline */}
        <View style={[styles.timelineCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.timelineTitle, { color: colors.foreground }]}>Order Progress</Text>
          {order.status === "cancelled" ? (
            <View style={{ alignItems: "center", gap: 10, paddingVertical: 20 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#ef444418", justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="close-circle" size={40} color="#ef4444" />
              </View>
              <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#ef4444" }}>Order Cancelled</Text>
            </View>
          ) : (
            STATUS_STEPS.filter((s) => s.key !== "cancelled").map((step, index, arr) => {
              const isDone = index <= statusIndex;
              const isCurrent = index === statusIndex;
              return (
                <View key={step.key} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineCircle, {
                      backgroundColor: isDone ? colors.primary : colors.muted,
                      borderColor: isDone ? colors.primary : colors.border,
                    }]}>
                      <Ionicons name={step.icon as any} size={14} color={isDone ? "#fff" : colors.mutedForeground} />
                    </View>
                    {index < arr.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: isDone ? colors.primary : colors.border }]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineLabel, {
                      color: isDone ? colors.foreground : colors.mutedForeground,
                      fontFamily: isCurrent ? "Inter_700Bold" : "Inter_400Regular",
                    }]}>
                      {step.label}
                    </Text>
                    {isCurrent && (
                      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, color: colors.primary }}>
                        In progress...
                      </Text>
                    )}
                  </View>
                  {isCurrent && <View style={[styles.currentDot, { backgroundColor: colors.primary }]} />}
                </View>
              );
            })
          )}
        </View>

        <TouchableOpacity style={[styles.helpBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.helpText, { color: colors.foreground }]}>Need Help with this order?</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 12 },
  mapContainer: { borderRadius: 20, overflow: "hidden", height: 220 },
  orderCard: { borderRadius: 16, padding: 14, gap: 10 },
  orderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderRestaurant: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  orderId: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  etaRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10 },
  etaRowText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  driverCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 14 },
  driverAvatar: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center" },
  driverAvatarText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  callBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  timelineCard: { borderRadius: 16, padding: 16 },
  timelineTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 16 },
  timelineItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4, minHeight: 40 },
  timelineLeft: { alignItems: "center", width: 32, marginRight: 12 },
  timelineCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", borderWidth: 2, zIndex: 1 },
  timelineLine: { width: 2, flex: 1, marginVertical: 2, minHeight: 20 },
  timelineContent: { flex: 1, paddingTop: 4, paddingBottom: 16 },
  timelineLabel: { fontSize: 14 },
  currentDot: { width: 8, height: 8, borderRadius: 4, marginTop: 10, marginRight: 4 },
  helpBtn: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 14, padding: 14 },
  helpText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
});
