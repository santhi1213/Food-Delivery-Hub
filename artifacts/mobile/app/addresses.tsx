import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const ADDRESS_TYPES = ["Home", "Work", "Other"];

export default function AddressesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addAddress } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [showForm, setShowForm] = useState(false);
  const [addrType, setAddrType] = useState("Home");
  const [addrText, setAddrText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addresses = user?.addresses ?? [];

  const handleSave = async () => {
    if (!addrText.trim()) { setError("Please enter an address."); return; }
    setSaving(true);
    setError(null);
    try {
      await addAddress(addrType, addrText.trim());
      setAddrText("");
      setShowForm(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const typeIcon = (type: string) => {
    if (type === "Home") return "home";
    if (type === "Work") return "briefcase";
    return "location";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Saved Addresses</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {addresses.length === 0 && !showForm && (
          <View style={styles.empty}>
            <Ionicons name="location-outline" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No saved addresses</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Add your home or work address for faster checkout</Text>
          </View>
        )}

        {addresses.map((addr, idx) => (
          <View key={addr._id ?? idx} style={[styles.addrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.addrIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name={typeIcon(addr.type) as any} size={20} color={colors.primary} />
            </View>
            <View style={styles.addrInfo}>
              <Text style={[styles.addrType, { color: colors.foreground }]}>{addr.type}</Text>
              <Text style={[styles.addrText, { color: colors.mutedForeground }]}>{addr.address}</Text>
            </View>
          </View>
        ))}

        {showForm ? (
          <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>New Address</Text>
            <View style={styles.typeRow}>
              {ADDRESS_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, { backgroundColor: addrType === t ? colors.primary : colors.muted, borderColor: colors.border }]}
                  onPress={() => setAddrType(t)}
                >
                  <Text style={{ color: addrType === t ? "#fff" : colors.foreground, fontSize: 13, fontFamily: "Inter_500Medium" }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Enter full address..."
              placeholderTextColor={colors.mutedForeground}
              value={addrText}
              onChangeText={(t) => { setAddrText(t); setError(null); }}
              multiline
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.formBtns}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save Address</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => { setShowForm(false); setError(null); setAddrText(""); }}>
                <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={[styles.addBtn, { borderColor: colors.primary }]} onPress={() => setShowForm(true)}>
            <Ionicons name="add-circle" size={20} color={colors.primary} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>Add New Address</Text>
          </TouchableOpacity>
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
  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  addrCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  addrIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  addrInfo: { flex: 1 },
  addrType: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  addrText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  form: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  formTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  textInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 70 },
  errorText: { color: "#ef4444", fontSize: 13, fontFamily: "Inter_500Medium" },
  formBtns: { flexDirection: "row", gap: 10 },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", borderWidth: 1 },
  cancelBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed" },
  addBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
