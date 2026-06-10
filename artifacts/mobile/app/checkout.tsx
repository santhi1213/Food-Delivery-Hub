import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: "phone-portrait-outline" as const },
  { id: "card", label: "Credit / Debit Card", icon: "card-outline" as const },
  { id: "wallet", label: "Wallet", icon: "wallet-outline" as const },
  { id: "cod", label: "Cash on Delivery", icon: "cash-outline" as const },
];

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addAddress } = useAuth();
  const { items, restaurantId, restaurantName, subtotal, clearCart } = useCart();
  const [addresses, setAddresses] = useState<{ id: string; type: string; address: string }[]>([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [placing, setPlacing] = useState(false);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddrType, setNewAddrType] = useState("Home");
  const [newAddrText, setNewAddrText] = useState("");
  const [savingAddr, setSavingAddr] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const deliveryFee = subtotal > 499 ? 0 : 29;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  useEffect(() => {
    const userAddresses = user?.addresses ?? [];
    const defaultAddresses = [
      { id: "a1", type: "Home", address: "12, 3rd Cross, Koramangala 5th Block, Bangalore - 560034" },
      { id: "a2", type: "Work", address: "WeWork Embassy Tech Village, Outer Ring Road, Bangalore - 560103" },
    ];
    const mapped = userAddresses.map((a) => ({ id: a._id ?? a.type, type: a.type, address: a.address }));
    setAddresses(mapped.length > 0 ? mapped : defaultAddresses);
  }, [user]);

  const handleSaveAddress = async () => {
    if (!newAddrText.trim()) return;
    setSavingAddr(true);
    try {
      await addAddress(newAddrType, newAddrText.trim());
      setAddresses((prev) => [...prev, { id: Date.now().toString(), type: newAddrType, address: newAddrText.trim() }]);
      setSelectedAddressIdx(addresses.length);
      setShowAddAddr(false);
      setNewAddrText("");
    } catch {
      Alert.alert("Error", "Failed to save address");
    } finally {
      setSavingAddr(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!restaurantId || !restaurantName) return;
    const deliveryAddress = addresses[selectedAddressIdx]?.address ?? "Default Address";
    setPlacing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const payload = {
        restaurantId,
        restaurantName,
        items: items.map((c) => ({
          itemId: c.item.id,
          name: c.item.name,
          qty: c.quantity,
          price: c.item.price,
          isVeg: c.item.isVeg,
        })),
        subtotal,
        deliveryFee,
        tax,
        total,
        deliveryAddress,
        paymentMethod: selectedPayment,
      };

      const { order, razorpayOrderId, razorpayKeyId } = await api.orders.create(payload);

      if (selectedPayment !== "cod" && razorpayOrderId && razorpayKeyId) {
        Alert.alert(
          "Payment",
          `Razorpay integration requires a native build. For now, your order is placed and payment will be collected on delivery.\n\nOrder ID: ${order._id?.slice(-8).toUpperCase()}`,
          [{ text: "OK", onPress: () => finishOrder(order._id) }]
        );
        return;
      }

      finishOrder(order._id);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const finishOrder = (orderId: string) => {
    clearCart();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace(`/order-tracking/${orderId}`);
  };

  const selectedAddress = addresses[selectedAddressIdx];

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
        {/* Delivery Address */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Delivery Address</Text>
          {addresses.map((addr, idx) => (
            <TouchableOpacity
              key={addr.id}
              style={[
                styles.addressRow,
                {
                  borderColor: selectedAddressIdx === idx ? colors.primary : colors.border,
                  backgroundColor: selectedAddressIdx === idx ? colors.secondary : colors.background,
                },
              ]}
              onPress={() => setSelectedAddressIdx(idx)}
              activeOpacity={0.75}
            >
              <View style={[styles.addrIcon, { backgroundColor: selectedAddressIdx === idx ? colors.primary : colors.muted }]}>
                <Ionicons
                  name={addr.type === "Home" ? "home" : addr.type === "Work" ? "briefcase" : "location"}
                  size={16}
                  color={selectedAddressIdx === idx ? "#fff" : colors.mutedForeground}
                />
              </View>
              <View style={styles.addrInfo}>
                <Text style={[styles.addrType, { color: colors.foreground }]}>{addr.type}</Text>
                <Text style={[styles.addrText, { color: colors.mutedForeground }]} numberOfLines={2}>{addr.address}</Text>
              </View>
              {selectedAddressIdx === idx && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </TouchableOpacity>
          ))}

          {showAddAddr ? (
            <View style={[styles.addAddrForm, { backgroundColor: colors.muted, borderRadius: 12, padding: 12, gap: 8 }]}>
              <View style={styles.addrTypeRow}>
                {["Home", "Work", "Other"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, { backgroundColor: newAddrType === t ? colors.primary : colors.card, borderColor: colors.border }]}
                    onPress={() => setNewAddrType(t)}
                  >
                    <Text style={{ color: newAddrType === t ? "#fff" : colors.foreground, fontSize: 13, fontFamily: "Inter_500Medium" }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.addrInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Enter full address..."
                placeholderTextColor={colors.mutedForeground}
                value={newAddrText}
                onChangeText={setNewAddrText}
                multiline
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={[styles.saveAddrBtn, { backgroundColor: colors.primary, flex: 1 }]}
                  onPress={handleSaveAddress}
                  disabled={savingAddr}
                >
                  {savingAddr ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Save Address</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveAddrBtn, { backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border }]}
                  onPress={() => setShowAddAddr(false)}
                >
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={[styles.addAddrBtn, { borderColor: colors.border }]} onPress={() => setShowAddAddr(true)}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={[styles.addAddrText, { color: colors.primary }]}>Add New Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentRow,
                {
                  borderColor: selectedPayment === method.id ? colors.primary : colors.border,
                  backgroundColor: selectedPayment === method.id ? colors.secondary : colors.background,
                },
              ]}
              onPress={() => setSelectedPayment(method.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.payIcon, { backgroundColor: selectedPayment === method.id ? colors.primary : colors.muted }]}>
                <Ionicons name={method.icon} size={18} color={selectedPayment === method.id ? "#fff" : colors.mutedForeground} />
              </View>
              <Text style={[styles.payLabel, { color: colors.foreground }]}>{method.label}</Text>
              {method.id === "upi" && <View style={[styles.popularTag, { backgroundColor: colors.secondary }]}><Text style={{ color: colors.primary, fontSize: 10, fontFamily: "Inter_600SemiBold" }}>Popular</Text></View>}
              <View style={[styles.radio, { borderColor: selectedPayment === method.id ? colors.primary : colors.border }]}>
                {selectedPayment === method.id && <View style={[styles.radioFill, { backgroundColor: colors.primary }]} />}
              </View>
            </TouchableOpacity>
          ))}
          {selectedPayment !== "cod" && (
            <View style={[styles.razorpayNote, { backgroundColor: colors.secondary }]}>
              <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
              <Text style={[styles.razorpayText, { color: colors.primary }]}>Secured by Razorpay</Text>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Summary</Text>
          {items.slice(0, 3).map(({ item, quantity }) => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={[styles.summaryItem, { color: colors.mutedForeground }]} numberOfLines={1}>{quantity}× {item.name}</Text>
              <Text style={[styles.summaryPrice, { color: colors.foreground }]}>₹{item.price * quantity}</Text>
            </View>
          ))}
          {items.length > 3 && <Text style={[{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular" }]}>+{items.length - 3} more items</Text>}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {[
            { label: "Subtotal", value: `₹${subtotal}` },
            { label: "Delivery", value: deliveryFee === 0 ? "FREE" : `₹${deliveryFee}` },
            { label: "GST (5%)", value: `₹${tax}` },
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
  addAddrForm: {},
  addrTypeRow: { flexDirection: "row", gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  addrInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 60 },
  saveAddrBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  addAddrBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: "dashed" },
  addAddrText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1.5 },
  payIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  payLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  popularTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  radioFill: { width: 10, height: 10, borderRadius: 5 },
  razorpayNote: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 10 },
  razorpayText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryItem: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", marginRight: 8 },
  summaryPrice: { fontSize: 13, fontFamily: "Inter_500Medium" },
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
