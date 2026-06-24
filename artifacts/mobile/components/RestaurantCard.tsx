// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import React from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import { useFavorites } from "@/context/FavoritesContext";
// import { Restaurant } from "@/data/mockData";
// import { useColors } from "@/hooks/useColors";

// interface Props {
//   restaurant: Restaurant;
// }

// export function RestaurantCard({ restaurant }: Props) {
//   const colors = useColors();
//   const { isFavorite, toggleFavorite } = useFavorites();
//   const fav = isFavorite(restaurant.id);

//   return (
//     <TouchableOpacity
//       style={[styles.card, { backgroundColor: colors.card }]}
//       activeOpacity={0.88}
//       onPress={() => router.push(`/restaurant/${restaurant.id}`)}
//     >
//       <View style={styles.imageContainer}>
//         <LinearGradient
//           colors={restaurant.gradientColors}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={styles.gradient}
//         >
//           <Ionicons name={restaurant.iconName as any} size={52} color="rgba(255,255,255,0.85)" />
//         </LinearGradient>

//         {!restaurant.isOpen && (
//           <View style={styles.closedOverlay}>
//             <Text style={styles.closedText}>Closed</Text>
//           </View>
//         )}

//         <TouchableOpacity
//           style={[styles.favBtn, { backgroundColor: colors.card }]}
//           onPress={() => toggleFavorite(restaurant.id)}
//           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//         >
//           <Ionicons name={fav ? "heart" : "heart-outline"} size={18} color={fav ? colors.accent : colors.mutedForeground} />
//         </TouchableOpacity>

//         {restaurant.deliveryFee === 0 && (
//           <View style={[styles.freeBadge, { backgroundColor: colors.primary }]}>
//             <Text style={[styles.freeBadgeText, { color: colors.primaryForeground }]}>Free Delivery</Text>
//           </View>
//         )}
//       </View>

//       <View style={[styles.info, { borderTopWidth: 1, borderTopColor: colors.border }]}>
//         <View style={styles.topRow}>
//           <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
//             {restaurant.name}
//           </Text>
//           <View style={[styles.ratingPill, { backgroundColor: colors.success + "22" }]}>
//             <Ionicons name="star" size={11} color={colors.success} />
//             <Text style={[styles.ratingText, { color: colors.success }]}>{restaurant.rating}</Text>
//           </View>
//         </View>
//         <Text style={[styles.cuisine, { color: colors.mutedForeground }]} numberOfLines={1}>
//           {restaurant.cuisine}
//         </Text>
//         <View style={styles.metaRow}>
//           <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
//           <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{restaurant.deliveryTime} min</Text>
//           <View style={[styles.dot, { backgroundColor: colors.border }]} />
//           <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
//           <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{restaurant.distance}</Text>
//           {restaurant.deliveryFee > 0 && (
//             <>
//               <View style={[styles.dot, { backgroundColor: colors.border }]} />
//               <Text style={[styles.metaText, { color: colors.mutedForeground }]}>₹{restaurant.deliveryFee} delivery</Text>
//             </>
//           )}
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     borderRadius: 16,
//     overflow: "hidden",
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   imageContainer: {
//     height: 140,
//     position: "relative",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   gradient: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   closedOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   closedText: {
//     color: "#fff",
//     fontSize: 16,
//     fontFamily: "Inter_600SemiBold",
//     letterSpacing: 1,
//   },
//   favBtn: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.12,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   freeBadge: {
//     position: "absolute",
//     bottom: 10,
//     left: 10,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 6,
//   },
//   freeBadgeText: {
//     fontSize: 11,
//     fontFamily: "Inter_600SemiBold",
//   },
//   info: {
//     padding: 12,
//   },
//   topRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 3,
//   },
//   name: {
//     fontSize: 16,
//     fontFamily: "Inter_600SemiBold",
//     flex: 1,
//     marginRight: 8,
//   },
//   ratingPill: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 3,
//     paddingHorizontal: 7,
//     paddingVertical: 3,
//     borderRadius: 20,
//   },
//   ratingText: {
//     fontSize: 12,
//     fontFamily: "Inter_600SemiBold",
//   },
//   cuisine: {
//     fontSize: 13,
//     fontFamily: "Inter_400Regular",
//     marginBottom: 6,
//   },
//   metaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   metaText: {
//     fontSize: 12,
//     fontFamily: "Inter_400Regular",
//   },
//   dot: {
//     width: 3,
//     height: 3,
//     borderRadius: 2,
//     marginHorizontal: 2,
//   },
// });


// import React from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { Restaurant } from '@/lib/api';
// import { router } from 'expo-router';

// interface RestaurantCardProps {
//   restaurant: Restaurant;
//   onPress?: () => void;
// }

// const { width } = Dimensions.get('window');

// export function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
//   const handlePress = () => {
//     console.log('🔄 Restaurant pressed:', restaurant._id || restaurant.id);
    
//     if (onPress) {
//       onPress();
//     } else {
//       // Navigate to restaurant details with the ID
//       const restaurantId = restaurant._id || restaurant.id;
//       if (restaurantId) {
//         router.push(`/restaurant/${restaurantId}`);
//       } else {
//         console.error('❌ No restaurant ID found');
//       }
//     }
//   };

//   // Get the first image or placeholder
//   const imageUrl = restaurant.images?.[0] || 'https://via.placeholder.com/400x200/ff4757/ffffff?text=Restaurant';
  
//   // Get cuisine as string
//   const cuisineText = Array.isArray(restaurant.cuisine) 
//     ? restaurant.cuisine.join(', ') 
//     : restaurant.cuisine || '';

//   return (
//     <TouchableOpacity 
//       style={styles.card} 
//       onPress={handlePress}
//       activeOpacity={0.8}
//     >
//       <Image 
//         source={{ uri: imageUrl }} 
//         style={styles.image}
//         resizeMode="cover"
//       />
//       <View style={styles.info}>
//         <Text style={styles.name} numberOfLines={1}>
//           {restaurant.name}
//         </Text>
//         <View style={styles.row}>
//           <View style={styles.ratingContainer}>
//             <Ionicons name="star" size={14} color="#FFD700" />
//             <Text style={styles.rating}>
//               {restaurant.rating?.toFixed(1) || 'New'}
//             </Text>
//           </View>
//           <Text style={styles.dot}>•</Text>
//           <Text style={styles.deliveryTime}>
//             {restaurant.deliveryTime || 30} min
//           </Text>
//           <Text style={styles.dot}>•</Text>
//           <Text style={styles.priceRange}>
//             {restaurant.priceRange || '₹₹'}
//           </Text>
//         </View>
//         <Text style={styles.cuisine} numberOfLines={1}>
//           {cuisineText}
//         </Text>
//         <Text style={styles.location}>
//           {restaurant.address?.locality || restaurant.address?.city || 'Location'}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     marginBottom: 16,
//     overflow: 'hidden',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   image: {
//     width: '100%',
//     height: 180,
//   },
//   info: {
//     padding: 12,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   rating: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   dot: {
//     marginHorizontal: 6,
//     color: '#999',
//   },
//   deliveryTime: {
//     fontSize: 13,
//     color: '#666',
//   },
//   priceRange: {
//     fontSize: 13,
//     color: '#666',
//   },
//   cuisine: {
//     fontSize: 13,
//     color: '#666',
//     marginBottom: 2,
//   },
//   location: {
//     fontSize: 12,
//     color: '#999',
//   },
// });


// src/components/RestaurantCard.tsx
// import React from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';

// interface RestaurantCardProps {
//   restaurant: any; // Use any temporarily to debug
//   onPress?: () => void;
// }

// const { width } = Dimensions.get('window');

// export function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
//   console.log('🃏 RestaurantCard rendering with:', restaurant);

//   const handlePress = () => {
//     console.log('🔄 Restaurant card clicked!');
//     console.log('📦 Restaurant data:', restaurant);
    
//     // Get the ID - check both _id and id
//     const restaurantId = restaurant._id || restaurant.id;
//     console.log('🔑 Restaurant ID:', restaurantId);
    
//     if (!restaurantId) {
//       console.error('❌ No ID found in restaurant:', restaurant);
//       return;
//     }

//     // If onPress prop is provided, use it
//     if (onPress) {
//       console.log('📞 Calling onPress prop');
//       onPress();
//       return;
//     }

//     // Otherwise, navigate directly
//     try {
//       console.log(`🚀 Navigating to /restaurant/${restaurantId}`);
//       router.push(`/restaurant/${restaurantId}`);
//     } catch (error) {
//       console.error('❌ Navigation error:', error);
//       // Try alternative navigation
//       try {
//         router.push({
//           pathname: '/restaurant/[id]',
//           params: { id: restaurantId }
//         });
//       } catch (err) {
//         console.error('❌ Alternative navigation failed:', err);
//       }
//     }
//   };

//   // Get the first image or placeholder
//   const imageUrl = restaurant.images?.[0] || 'https://via.placeholder.com/400x200/ff4757/ffffff?text=Restaurant';
  
//   // Get cuisine as string
//   const cuisineText = Array.isArray(restaurant.cuisine) 
//     ? restaurant.cuisine.join(', ') 
//     : restaurant.cuisine || '';

//   return (
//     <TouchableOpacity 
//       style={styles.card} 
//       onPress={handlePress}
//       activeOpacity={0.8}
//     >
//       <Image 
//         source={{ uri: imageUrl }} 
//         style={styles.image}
//         resizeMode="cover"
//       />
//       <View style={styles.info}>
//         <Text style={styles.name} numberOfLines={1}>
//           {restaurant.name || 'Restaurant'}
//         </Text>
//         <View style={styles.row}>
//           <View style={styles.ratingContainer}>
//             <Ionicons name="star" size={14} color="#FFD700" />
//             <Text style={styles.rating}>
//               {restaurant.rating?.toFixed(1) || 'New'}
//             </Text>
//           </View>
//           <Text style={styles.dot}>•</Text>
//           <Text style={styles.deliveryTime}>
//             {restaurant.deliveryTime || 30} min
//           </Text>
//           <Text style={styles.dot}>•</Text>
//           <Text style={styles.priceRange}>
//             {restaurant.priceRange || '₹₹'}
//           </Text>
//         </View>
//         <Text style={styles.cuisine} numberOfLines={1}>
//           {cuisineText}
//         </Text>
//         <Text style={styles.location}>
//           {restaurant.address?.locality || restaurant.address?.city || 'Location'}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     marginBottom: 16,
//     overflow: 'hidden',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   image: {
//     width: '100%',
//     height: 180,
//   },
//   info: {
//     padding: 12,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   rating: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   dot: {
//     marginHorizontal: 6,
//     color: '#999',
//   },
//   deliveryTime: {
//     fontSize: 13,
//     color: '#666',
//   },
//   priceRange: {
//     fontSize: 13,
//     color: '#666',
//   },
//   cuisine: {
//     fontSize: 13,
//     color: '#666',
//     marginBottom: 2,
//   },
//   location: {
//     fontSize: 12,
//     color: '#999',
//   },
// });


// src/components/RestaurantCard.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface RestaurantCardProps {
  restaurant: any; // Use any for now to handle different data structures
  onPress?: () => void;
}

const { width } = Dimensions.get('window');

export function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
  console.log('🃏 RestaurantCard rendering:', restaurant?.name);

  const handlePress = () => {
    const restaurantId = restaurant._id || restaurant.id;
    console.log('👆 Restaurant pressed:', restaurantId);
    
    if (onPress) {
      onPress();
    } else if (restaurantId) {
      router.push(`/restaurant/${restaurantId}`);
    }
  };

  // Get the first image or placeholder
  const imageUrl = restaurant.images?.[0] || 
                   restaurant.coverImage || 
                   'https://via.placeholder.com/400x200/ff4757/ffffff?text=Restaurant';
  
  // Get cuisine as string
  const cuisineText = Array.isArray(restaurant.cuisine) 
    ? restaurant.cuisine.join(', ') 
    : restaurant.cuisine || '';

  // Get rating
  const rating = restaurant.rating || restaurant.averageRating || 0;

  // Get delivery time
  const deliveryTime = restaurant.deliveryTime || '30';

  // Get price range
  const priceRange = restaurant.priceRange || '₹₹';

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name || 'Restaurant'}
        </Text>
        <View style={styles.row}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>
              {rating > 0 ? rating.toFixed(1) : 'New'}
            </Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.deliveryTime}>
            {deliveryTime} min
          </Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.priceRange}>
            {priceRange}
          </Text>
        </View>
        <Text style={styles.cuisine} numberOfLines={1}>
          {cuisineText || 'Various cuisines'}
        </Text>
        <Text style={styles.location}>
          {restaurant.address?.locality || restaurant.address?.city || 'Location'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
  },
  dot: {
    marginHorizontal: 6,
    color: '#999',
  },
  deliveryTime: {
    fontSize: 13,
    color: '#666',
  },
  priceRange: {
    fontSize: 13,
    color: '#666',
  },
  cuisine: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#999',
  },
});