import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";

const COUPONS: Record<string, number> = {
  FIRST50: 50,
  SAVE100: 100,
  NEWUSER: 75,
};

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, restaurantName, updateQuantity, removeItem, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const deliveryFee = subtotal > 0 ? (subtotal > 499 ? 0 : 29) : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax - appliedDiscount;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedDiscount(COUPONS[code]);
      setCouponError("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setCouponError("Invalid coupon code");
      setAppliedDiscount(0);
    }
  };

  const removeCoupon = () => {
    setCoupon("");
    setAppliedDiscount(0);
    setCouponError("");
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Cart</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={72} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Add items from a restaurant to get started
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.browseBtnText, { color: colors.primaryForeground }]}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Cart</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 120 }]}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.restaurantHeader}>
            <Ionicons name="storefront-outline" size={18} color={colors.primary} />
            <Text style={[styles.restaurantName, { color: colors.foreground }]}>{restaurantName || 'Restaurant'}</Text>
          </View>
          {items.map((item) => (
            <View key={item.id} style={[styles.cartItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.vegDot, { borderColor: item.isVeg ? colors.success : colors.accent }]}>
                <View style={[styles.vegFill, { backgroundColor: item.isVeg ? colors.success : colors.accent }]} />
              </View>
              <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={[styles.qtyControl, { backgroundColor: colors.primary }]}>
                <TouchableOpacity
                  onPress={() => {
                    if (item.quantity === 1) {
                      Alert.alert("Remove Item", `Remove ${item.name} from cart?`, [
                        { text: "Cancel", style: "cancel" },
                        { text: "Remove", style: "destructive", onPress: () => removeItem(item.id) },
                      ]);
                    } else {
                      updateQuantity(item.id, -1);
                    }
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                >
                  <Ionicons name={item.quantity === 1 ? "trash-outline" : "remove"} size={15} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Ionicons name="add" size={15} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.itemPrice, { color: colors.foreground }]}>
                ₹{item.price * item.quantity}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Coupon</Text>
          {appliedDiscount > 0 ? (
            <View style={[styles.appliedCoupon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={[styles.couponCode, { color: colors.success }]}>
                {coupon.toUpperCase()} — ₹{appliedDiscount} off
              </Text>
              <TouchableOpacity onPress={removeCoupon}>
                <Ionicons name="close" size={18} color={colors.success} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <View style={[styles.couponInput, { backgroundColor: colors.muted, borderColor: couponError ? colors.accent : colors.border }]}>
                <Ionicons name="pricetag-outline" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.couponText, { color: colors.foreground }]}
                  placeholder="Enter coupon code"
                  placeholderTextColor={colors.mutedForeground}
                  value={coupon}
                  onChangeText={(t) => { setCoupon(t); setCouponError(""); }}
                  autoCapitalize="characters"
                />
              </View>
              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                onPress={applyCoupon}
              >
                <Text style={[styles.applyText, { color: colors.primaryForeground }]}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}
          {couponError ? <Text style={[styles.couponError, { color: colors.accent }]}>{couponError}</Text> : null}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bill Summary</Text>
          {[
            { label: "Item Total", value: `₹${subtotal}` },
            { label: "Delivery Fee", value: deliveryFee === 0 ? "FREE" : `₹${deliveryFee}` },
            { label: "GST (5%)", value: `₹${tax}` },
            ...(appliedDiscount > 0 ? [{ label: "Coupon Discount", value: `-₹${appliedDiscount}` }] : []),
          ].map((row) => (
            <View key={row.label} style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[
                styles.billValue,
                { color: row.value.startsWith("-") ? colors.success : row.value === "FREE" ? colors.success : colors.foreground },
              ]}>
                {row.value}
              </Text>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.foreground }]}>₹{total}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, paddingBottom: insets.bottom + 12, borderTopColor: colors.border }]}>
        <View style={styles.footerInfo}>
          <Text style={[styles.footerTotal, { color: colors.foreground }]}>₹{total}</Text>
          <Text style={[styles.footerLabel, { color: colors.mutedForeground }]}>total payable</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/checkout")}
          activeOpacity={0.85}
        >
          <Text style={[styles.checkoutText, { color: colors.primaryForeground }]}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 16, 
    paddingBottom: 12, 
    borderBottomWidth: StyleSheet.hairlineWidth 
  },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  headerTitle: { 
    flex: 1, 
    textAlign: "center", 
    fontSize: 17, 
    fontFamily: "Inter_600SemiBold" 
  },
  content: { padding: 16, gap: 12 },
  section: { borderRadius: 16, padding: 16, gap: 12 },
  restaurantHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    paddingBottom: 4 
  },
  restaurantName: { 
    fontSize: 15, 
    fontFamily: "Inter_600SemiBold" 
  },
  cartItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10, 
    paddingVertical: 12, 
    borderBottomWidth: StyleSheet.hairlineWidth 
  },
  vegDot: { 
    width: 14, 
    height: 14, 
    borderWidth: 1.5, 
    borderRadius: 2, 
    justifyContent: "center", 
    alignItems: "center", 
    flexShrink: 0 
  },
  vegFill: { 
    width: 6, 
    height: 6, 
    borderRadius: 3 
  },
  itemName: { 
    flex: 1, 
    fontSize: 14, 
    fontFamily: "Inter_500Medium" 
  },
  qtyControl: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    paddingHorizontal: 8, 
    paddingVertical: 5, 
    borderRadius: 8 
  },
  qtyText: { 
    color: "#fff", 
    fontSize: 13, 
    fontFamily: "Inter_700Bold", 
    minWidth: 14, 
    textAlign: "center" 
  },
  itemPrice: { 
    fontSize: 14, 
    fontFamily: "Inter_600SemiBold", 
    minWidth: 50, 
    textAlign: "right" 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontFamily: "Inter_600SemiBold" 
  },
  appliedCoupon: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10, 
    padding: 12, 
    borderRadius: 10 
  },
  couponCode: { 
    flex: 1, 
    fontSize: 14, 
    fontFamily: "Inter_600SemiBold" 
  },
  couponRow: { 
    flexDirection: "row", 
    gap: 8 
  },
  couponInput: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 11, 
    borderRadius: 10, 
    borderWidth: 1 
  },
  couponText: { 
    flex: 1, 
    fontSize: 14, 
    fontFamily: "Inter_400Regular", 
    padding: 0 
  },
  applyBtn: { 
    paddingHorizontal: 16, 
    paddingVertical: 11, 
    borderRadius: 10 
  },
  applyText: { 
    fontSize: 14, 
    fontFamily: "Inter_600SemiBold" 
  },
  couponError: { 
    fontSize: 12, 
    fontFamily: "Inter_400Regular" 
  },
  billRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  billLabel: { 
    fontSize: 14, 
    fontFamily: "Inter_400Regular" 
  },
  billValue: { 
    fontSize: 14, 
    fontFamily: "Inter_500Medium" 
  },
  totalRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingTop: 12, 
    marginTop: 4, 
    borderTopWidth: StyleSheet.hairlineWidth 
  },
  totalLabel: { 
    fontSize: 16, 
    fontFamily: "Inter_700Bold" 
  },
  totalValue: { 
    fontSize: 18, 
    fontFamily: "Inter_700Bold" 
  },
  footer: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    gap: 16, 
    borderTopWidth: StyleSheet.hairlineWidth 
  },
  footerInfo: {},
  footerTotal: { 
    fontSize: 20, 
    fontFamily: "Inter_700Bold" 
  },
  footerLabel: { 
    fontSize: 12, 
    fontFamily: "Inter_400Regular" 
  },
  checkoutBtn: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8, 
    paddingVertical: 15, 
    borderRadius: 14 
  },
  checkoutText: { 
    fontSize: 15, 
    fontFamily: "Inter_700Bold" 
  },
  empty: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    gap: 12, 
    padding: 24 
  },
  emptyTitle: { 
    fontSize: 20, 
    fontFamily: "Inter_700Bold" 
  },
  emptyText: { 
    fontSize: 14, 
    fontFamily: "Inter_400Regular", 
    textAlign: "center" 
  },
  browseBtn: { 
    marginTop: 12, 
    paddingHorizontal: 28, 
    paddingVertical: 14, 
    borderRadius: 14 
  },
  browseBtnText: { 
    fontSize: 15, 
    fontFamily: "Inter_600SemiBold" 
  },
});

