import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Category } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface Props {
  category: Category;
  selected: boolean;
  onPress: () => void;
}

export function CategoryChip({ category, selected, onPress }: Props) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: selected ? category.color : colors.card,
          borderColor: selected ? category.color : colors.border,
          shadowColor: selected ? category.color : "transparent",
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Ionicons
        name={category.icon as any}
        size={20}
        color={selected ? "#fff" : category.color}
      />
      <Text
        style={[
          styles.label,
          { color: selected ? "#fff" : colors.foreground },
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
    borderWidth: 1,
    marginRight: 10,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
