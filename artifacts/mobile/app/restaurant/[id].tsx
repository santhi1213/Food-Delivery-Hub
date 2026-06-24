// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   Dimensions,
// } from 'react-native';
// import { useLocalSearchParams, router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { api, ApiError } from '@/lib/api';
// import { useCart } from '@/context/CartContext';
// import { useColors } from '@/hooks/useColors';


// const { width } = Dimensions.get('window');

// interface MenuItem {
//   _id?: string;
//   name: string;
//   description: string;
//   price: number;
//   isVeg: boolean;
//   isAvailable: boolean;
//   image?: string;
//   customizations?: any[];
// }

// interface MenuCategory {
//   _id?: string;
//   category: string;
//   items: MenuItem[];
// }

// interface RestaurantData {
//   _id: string;
//   name: string;
//   description?: string;
//   cuisine: string[];
//   rating: number;
//   totalRatings: number;
//   priceRange: string;
//   deliveryTime: number;
//   minimumOrder: number;
//   deliveryFee: number;
//   isActive: boolean;
//   isFeatured: boolean;
//   isOpen: boolean;
//   address: {
//     street: string;
//     locality: string;
//     city: string;
//     state: string;
//     pincode?: string;
//     coordinates?: { lat: number; lng: number };
//   };
//   location: {
//     type: string;
//     coordinates: number[];
//   };
//   images: string[];
//   logo?: string;
//   coverImage?: string;
//   phone?: string;
//   email?: string;
//   tags: string[];
//   menu: MenuCategory[];
//   reviews: any[];
//   createdAt: string;
//   updatedAt: string;
// }

// export default function RestaurantDetailsScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const colors = useColors();
//   const insets = useSafeAreaInsets();
//   const { addToCart } = useCart();
//   const { getCartCount } = useCart();
//   const cartCount = getCartCount();
  
//   const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

//   console.log('📱 RestaurantDetailsScreen mounted with ID:', id);

//   // Fetch restaurant details
//   const fetchRestaurant = async (refresh = false) => {
//     console.log('🔍 fetchRestaurant called, ID:', id);
    
//     if (!id) {
//       console.error('❌ No ID provided to fetchRestaurant');
//       setError('Restaurant ID not found');
//       setLoading(false);
//       return;
//     }

//     try {
//       if (refresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }
//       setError(null);

//       console.log(`📡 Fetching restaurant with ID: ${id}`);
      
//       const response = await api.restaurants.get(id);
      
//       console.log('✅ Restaurant response:', response);
      
//       // Your API returns { success: true, data: restaurant }
//       if (response && response.success && response.data) {
//         console.log('🏪 Setting restaurant:', response.data.name);
//         console.log('📋 Menu items:', response.data.menu?.length || 0, 'categories');
//         setRestaurant(response.data);
//       } else {
//         console.warn('⚠️ No restaurant found in response');
//         setError('Restaurant not found');
//       }
//     } catch (err) {
//       console.error('❌ Error fetching restaurant:', err);
      
//       if (err instanceof ApiError) {
//         console.error('API Error:', err.message, err.status);
//         setError(err.message);
//       } else if (err instanceof Error) {
//         console.error('Error:', err.message);
//         setError(err.message);
//       } else {
//         setError('Failed to load restaurant details');
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     console.log('🔄 useEffect triggered with ID:', id);
//     if (id) {
//       fetchRestaurant();
//     } else {
//       console.error('❌ No ID in params');
//     }
//   }, [id]);

//   // Handle refresh
//   const onRefresh = () => {
//     console.log('🔄 Pull to refresh');
//     fetchRestaurant(true);
//   };

//   // Handle add to cart
//   const handleAddToCart = (item: MenuItem, categoryName: string) => {
//     console.log('🛒 Adding to cart:', item);
//     if (!restaurant) {
//       console.error('❌ No restaurant found for cart');
//       return;
//     }
    
//     addToCart({
//       id: item._id || `item_${Date.now()}`,
//       name: item.name,
//       price: item.price,
//       quantity: 1,
//       restaurantId: restaurant._id,
//       restaurantName: restaurant.name,
//     });
    
//     Alert.alert('Success', `${item.name} added to cart!`);
//   };

//   // Get unique categories from menu
//   const getUniqueCategories = () => {
//     if (!restaurant || !restaurant.menu) return [];
//     return restaurant.menu.map(category => category.category);
//   };

//   // Get filtered menu items
//   const getFilteredMenu = () => {
//     if (!restaurant || !restaurant.menu) return [];
    
//     if (selectedCategory) {
//       return restaurant.menu.filter(
//         category => category.category === selectedCategory
//       );
//     }
    
//     return restaurant.menu;
//   };

//   // Render loading state
//   if (loading) {
//     return (
//       <View style={[styles.centered, { backgroundColor: colors.background }]}>
//         <ActivityIndicator size="large" color={colors.primary} />
//         <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
//           Loading restaurant details...
//         </Text>
//       </View>
//     );
//   }

//   // Render error state
//   if (error || !restaurant) {
//     return (
//       <View style={[styles.centered, { backgroundColor: colors.background, padding: 20 }]}>
//         <Ionicons name="alert-circle-outline" size={60} color={colors.primary} />
//         <Text style={[styles.errorText, { color: colors.foreground, marginTop: 16 }]}>
//           {error || 'Restaurant not found'}
//         </Text>
//         <TouchableOpacity 
//           style={[styles.retryButton, { backgroundColor: colors.primary }]}
//           onPress={() => {
//             console.log('🔄 Retry button pressed');
//             fetchRestaurant();
//           }}
//         >
//           <Text style={styles.retryButtonText}>Retry</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.goBackButton, { marginTop: 10 }]}
//           onPress={() => {
//             console.log('🔙 Go back button pressed');
//             router.back();
//           }}
//         >
//           <Text style={[styles.goBackButtonText, { color: colors.primary }]}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const uniqueCategories = getUniqueCategories();
//   const filteredMenu = getFilteredMenu();

//   // Get the first image or placeholder
//   const coverImage = restaurant.images?.[0] || 
//                      restaurant.coverImage || 
//                      'https://via.placeholder.com/800x300/ff4757/ffffff?text=Restaurant';

//   // Check if restaurant is open
//   const isOpen = restaurant.isOpen !== undefined ? restaurant.isOpen : true;

//   // Get cuisine as string
//   const cuisineText = Array.isArray(restaurant.cuisine) 
//     ? restaurant.cuisine.join(' • ') 
//     : restaurant.cuisine || '';

//   // Get address as string
//   const addressText = restaurant.address 
//     ? `${restaurant.address.locality || ''}, ${restaurant.address.city || ''}`
//     : 'Location not specified';

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <ScrollView
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
//         {/* Cover Image */}
//         <View style={styles.imageContainer}>
//           <Image source={{ uri: coverImage }} style={styles.coverImage} />
//           <TouchableOpacity 
//             style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
//             onPress={() => {
//               console.log('🔙 Back button pressed');
//               router.back();
//             }}
//           >
//             <Ionicons name="arrow-back" size={24} color="white" />
//           </TouchableOpacity>
//         </View>

//         {/* Restaurant Info */}
//         <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
//           <Text style={[styles.restaurantName, { color: colors.foreground }]}>
//             {restaurant.name}
//           </Text>
          
//           <View style={styles.row}>
//             <View style={styles.ratingContainer}>
//               <Ionicons name="star" size={16} color="#FFD700" />
//               <Text style={[styles.rating, { color: colors.foreground }]}>
//                 {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'New'}
//               </Text>
//               {restaurant.totalRatings > 0 && (
//                 <Text style={[styles.ratingCount, { color: colors.mutedForeground }]}>
//                   ({restaurant.totalRatings})
//                 </Text>
//               )}
//             </View>
//             <Text style={styles.dot}>•</Text>
//             <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
//               {restaurant.deliveryTime} min
//             </Text>
//             <Text style={styles.dot}>•</Text>
//             <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
//               {restaurant.priceRange || '₹₹'}
//             </Text>
//             <Text style={styles.dot}>•</Text>
//             <Text style={[styles.infoText, { color: isOpen ? '#4CAF50' : '#f44336' }]}>
//               {isOpen ? 'Open' : 'Closed'}
//             </Text>
//           </View>

//           {cuisineText && (
//             <Text style={[styles.cuisine, { color: colors.mutedForeground }]}>
//               {cuisineText}
//             </Text>
//           )}

//           <View style={styles.addressContainer}>
//             <Ionicons name="location-outline" size={16} color={colors.mutedForeground} />
//             <Text style={[styles.address, { color: colors.mutedForeground }]}>
//               {addressText}
//             </Text>
//           </View>

//           {restaurant.description && (
//             <Text style={[styles.description, { color: colors.mutedForeground }]}>
//               {restaurant.description}
//             </Text>
//           )}

//           {/* Details Row */}
//           <View style={styles.detailsRow}>
//             <View style={styles.detailItem}>
//               <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
//                 Min Order
//               </Text>
//               <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                 ₹{restaurant.minimumOrder || 0}
//               </Text>
//             </View>
//             <View style={styles.detailItem}>
//               <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
//                 Delivery Fee
//               </Text>
//               <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                 ₹{restaurant.deliveryFee || 0}
//               </Text>
//             </View>
//             <View style={styles.detailItem}>
//               <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
//                 Categories
//               </Text>
//               <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                 {restaurant.menu?.length || 0}
//               </Text>
//             </View>
//           </View>

//           {/* Tags */}
//           {restaurant.tags && restaurant.tags.length > 0 && (
//             <View style={styles.tagsContainer}>
//               {restaurant.tags.map((tag, index) => (
//                 <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
//                   <Text style={[styles.tagText, { color: colors.primary }]}>
//                     {tag}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//           )}
//         </View>

//         {/* Menu Section */}
//         <View style={[styles.menuContainer, { backgroundColor: colors.card, marginTop: 12 }]}>
//           <Text style={[styles.menuTitle, { color: colors.foreground }]}>Menu</Text>

//           {/* Category Filters */}
//           {uniqueCategories.length > 1 && (
//             <ScrollView 
//               horizontal 
//               showsHorizontalScrollIndicator={false}
//               style={styles.categoryScroll}
//               contentContainerStyle={styles.categoryContainer}
//             >
//               <TouchableOpacity
//                 style={[
//                   styles.categoryChip,
//                   !selectedCategory && { backgroundColor: colors.primary }
//                 ]}
//                 onPress={() => {
//                   console.log('📂 All categories selected');
//                   setSelectedCategory(null);
//                 }}
//               >
//                 <Text style={[
//                   styles.categoryChipText,
//                   { color: !selectedCategory ? 'white' : colors.foreground }
//                 ]}>
//                   All
//                 </Text>
//               </TouchableOpacity>
              
//               {uniqueCategories.map((category) => (
//                 <TouchableOpacity
//                   key={category}
//                   style={[
//                     styles.categoryChip,
//                     selectedCategory === category && { backgroundColor: colors.primary }
//                   ]}
//                   onPress={() => {
//                     console.log(`📂 Category selected: ${category}`);
//                     setSelectedCategory(category);
//                   }}
//                 >
//                   <Text style={[
//                     styles.categoryChipText,
//                     { color: selectedCategory === category ? 'white' : colors.foreground }
//                   ]}>
//                     {category}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           )}

//           {/* Menu Items */}
//           {filteredMenu && filteredMenu.length > 0 ? (
//             filteredMenu.map((category) => (
//               <View key={category._id || category.category} style={styles.menuSection}>
//                 <Text style={[styles.menuCategory, { color: colors.foreground }]}>
//                   {category.category}
//                 </Text>
//                 {category.items.map((item) => {
//                   const itemId = item._id || `item_${Date.now()}`;
                  
//                   return (
//                     <View key={itemId} style={[styles.menuItem, { borderBottomColor: colors.border }]}>
//                       <View style={styles.menuItemInfo}>
//                         <View style={styles.menuItemHeader}>
//                           <Text style={[styles.menuItemName, { color: colors.foreground }]}>
//                             {item.name}
//                           </Text>
//                           {item.isVeg && (
//                             <View style={styles.vegBadge}>
//                               <Text style={styles.vegBadgeText}>Veg</Text>
//                             </View>
//                           )}
//                           {!item.isVeg && (
//                             <View style={[styles.vegBadge, { backgroundColor: '#f44336' }]}>
//                               <Text style={styles.vegBadgeText}>Non-Veg</Text>
//                             </View>
//                           )}
//                         </View>
//                         <Text style={[styles.menuItemDescription, { color: colors.mutedForeground }]}>
//                           {item.description || 'No description available'}
//                         </Text>
//                         <Text style={[styles.menuItemPrice, { color: colors.foreground }]}>
//                           ₹{item.price}
//                         </Text>
//                       </View>
//                       {item.isAvailable !== false && (
//                         <TouchableOpacity
//                           style={[styles.addButton, { borderColor: colors.primary }]}
//                           onPress={() => handleAddToCart(item, category.category)}
//                         >
//                           <Text style={[styles.addButtonText, { color: colors.primary }]}>
//                             ADD
//                           </Text>
//                         </TouchableOpacity>
//                       )}
//                     </View>
//                   );
//                 })}
//               </View>
//             ))
//           ) : (
//             <View style={styles.emptyMenu}>
//               <Ionicons name="restaurant-outline" size={48} color={colors.mutedForeground} />
//               <Text style={[styles.emptyMenuText, { color: colors.mutedForeground }]}>
//                 No menu items available
//               </Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   imageContainer: {
//     position: 'relative',
//   },
//   coverImage: {
//     width: width,
//     height: 250,
//   },
//   backButton: {
//     position: 'absolute',
//     top: 40,
//     left: 16,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   infoContainer: {
//     padding: 16,
//     marginTop: -10,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   restaurantName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     flexWrap: 'wrap',
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   rating: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   ratingCount: {
//     fontSize: 12,
//   },
//   dot: {
//     marginHorizontal: 6,
//     color: '#999',
//   },
//   infoText: {
//     fontSize: 14,
//   },
//   cuisine: {
//     fontSize: 14,
//     marginBottom: 8,
//   },
//   addressContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginBottom: 6,
//   },
//   address: {
//     fontSize: 14,
//   },
//   description: {
//     fontSize: 14,
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   detailsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   detailItem: {
//     alignItems: 'center',
//   },
//   detailLabel: {
//     fontSize: 12,
//     marginBottom: 4,
//   },
//   detailValue: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   tagsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginTop: 12,
//   },
//   tag: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   tagText: {
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   menuContainer: {
//     padding: 16,
//     marginBottom: 20,
//   },
//   menuTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   categoryScroll: {
//     marginBottom: 12,
//   },
//   categoryContainer: {
//     gap: 8,
//     paddingVertical: 4,
//   },
//   categoryChip: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginRight: 8,
//   },
//   categoryChipText: {
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   menuSection: {
//     marginTop: 12,
//   },
//   menuCategory: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//   },
//   menuItemInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   menuItemHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginBottom: 4,
//     flexWrap: 'wrap',
//   },
//   menuItemName: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   vegBadge: {
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   vegBadgeText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   menuItemDescription: {
//     fontSize: 13,
//     marginBottom: 4,
//   },
//   menuItemPrice: {
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   addButton: {
//     borderWidth: 1,
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 6,
//     alignSelf: 'center',
//     justifyContent: 'center',
//     height: 36,
//   },
//   addButtonText: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   emptyMenu: {
//     padding: 40,
//     alignItems: 'center',
//     gap: 12,
//   },
//   emptyMenuText: {
//     fontSize: 16,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//   },
//   errorText: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   goBackButton: {
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   goBackButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });


// app/restaurant/[id].tsx
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   Dimensions,
// } from 'react-native';
// import { useLocalSearchParams, router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { api, ApiError } from '@/lib/api';
// import { useCart } from '@/context/CartContext';
// import { useColors } from '@/hooks/useColors';

// const { width } = Dimensions.get('window');

// interface MenuItem {
//   _id?: string;
//   name: string;
//   description: string;
//   price: number;
//   isVeg: boolean;
//   isAvailable: boolean;
//   image?: string;
//   customizations?: any[];
// }

// interface MenuCategory {
//   _id?: string;
//   category: string;
//   items: MenuItem[];
// }

// interface RestaurantData {
//   _id: string;
//   name: string;
//   description?: string;
//   cuisine: string[];
//   rating: number;
//   totalRatings: number;
//   priceRange: string;
//   deliveryTime: number;
//   minimumOrder: number;
//   deliveryFee: number;
//   isActive: boolean;
//   isFeatured: boolean;
//   isOpen: boolean;
//   address: {
//     street: string;
//     locality: string;
//     city: string;
//     state: string;
//     pincode?: string;
//     coordinates?: { lat: number; lng: number };
//   };
//   location: {
//     type: string;
//     coordinates: number[];
//   };
//   images: string[];
//   logo?: string;
//   coverImage?: string;
//   phone?: string;
//   email?: string;
//   tags: string[];
//   menu: MenuCategory[];
//   reviews: any[];
//   createdAt: string;
//   updatedAt: string;
// }

// export default function RestaurantDetailsScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const colors = useColors();
//   const insets = useSafeAreaInsets();
//   const { addToCart, getCartCount } = useCart();
//   const cartCount = getCartCount();
  
//   const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

//   console.log('📱 RestaurantDetailsScreen mounted with ID:', id);

//   // Fetch restaurant details
//   const fetchRestaurant = async (refresh = false) => {
//     console.log('🔍 fetchRestaurant called, ID:', id);
    
//     if (!id) {
//       console.error('❌ No ID provided to fetchRestaurant');
//       setError('Restaurant ID not found');
//       setLoading(false);
//       return;
//     }

//     try {
//       if (refresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }
//       setError(null);

//       console.log(`📡 Fetching restaurant with ID: ${id}`);
      
//       const response = await api.restaurants.get(id);
      
//       console.log('✅ Restaurant response:', response);
      
//       if (response && response.success && response.data) {
//         console.log('🏪 Setting restaurant:', response.data.name);
//         console.log('📋 Menu items:', response.data.menu?.length || 0, 'categories');
//         setRestaurant(response.data);
//       } else {
//         console.warn('⚠️ No restaurant found in response');
//         setError('Restaurant not found');
//       }
//     } catch (err) {
//       console.error('❌ Error fetching restaurant:', err);
      
//       if (err instanceof ApiError) {
//         console.error('API Error:', err.message, err.status);
//         setError(err.message);
//       } else if (err instanceof Error) {
//         console.error('Error:', err.message);
//         setError(err.message);
//       } else {
//         setError('Failed to load restaurant details');
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     console.log('🔄 useEffect triggered with ID:', id);
//     if (id) {
//       fetchRestaurant();
//     } else {
//       console.error('❌ No ID in params');
//     }
//   }, [id]);

//   // Handle refresh
//   const onRefresh = () => {
//     console.log('🔄 Pull to refresh');
//     fetchRestaurant(true);
//   };

//   // Handle add to cart
//   const handleAddToCart = (item: MenuItem, categoryName: string) => {
//     console.log('🛒 Adding to cart:', item);
//     if (!restaurant) {
//       console.error('❌ No restaurant found for cart');
//       return;
//     }
    
//     addToCart({
//       id: item._id || `item_${Date.now()}`,
//       name: item.name,
//       price: item.price,
//       quantity: 1,
//       isVeg: item.isVeg,
//       restaurantId: restaurant._id,
//       restaurantName: restaurant.name,
//     });
    
//     Alert.alert('Success', `${item.name} added to cart!`);
//   };

//   // Get unique categories from menu
//   const getUniqueCategories = () => {
//     if (!restaurant || !restaurant.menu) return [];
//     return restaurant.menu.map(category => category.category);
//   };

//   // Get filtered menu items
//   const getFilteredMenu = () => {
//     if (!restaurant || !restaurant.menu) return [];
    
//     if (selectedCategory) {
//       return restaurant.menu.filter(
//         category => category.category === selectedCategory
//       );
//     }
    
//     return restaurant.menu;
//   };

//   // Render loading state
//   if (loading) {
//     return (
//       <View style={[styles.centered, { backgroundColor: colors.background }]}>
//         <ActivityIndicator size="large" color={colors.primary} />
//         <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
//           Loading restaurant details...
//         </Text>
//       </View>
//     );
//   }

//   // Render error state
//   if (error || !restaurant) {
//     return (
//       <View style={[styles.centered, { backgroundColor: colors.background, padding: 20 }]}>
//         <Ionicons name="alert-circle-outline" size={60} color={colors.primary} />
//         <Text style={[styles.errorText, { color: colors.foreground, marginTop: 16 }]}>
//           {error || 'Restaurant not found'}
//         </Text>
//         <TouchableOpacity 
//           style={[styles.retryButton, { backgroundColor: colors.primary }]}
//           onPress={() => {
//             console.log('🔄 Retry button pressed');
//             fetchRestaurant();
//           }}
//         >
//           <Text style={styles.retryButtonText}>Retry</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.goBackButton, { marginTop: 10 }]}
//           onPress={() => {
//             console.log('🔙 Go back button pressed');
//             router.back();
//           }}
//         >
//           <Text style={[styles.goBackButtonText, { color: colors.primary }]}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const uniqueCategories = getUniqueCategories();
//   const filteredMenu = getFilteredMenu();

//   // Get the first image or placeholder
//   const coverImage = restaurant.images?.[0] || 
//                      restaurant.coverImage || 
//                      'https://via.placeholder.com/800x300/ff4757/ffffff?text=Restaurant';

//   // Check if restaurant is open
//   const isOpen = restaurant.isOpen !== undefined ? restaurant.isOpen : true;

//   // Get cuisine as string
//   const cuisineText = Array.isArray(restaurant.cuisine) 
//     ? restaurant.cuisine.join(' • ') 
//     : restaurant.cuisine || '';

//   // Get address as string
//   const addressText = restaurant.address 
//     ? `${restaurant.address.locality || ''}, ${restaurant.address.city || ''}`
//     : 'Location not specified';

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* Header with Back Button and Cart */}
//       <View style={[styles.header, { 
//         paddingTop: insets.top + 8, 
//         backgroundColor: colors.card, 
//         borderBottomColor: colors.border 
//       }]}>
//         <TouchableOpacity 
//           style={styles.backBtn} 
//           onPress={() => router.back()}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//         >
//           <Ionicons name="arrow-back" size={24} color={colors.foreground} />
//         </TouchableOpacity>
        
//         <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
//           {restaurant.name}
//         </Text>
        
//         <TouchableOpacity 
//           style={styles.cartBtn} 
//           onPress={() => router.push("/cart")}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//         >
//           <Ionicons name="cart-outline" size={24} color={colors.foreground} />
//           {cartCount > 0 && (
//             <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
//               <Text style={styles.cartBadgeText}>{cartCount}</Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       <ScrollView
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
//         {/* Cover Image */}
//         <View style={styles.imageContainer}>
//           <Image source={{ uri: coverImage }} style={styles.coverImage} />
//         </View>

//         {/* Restaurant Info */}
//         <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
//           <Text style={[styles.restaurantName, { color: colors.foreground }]}>
//             {restaurant.name}
//           </Text>
          
//           <View style={styles.row}>
//             <View style={styles.ratingContainer}>
//               <Ionicons name="star" size={16} color="#FFD700" />
//               <Text style={[styles.rating, { color: colors.foreground }]}>
//                 {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'New'}
//               </Text>
//               {restaurant.totalRatings > 0 && (
//                 <Text style={[styles.ratingCount, { color: colors.mutedForeground }]}>
//                   ({restaurant.totalRatings})
//                 </Text>
//               )}
//             </View>
//             <Text style={styles.dot}>•</Text>
//             <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
//               {restaurant.deliveryTime} min
//             </Text>
//             <Text style={styles.dot}>•</Text>
//             <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
//               {restaurant.priceRange || '₹₹'}
//             </Text>
//             <Text style={styles.dot}>•</Text>
//             <Text style={[styles.infoText, { color: isOpen ? '#4CAF50' : '#f44336' }]}>
//               {isOpen ? 'Open' : 'Closed'}
//             </Text>
//           </View>

//           {cuisineText && (
//             <Text style={[styles.cuisine, { color: colors.mutedForeground }]}>
//               {cuisineText}
//             </Text>
//           )}

//           <View style={styles.addressContainer}>
//             <Ionicons name="location-outline" size={16} color={colors.mutedForeground} />
//             <Text style={[styles.address, { color: colors.mutedForeground }]}>
//               {addressText}
//             </Text>
//           </View>

//           {restaurant.description && (
//             <Text style={[styles.description, { color: colors.mutedForeground }]}>
//               {restaurant.description}
//             </Text>
//           )}

//           {/* Details Row */}
//           <View style={styles.detailsRow}>
//             <View style={styles.detailItem}>
//               <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
//                 Min Order
//               </Text>
//               <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                 ₹{restaurant.minimumOrder || 0}
//               </Text>
//             </View>
//             <View style={styles.detailItem}>
//               <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
//                 Delivery Fee
//               </Text>
//               <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                 ₹{restaurant.deliveryFee || 0}
//               </Text>
//             </View>
//             <View style={styles.detailItem}>
//               <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
//                 Categories
//               </Text>
//               <Text style={[styles.detailValue, { color: colors.foreground }]}>
//                 {restaurant.menu?.length || 0}
//               </Text>
//             </View>
//           </View>

//           {/* Tags */}
//           {restaurant.tags && restaurant.tags.length > 0 && (
//             <View style={styles.tagsContainer}>
//               {restaurant.tags.map((tag, index) => (
//                 <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
//                   <Text style={[styles.tagText, { color: colors.primary }]}>
//                     {tag}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//           )}
//         </View>

//         {/* Menu Section */}
//         <View style={[styles.menuContainer, { backgroundColor: colors.card, marginTop: 12 }]}>
//           <Text style={[styles.menuTitle, { color: colors.foreground }]}>Menu</Text>

//           {/* Category Filters */}
//           {uniqueCategories.length > 1 && (
//             <ScrollView 
//               horizontal 
//               showsHorizontalScrollIndicator={false}
//               style={styles.categoryScroll}
//               contentContainerStyle={styles.categoryContainer}
//             >
//               <TouchableOpacity
//                 style={[
//                   styles.categoryChip,
//                   !selectedCategory && { backgroundColor: colors.primary }
//                 ]}
//                 onPress={() => {
//                   console.log('📂 All categories selected');
//                   setSelectedCategory(null);
//                 }}
//               >
//                 <Text style={[
//                   styles.categoryChipText,
//                   { color: !selectedCategory ? 'white' : colors.foreground }
//                 ]}>
//                   All
//                 </Text>
//               </TouchableOpacity>
              
//               {uniqueCategories.map((category) => (
//                 <TouchableOpacity
//                   key={category}
//                   style={[
//                     styles.categoryChip,
//                     selectedCategory === category && { backgroundColor: colors.primary }
//                   ]}
//                   onPress={() => {
//                     console.log(`📂 Category selected: ${category}`);
//                     setSelectedCategory(category);
//                   }}
//                 >
//                   <Text style={[
//                     styles.categoryChipText,
//                     { color: selectedCategory === category ? 'white' : colors.foreground }
//                   ]}>
//                     {category}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           )}

//           {/* Menu Items */}
//           {filteredMenu && filteredMenu.length > 0 ? (
//             filteredMenu.map((category) => (
//               <View key={category._id || category.category} style={styles.menuSection}>
//                 <Text style={[styles.menuCategory, { color: colors.foreground }]}>
//                   {category.category}
//                 </Text>
//                 {category.items.map((item) => {
//                   const itemId = item._id || `item_${Date.now()}`;
                  
//                   return (
//                     <View key={itemId} style={[styles.menuItem, { borderBottomColor: colors.border }]}>
//                       <View style={styles.menuItemInfo}>
//                         <View style={styles.menuItemHeader}>
//                           <Text style={[styles.menuItemName, { color: colors.foreground }]}>
//                             {item.name}
//                           </Text>
//                           {item.isVeg && (
//                             <View style={styles.vegBadge}>
//                               <Text style={styles.vegBadgeText}>Veg</Text>
//                             </View>
//                           )}
//                           {!item.isVeg && (
//                             <View style={[styles.vegBadge, { backgroundColor: '#f44336' }]}>
//                               <Text style={styles.vegBadgeText}>Non-Veg</Text>
//                             </View>
//                           )}
//                         </View>
//                         <Text style={[styles.menuItemDescription, { color: colors.mutedForeground }]}>
//                           {item.description || 'No description available'}
//                         </Text>
//                         <Text style={[styles.menuItemPrice, { color: colors.foreground }]}>
//                           ₹{item.price}
//                         </Text>
//                       </View>
//                       {item.isAvailable !== false && (
//                         <TouchableOpacity
//                           style={[styles.addButton, { borderColor: colors.primary }]}
//                           onPress={() => handleAddToCart(item, category.category)}
//                         >
//                           <Text style={[styles.addButtonText, { color: colors.primary }]}>
//                             ADD
//                           </Text>
//                         </TouchableOpacity>
//                       )}
//                     </View>
//                   );
//                 })}
//               </View>
//             ))
//           ) : (
//             <View style={styles.emptyMenu}>
//               <Ionicons name="restaurant-outline" size={48} color={colors.mutedForeground} />
//               <Text style={[styles.emptyMenuText, { color: colors.mutedForeground }]}>
//                 No menu items available
//               </Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   backBtn: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     flex: 1,
//     fontSize: 17,
//     fontFamily: 'Inter_600SemiBold',
//     textAlign: 'center',
//     marginHorizontal: 8,
//   },
//   cartBtn: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   cartBadge: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     minWidth: 18,
//     height: 18,
//     borderRadius: 9,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 4,
//   },
//   cartBadgeText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: 'bold',
//     fontFamily: 'Inter_700Bold',
//   },
//   imageContainer: {
//     position: 'relative',
//   },
//   coverImage: {
//     width: width,
//     height: 250,
//   },
//   infoContainer: {
//     padding: 16,
//     marginTop: -10,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   restaurantName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     flexWrap: 'wrap',
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   rating: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   ratingCount: {
//     fontSize: 12,
//   },
//   dot: {
//     marginHorizontal: 6,
//     color: '#999',
//   },
//   infoText: {
//     fontSize: 14,
//   },
//   cuisine: {
//     fontSize: 14,
//     marginBottom: 8,
//   },
//   addressContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginBottom: 6,
//   },
//   address: {
//     fontSize: 14,
//   },
//   description: {
//     fontSize: 14,
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   detailsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   detailItem: {
//     alignItems: 'center',
//   },
//   detailLabel: {
//     fontSize: 12,
//     marginBottom: 4,
//   },
//   detailValue: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   tagsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginTop: 12,
//   },
//   tag: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   tagText: {
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   menuContainer: {
//     padding: 16,
//     marginBottom: 20,
//   },
//   menuTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   categoryScroll: {
//     marginBottom: 12,
//   },
//   categoryContainer: {
//     gap: 8,
//     paddingVertical: 4,
//   },
//   categoryChip: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginRight: 8,
//   },
//   categoryChipText: {
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   menuSection: {
//     marginTop: 12,
//   },
//   menuCategory: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//   },
//   menuItemInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   menuItemHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginBottom: 4,
//     flexWrap: 'wrap',
//   },
//   menuItemName: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   vegBadge: {
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   vegBadgeText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   menuItemDescription: {
//     fontSize: 13,
//     marginBottom: 4,
//   },
//   menuItemPrice: {
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   addButton: {
//     borderWidth: 1,
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 6,
//     alignSelf: 'center',
//     justifyContent: 'center',
//     height: 36,
//   },
//   addButtonText: {
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   emptyMenu: {
//     padding: 40,
//     alignItems: 'center',
//     gap: 12,
//   },
//   emptyMenuText: {
//     fontSize: 16,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//   },
//   errorText: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   goBackButton: {
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   goBackButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });


// app/restaurant/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, ApiError } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useColors } from '@/hooks/useColors';

const { width } = Dimensions.get('window');

interface MenuItem {
  _id?: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  image?: string;
  customizations?: any[];
}

interface MenuCategory {
  _id?: string;
  category: string;
  items: MenuItem[];
}

interface RestaurantData {
  _id: string;
  name: string;
  description?: string;
  cuisine: string[];
  rating: number;
  totalRatings: number;
  priceRange: string;
  deliveryTime: number;
  minimumOrder: number;
  deliveryFee: number;
  isActive: boolean;
  isFeatured: boolean;
  isOpen: boolean;
  address: {
    street: string;
    locality: string;
    city: string;
    state: string;
    pincode?: string;
    coordinates?: { lat: number; lng: number };
  };
  location: {
    type: string;
    coordinates: number[];
  };
  images: string[];
  logo?: string;
  coverImage?: string;
  phone?: string;
  email?: string;
  tags: string[];
  menu: MenuCategory[];
  reviews: any[];
  createdAt: string;
  updatedAt: string;
}

export default function RestaurantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addToCart, getCartCount } = useCart();
  const cartCount = getCartCount();
  
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  console.log('📱 RestaurantDetailsScreen mounted with ID:', id);

  // Fetch restaurant details
  const fetchRestaurant = async (refresh = false) => {
    console.log('🔍 fetchRestaurant called, ID:', id);
    
    if (!id) {
      console.error('❌ No ID provided to fetchRestaurant');
      setError('Restaurant ID not found');
      setLoading(false);
      return;
    }

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log(`📡 Fetching restaurant with ID: ${id}`);
      
      const response = await api.restaurants.get(id);
      
      console.log('✅ Restaurant response:', response);
      
      if (response && response.success && response.data) {
        console.log('🏪 Setting restaurant:', response.data.name);
        console.log('📋 Menu items:', response.data.menu?.length || 0, 'categories');
        setRestaurant(response.data);
      } else {
        console.warn('⚠️ No restaurant found in response');
        setError('Restaurant not found');
      }
    } catch (err) {
      console.error('❌ Error fetching restaurant:', err);
      
      if (err instanceof ApiError) {
        console.error('API Error:', err.message, err.status);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error('Error:', err.message);
        setError(err.message);
      } else {
        setError('Failed to load restaurant details');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered with ID:', id);
    if (id) {
      fetchRestaurant();
    } else {
      console.error('❌ No ID in params');
    }
  }, [id]);

  // Handle refresh
  const onRefresh = () => {
    console.log('🔄 Pull to refresh');
    fetchRestaurant(true);
  };

  // Handle add to cart
  const handleAddToCart = (item: MenuItem, categoryName: string) => {
    console.log('🛒 Adding to cart:', item);
    if (!restaurant) {
      console.error('❌ No restaurant found for cart');
      return;
    }
    
    addToCart({
      id: item._id || `item_${Date.now()}`,
      name: item.name,
      price: item.price,
      isVeg: item.isVeg,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
    });
    
    Alert.alert('Success', `${item.name} added to cart!`);
  };

  // Get unique categories from menu
  const getUniqueCategories = () => {
    if (!restaurant || !restaurant.menu) return [];
    return restaurant.menu.map(category => category.category);
  };

  // Get filtered menu items
  const getFilteredMenu = () => {
    if (!restaurant || !restaurant.menu) return [];
    
    if (selectedCategory) {
      return restaurant.menu.filter(
        category => category.category === selectedCategory
      );
    }
    
    return restaurant.menu;
  };

  // Render loading state
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading restaurant details...
        </Text>
      </View>
    );
  }

  // Render error state
  if (error || !restaurant) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.primary} />
        <Text style={[styles.errorText, { color: colors.foreground, marginTop: 16 }]}>
          {error || 'Restaurant not found'}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            console.log('🔄 Retry button pressed');
            fetchRestaurant();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.goBackButton, { marginTop: 10 }]}
          onPress={() => {
            console.log('🔙 Go back button pressed');
            router.back();
          }}
        >
          <Text style={[styles.goBackButtonText, { color: colors.primary }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const uniqueCategories = getUniqueCategories();
  const filteredMenu = getFilteredMenu();

  // Get the first image or placeholder
  const coverImage = restaurant.images?.[0] || 
                     restaurant.coverImage || 
                     'https://via.placeholder.com/800x300/ff4757/ffffff?text=Restaurant';

  // Check if restaurant is open
  const isOpen = restaurant.isOpen !== undefined ? restaurant.isOpen : true;

  // Get cuisine as string
  const cuisineText = Array.isArray(restaurant.cuisine) 
    ? restaurant.cuisine.join(' • ') 
    : restaurant.cuisine || '';

  // Get address as string
  const addressText = restaurant.address 
    ? `${restaurant.address.locality || ''}, ${restaurant.address.city || ''}`
    : 'Location not specified';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Back Button and Cart */}
      <View style={[styles.header, { 
        paddingTop: insets.top + 8, 
        backgroundColor: colors.card, 
        borderBottomColor: colors.border 
      }]}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {restaurant.name}
        </Text>
        
        <TouchableOpacity 
          style={styles.cartBtn} 
          onPress={() => router.push("/cart")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="cart-outline" size={24} color={colors.foreground} />
          {cartCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
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
        {/* Cover Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: coverImage }} style={styles.coverImage} />
        </View>

        {/* Restaurant Info */}
        <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.restaurantName, { color: colors.foreground }]}>
            {restaurant.name}
          </Text>
          
          <View style={styles.row}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={[styles.rating, { color: colors.foreground }]}>
                {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'New'}
              </Text>
              {restaurant.totalRatings > 0 && (
                <Text style={[styles.ratingCount, { color: colors.mutedForeground }]}>
                  ({restaurant.totalRatings})
                </Text>
              )}
            </View>
            <Text style={styles.dot}>•</Text>
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              {restaurant.deliveryTime} min
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              {restaurant.priceRange || '₹₹'}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={[styles.infoText, { color: isOpen ? '#4CAF50' : '#f44336' }]}>
              {isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>

          {cuisineText ? (
            <Text style={[styles.cuisine, { color: colors.mutedForeground }]}>
              {cuisineText}
            </Text>
          ) : null}

          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.address, { color: colors.mutedForeground }]}>
              {addressText}
            </Text>
          </View>

          {restaurant.description ? (
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {restaurant.description}
            </Text>
          ) : null}

          {/* Details Row */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                Min Order
              </Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>
                ₹{restaurant.minimumOrder || 0}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                Delivery Fee
              </Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>
                ₹{restaurant.deliveryFee || 0}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                Categories
              </Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>
                {restaurant.menu?.length || 0}
              </Text>
            </View>
          </View>

          {/* Tags */}
          {restaurant.tags && restaurant.tags.length > 0 ? (
            <View style={styles.tagsContainer}>
              {restaurant.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Menu Section */}
        <View style={[styles.menuContainer, { backgroundColor: colors.card, marginTop: 12 }]}>
          <Text style={[styles.menuTitle, { color: colors.foreground }]}>Menu</Text>

          {/* Category Filters */}
          {uniqueCategories.length > 1 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryContainer}
            >
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  !selectedCategory && { backgroundColor: colors.primary }
                ]}
                onPress={() => {
                  console.log('📂 All categories selected');
                  setSelectedCategory(null);
                }}
              >
                <Text style={[
                  styles.categoryChipText,
                  { color: !selectedCategory ? 'white' : colors.foreground }
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              
              {uniqueCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => {
                    console.log(`📂 Category selected: ${category}`);
                    setSelectedCategory(category);
                  }}
                >
                  <Text style={[
                    styles.categoryChipText,
                    { color: selectedCategory === category ? 'white' : colors.foreground }
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}

          {/* Menu Items */}
          {filteredMenu && filteredMenu.length > 0 ? (
            filteredMenu.map((category) => (
              <View key={category._id || category.category} style={styles.menuSection}>
                <Text style={[styles.menuCategory, { color: colors.foreground }]}>
                  {category.category}
                </Text>
                {category.items.map((item) => {
                  const itemId = item._id || `item_${Date.now()}`;
                  
                  return (
                    <View key={itemId} style={[styles.menuItem, { borderBottomColor: colors.border }]}>
                      <View style={styles.menuItemInfo}>
                        <View style={styles.menuItemHeader}>
                          <Text style={[styles.menuItemName, { color: colors.foreground }]}>
                            {item.name}
                          </Text>
                          {item.isVeg ? (
                            <View style={styles.vegBadge}>
                              <Text style={styles.vegBadgeText}>Veg</Text>
                            </View>
                          ) : (
                            <View style={[styles.vegBadge, { backgroundColor: '#f44336' }]}>
                              <Text style={styles.vegBadgeText}>Non-Veg</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.menuItemDescription, { color: colors.mutedForeground }]}>
                          {item.description || 'No description available'}
                        </Text>
                        <Text style={[styles.menuItemPrice, { color: colors.foreground }]}>
                          ₹{item.price}
                        </Text>
                      </View>
                      {item.isAvailable !== false ? (
                        <TouchableOpacity
                          style={[styles.addButton, { borderColor: colors.primary }]}
                          onPress={() => handleAddToCart(item, category.category)}
                        >
                          <Text style={[styles.addButtonText, { color: colors.primary }]}>
                            ADD
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ))
          ) : (
            <View style={styles.emptyMenu}>
              <Ionicons name="restaurant-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyMenuText, { color: colors.mutedForeground }]}>
                No menu items available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  cartBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  imageContainer: {
    position: 'relative',
  },
  coverImage: {
    width: width,
    height: 250,
  },
  infoContainer: {
    padding: 16,
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 12,
  },
  dot: {
    marginHorizontal: 6,
    color: '#999',
  },
  infoText: {
    fontSize: 14,
  },
  cuisine: {
    fontSize: 14,
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  address: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  menuContainer: {
    padding: 16,
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  menuSection: {
    marginTop: 12,
  },
  menuCategory: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  vegBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vegBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  menuItemDescription: {
    fontSize: 13,
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  addButton: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'center',
    justifyContent: 'center',
    height: 36,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyMenu: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyMenuText: {
    fontSize: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  goBackButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  goBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

