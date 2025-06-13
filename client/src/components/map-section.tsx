import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Minus } from "lucide-react";

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function MapSection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const initializeMap = () => {
      try {
        if (!window.google || !mapRef.current) {
          throw new Error("Google Maps not available");
        }

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 33.7490, lng: -84.3880 }, // Atlanta center
          zoom: 10,
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
          ],
        });

        // Sample property markers
        const properties = [
          { lat: 33.7701, lng: -84.3870, name: "The Loft District" },
          { lat: 32.7767, lng: -96.7970, name: "Skyline Studios" },
        ];

        properties.forEach((property) => {
          new window.google.maps.Marker({
            position: { lat: property.lat, lng: property.lng },
            map: map,
            title: property.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#2D5AA0",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });
        });

        setMapLoaded(true);
      } catch (error) {
        console.error("Map initialization failed:", error);
        setMapError(true);
      }
    };

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || ''}&callback=initMap`;
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
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neutral mb-4">Explore Our Properties</h2>
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
