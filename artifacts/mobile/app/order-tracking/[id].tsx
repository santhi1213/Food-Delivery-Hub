import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { MOCK_ORDERS, STATUS_STEPS, getStatusIndex } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function OrderTrackingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const order = MOCK_ORDERS.find((o) => o.id === id) ?? {
    id: id ?? "new",
    restaurantName: "Your Restaurant",
    status: "placed" as const,
    estimatedTime: "30-40 mins",
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    discount: 0,
    total: 0,
    date: new Date().toISOString(),
    restaurantId: "",
  };

  const statusIndex = getStatusIndex(order.status);
  const activeSteps = order.status === "cancelled" ? [] : STATUS_STEPS.filter((_, i) => i <= statusIndex);

  const pulseAnim = useRef(new Animated.Value(1)).current;

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
        <View style={[styles.mapPlaceholder]}>
          <LinearGradient
            colors={["#1a1a2e", "#16213e", "#0f3460"]}
            style={styles.mapGradient}
          >
            <View style={styles.mapGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={[styles.mapLine, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
              ))}
            </View>
            {isActive && (
              <Animated.View style={[styles.deliveryDot, { transform: [{ scale: pulseAnim }] }]}>
                <View style={[styles.deliveryDotInner, { backgroundColor: colors.primary }]}>
                  <Ionicons name="bicycle" size={22} color="#fff" />
                </View>
                <View style={[styles.deliveryDotRing, { borderColor: colors.primary }]} />
              </Animated.View>
            )}
            <View style={[styles.etaBadge, { backgroundColor: colors.card }]}>
              <Ionicons name="time" size={16} color={colors.primary} />
              <Text style={[styles.etaText, { color: colors.foreground }]}>
                {order.estimatedTime ?? "Delivered"}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={[styles.orderSummaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.orderSummaryRow}>
            <View>
              <Text style={[styles.orderRestaurant, { color: colors.foreground }]}>{order.restaurantName}</Text>
              <Text style={[styles.orderId, { color: colors.mutedForeground }]}>Order #{order.id.slice(-6).toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isActive ? colors.primary + "18" : colors.successBg }]}>
              <Text style={[styles.statusText, { color: isActive ? colors.primary : colors.success }]}>
                {STATUS_STEPS.find((s) => s.key === order.status)?.label ?? order.status}
              </Text>
            </View>
          </View>
        </View>

        {isActive && (
          <View style={[styles.driverCard, { backgroundColor: colors.card }]}>
            <View style={[styles.driverAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.driverAvatarText}>AK</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={[styles.driverName, { color: colors.foreground }]}>Arjun Kumar</Text>
              <View style={styles.driverMeta}>
                <Ionicons name="star" size={12} color={colors.warning} />
                <Text style={[styles.driverRating, { color: colors.mutedForeground }]}>4.8 • 1,240 deliveries</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.secondary }]}>
              <Ionicons name="call" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.timelineCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.timelineTitle, { color: colors.foreground }]}>Order Progress</Text>
          {order.status === "cancelled" ? (
            <View style={styles.cancelledContainer}>
              <View style={[styles.cancelCircle, { backgroundColor: colors.accent + "18" }]}>
                <Ionicons name="close-circle" size={40} color={colors.accent} />
              </View>
              <Text style={[styles.cancelledText, { color: colors.accent }]}>Order Cancelled</Text>
            </View>
          ) : (
            STATUS_STEPS.filter((s) => s.key !== "cancelled").map((step, index) => {
              const stepIndex = STATUS_STEPS.filter((s) => s.key !== "cancelled").indexOf(step);
              const isDone = stepIndex <= statusIndex;
              const isCurrent = stepIndex === statusIndex;

              return (
                <View key={step.key} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineCircle,
                      {
                        backgroundColor: isDone ? colors.primary : colors.muted,
                        borderColor: isDone ? colors.primary : colors.border,
                      },
                    ]}>
                      <Ionicons
                        name={step.icon as any}
                        size={14}
                        color={isDone ? "#fff" : colors.mutedForeground}
                      />
                    </View>
                    {index < STATUS_STEPS.filter((s) => s.key !== "cancelled").length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: isDone ? colors.primary : colors.border }]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineLabel, { color: isDone ? colors.foreground : colors.mutedForeground, fontFamily: isCurrent ? "Inter_700Bold" : "Inter_400Regular" }]}>
                      {step.label}
                    </Text>
                    {isCurrent && (
                      <Text style={[styles.timelineSub, { color: colors.primary }]}>In progress...</Text>
                    )}
                  </View>
                  {isCurrent && (
                    <View style={[styles.currentDot, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              );
            })
          )}
        </View>

        <TouchableOpacity
          style={[styles.helpBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.75}
        >
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
  mapPlaceholder: { borderRadius: 20, overflow: "hidden", height: 200 },
  mapGradient: { flex: 1, justifyContent: "center", alignItems: "center", position: "relative" },
  mapGrid: { ...StyleSheet.absoluteFillObject, flexDirection: "column", justifyContent: "space-around" },
  mapLine: { height: 1, width: "100%" },
  deliveryDot: { alignItems: "center", justifyContent: "center" },
  deliveryDotInner: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", zIndex: 2 },
  deliveryDotRing: { position: "absolute", width: 70, height: 70, borderRadius: 35, borderWidth: 2, opacity: 0.4 },
  etaBadge: { position: "absolute", bottom: 14, left: 14, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  etaText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  orderSummaryCard: { borderRadius: 16, padding: 16 },
  orderSummaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderRestaurant: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  orderId: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  driverCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 14 },
  driverAvatar: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center" },
  driverAvatarText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  driverMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  driverRating: { fontSize: 12, fontFamily: "Inter_400Regular" },
  callBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  timelineCard: { borderRadius: 16, padding: 16 },
  timelineTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 16 },
  timelineItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4, minHeight: 40 },
  timelineLeft: { alignItems: "center", width: 32, marginRight: 12 },
  timelineCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", borderWidth: 2, zIndex: 1 },
  timelineLine: { width: 2, flex: 1, marginVertical: 2, minHeight: 20 },
  timelineContent: { flex: 1, paddingTop: 4, paddingBottom: 16 },
  timelineLabel: { fontSize: 14 },
  timelineSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  currentDot: { width: 8, height: 8, borderRadius: 4, marginTop: 10, marginRight: 4 },
  cancelledContainer: { alignItems: "center", gap: 10, paddingVertical: 20 },
  cancelCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center" },
  cancelledText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  helpBtn: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 14, padding: 14 },
  helpText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  successBg: {},
});
