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