"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";
import {
  getNearbyBusinesses,
  type Business,
} from "../../services/business.service";
import { WebView } from "react-native-webview";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapHtml, setMapHtml] = useState<string>("");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const insets = useSafeAreaInsets();

  const { data: nearbyBusinesses, isLoading } = useQuery({
    queryKey: [
      "nearbyBusinesses",
      location?.coords.latitude,
      location?.coords.longitude,
    ],
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
      console.log("Requesting location permission...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission status:", status);

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      console.log("Getting current position...");
      const currentLocation = await Location.getCurrentPositionAsync({});
      console.log("Current location:", currentLocation);
      setLocation(currentLocation);
    })();
  }, []);

  useEffect(() => {
    if (location?.coords && nearbyBusinesses) {
      console.log("Creating map with location:", location.coords);
      console.log("Nearby businesses:", nearbyBusinesses);

      const markers = nearbyBusinesses
        .map((business) => {
          // Özel karakterleri escape et
          const escapedName = business.name.replace(/'/g, "\\'");
          const escapedAddress = business.address.replace(/'/g, "\\'");

          return `L.marker([${business.latitude}, ${business.longitude}])
          .bindPopup('${escapedName}<br>${escapedAddress}<br>${Math.round(
            business.distance! * 1000
          )}m away')
          .addTo(map)
          .on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'businessSelected', id: '${
              business.id
            }' }));
          });`;
        })
        .join("\n");

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Clean Map</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
            <style>
              html, body, #map {
                height: 100%;
                margin: 0;
                padding: 0;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              }
        
              .leaflet-popup-content-wrapper {
                background: #ffffff;
                color: #333;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                padding: 10px;
              }
        
              .leaflet-popup-tip {
                background: #ffffff;
              }
        
              /* Pulse animation for user marker */
              .pulse-marker {
                width: 16px;
                height: 16px;
                background: #2596be;
                border-radius: 50%;
                position: absolute;
                transform: translate(-8px, -8px);
                animation: pulse 1.6s ease-out infinite;
                border: 2px solid white;
              }
        
              @keyframes pulse {
                0% {
                  box-shadow: 0 0 0 0 rgba(37, 150, 190, 0.4);
                }
                70% {
                  box-shadow: 0 0 0 10px rgba(37, 150, 190, 0);
                }
                100% {
                  box-shadow: 0 0 0 0 rgba(37, 150, 190, 0);
                }
              }
            </style>
          </head>
          <body>
            <div id="map"></div>
            <script>
              const map = L.map('map', { zoomControl: false }).setView([${
                location.coords.latitude
              }, ${location.coords.longitude}], 12);
        
              // ✅ Beyaz ve modern harita zemini
              L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '',
                subdomains: 'abcd',
                maxZoom: 19
              }).addTo(map);
        
              // ✅ Yumuşak yakınlaştırma
              setTimeout(() => {
                map.flyTo([${location.coords.latitude}, ${
        location.coords.longitude
      }], 15, {
                  animate: true,
                  duration: 1.5
                });
              }, 500);
        
              // ✅ Pulse'lı kullanıcı marker
              const userIcon = L.divIcon({
                className: 'pulse-marker',
                iconSize: [16, 16],
              });
        
              L.marker([${location.coords.latitude}, ${
        location.coords.longitude
      }], {
                icon: userIcon
              })
              .addTo(map)
              .bindPopup('📍 You are here')
              .openPopup();
        
              // ✅ Siyah-beyaz özel marker (Flaticon)
              ${nearbyBusinesses
                .map((business) => {
                  const name = business.name.replace(/'/g, "\\'");
                  const address = business.address.replace(/'/g, "\\'");
                  const lat = business.latitude;
                  const lng = business.longitude;
                  const distance = Math.round((business.distance ?? 0) * 1000);
                  const iconUrl =
                    "https://cdn-icons-png.flaticon.com/512/447/447031.png";

                  return `
                    L.marker([${lat}, ${lng}], {
                      icon: L.icon({
                        iconUrl: '${iconUrl}',
                        iconSize: [32, 32],
                        iconAnchor: [16, 36], // ⬅️ marker'ı biraz yukarı çeker
                        popupAnchor: [0, -32]
                      })
                    })
                    .addTo(map)
                    .bindPopup('<strong>${name}</strong><br><small>${address}</small><br><span style="color:#1B9AAA">${distance}m</span>')
                    .on('click', function() {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'businessSelected', id: '${business.id}' }));
                    });
                  `;
                })
                .join("\n")}
            </script>
          </body>
        </html>
        `;

      console.log("Setting map HTML...");
      setMapHtml(html);
    }
  }, [location, nearbyBusinesses]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "businessSelected") {
        const business = nearbyBusinesses?.find((b) => b.id === data.id);
        if (business) {
          setSelectedBusiness(business);
          router.push(`/business/${business.id}`);
        }
      }
    } catch (error) {
      console.error("Error handling WebView message:", error);
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
    if (Platform.OS === "web") {
      return <iframe srcDoc={mapHtml} style={styles.map} allow="geolocation" />;
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
              onPress={() => router.push(`/${business.id}`)}
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
    backgroundColor: "#f8f9fa",
  },
  mapContainer: {
    height: "50%",
    width: "100%",
    backgroundColor: "#f0f0f0",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderWidth: 0,
    backgroundColor: "#f0f0f0",
  },
  businessListContainer: {
    height: "50%",
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  businessListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: "Outfit-Bold",
  },
  businessList: {
    flex: 1,
  },
  businessItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Outfit-Bold",
  },
  businessAddress: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    fontFamily: "Outfit-Light",
  },
  businessDistance: {
    fontSize: 12,
    color: "#1B9AAA",
    marginTop: 4,
    fontFamily: "Outfit-Regular",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Outfit-Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontFamily: "Outfit-Regular",
  },
});
