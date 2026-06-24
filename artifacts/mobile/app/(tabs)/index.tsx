// import { Ionicons } from "@expo/vector-icons";


// import { router } from "expo-router";
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   RefreshControl,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { BannerCarousel } from "@/components/BannerCarousel";
// import { CartBar } from "@/components/CartBar";
// import { CategoryChip } from "@/components/CategoryChip";
// import { RestaurantCard } from "@/components/RestaurantCard";
// import { useColors } from "@/hooks/useColors";
// import { api, Restaurant, ApiError } from "@/lib/api";
// import { useCart } from "@/context/CartContext";

// // Types
// interface Category {
//   id: string;
//   name: string;
//   icon: string;
//   emoji: string;
//   color: string;
// }

// // Static categories
// const CATEGORIES: Category[] = [
//   { id: "pizza", name: "Pizza", icon: "pizza", emoji: "🍕", color: "#F97316" },
//   { id: "burger", name: "Burger", icon: "fast-food", emoji: "🍔", color: "#EF4444" },
//   { id: "sushi", name: "Sushi", icon: "fish", emoji: "🍣", color: "#0EA5E9" },
//   { id: "chinese", name: "Chinese", icon: "restaurant", emoji: "🥢", color: "#F59E0B" },
//   { id: "indian", name: "Indian", icon: "restaurant", emoji: "🍛", color: "#8B5CF6" },
//   { id: "italian", name: "Italian", icon: "restaurant", emoji: "🍝", color: "#10B981" },
//   { id: "mexican", name: "Mexican", icon: "restaurant", emoji: "🌮", color: "#EF4444" },
//   { id: "dessert", name: "Dessert", icon: "ice-cream", emoji: "🍰", color: "#F472B6" },
//   { id: "healthy", name: "Healthy", icon: "leaf", emoji: "🥗", color: "#22C55E" },
//   { id: "drinks", name: "Drinks", icon: "cafe", emoji: "☕", color: "#0F766E" },
// ];

// export default function HomeScreen() {
//   const colors = useColors();
//   const insets = useSafeAreaInsets();
//   const { getCartCount } = useCart(); // This should now work
  
//   // State
//   const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     total: 0,
//     totalPages: 0,
//     limit: 10,
//   });

//   const topPad = Platform.OS === "web" ? 67 : insets.top;

//   // Fetch restaurants from API
//   const fetchRestaurants = useCallback(async (page = 1, category?: string | null, refresh = false) => {
//     try {
//       if (refresh) {
//         setRefreshing(true);
//       } else if (page === 1) {
//         setLoading(true);
//       }
      
//       setError(null);

//       // Build query parameters
//       const params: any = {
//         page,
//         limit: 10,
//         sortBy: 'rating',
//         sortOrder: 'desc',
//       };

//       // Add category filter if selected
//       if (category) {
//         params.category = category;
//       }

//       console.log("📡 Fetching restaurants with params:", params);

//       // Fetch restaurants
//       const response = await api.restaurants.list(params);
      
//       console.log("✅ API Response:", response);
      
//       if (response && response.restaurants) {
//         setRestaurants(prev => 
//           page === 1 ? response.restaurants : [...prev, ...response.restaurants]
//         );
//         setPagination({
//           page: response.page || page,
//           total: response.total || 0,
//           totalPages: response.totalPages || 0,
//           limit: response.limit || 10,
//         });
//       } else {
//         console.warn("⚠️ No restaurants found in response");
//         setRestaurants([]);
//       }

//     } catch (err) {
//       console.error("❌ Error fetching restaurants:", err);
      
//       if (err instanceof ApiError) {
//         setError(err.message);
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Failed to load restaurants. Please try again.");
//       }
      
//       // If it's a network error and we have no restaurants, show error
//       if (page === 1 && restaurants.length === 0) {
//         // Show full error state
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [restaurants.length]);

//   // Initial load
//   useEffect(() => {
//     fetchRestaurants(1, null);
//   }, []);

//   // Handle category change
//   useEffect(() => {
//     fetchRestaurants(1, selectedCategory);
//   }, [selectedCategory]);

//   // Handle refresh
//   const onRefresh = useCallback(() => {
//     fetchRestaurants(1, selectedCategory, true);
//   }, [selectedCategory, fetchRestaurants]);

//   // Handle load more
//   const loadMore = useCallback(() => {
//     if (!loading && pagination.page < pagination.totalPages) {
//       fetchRestaurants(pagination.page + 1, selectedCategory);
//     }
//   }, [loading, pagination, selectedCategory, fetchRestaurants]);

//   // Filter restaurants by category (client-side filtering as backup)
//   const filteredRestaurants = selectedCategory
//     ? restaurants.filter(
//         (r) =>
//           r.cuisine?.some(c => c.toLowerCase().includes(selectedCategory.toLowerCase())) ||
//           r.tags?.some(t => t.toLowerCase().includes(selectedCategory.toLowerCase())) ||
//           r.menu?.some(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()))
//       )
//     : restaurants;

//   // Get cart count for badge
//   const cartCount = getCartCount();

//   // Render loading state
//   if (loading && restaurants.length === 0) {
//     return (
//       <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
//         <ActivityIndicator size="large" color={colors.primary} />
//         <Text style={[styles.loadingText, { color: colors.mutedForeground, marginTop: 16 }]}>
//           Loading restaurants...
//         </Text>
//       </View>
//     );
//   }

//   // Render error state
//   if (error && restaurants.length === 0) {
//     return (
//       <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
//         <Ionicons name="alert-circle-outline" size={60} color={colors.primary} />
//         <Text style={[styles.errorText, { color: colors.foreground, marginTop: 16, textAlign: 'center' }]}>
//           {error}
//         </Text>
//         <TouchableOpacity 
//           style={[styles.retryButton, { backgroundColor: colors.primary }]}
//           onPress={() => fetchRestaurants(1, selectedCategory)}
//         >
//           <Text style={[styles.retryButtonText, { color: 'white' }]}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* Top Bar */}
//       <View style={[
//         styles.topBar, 
//         { 
//           paddingTop: topPad + 10, 
//           backgroundColor: colors.card, 
//           borderBottomColor: colors.border 
//         }
//       ]}>
//         <TouchableOpacity style={styles.locationBtn} activeOpacity={0.75}>
//           <Ionicons name="location" size={18} color={colors.primary} />
//           <View>
//             <Text style={[styles.locationLabel, { color: colors.mutedForeground }]}>
//               Deliver to
//             </Text>
//             <View style={styles.locationRow}>
//               <Text style={[styles.locationText, { color: colors.foreground }]}>
//                 Koramangala, Bangalore
//               </Text>
//               <Ionicons name="chevron-down" size={14} color={colors.foreground} />
//             </View>
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.notifBtn, { backgroundColor: colors.muted }]}>
//           <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
//           {cartCount > 0 && (
//             <View style={[styles.badge, { backgroundColor: colors.primary }]}>
//               <Text style={[styles.badgeText, { color: 'white' }]}>
//                 {cartCount}
//               </Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Main Content */}
//       <ScrollView
//         contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//             tintColor={colors.primary}
//           />
//         }
//       >
//         {/* Search Bar */}
//         <TouchableOpacity
//           style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
//           activeOpacity={0.8}
//           onPress={() => router.push("/(tabs)/search")}
//         >
//           <Ionicons name="search" size={18} color={colors.mutedForeground} />
//           <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
//             Search restaurants or dishes...
//           </Text>
//           <View style={[styles.searchFilter, { backgroundColor: colors.secondary }]}>
//             <Ionicons name="options" size={16} color={colors.primary} />
//           </View>
//         </TouchableOpacity>

//         {/* Banner Carousel */}
//         <View style={styles.section}>
//           <BannerCarousel />
//         </View>

//         {/* Categories */}
//         <View style={styles.section}>
//           <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
//             What's on your mind?
//           </Text>
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false} 
//             contentContainerStyle={styles.categories}
//           >
//             {CATEGORIES.map((cat) => (
//               <CategoryChip
//                 key={cat.id}
//                 category={cat}
//                 selected={selectedCategory === cat.id}
//                 onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
//               />
//             ))}
//           </ScrollView>
//         </View>

//         {/* All Restaurants */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
//               {selectedCategory ? `Results for ${selectedCategory}` : "All Restaurants"}
//             </Text>
//             <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
//               {filteredRestaurants.length} places
//             </Text>
//           </View>

//           {filteredRestaurants.length === 0 ? (
//             <View style={styles.empty}>
//               <Ionicons name="restaurant-outline" size={48} color={colors.mutedForeground} />
//               <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
//                 No restaurants found for this category
//               </Text>
//             </View>
//           ) : (
//             <>
//               {/* {filteredRestaurants.map((r) => (
//                 <RestaurantCard
//                   key={r._id || r.id}
//                   restaurant={{
//                     ...r,
//                     id: (r as any)?._id ?? (r as any)?.id ?? '',
//                     reviewCount: (r as any)?.reviewCount ?? 0,
//                     distance: (r as any)?.distance ?? 0,
//                     minOrder: (r as any)?.minOrder ?? 0,
//                     gradientColors: (r as any)?.gradientColors ?? ['#ffffff', '#f0f0f0'],
//                     iconName: (r as any)?.iconName ?? 'restaurant'
//                   }}
//                 />
//               ))} */}
//               {filteredRestaurants.map((r) => {
//   console.log('🏠 Rendering restaurant:', r._id || r.id, r.name);
//   return (
//     <RestaurantCard 
//       key={r._id || r.id} 
//       restaurant={r}
//       onPress={() => {
//         const id = r._id || r.id;
//         console.log('👆 Restaurant clicked, ID:', id);
//         if (id) {
//           router.push(`/restaurant/${id}`);
//         }
//       }}
//     />
//   );
// })}
              
//               {/* Load More Button */}
//               {pagination.page < pagination.totalPages && (
//                 <TouchableOpacity 
//                   style={[styles.loadMoreButton, { backgroundColor: colors.card, borderColor: colors.border }]}
//                   onPress={loadMore}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <ActivityIndicator size="small" color={colors.primary} />
//                   ) : (
//                     <Text style={[styles.loadMoreText, { color: colors.primary }]}>
//                       Load More
//                     </Text>
//                   )}
//                 </TouchableOpacity>
//               )}
              
//               {/* Loading indicator for more items */}
//               {loading && restaurants.length > 0 && (
//                 <View style={styles.loadingMoreContainer}>
//                   <ActivityIndicator size="small" color={colors.primary} />
//                   <Text style={[styles.loadingMoreText, { color: colors.mutedForeground }]}>
//                     Loading more...
//                   </Text>
//                 </View>
//               )}
//             </>
//           )}
//         </View>
//       </ScrollView>

//       {/* Cart Bar */}
//       <CartBar />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   topBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   locationBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   locationLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
//   locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
//   locationText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
//   notifBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     position: 'relative',
//   },
//   badge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     minWidth: 20,
//     height: 20,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 4,
//   },
//   badgeText: {
//     fontSize: 11,
//     fontWeight: 'bold',
//     fontFamily: "Inter_600SemiBold",
//   },
//   scrollContent: { paddingHorizontal: 16, paddingTop: 14 },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     paddingVertical: 13,
//     gap: 10,
//     marginBottom: 4,
//   },
//   searchPlaceholder: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
//   searchFilter: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   section: { marginTop: 20 },
//   sectionHeader: { 
//     flexDirection: "row", 
//     justifyContent: "space-between", 
//     alignItems: "center", 
//     marginBottom: 14 
//   },
//   sectionTitle: { 
//     fontSize: 19, 
//     fontFamily: "Inter_700Bold" 
//   },
//   sectionCount: { 
//     fontSize: 13, 
//     fontFamily: "Inter_400Regular" 
//   },
//   categories: { paddingBottom: 6, gap: 8 },
//   empty: { alignItems: "center", gap: 10, paddingVertical: 40 },
//   emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
//   loadingText: {
//     fontSize: 16,
//     fontFamily: "Inter_400Regular",
//   },
//   errorText: {
//     fontSize: 16,
//     fontFamily: "Inter_400Regular",
//     marginBottom: 20,
//   },
//   retryButton: {
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   retryButtonText: {
//     fontSize: 16,
//     fontFamily: "Inter_600SemiBold",
//   },
//   loadMoreButton: {
//     padding: 14,
//     borderRadius: 10,
//     borderWidth: 1,
//     alignItems: 'center',
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   loadMoreText: {
//     fontSize: 14,
//     fontFamily: "Inter_600SemiBold",
//   },
//   loadingMoreContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 20,
//     gap: 10,
//   },
//   loadingMoreText: {
//     fontSize: 14,
//     fontFamily: "Inter_400Regular",
//   },
// });



// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BannerCarousel } from "@/components/BannerCarousel";
import { CartBar } from "@/components/CartBar";
import { CategoryChip } from "@/components/CategoryChip";
import { RestaurantCard } from "@/components/RestaurantCard";
import { useColors } from "@/hooks/useColors";
import { api, Restaurant, ApiError } from "@/lib/api";
import { useCart } from "@/context/CartContext";

// Types
interface Category {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  color: string;
}

// Static categories
const CATEGORIES: Category[] = [
  { id: "pizza", name: "Pizza", icon: "pizza", emoji: "🍕", color: "#F97316" },
  { id: "burger", name: "Burger", icon: "fast-food", emoji: "🍔", color: "#EF4444" },
  { id: "sushi", name: "Sushi", icon: "fish", emoji: "🍣", color: "#0EA5E9" },
  { id: "chinese", name: "Chinese", icon: "restaurant", emoji: "🥢", color: "#F59E0B" },
  { id: "indian", name: "Indian", icon: "restaurant", emoji: "🍛", color: "#8B5CF6" },
  { id: "italian", name: "Italian", icon: "restaurant", emoji: "🍝", color: "#10B981" },
  { id: "mexican", name: "Mexican", icon: "restaurant", emoji: "🌮", color: "#EF4444" },
  { id: "dessert", name: "Dessert", icon: "ice-cream", emoji: "🍰", color: "#F472B6" },
  { id: "healthy", name: "Healthy", icon: "leaf", emoji: "🥗", color: "#22C55E" },
  { id: "drinks", name: "Drinks", icon: "cafe", emoji: "☕", color: "#0F766E" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getCartCount } = useCart();
  
  // State
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10,
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Fetch restaurants from API
  const fetchRestaurants = useCallback(async (page = 1, category?: string | null, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }
      
      setError(null);

      // Build query parameters
      const params: any = {
        page,
        limit: 10,
        sortBy: 'rating',
        sortOrder: 'desc',
      };

      // Add category filter if selected
      if (category) {
        params.category = category;
      }

      console.log("📡 Fetching restaurants with params:", params);

      // Fetch restaurants
      const response = await api.restaurants.list(params);
      
      console.log("✅ API Response:", response);
      
      if (response && response.success && response.data) {
        // The API returns { success: true, data: restaurants[], pagination: {} }
        setRestaurants(prev => 
          page === 1 ? response.data : [...prev, ...response.data]
        );
        
        if (response.pagination) {
          setPagination({
            page: response.pagination.page || page,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0,
            limit: response.pagination.limit || 10,
          });
        }
      } else {
        console.warn("⚠️ No restaurants found in response");
        setRestaurants([]);
      }

    } catch (err) {
      console.error("❌ Error fetching restaurants:", err);
      
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load restaurants. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRestaurants(1, null);
  }, []);

  // Handle category change
  useEffect(() => {
    fetchRestaurants(1, selectedCategory);
  }, [selectedCategory]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    fetchRestaurants(1, selectedCategory, true);
  }, [selectedCategory, fetchRestaurants]);

  // Handle load more
  const loadMore = useCallback(() => {
    if (!loading && pagination.page < pagination.totalPages) {
      fetchRestaurants(pagination.page + 1, selectedCategory);
    }
  }, [loading, pagination, selectedCategory, fetchRestaurants]);

  // Get cart count for badge
  const cartCount = getCartCount();

  // Render loading state
  if (loading && restaurants.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground, marginTop: 16 }]}>
          Loading restaurants...
        </Text>
      </View>
    );
  }

  // Render error state
  if (error && restaurants.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.primary} />
        <Text style={[styles.errorText, { color: colors.foreground, marginTop: 16, textAlign: 'center' }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => fetchRestaurants(1, selectedCategory)}
        >
          <Text style={[styles.retryButtonText, { color: 'white' }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if there are any restaurants
  const hasRestaurants = restaurants.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[
        styles.topBar, 
        { 
          paddingTop: topPad + 10, 
          backgroundColor: colors.card, 
          borderBottomColor: colors.border 
        }
      ]}>
        <TouchableOpacity style={styles.locationBtn} activeOpacity={0.75}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <View>
            <Text style={[styles.locationLabel, { color: colors.mutedForeground }]}>
              Deliver to
            </Text>
            <View style={styles.locationRow}>
              <Text style={[styles.locationText, { color: colors.foreground }]}>
                Koramangala, Bangalore
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.foreground} />
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.notifBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
          {cartCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: 'white' }]}>
                {cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Search Bar */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
            Search restaurants or dishes...
          </Text>
          <View style={[styles.searchFilter, { backgroundColor: colors.secondary }]}>
            <Ionicons name="options" size={16} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Banner Carousel */}
        <View style={styles.section}>
          <BannerCarousel />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            What's on your mind?
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categories}
          >
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* All Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {selectedCategory ? `Results for ${selectedCategory}` : "All Restaurants"}
            </Text>
            <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
              {restaurants.length} places
            </Text>
          </View>

          {!hasRestaurants ? (
            <View style={styles.empty}>
              <Ionicons name="restaurant-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No restaurants found
              </Text>
              <TouchableOpacity 
                style={[styles.addRestaurantBtn, { backgroundColor: colors.primary }]}
                onPress={() => {/* Navigate to add restaurant */}}
              >
                <Text style={[styles.addRestaurantBtnText, { color: 'white' }]}>
                  Add a Restaurant
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {restaurants.map((r) => {
                // Ensure we have an ID to use as key
                const restaurantId = r._id || r.id;
                console.log("🏪 Rendering restaurant:", restaurantId, r.name);
                
                return (
                  <RestaurantCard 
                    key={restaurantId || `restaurant-${Math.random()}`} 
                    restaurant={r}
                    onPress={() => {
                      if (restaurantId) {
                        console.log("👆 Navigating to restaurant:", restaurantId);
                        router.push(`/restaurant/${restaurantId}`);
                      }
                    }}
                  />
                );
              })}
              
              {/* Load More Button */}
              {pagination.page < pagination.totalPages && (
                <TouchableOpacity 
                  style={[styles.loadMoreButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                      Load More
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Cart Bar */}
      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  locationBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: "Inter_600SemiBold",
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
    marginBottom: 4,
  },
  searchPlaceholder: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  searchFilter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  section: { marginTop: 20 },
  sectionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 14 
  },
  sectionTitle: { 
    fontSize: 19, 
    fontFamily: "Inter_700Bold" 
  },
  sectionCount: { 
    fontSize: 13, 
    fontFamily: "Inter_400Regular" 
  },
  categories: { paddingBottom: 6, gap: 8 },
  empty: { 
    alignItems: "center", 
    gap: 16, 
    paddingVertical: 60 
  },
  emptyText: { 
    fontSize: 16, 
    fontFamily: "Inter_400Regular", 
    textAlign: "center" 
  },
  addRestaurantBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addRestaurantBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  loadMoreButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});