import { Ionicons } from "@expo/vector-icons";
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
import { useColors } from "@/hooks/useColors";

const SECTIONS = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly: name, email, phone number, and delivery addresses. We also collect usage data such as orders placed, restaurants browsed, and app interactions to improve your experience.",
  },
  {
    title: "How We Use Your Information",
    body: "Your information is used to process orders, provide customer support, send order updates and promotional notifications (with your consent), and improve our app and services.",
  },
  {
    title: "Data Sharing",
    body: "We share your delivery address and name with our restaurant partners to fulfil your order. We do not sell your personal data to third parties. Payment data is handled directly by Razorpay — we never store your card details.",
  },
  {
    title: "Data Storage & Security",
    body: "Your data is stored on secure servers with industry-standard encryption. We retain account data for as long as your account is active and up to 90 days after deletion.",
  },
  {
    title: "Your Rights",
    body: "You can request access to, correction of, or deletion of your personal data at any time by contacting support@foodrush.app. You may also withdraw consent for marketing communications in your notification settings.",
  },
  {
    title: "Cookies & Tracking",
    body: "The FoodRush app uses local storage (AsyncStorage) to remember your session and cart. We do not use third-party tracking cookies.",
  },
  {
    title: "Contact Us",
    body: "For any privacy-related questions or requests, contact our Data Protection team at privacy@foodrush.app.",
  },
];

export default function PrivacyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Privacy Policy</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={[styles.updated, { color: colors.mutedForeground }]}>Last updated: June 2026</Text>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          FoodRush ("we", "our", "us") is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights.
        </Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{s.title}</Text>
            <Text style={[styles.sectionBody, { color: colors.mutedForeground }]}>{s.body}</Text>
          </View>
        ))}
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
  updated: { fontSize: 12, fontFamily: "Inter_400Regular" },
  intro: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  section: { borderRadius: 14, padding: 16, gap: 8 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  sectionBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
