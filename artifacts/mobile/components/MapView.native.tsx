import React from "react";
import RNMapView, { Marker, Polyline } from "react-native-maps";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

interface Props {
  driverCoord: { latitude: number; longitude: number } | null;
  primaryColor: string;
  mapRef?: React.RefObject<any>;
}

const DESTINATION = { latitude: 12.9279, longitude: 77.6271 };

export default function MapViewWrapper({ driverCoord, primaryColor, mapRef }: Props) {
  const initialRegion = driverCoord
    ? {
        latitude: (driverCoord.latitude + DESTINATION.latitude) / 2,
        longitude: (driverCoord.longitude + DESTINATION.longitude) / 2,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }
    : { latitude: DESTINATION.latitude, longitude: DESTINATION.longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 };

  return (
    <RNMapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
    >
      {driverCoord && (
        <Marker coordinate={driverCoord} title="Delivery Partner">
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: primaryColor, justifyContent: "center", alignItems: "center" }}>
            <Ionicons name="bicycle" size={18} color="#fff" />
          </View>
        </Marker>
      )}
      <Marker coordinate={DESTINATION} title="Your Location">
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#22c55e", justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="home" size={16} color="#fff" />
        </View>
      </Marker>
      {driverCoord && (
        <Polyline
          coordinates={[driverCoord, DESTINATION]}
          strokeColor={primaryColor}
          strokeWidth={3}
          lineDashPattern={[6, 4]}
        />
      )}
    </RNMapView>
  );
}
