import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

export default function WebMapView({ latitude, longitude }: { latitude: number; longitude: number }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: Dimensions.get('window').width - 32,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#64748b',
    fontSize: 14,
  },
});
