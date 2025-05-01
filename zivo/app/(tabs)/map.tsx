import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import { getNearbyBusinesses, Business } from '../../services/business.service';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapHtml, setMapHtml] = useState<string>('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const { data: nearbyBusinesses, isLoading } = useQuery({
    queryKey: ['nearbyBusinesses', location?.coords.latitude, location?.coords.longitude],
    queryFn: () => {
      if (location?.coords) {
        return getNearbyBusinesses(
          location.coords.latitude,
          location.coords.longitude,
          5 // 5km yarıçap
        );
      }
      return null;
    },
    enabled: !!location?.coords,
  });

  useEffect(() => {
    (async () => {
      console.log('Requesting location permission...');
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', status);
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      console.log('Getting current position...');
      let currentLocation = await Location.getCurrentPositionAsync({});
      console.log('Current location:', currentLocation);
      setLocation(currentLocation);
    })();
  }, []);

  useEffect(() => {
    if (location?.coords && nearbyBusinesses) {
      console.log('Creating map with location:', location.coords);
      console.log('Nearby businesses:', nearbyBusinesses);
      
      const markers = nearbyBusinesses.map(business => {
        // Özel karakterleri escape et
        const escapedName = business.name.replace(/'/g, "\\'");
        const escapedAddress = business.address.replace(/'/g, "\\'");
        
        return `L.marker([${business.latitude}, ${business.longitude}])
          .bindPopup('${escapedName}<br>${escapedAddress}<br>${Math.round(business.distance! * 1000)}m away')
          .addTo(map)
          .on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'businessSelected', id: '${business.id}' }));
          });`;
      }).join('\n');

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Map</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
            <style>
              #map { height: 100%; width: 100%; }
              body { margin: 0; padding: 0; }
              html, body, #map { height: 100%; }
            </style>
          </head>
          <body>
            <div id="map"></div>
            <script>
              console.log('Initializing map...');
              var map = L.map('map').setView([${location.coords.latitude}, ${location.coords.longitude}], 13);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
              }).addTo(map);
              
              L.marker([${location.coords.latitude}, ${location.coords.longitude}])
                .bindPopup('Your Location')
                .addTo(map);
              
              ${markers}
              console.log('Map initialized successfully');
            </script>
          </body>
        </html>
      `;
      console.log('Setting map HTML...');
      setMapHtml(html);
    }
  }, [location, nearbyBusinesses]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'businessSelected') {
        const business = nearbyBusinesses?.find(b => b.id === data.id);
        if (business) {
          setSelectedBusiness(business);
          router.push(`/business/${business.id}`);
        }
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <iframe
          srcDoc={mapHtml}
          style={styles.map}
          allow="geolocation"
        />
      );
    }
    return (
      <WebView
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {!location ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1B9AAA" />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1B9AAA" />
            <Text style={styles.loadingText}>Loading nearby businesses...</Text>
          </View>
        ) : !mapHtml ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1B9AAA" />
            <Text style={styles.loadingText}>Preparing map...</Text>
          </View>
        ) : (
          renderMap()
        )}
      </View>
      
      <View style={styles.businessListContainer}>
        <Text style={styles.businessListTitle}>Nearby Businesses</Text>
        <ScrollView style={styles.businessList}>
          {nearbyBusinesses?.map((business) => (
            <TouchableOpacity
              key={business.id}
              style={styles.businessItem}
              onPress={() => router.push(`/(business)/${business.id}`)}
            >
              <View style={styles.businessInfo}>
                <Text style={styles.businessName}>{business.name}</Text>
                <Text style={styles.businessAddress}>{business.address}</Text>
                <Text style={styles.businessDistance}>
                  {Math.round(business.distance! * 1000)}m away
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: '50%',
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: '#f0f0f0',
  },
  businessListContainer: {
    height: '50%',
    padding: 16,
    backgroundColor: '#fff',
  },
  businessListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  businessList: {
    flex: 1,
  },
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  businessAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  businessDistance: {
    fontSize: 12,
    color: '#1B9AAA',
    marginTop: 4,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
}); 