import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MapFallback({ location }: { location: string }) {
  return (
    <View style={styles.container}>
      <Ionicons name="map-outline" size={48} color="#9CA3AF" />
      <Text style={styles.title}>Map View</Text>
      <Text style={styles.location}>{location}</Text>
      <Text style={styles.message}>Map is currently unavailable</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
});