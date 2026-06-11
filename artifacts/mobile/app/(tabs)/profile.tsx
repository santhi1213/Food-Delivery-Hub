import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

interface MenuRowProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function MenuRow({ icon, label, subtitle, onPress, rightElement, danger }: MenuRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.menuRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? "#fef2f2" : colors.secondary }]}>
        <Ionicons name={icon as any} size={20} color={danger ? "#ef4444" : colors.primary} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, { color: danger ? "#ef4444" : colors.foreground }]}>{label}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      </View>
      {rightElement ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} /> : null)}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { preference, setPreference } = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAppearance, setShowAppearance] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("notificationsEnabled").then((v) => {
      if (v !== null) setNotificationsEnabled(v === "true");
    });
  }, []);

  const toggleNotifications = (val: boolean) => {
    setNotificationsEnabled(val);
    AsyncStorage.setItem("notificationsEnabled", String(val));
  };

  const themeLabel = preference === "light" ? "Light" : preference === "dark" ? "Dark" : "System";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {user ? (
          <View style={[styles.userCard, { backgroundColor: colors.card }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.foreground }]}>{user.name}</Text>
              <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user.email}</Text>
              <Text style={[styles.userPhone, { color: colors.mutedForeground }]}>{user.phone}</Text>
            </View>
          </View>
        ) : null}

        {/* ACCOUNT */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
          <MenuRow
            icon="location-outline"
            label="Saved Addresses"
            subtitle="Home, Work & more"
            onPress={() => router.push("/addresses")}
          />
          <MenuRow
            icon="heart-outline"
            label="Favourites"
            subtitle="Your saved restaurants"
            onPress={() => router.push("/favourites")}
          />
          <MenuRow
            icon="receipt-outline"
            label="Order History"
            subtitle="View all past orders"
            onPress={() => router.push("/(tabs)/orders")}
          />
          <MenuRow
            icon="card-outline"
            label="Payment Methods"
            subtitle="Cards, UPI & more"
            onPress={() => router.push("/payment-methods")}
          />
        </View>

        {/* PREFERENCES */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PREFERENCES</Text>

          {/* Appearance */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: colors.border }]}
            onPress={() => setShowAppearance(!showAppearance)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name={preference === "dark" ? "moon" : "sunny-outline"} size={20} color={colors.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>Appearance</Text>
              <Text style={[styles.menuSubtitle, { color: colors.mutedForeground }]}>{themeLabel} Mode</Text>
            </View>
            <Ionicons name={showAppearance ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          {showAppearance && (
            <View style={[styles.appearanceOptions, { borderBottomColor: colors.border }]}>
              {(["light", "dark", "system"] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.appearanceOption, { backgroundColor: preference === opt ? colors.primary : colors.muted }]}
                  onPress={() => setPreference(opt)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt === "dark" ? "moon" : opt === "light" ? "sunny" : "phone-portrait-outline"}
                    size={16}
                    color={preference === opt ? "#fff" : colors.mutedForeground}
                  />
                  <Text style={{ color: preference === opt ? "#fff" : colors.foreground, fontSize: 13, fontFamily: "Inter_500Medium" }}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Notifications */}
          <MenuRow
            icon="notifications-outline"
            label="Notifications"
            subtitle={notificationsEnabled ? "Order updates & offers" : "Muted"}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor="#fff"
              />
            }
          />

          {/* Language */}
          <MenuRow
            icon="language-outline"
            label="Language"
            subtitle="English"
            rightElement={
              <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>EN</Text>
              </View>
            }
          />
        </View>

        {/* SUPPORT */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SUPPORT</Text>
          <MenuRow
            icon="help-circle-outline"
            label="Help Center"
            subtitle="FAQs & support"
            onPress={() => router.push("/help")}
          />
          <MenuRow
            icon="star-outline"
            label="Rate FoodRush"
            subtitle="Share your experience"
            onPress={() => {
              router.push("/help");
            }}
            rightElement={
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map((s) => <Ionicons key={s} name="star" size={14} color="#FFB800" />)}
              </View>
            }
          />
          <MenuRow
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => router.push("/privacy")}
          />
        </View>

        {/* SIGN OUT */}
        {user && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            {confirmLogout ? (
              <View style={styles.logoutConfirm}>
                <Text style={[styles.logoutConfirmText, { color: colors.foreground }]}>
                  Sign out of FoodRush?
                </Text>
                <View style={styles.logoutConfirmBtns}>
                  <TouchableOpacity
                    style={[styles.logoutCancelBtn, { borderColor: colors.border }]}
                    onPress={() => setConfirmLogout(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.logoutCancelText, { color: colors.foreground }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.logoutConfirmBtn}
                    onPress={() => { setConfirmLogout(false); logout(); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.logoutConfirmBtnText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <MenuRow
                icon="log-out-outline"
                label="Sign Out"
                onPress={() => setConfirmLogout(true)}
                danger
              />
            )}
          </View>
        )}

        <Text style={[styles.version, { color: colors.mutedForeground }]}>FoodRush v1.0.0</Text>
      </ScrollView>
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
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  content: { padding: 16, gap: 14 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 2 },
  userEmail: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 1 },
  userPhone: { fontSize: 13, fontFamily: "Inter_400Regular" },
  section: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontFamily: "Inter_500Medium", marginBottom: 1 },
  menuSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  appearanceOptions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appearanceOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  starsRow: { flexDirection: "row", gap: 2 },
  logoutConfirm: { padding: 16, gap: 12 },
  logoutConfirmText: { fontSize: 15, fontFamily: "Inter_500Medium", textAlign: "center" },
  logoutConfirmBtns: { flexDirection: "row", gap: 10 },
  logoutCancelBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  logoutCancelText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  logoutConfirmBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: "#ef4444", alignItems: "center" },
  logoutConfirmBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  version: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8 },
});
