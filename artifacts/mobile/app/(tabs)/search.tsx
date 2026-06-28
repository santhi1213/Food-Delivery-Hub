import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SearchBarInput } from "@/components/SearchBarInput";
import { RESTAURANTS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const FILTERS = ["Veg Only", "Fast Delivery", "Top Rated", "Free Delivery", "Open Now"];
const TRENDING = ["Biryani", "Burger", "Pizza", "Sushi", "Healthy Bowl", "Desserts"];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const toggleFilter = (f: string) =>
    setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const results = useMemo(() => {
    let list = RESTAURANTS;

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.menu.some((s) => s.items.some((i) => i.name.toLowerCase().includes(q)))
      );
    }

    if (activeFilters.includes("Veg Only")) {
      list = list.filter((r) => r.menu.every((s) => s.items.every((i) => i.isVeg)));
    }
    if (activeFilters.includes("Fast Delivery")) {
      list = list.filter((r) => parseInt(r.deliveryTime) <= 30);
    }
    if (activeFilters.includes("Top Rated")) {
      list = list.filter((r) => r.rating >= 4.4);
    }
    if (activeFilters.includes("Free Delivery")) {
      list = list.filter((r) => r.deliveryFee === 0);
    }
    if (activeFilters.includes("Open Now")) {
      list = list.filter((r) => r.isOpen);
    }

    return list;
  }, [query, activeFilters]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Discover</Text>
        <View style={styles.searchRow}>
          <SearchBarInput
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery("")}
            autoFocus={false}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeFilters.includes(f) ? colors.primary : colors.card,
                  borderColor: activeFilters.includes(f) ? colors.primary : colors.border,
                },
              ]}
              onPress={() => toggleFilter(f)}
              activeOpacity={0.75}
            >
              {activeFilters.includes(f) && <Ionicons name="checkmark" size={13} color="#fff" />}
              <Text
                style={[
                  styles.filterText,
                  { color: activeFilters.includes(f) ? "#fff" : colors.foreground },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {query.length === 0 && activeFilters.length === 0 ? (
        <ScrollView contentContainerStyle={[styles.discoverContent, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Trending Searches</Text>
          <View style={styles.trendingGrid}>
            {TRENDING.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.trendingChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setQuery(t)}
                activeOpacity={0.75}
              >
                <Ionicons name="trending-up" size={14} color={colors.primary} />
                <Text style={[styles.trendingText, { color: colors.foreground }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>All Restaurants</Text>
          {RESTAURANTS.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          ListHeaderComponent={
            <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
              {results.length} restaurant{results.length !== 1 ? "s" : ""} found
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results found</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Try different keywords or clear filters
              </Text>
            </View>
          }
          renderItem={({ item }) => <RestaurantCard restaurant={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 12 },
  searchRow: { marginBottom: 10 },
  filters: { gap: 8, paddingBottom: 4 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  discoverContent: { padding: 16 },
  sectionLabel: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12, marginTop: 8 },
  trendingGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  trendingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  trendingText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  listContent: { padding: 16 },
  resultCount: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  empty: { alignItems: "center", gap: 8, paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
