import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { height } = Dimensions.get("window");

const FEATURES = [
  { icon: "flash", label: "Fast Delivery" },
  { icon: "restaurant", label: "1000+ Restaurants" },
  { icon: "shield-checkmark", label: "Safe & Secure" },
];

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, "#FF5722"]}
        style={[styles.hero, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Ionicons name="bicycle" size={52} color="#fff" />
          </View>
          <Text style={styles.appName}>FoodRush</Text>
          <Text style={styles.tagline}>Delicious food, delivered fast</Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Ionicons name={f.icon as any} size={20} color="#fff" />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={[styles.bottom, { backgroundColor: colors.card, paddingBottom: insets.bottom + 24 }]}>
        <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>What are you hungry for?</Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.mutedForeground }]}>
          Sign in to order from hundreds of restaurants near you
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.primary }]}
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={styles.guestBtn}
          activeOpacity={0.7}
        >
          <Text style={[styles.guestText, { color: colors.mutedForeground }]}>
            Browse as Guest
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  logoArea: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
  },
  features: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  featureItem: {
    alignItems: "center",
    gap: 6,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  featureLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  bottom: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  secondaryBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 16,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  guestBtn: {
    alignItems: "center",
    padding: 8,
  },
  guestText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "underline",
  },
});
