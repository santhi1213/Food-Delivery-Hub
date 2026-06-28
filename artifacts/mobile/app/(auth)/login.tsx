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
import { api } from "@/lib/api";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      setError(err?.message ?? "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setDemoLoading(true);
    const demoEmail = "demo@foodrush.app";
    const demoPwd = "demo123456";
    try {
      await login(demoEmail, demoPwd);
    } catch {
      // Demo user doesn't exist yet — auto-create it
      try {
        await register("Demo User", demoEmail, "9000000000", demoPwd);
      } catch (regErr: any) {
        // If "already registered" error we can ignore and try login again
        if (!regErr?.message?.includes("already")) {
          setError("Could not start demo. Please create an account.");
          setDemoLoading(false);
          return;
        }
        // Try login one more time
        try {
          await login(demoEmail, demoPwd);
        } catch (finalErr: any) {
          setError(finalErr?.message ?? "Demo login failed.");
          setDemoLoading(false);
          return;
        }
      }
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Sign In</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.foreground }]}>Welcome back!</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Sign in to access your orders and saved addresses
        </Text>

        {/* Inline error banner */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.foreground }]}>Email Address</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: error ? "#fca5a5" : colors.border }]}>
            <Ionicons name="mail-outline" size={20} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="your@email.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: error ? "#fca5a5" : colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Enter password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(null); }}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
            onPress={handleLogin}
            disabled={loading || demoLoading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.loginBtnText, { color: colors.primaryForeground }]}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.orText, { color: colors.mutedForeground }]}>or</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity
          style={[styles.demoBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.85}
          onPress={handleDemoLogin}
          disabled={loading || demoLoading}
        >
          {demoLoading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <>
              <Ionicons name="flash" size={18} color={colors.primary} />
              <Text style={[styles.demoBtnText, { color: colors.foreground }]}>Try Demo Account</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={[styles.signupText, { color: colors.mutedForeground }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
            <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 24 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 20 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: "#ef4444", lineHeight: 19 },
  form: { gap: 4 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 12 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", padding: 0 },
  forgotBtn: { alignSelf: "flex-end", marginTop: 10, marginBottom: 6 },
  forgotText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  loginBtn: { paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 8 },
  loginBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  orText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    minHeight: 52,
  },
  demoBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  signupRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  signupText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  signupLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
