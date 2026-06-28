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
import { useColors } from "@/hooks/useColors";

const FAQS = [
  {
    q: "How do I track my order?",
    a: "Once your order is confirmed, tap on 'Orders' in the bottom tab bar. Select your active order to see real-time tracking with status updates and driver location.",
  },
  {
    q: "Can I cancel my order?",
    a: "Yes — you can cancel an order while it's in 'Placed' or 'Confirmed' status. Open the order details and tap 'Cancel Order'. Once the restaurant starts preparing, cancellation is no longer possible.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI (GPay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), Wallets, and Cash on Delivery.",
  },
  {
    q: "Is there a minimum order amount?",
    a: "Each restaurant sets its own minimum order. You'll see it displayed on the restaurant's page before you add items to your cart.",
  },
  {
    q: "How do I add a delivery address?",
    a: "Go to Profile → Saved Addresses and tap 'Add New Address'. You can also add a new address during checkout. All saved addresses are stored for future orders.",
  },
  {
    q: "My payment failed — was I charged?",
    a: "If the payment failed, you were not charged. If an amount was deducted from your account, it will be refunded within 5–7 business days. Contact your bank if it takes longer.",
  },
  {
    q: "The restaurant is showing as closed. When will it reopen?",
    a: "Restaurants manage their own hours. If a restaurant is closed, it usually reopens during regular service hours. Try checking again later or browse other open restaurants nearby.",
  },
  {
    q: "How do I report a problem with my order?",
    a: "If your order is missing items, incorrect, or had a quality issue, please contact FoodRush support via email at support@foodrush.app with your order ID and a brief description.",
  },
];

export default function HelpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Help Center</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.heroBanner, { backgroundColor: colors.secondary }]}>
          <Ionicons name="help-buoy" size={36} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>How can we help?</Text>
            <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>Browse the FAQs below or contact us</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>FREQUENTLY ASKED QUESTIONS</Text>

        <View style={[styles.faqContainer, { backgroundColor: colors.card }]}>
          {FAQS.map((faq, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setExpanded(expanded === i ? null : i)}
              style={[styles.faqItem, { borderBottomColor: colors.border, borderBottomWidth: i < FAQS.length - 1 ? StyleSheet.hairlineWidth : 0 }]}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQ, { color: colors.foreground, flex: 1, paddingRight: 12 }]}>{faq.q}</Text>
                <Ionicons name={expanded === i ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
              </View>
              {expanded === i && (
                <Text style={[styles.faqA, { color: colors.mutedForeground }]}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.contactBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.contactTitle, { color: colors.foreground }]}>Still need help?</Text>
          <Text style={[styles.contactSubtitle, { color: colors.mutedForeground }]}>Our team is available Mon–Sat, 9am–8pm</Text>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={16} color={colors.primary} />
            <Text style={[styles.contactInfo, { color: colors.primary }]}>support@foodrush.app</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 14 },
  heroBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 14 },
  heroTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 2 },
  heroSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginTop: 4 },
  faqContainer: { borderRadius: 14, overflow: "hidden" },
  faqItem: { paddingHorizontal: 16, paddingVertical: 14 },
  faqHeader: { flexDirection: "row", alignItems: "center" },
  faqQ: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  faqA: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginTop: 8 },
  contactBox: { borderRadius: 14, padding: 16, gap: 6, borderWidth: 1 },
  contactTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  contactSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  contactInfo: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
