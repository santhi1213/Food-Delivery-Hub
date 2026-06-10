import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Order } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: "phone-portrait-outline" as const },
  { id: "card", label: "Credit / Debit Card", icon: "card-outline" as const },
  { id: "wallet", label: "Wallet", icon: "wallet-outline" as const },
  { id: "cod", label: "Cash on Delivery", icon: "cash-outline" as const },
];

const ADDRESSES = [
  { id: "a1", type: "Home", address: "12, 3rd Cross, Koramangala 5th Block, Bangalore - 560034" },
  { id: "a2", type: "Work", address: "WeWork Embassy Tech Village, Outer Ring Road, Bangalore - 560103" },
];

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { items, restaurantId, restaurantName, subtotal, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState("a1");
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [placing, setPlacing] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const deliveryFee = subtotal > 499 ? 0 : 29;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    if (!restaurantId || !restaurantName) return;
    setPlacing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await new Promise((r) => setTimeout(r, 1200));

    const newOrder: Order = {
      id: "ord_" + Date.now().toString(),
      restaurantId,
      restaurantName,
      items: items.map((c) => ({ id: c.item.id, name: c.item.name, qty: c.quantity, price: c.item.price })),
      status: "placed",
      subtotal,
      deliveryFee,
      discount: 0,
      total,
      date: new Date().toISOString(),
      estimatedTime: "30-40 mins",
    };

    const stored = await AsyncStorage.getItem("user_orders");
    const existing: Order[] = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem("user_orders", JSON.stringify([newOrder, ...existing]));

    clearCart();
    setPlacing(false);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace(`/order-tracking/${newOrder.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Checkout</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 120 }]}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Delivery Address</Text>
          {ADDRESSES.map((addr) => (
            <TouchableOpacity
              key={addr.id}
              style={[
                styles.addressRow,
                { borderColor: selectedAddress === addr.id ? colors.primary : colors.border },
                { backgroundColor: selectedAddress === addr.id ? colors.secondary : colors.background },
              ]}
              onPress={() => setSelectedAddress(addr.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.addrIcon, { backgroundColor: selectedAddress === addr.id ? colors.primary : colors.muted }]}>
                <Ionicons
                  name={addr.type === "Home" ? "home" : "briefcase"}
                  size={16}
                  color={selectedAddress === addr.id ? "#fff" : colors.mutedForeground}
                />
              </View>
              <View style={styles.addrInfo}>
                <Text style={[styles.addrType, { color: colors.foreground }]}>{addr.type}</Text>
                <Text style={[styles.addrText, { color: colors.mutedForeground }]} numberOfLines={2}>{addr.address}</Text>
              </View>
              {selectedAddress === addr.id && (
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.addAddrBtn, { borderColor: colors.border }]}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={[styles.addAddrText, { color: colors.primary }]}>Add New Address</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentRow,
                { borderColor: selectedPayment === method.id ? colors.primary : colors.border },
                { backgroundColor: selectedPayment === method.id ? colors.secondary : colors.background },
              ]}
              onPress={() => setSelectedPayment(method.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.payIcon, { backgroundColor: selectedPayment === method.id ? colors.primary : colors.muted }]}>
                <Ionicons name={method.icon} size={18} color={selectedPayment === method.id ? "#fff" : colors.mutedForeground} />
              </View>
              <Text style={[styles.payLabel, { color: colors.foreground }]}>{method.label}</Text>
              <View style={[
                styles.radio,
                { borderColor: selectedPayment === method.id ? colors.primary : colors.border },
              ]}>
                {selectedPayment === method.id && (
                  <View style={[styles.radioFill, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Summary</Text>
          {items.slice(0, 3).map(({ item, quantity }) => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={[styles.summaryItem, { color: colors.mutedForeground }]}>{quantity}x {item.name}</Text>
              <Text style={[styles.summaryPrice, { color: colors.foreground }]}>₹{item.price * quantity}</Text>
            </View>
          ))}
          {items.length > 3 && (
            <Text style={[styles.moreItems, { color: colors.mutedForeground }]}>+{items.length - 3} more items</Text>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {[
            { label: "Subtotal", value: `₹${subtotal}` },
            { label: "Delivery", value: deliveryFee === 0 ? "FREE" : `₹${deliveryFee}` },
            { label: "GST", value: `₹${tax}` },
          ].map((row) => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={[styles.billLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.billValue, { color: row.value === "FREE" ? colors.success : colors.foreground }]}>{row.value}</Text>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total Payable</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>₹{total}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, paddingBottom: insets.bottom + 12, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.placeBtn, { backgroundColor: placing ? colors.muted : colors.primary }]}
          onPress={handlePlaceOrder}
          disabled={placing}
          activeOpacity={0.85}
        >
          {placing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={[styles.placeBtnText, { color: colors.primaryForeground }]}>Place Order</Text>
              <Text style={[styles.placeBtnAmount, { color: "rgba(255,255,255,0.85)" }]}>₹{total}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 12 },
  section: { borderRadius: 16, padding: 16, gap: 10 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1.5 },
  addrIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  addrInfo: { flex: 1 },
  addrType: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  addrText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
  addAddrBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: "dashed" },
  addAddrText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1.5 },
  payIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  payLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  radioFill: { width: 10, height: 10, borderRadius: 5 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryItem: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", marginRight: 8 },
  summaryPrice: { fontSize: 13, fontFamily: "Inter_500Medium" },
  moreItems: { fontSize: 12, fontFamily: "Inter_400Regular" },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  billLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  billValue: { fontSize: 13, fontFamily: "Inter_500Medium" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth },
  totalLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  totalValue: { fontSize: 17, fontFamily: "Inter_700Bold" },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  placeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14 },
  placeBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  placeBtnAmount: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
