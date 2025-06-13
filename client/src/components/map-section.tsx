import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Minus } from "lucide-react";
import type { Property } from "@shared/schema";

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface MapSectionProps {
  cityFilter: string;
}

export default function MapSection({ cityFilter }: MapSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // City coordinates
  const getCityCenter = (city: string) => {
    switch (city) {
      case "atlanta":
        return { lat: 33.7490, lng: -84.3880 };
      case "dallas":
        return { lat: 32.7767, lng: -96.7970 };
      default:
        return { lat: 33.7490, lng: -84.3880 }; // Default to Atlanta
    }
  };

  useEffect(() => {
    const initializeMap = () => {
      try {
        if (!window.google || !mapRef.current) {
          throw new Error("Google Maps not available");
        }

        const center = getCityCenter(cityFilter);
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 11,
          styles: [
            {
              featureType: "all",
              elementType: "geometry.fill",
              stylers: [{ color: "#f5f5f5" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#e9e9e9" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#ffffff" }],
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#666666" }],
            },
          ],
        });

        setMapInstance(map);
        setMapLoaded(true);
      } catch (error) {
        console.error("Map initialization failed:", error);
        setMapError(true);
      }
    };

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_API_KEY || ''}&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = initializeMap;
      
      script.onerror = () => {
        console.error("Failed to load Google Maps API");
        setMapError(true);
      };
      
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, [cityFilter]);

  // Update map center when city filter changes
  useEffect(() => {
    if (mapInstance && cityFilter) {
      const center = getCityCenter(cityFilter);
      mapInstance.setCenter(center);
      mapInstance.setZoom(11);
    }
  }, [cityFilter, mapInstance]);

  // Add markers when properties data is available and map is loaded
  useEffect(() => {
    if (!mapInstance || !properties.length) return;

    // Clear existing markers
    const markers: any[] = [];

    // Default coordinates for properties that don't have lat/lng
    const defaultCoordinates = {
      "The Loft District": { lat: 33.7701, lng: -84.3870 },
      "Skyline Studios": { lat: 32.7767, lng: -96.7970 },
    };

    // Filter properties based on city selection
    const filteredProperties = cityFilter === "all" 
      ? properties 
      : properties.filter(property => property.city.toLowerCase() === cityFilter);

    filteredProperties.forEach((property) => {
      let lat, lng;
      
      // Use stored coordinates if available, otherwise use defaults
      if (property.latitude && property.longitude) {
        lat = parseFloat(property.latitude);
        lng = parseFloat(property.longitude);
      } else {
        const coords = defaultCoordinates[property.name as keyof typeof defaultCoordinates];
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        } else {
          // Skip properties without coordinates
          return;
        }
      }

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        title: property.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#2D5AA0",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });

      // Create info window for each property
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">
              ${property.name}
            </h3>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">
              ${property.address}, ${property.city}, ${property.state}
            </p>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">
              ${property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`} • ${property.bathrooms} bath • ${property.totalUnits} units
            </p>
            <button onclick="window.location.href='/property/${property.id}'" 
              style="background: #2D5AA0; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;">
              View Details
            </button>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance, marker);
      });

      markers.push(marker);
    });

    // Adjust map bounds to show all markers if there are any
    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(marker => bounds.extend(marker.getPosition()));
      mapInstance.fitBounds(bounds);
      
      // Don't zoom in too much for single markers
      const zoom = mapInstance.getZoom();
      if (zoom > 15) {
        mapInstance.setZoom(15);
      }
    }

    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [mapInstance, properties, cityFilter]);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Explore Our Properties</h2>
          <p className="text-gray-600">Interactive map showing available rental units across Atlanta and Dallas</p>
        </div>

        <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg" style={{ height: "400px" }}>
          {!mapLoaded && !mapError && (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Map...</h3>
                <p className="text-gray-600">Please wait while we load the interactive map</p>
              </div>
            </div>
          )}

          {mapError && (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Map Unavailable</h3>
                <p className="text-gray-600">Use the property grid below to browse available units</p>
              </div>
            </div>
          )}

          <div ref={mapRef} className="w-full h-full" />

          {/* Map controls */}
          {mapLoaded && (
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <Button
                size="icon"
                variant="secondary"
                className="bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <Minus className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
