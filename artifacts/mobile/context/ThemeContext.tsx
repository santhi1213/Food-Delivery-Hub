import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

type ThemePreference = "light" | "dark" | "system";

interface ThemeContextType {
  preference: ThemePreference;
  resolvedScheme: "light" | "dark";
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  preference: "system",
  resolvedScheme: "light",
  setPreference: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem("themePreference").then((v) => {
      if (v === "light" || v === "dark" || v === "system") {
        setPreferenceState(v);
      }
    });
  }, []);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    AsyncStorage.setItem("themePreference", p);
  }, []);

  const resolvedScheme: "light" | "dark" =
    preference === "system" ? systemScheme : preference;

  return (
    <ThemeContext.Provider value={{ preference, resolvedScheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
