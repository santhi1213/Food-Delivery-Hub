import React from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet, Dimensions } from 'react-native';

export default function WebMapView({ latitude, longitude }: { latitude: number; longitude: number }) {
  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          #map { height: 100%; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function initMap() {
            const location = { lat: ${latitude}, lng: ${longitude} };
            const map = new google.maps.Map(document.getElementById("map"), {
              zoom: 14,
              center: location,
            });
            new google.maps.Marker({
              position: location,
              map: map,
              title: "Current Location",
            });
          }
        </script>
        <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap" async defer></script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: mapHTML }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: Dimensions.get('window').width - 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});