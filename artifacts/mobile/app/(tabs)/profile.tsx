import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
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
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? colors.accent + "15" : colors.secondary }]}>
        <Ionicons name={icon as any} size={20} color={danger ? colors.accent : colors.primary} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, { color: danger ? colors.accent : colors.foreground }]}>{label}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      </View>
      {rightElement ?? <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

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
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.secondary }]}>
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
          <MenuRow
            icon="location-outline"
            label="Saved Addresses"
            subtitle="Home, Work & more"
            onPress={() => {}}
          />
          <MenuRow
            icon="heart-outline"
            label="Favorites"
            subtitle="Your saved restaurants"
            onPress={() => {}}
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
            onPress={() => {}}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PREFERENCES</Text>
          <MenuRow
            icon={colorScheme === "dark" ? "moon" : "sunny-outline"}
            label="Appearance"
            subtitle={colorScheme === "dark" ? "Dark Mode" : "Light Mode"}
            rightElement={
              <View style={[styles.themeBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.themeBadgeText, { color: colors.primary }]}>
                  {colorScheme === "dark" ? "Dark" : "Light"}
                </Text>
              </View>
            }
          />
          <MenuRow
            icon="notifications-outline"
            label="Notifications"
            subtitle="Manage alerts & offers"
            onPress={() => {}}
          />
          <MenuRow
            icon="language-outline"
            label="Language"
            subtitle="English"
            onPress={() => {}}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SUPPORT</Text>
          <MenuRow
            icon="help-circle-outline"
            label="Help Center"
            subtitle="FAQs & support"
            onPress={() => {}}
          />
          <MenuRow
            icon="star-outline"
            label="Rate FoodRush"
            subtitle="Share your experience"
            onPress={() => {}}
          />
          <MenuRow
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => {}}
          />
        </View>

        {user && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <MenuRow
              icon="log-out-outline"
              label="Sign Out"
              onPress={handleLogout}
              danger
            />
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 2 },
  userEmail: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 1 },
  userPhone: { fontSize: 13, fontFamily: "Inter_400Regular" },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
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
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontFamily: "Inter_500Medium", marginBottom: 1 },
  menuSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  themeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  themeBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  version: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8 },
});
