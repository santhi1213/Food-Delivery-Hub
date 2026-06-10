import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MenuItem } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface Props {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function FoodItemCard({ item, quantity, onAdd, onIncrease, onDecrease }: Props) {
  const colors = useColors();

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdd();
  };

  const handleIncrease = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onIncrease();
  };

  const handleDecrease = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDecrease();
  };

  return (
    <View style={[styles.card, { borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        <View style={styles.typeRow}>
          <View style={[styles.vegDot, { borderColor: item.isVeg ? colors.success : colors.accent }]}>
            <View style={[styles.vegFill, { backgroundColor: item.isVeg ? colors.success : colors.accent }]} />
          </View>
          {item.popular && (
            <View style={[styles.popularBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.popularText, { color: colors.primary }]}>Bestseller</Text>
            </View>
          )}
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
        <Text style={[styles.price, { color: colors.foreground }]}>₹{item.price}</Text>
        {item.calories && (
          <Text style={[styles.calories, { color: colors.mutedForeground }]}>{item.calories} cal</Text>
        )}
        <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View style={styles.right}>
        <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.muted }]}>
          <Ionicons name="restaurant-outline" size={28} color={colors.mutedForeground} />
        </View>

        {quantity === 0 ? (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.card, borderColor: colors.primary }]}
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <Text style={[styles.addBtnText, { color: colors.primary }]}>ADD</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.qtyControl, { backgroundColor: colors.primary }]}>
            <TouchableOpacity onPress={handleDecrease} hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}>
              <Ionicons name="remove" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity onPress={handleIncrease} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-start",
    gap: 12,
  },
  left: {
    flex: 1,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  vegDot: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  vegFill: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  popularBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
    lineHeight: 20,
  },
  price: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  calories: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  right: {
    alignItems: "center",
    gap: 8,
    width: 88,
  },
  itemImagePlaceholder: {
    width: 88,
    height: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtn: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  addBtnText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 10,
  },
  qtyText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    minWidth: 16,
    textAlign: "center",
  },
});
