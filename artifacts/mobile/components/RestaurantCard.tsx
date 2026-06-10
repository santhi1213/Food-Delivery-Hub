import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFavorites } from "@/context/FavoritesContext";
import { Restaurant } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface Props {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: Props) {
  const colors = useColors();
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(restaurant.id);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      activeOpacity={0.88}
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
    >
      <View style={styles.imageContainer}>
        <LinearGradient
          colors={restaurant.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Ionicons name={restaurant.iconName as any} size={52} color="rgba(255,255,255,0.85)" />
        </LinearGradient>

        {!restaurant.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.favBtn, { backgroundColor: colors.card }]}
          onPress={() => toggleFavorite(restaurant.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name={fav ? "heart" : "heart-outline"} size={18} color={fav ? colors.accent : colors.mutedForeground} />
        </TouchableOpacity>

        {restaurant.deliveryFee === 0 && (
          <View style={[styles.freeBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.freeBadgeText, { color: colors.primaryForeground }]}>Free Delivery</Text>
          </View>
        )}
      </View>

      <View style={[styles.info, { borderTopWidth: 1, borderTopColor: colors.border }]}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={[styles.ratingPill, { backgroundColor: colors.success + "22" }]}>
            <Ionicons name="star" size={11} color={colors.success} />
            <Text style={[styles.ratingText, { color: colors.success }]}>{restaurant.rating}</Text>
          </View>
        </View>
        <Text style={[styles.cuisine, { color: colors.mutedForeground }]} numberOfLines={1}>
          {restaurant.cuisine}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{restaurant.deliveryTime} min</Text>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{restaurant.distance}</Text>
          {restaurant.deliveryFee > 0 && (
            <>
              <View style={[styles.dot, { backgroundColor: colors.border }]} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>₹{restaurant.deliveryFee} delivery</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 140,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  closedText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  favBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  freeBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  freeBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  info: {
    padding: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    marginRight: 8,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  cuisine: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 2,
  },
});
