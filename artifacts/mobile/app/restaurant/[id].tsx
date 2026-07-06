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
  FlatList,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, ApiError } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useColors } from '@/hooks/useColors';

const { width } = Dimensions.get('window');

// Menu Item interface matching backend
interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPercentage?: number;
  offerPrice?: number;
  isVeg: boolean;
  isAvailable: boolean;
  isBestseller?: boolean;
  isPopular?: boolean;
  isTrending?: boolean;
  preparationTime?: number;
  images?: string[];
  categoryId?: string;
  categoryName?: string;
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
  images: string[];
  logo?: string;
  coverImage?: string;
  phone?: string;
  email?: string;
  tags: string[];
  menuItems?: MenuItem[];
  menu?: MenuItem[];
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => {
        setToastVisible(false);
        setToastMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  // Fetch restaurant details from API
  const fetchRestaurant = async (refresh = false) => {
    if (!id) {
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
      console.log('✅ Restaurant response received');

      if (response && response.success && response.data) {
        const restaurantData = response.data as unknown as RestaurantData;
        
        // Log menu items for debugging
        const menuItems = restaurantData.menuItems || restaurantData.menu || [];
        console.log(`📋 Menu items count: ${menuItems.length}`);
        
        setRestaurant(restaurantData);
      } else {
        setError('Restaurant not found');
      }
    } catch (err) {
      console.error('❌ Error fetching restaurant:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
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
    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  // Pull to refresh handler
  const onRefresh = () => {
    fetchRestaurant(true);
  };

  // Add item to cart with validation
  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) {
      Alert.alert('Error', 'Restaurant not found');
      return;
    }

    if (!item.isAvailable) {
      Alert.alert('Unavailable', `${item.name} is currently unavailable`);
      return;
    }

    addToCart({
      id: item._id,
      name: item.name,
      price: item.price,
      isVeg: item.isVeg,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      quantity: 1,
    });

    setToastMessage(`${item.name} added to cart!`);
    setToastVisible(true);
  };

  // Get menu items from either menuItems or menu array
  const getMenuItems = (): MenuItem[] => {
    if (!restaurant) return [];
    
    const items = restaurant.menuItems || restaurant.menu || [];
    
    // If it's a flat array of menu items
    if (Array.isArray(items) && items.length > 0 && 'name' in items[0]) {
      return items as MenuItem[];
    }
    
    // If it's a categorized menu (old format with 'items' property)
    if (Array.isArray(items) && items.length > 0 && 'items' in items[0]) {
      const flatItems: MenuItem[] = [];
      items.forEach((category: any) => {
        if (category.items && Array.isArray(category.items)) {
          flatItems.push(...category.items);
        }
      });
      return flatItems;
    }
    
    return [];
  };

  // Get unique categories from menu
  const getCategories = (): string[] => {
    const items = getMenuItems();
    const categories = new Set<string>();
    items.forEach(item => {
      if (item.categoryName) {
        categories.add(item.categoryName);
      }
    });
    return Array.from(categories);
  };

  // Filter menu items by selected category
  const getFilteredItems = (): MenuItem[] => {
    const items = getMenuItems();
    if (selectedCategory) {
      return items.filter(item => item.categoryName === selectedCategory);
    }
    return items;
  };

  // Loading state
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

  // Error state
  if (error || !restaurant) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.primary} />
        <Text style={[styles.errorText, { color: colors.foreground, marginTop: 16 }]}>
          {error || 'Restaurant not found'}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => fetchRestaurant()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.goBackButton, { marginTop: 10 }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.goBackButtonText, { color: colors.primary }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const menuItems = getFilteredItems();
  const categories = getCategories();
  const isOpen = restaurant.isOpen !== undefined ? restaurant.isOpen : true;

  const coverImage = restaurant.images?.[0] ||
    restaurant.coverImage ||
    'https://via.placeholder.com/800x300/ff4757/ffffff?text=Restaurant';

  const cuisineText = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine.join(' • ')
    : restaurant.cuisine || '';

  const addressText = restaurant.address
    ? `${restaurant.address.locality || ''}, ${restaurant.address.city || ''}`
    : 'Location not specified';

  // Render individual menu item
  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const discountPrice = item.discountPercentage 
      ? item.price * (1 - item.discountPercentage / 100) 
      : item.price;

    return (
      <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
        <View style={styles.menuItemLeft}>
          <View style={styles.menuItemHeader}>
            <View style={styles.menuItemNameRow}>
              <View style={[styles.vegIndicator, { borderColor: item.isVeg ? '#4CAF50' : '#f44336' }]}>
                <View style={[styles.vegDot, { backgroundColor: item.isVeg ? '#4CAF50' : '#f44336' }]} />
              </View>
              <Text style={[styles.menuItemName, { color: colors.foreground }]}>
                {item.name}
              </Text>
              {item.isBestseller && (
                <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.badgeText, { color: '#92400E' }]}>Bestseller</Text>
                </View>
              )}
              {!item.isAvailable && (
                <View style={[styles.badge, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.badgeText, { color: '#DC2626' }]}>Unavailable</Text>
                </View>
              )}
            </View>
            <Text style={[styles.menuItemDescription, { color: colors.mutedForeground }]} numberOfLines={2}>
              {item.description || 'No description available'}
            </Text>
            <View style={styles.menuItemPriceRow}>
              <Text style={[styles.menuItemPrice, { color: colors.foreground }]}>
                ₹{discountPrice.toFixed(2)}
              </Text>
              {item.discountPercentage && item.discountPercentage > 0 && (
                <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
                  ₹{item.price.toFixed(2)}
                </Text>
              )}
              {item.preparationTime && (
                <Text style={[styles.prepTime, { color: colors.mutedForeground }]}>
                  • {item.preparationTime} min
                </Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.menuItemRight}>
          {item.images && item.images.length > 0 && (
            <Image 
              source={{ uri: item.images[0] }} 
              style={styles.menuItemImage}
              resizeMode="cover"
            />
          )}
          {item.isAvailable !== false ? (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: colors.primary }]}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={[styles.addButtonText, { color: colors.primary }]}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.unavailableButton, { backgroundColor: colors.muted }]}>
              <Text style={[styles.unavailableButtonText, { color: colors.mutedForeground }]}>
                Unavailable
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
          onPress={() => router.push('/cart')}
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
        </View>

        {/* Menu Section */}
        <View style={[styles.menuContainer, { backgroundColor: colors.card, marginTop: 12 }]}>
          <Text style={[styles.menuTitle, { color: colors.foreground }]}>
            Menu ({menuItems.length} items)
          </Text>

          {/* Category Filters */}
          {categories.length > 0 && (
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
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[
                  styles.categoryChipText,
                  { color: !selectedCategory ? 'white' : colors.foreground }
                ]}>
                  All
                </Text>
              </TouchableOpacity>

              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setSelectedCategory(category)}
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
          )}

          {/* Menu Items List */}
          {menuItems.length > 0 ? (
            <FlatList
              data={menuItems}
              keyExtractor={(item) => item._id}
              renderItem={renderMenuItem}
              scrollEnabled={false}
            />
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

      {/* Toast Notification */}
      {toastVisible && toastMessage && (
        <View style={[styles.toast, { backgroundColor: colors.success || '#4CAF50' }]}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
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
    height: 200,
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
    fontFamily: 'Inter_700Bold',
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
  menuContainer: {
    padding: 16,
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Inter_700Bold',
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
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  menuItemHeader: {
    flex: 1,
  },
  menuItemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  vegIndicator: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter_600SemiBold',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  menuItemDescription: {
    fontSize: 13,
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
  menuItemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_700Bold',
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
    fontFamily: 'Inter_400Regular',
  },
  prepTime: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  menuItemRight: {
    alignItems: 'center',
    gap: 8,
    width: 88,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
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
  unavailableButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unavailableButtonText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyMenu: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyMenuText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter_400Regular',
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
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  toastText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
  },
});