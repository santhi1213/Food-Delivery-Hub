import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), phone.trim(), password);
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon, placeholder, value, onChangeText, keyboardType, secureTextEntry, suffix }: any) => (
    <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={colors.mutedForeground} />
      <TextInput
        style={[styles.input, { color: colors.foreground }]}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
      />
      {suffix}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create Account</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.foreground }]}>Join FoodRush</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Get access to exclusive deals and track your orders
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.foreground }]}>Full Name</Text>
          <InputField icon="person-outline" placeholder="John Doe" value={name} onChangeText={setName} />

          <Text style={[styles.label, { color: colors.foreground }]}>Mobile Number</Text>
          <InputField icon="call-outline" placeholder="+91 98765 43210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={[styles.label, { color: colors.foreground }]}>Email Address</Text>
          <InputField icon="mail-outline" placeholder="your@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" />

          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <InputField
            icon="lock-closed-outline"
            placeholder="Min. 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPwd}
            suffix={
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.registerBtnText, { color: colors.primaryForeground }]}>Create Account</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.terms, { color: colors.mutedForeground }]}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>

        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: colors.mutedForeground }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
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
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  content: { padding: 24 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 24 },
  form: { gap: 4 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 12 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", padding: 0 },
  registerBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  registerBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  terms: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 12,
  },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  loginText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  loginLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
