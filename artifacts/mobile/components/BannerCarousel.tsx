import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 32;

const BANNERS = [
  {
    id: "b1",
    title: "50% off your first order",
    subtitle: "Use code FIRST50 at checkout",
    colors: ["#FC8019", "#FF5722"] as [string, string],
    icon: "🍛",
  },
  {
    id: "b2",
    title: "Free delivery this weekend",
    subtitle: "No minimum order required",
    colors: ["#E23744", "#C62828"] as [string, string],
    icon: "🛵",
  },
  {
    id: "b3",
    title: "New restaurants near you",
    subtitle: "Explore fresh menus added today",
    colors: ["#6A1B9A", "#9C27B0"] as [string, string],
    icon: "✨",
  },
];

export function BannerCarousel() {
  const colors = useColors();
  const [active, setActive] = useState(0);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % BANNERS.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={BANNERS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        snapToInterval={BANNER_WIDTH + 10}
        decelerationRate="fast"
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 10));
          setActive(idx);
        }}
        getItemLayout={(_, index) => ({ length: BANNER_WIDTH + 10, offset: (BANNER_WIDTH + 10) * index, index })}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.92} style={{ width: BANNER_WIDTH, marginRight: 10 }}>
            <LinearGradient
              colors={item.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                <View style={[styles.ctaBtn, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                  <Text style={styles.ctaText}>Order Now</Text>
                </View>
              </View>
              <Text style={styles.bannerEmoji}>{item.icon}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
      <View style={styles.dots}>
        {BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === active ? colors.primary : colors.border,
                width: i === active ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  banner: {
    height: 140,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    lineHeight: 24,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 12,
  },
  ctaBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ctaText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  bannerEmoji: {
    fontSize: 60,
    marginLeft: 10,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
