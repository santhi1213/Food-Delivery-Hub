import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BannerCarousel } from "@/components/BannerCarousel";
import { CartBar } from "@/components/CartBar";
import { CategoryChip } from "@/components/CategoryChip";
import { RestaurantCard } from "@/components/RestaurantCard";
import { CATEGORIES, RESTAURANTS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = selectedCategory
    ? RESTAURANTS.filter(
        (r) =>
          r.cuisine.toLowerCase().includes(selectedCategory) ||
          r.tags.some((t) => t.toLowerCase().includes(selectedCategory)) ||
          r.menu.some((s) => s.title.toLowerCase().includes(selectedCategory))
      )
    : RESTAURANTS;

  const featured = RESTAURANTS.filter((r) => r.isFeatured);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.locationBtn} activeOpacity={0.75}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <View>
            <Text style={[styles.locationLabel, { color: colors.mutedForeground }]}>Deliver to</Text>
            <View style={styles.locationRow}>
              <Text style={[styles.locationText, { color: colors.foreground }]}>Koramangala, Bangalore</Text>
              <Ionicons name="chevron-down" size={14} color={colors.foreground} />
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.notifBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
            Search restaurants or dishes...
          </Text>
          <View style={[styles.searchFilter, { backgroundColor: colors.secondary }]}>
            <Ionicons name="options" size={16} color={colors.primary} />
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <BannerCarousel />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What's on your mind?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              />
            ))}
          </ScrollView>
        </View>

        {!selectedCategory && featured.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Featured Restaurants</Text>
            </View>
            {featured.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {selectedCategory ? `Results` : "All Restaurants"}
            </Text>
            <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
              {filtered.length} places
            </Text>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="restaurant-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No restaurants found for this category
              </Text>
            </View>
          ) : (
            filtered.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
          )}
        </View>
      </ScrollView>

      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  locationBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
    marginBottom: 4,
  },
  searchPlaceholder: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  searchFilter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  section: { marginTop: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 19, fontFamily: "Inter_700Bold" },
  sectionCount: { fontSize: 13, fontFamily: "Inter_400Regular" },
  categories: { paddingBottom: 6 },
  empty: { alignItems: "center", gap: 10, paddingVertical: 40 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
});
