// import { BlurView } from "expo-blur";
// import { isLiquidGlassAvailable } from "expo-glass-effect";
// import { Tabs } from "expo-router";
// import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
// import { SymbolView } from "expo-symbols";
// import { Feather, Ionicons } from "@expo/vector-icons";
// import React from "react";
// import { Platform, StyleSheet, View, useColorScheme } from "react-native";
// import { useCart } from "@/context/CartContext";
// import { useColors } from "@/hooks/useColors";

// function NativeTabLayout() {
//   return (
//     <NativeTabs>
//       <NativeTabs.Trigger name="index">
//         <Icon sf={{ default: "house", selected: "house.fill" }} />
//         <Label>Home</Label>
//       </NativeTabs.Trigger>
//       <NativeTabs.Trigger name="search" role="search">
//         <Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} />
//         <Label>Search</Label>
//       </NativeTabs.Trigger>
//       <NativeTabs.Trigger name="orders">
//         <Icon sf={{ default: "receipt", selected: "receipt.fill" }} />
//         <Label>Orders</Label>
//       </NativeTabs.Trigger>
//       <NativeTabs.Trigger name="profile">
//         <Icon sf={{ default: "person", selected: "person.fill" }} />
//         <Label>Profile</Label>
//       </NativeTabs.Trigger>
//     </NativeTabs>
//   );
// }

// function ClassicTabLayout() {
//   const colors = useColors();
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";
//   const isIOS = Platform.OS === "ios";
//   const isWeb = Platform.OS === "web";
//   const { itemCount } = useCart();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: colors.primary,
//         tabBarInactiveTintColor: colors.mutedForeground,
//         headerShown: false,
//         tabBarStyle: {
//           position: "absolute",
//           backgroundColor: isIOS ? "transparent" : colors.card,
//           borderTopWidth: isWeb ? 1 : StyleSheet.hairlineWidth,
//           borderTopColor: colors.border,
//           elevation: 0,
//           ...(isWeb ? { height: 84 } : {}),
//         },
//         tabBarBackground: () =>
//           isIOS ? (
//             <BlurView
//               intensity={100}
//               tint={isDark ? "dark" : "light"}
//               style={StyleSheet.absoluteFill}
//             />
//           ) : isWeb ? (
//             <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
//           ) : null,
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home",
//           tabBarIcon: ({ color }) =>
//             isIOS ? (
//               <SymbolView name="house" tintColor={color} size={24} />
//             ) : (
//               <Feather name="home" size={22} color={color} />
//             ),
//         }}
//       />
//       <Tabs.Screen
//         name="search"
//         options={{
//           title: "Search",
//           tabBarIcon: ({ color }) =>
//             isIOS ? (
//               <SymbolView name="magnifyingglass" tintColor={color} size={24} />
//             ) : (
//               <Feather name="search" size={22} color={color} />
//             ),
//         }}
//       />
//       <Tabs.Screen
//         name="orders"
//         options={{
//           title: "Orders",
//           tabBarBadge: itemCount > 0 ? itemCount : undefined,
//           tabBarIcon: ({ color }) =>
//             isIOS ? (
//               <SymbolView name="receipt" tintColor={color} size={24} />
//             ) : (
//               <Ionicons name="receipt-outline" size={22} color={color} />
//             ),
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color }) =>
//             isIOS ? (
//               <SymbolView name="person" tintColor={color} size={24} />
//             ) : (
//               <Feather name="user" size={22} color={color} />
//             ),
//         }}
//       />
//     </Tabs>
//   );
// }

// export default function TabLayout() {
//   if (isLiquidGlassAvailable()) {
//     return <NativeTabLayout />;
//   }
//   return <ClassicTabLayout />;
// }



// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";

export default function TabLayout() {
  const colors = useColors();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="cart" size={size} color={color} />
              {cartCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  backgroundColor: colors.primary,
                  borderRadius: 10,
                  minWidth: 18,
                  height: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 4,
                }}>
                  <Text style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: "Favourites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

