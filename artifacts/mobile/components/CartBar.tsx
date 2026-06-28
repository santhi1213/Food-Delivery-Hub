import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";

export function CartBar() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { totalItems, subtotal } = useCart();
  const itemCount = totalItems;

  if (itemCount === 0) return null;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/cart");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[
        styles.bar,
        {
          backgroundColor: colors.primary,
          bottom: insets.bottom + 12,
        },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
        <Text style={styles.badgeText}>{itemCount}</Text>
      </View>
      <Text style={styles.label}>View Cart</Text>
      <Text style={styles.total}>₹{subtotal}</Text>
      <Ionicons name="arrow-forward" size={18} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#FC8019",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  label: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  total: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
