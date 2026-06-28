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

const METHODS = [
  { icon: "phone-portrait-outline", label: "UPI", subtitle: "Pay via any UPI app", badge: "Popular" },
  { icon: "card-outline", label: "Credit / Debit Card", subtitle: "Visa, Mastercard, RuPay" },
  { icon: "wallet-outline", label: "Wallets", subtitle: "Paytm, PhonePe, Amazon Pay" },
  { icon: "cash-outline", label: "Cash on Delivery", subtitle: "Pay when your order arrives" },
];

export default function PaymentMethodsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Payment Methods</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCEPTED PAYMENTS</Text>
          {METHODS.map((m, i) => (
            <View key={m.label} style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: i < METHODS.length - 1 ? StyleSheet.hairlineWidth : 0 }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
                <Ionicons name={m.icon as any} size={22} color={colors.primary} />
              </View>
              <View style={styles.rowInfo}>
                <View style={styles.rowLabelRow}>
                  <Text style={[styles.rowLabel, { color: colors.foreground }]}>{m.label}</Text>
                  {m.badge && (
                    <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.badgeText, { color: colors.primary }]}>{m.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.rowSubtitle, { color: colors.mutedForeground }]}>{m.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.secondary }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            All payments are secured by Razorpay with 256-bit SSL encryption.
          </Text>
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
  section: { borderRadius: 16, overflow: "hidden" },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  rowInfo: { flex: 1 },
  rowLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  rowSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 18 },
});
