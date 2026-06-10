import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CartBar } from "@/components/CartBar";
import { FoodItemCard } from "@/components/FoodItemCard";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { RESTAURANTS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function RestaurantScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, updateQuantity, getQuantity, restaurantId: cartRestaurantId } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeSection, setActiveSection] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const restaurant = RESTAURANTS.find((r) => r.id === id);

  if (!restaurant) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Restaurant not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fav = isFavorite(restaurant.id);

  const handleAdd = (item: any) => {
    if (cartRestaurantId && cartRestaurantId !== restaurant.id) {
      Alert.alert(
        "Start new cart?",
        "Your cart has items from another restaurant. Starting a new order will clear your cart.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear & Add",
            style: "destructive",
            onPress: () => addItem(item, restaurant.id, restaurant.name),
          },
        ]
      );
    } else {
      addItem(item, restaurant.id, restaurant.name);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={restaurant.gradientColors}
        style={[styles.hero, { paddingTop: insets.top || 44 }]}
      >
        <View style={styles.heroActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.3)" }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroRight}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.3)" }]}
              onPress={() => toggleFavorite(restaurant.id)}
            >
              <Ionicons name={fav ? "heart" : "heart-outline"} size={22} color={fav ? colors.accent : "#fff"} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.3)" }]}>
              <Ionicons name="share-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name={restaurant.iconName as any} size={60} color="rgba(255,255,255,0.7)" />
        </View>
      </LinearGradient>

      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <View style={styles.infoTop}>
          <View style={styles.infoLeft}>
            <Text style={[styles.restaurantName, { color: colors.foreground }]}>{restaurant.name}</Text>
            <Text style={[styles.cuisine, { color: colors.mutedForeground }]}>{restaurant.cuisine}</Text>
          </View>
          <View style={[styles.ratingBox, { backgroundColor: colors.success + "18" }]}>
            <Ionicons name="star" size={14} color={colors.success} />
            <Text style={[styles.ratingVal, { color: colors.success }]}>{restaurant.rating}</Text>
            <Text style={[styles.ratingCount, { color: colors.mutedForeground }]}>({restaurant.reviewCount})</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{restaurant.deliveryTime} min</Text>
          </View>
          <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{restaurant.distance}</Text>
          </View>
          <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
          <View style={styles.metaItem}>
            <Ionicons name="bicycle-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {restaurant.deliveryFee === 0 ? "Free delivery" : `₹${restaurant.deliveryFee}`}
            </Text>
          </View>
          <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
          <View style={styles.metaItem}>
            <Ionicons name="receipt-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Min ₹{restaurant.minOrder}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.categoryTabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabsContent}>
          {restaurant.menu.map((section, i) => (
            <TouchableOpacity
              key={section.title}
              style={[
                styles.categoryTab,
                activeSection === i && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveSection(i)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  { color: activeSection === i ? colors.primary : colors.mutedForeground },
                ]}
              >
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.menuContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {restaurant.menu.map((section, sIdx) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={[styles.menuSectionTitle, { color: colors.foreground }]}>{section.title}</Text>
            <Text style={[styles.menuSectionCount, { color: colors.mutedForeground }]}>
              {section.items.length} items
            </Text>
            {section.items.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                quantity={getQuantity(item.id)}
                onAdd={() => handleAdd(item)}
                onIncrease={() => updateQuantity(item.id, 1)}
                onDecrease={() => updateQuantity(item.id, -1)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  notFoundText: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  hero: {
    height: 200,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  heroActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  heroIcon: { alignSelf: "center" },
  infoCard: {
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  infoLeft: { flex: 1, marginRight: 12 },
  restaurantName: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 3 },
  cuisine: { fontSize: 14, fontFamily: "Inter_400Regular" },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ratingVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  ratingCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  metaDot: { width: 3, height: 3, borderRadius: 2 },
  categoryTabs: {
    borderBottomWidth: 1,
  },
  categoryTabsContent: { paddingHorizontal: 16 },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginRight: 4,
  },
  categoryTabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  menuContent: { paddingHorizontal: 16 },
  menuSection: { paddingTop: 20 },
  menuSectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  menuSectionCount: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4, marginTop: 2 },
});
