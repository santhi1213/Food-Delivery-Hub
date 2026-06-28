import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  driverCoord: { latitude: number; longitude: number } | null;
  primaryColor: string;
  mapRef?: React.RefObject<any>;
  etaText?: string;
}

export default function MapViewWrapper({ primaryColor, etaText }: Props) {
  return (
    <LinearGradient colors={["#1a1a2e", "#16213e", "#0f3460"]} style={styles.container}>
      <View style={[styles.dotInner, { backgroundColor: primaryColor }]}>
        <Ionicons name="bicycle" size={22} color="#fff" />
      </View>
      <View style={[styles.etaBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
        <Ionicons name="time" size={14} color="#fff" />
        <Text style={styles.etaText}>{etaText ?? "Calculating..."}</Text>
      </View>
      <Text style={styles.note}>Live map available on device</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  dotInner: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  etaBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  etaText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  note: { position: "absolute", bottom: 10, right: 12, color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Inter_400Regular" },
});
