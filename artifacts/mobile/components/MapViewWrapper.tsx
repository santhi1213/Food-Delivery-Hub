import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import MapView from 'react-native-maps';

export default function MapViewWrapper(props: any) {
  const [isReady, setIsReady] = React.useState(false);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10 }}>Loading map...</Text>
      </View>
    );
  }

  return <MapView {...props} onMapReady={() => setIsReady(true)} />;
}