import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavorites } from "@/context/FavoritesContext";
import { RESTAURANTS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function FavouritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useFavorites();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const favRestaurants = RESTAURANTS.filter((r) => favorites.includes(r.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Favourites</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {favRestaurants.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={60} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No favourites yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Tap the heart icon on any restaurant to save it here
            </Text>
            <TouchableOpacity style={[styles.browseBtn, { backgroundColor: colors.primary }]} onPress={() => router.replace("/(tabs)")}>
              <Text style={styles.browseBtnText}>Browse Restaurants</Text>
            </TouchableOpacity>
          </View>
        ) : (
          favRestaurants.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/restaurant/${r.id}`)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={r.gradientColors} style={styles.cardImage}>
                <Ionicons name={r.iconName as any} size={32} color="rgba(255,255,255,0.9)" />
              </LinearGradient>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: colors.foreground }]}>{r.name}</Text>
                <Text style={[styles.cardCuisine, { color: colors.mutedForeground }]} numberOfLines={1}>{r.cuisine}</Text>
                <View style={styles.cardMeta}>
                  <Ionicons name="star" size={12} color="#FFB800" />
                  <Text style={[styles.cardMetaText, { color: colors.foreground }]}>{r.rating}</Text>
                  <Text style={[styles.cardMetaDot, { color: colors.mutedForeground }]}>·</Text>
                  <Text style={[styles.cardMetaText, { color: colors.mutedForeground }]}>{r.deliveryTime} min</Text>
                  <Text style={[styles.cardMetaDot, { color: colors.mutedForeground }]}>·</Text>
                  <Text style={[styles.cardMetaText, { color: colors.mutedForeground }]}>{r.distance}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.heartBtn} onPress={() => toggleFavorite(r.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="heart" size={22} color="#E23744" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 12 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, paddingHorizontal: 24 },
  browseBtn: { marginTop: 8, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  browseBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardImage: { width: 64, height: 64, borderRadius: 12, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  cardCuisine: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 4 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardMetaText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  cardMetaDot: { fontSize: 12 },
  heartBtn: { padding: 4 },
});
