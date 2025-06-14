import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  setCityFilter: (city: string) => void;
  availabilityFilter: boolean;
  setAvailabilityFilter: (available: boolean) => void;
}

export default function MapSection({ cityFilter, setCityFilter, availabilityFilter, setAvailabilityFilter }: MapSectionProps) {
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
        return { lat: 33.74900, lng: -84.38800 };
      case "dallas":
        return { lat: 32.77670, lng: -96.79700 };
      default:
        return { lat: 33.74900, lng: -84.38800 }; // Default to Atlanta
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
      if ((window as any).initMap) {
        delete (window as any).initMap;
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


    // Filter properties based on city selection
    const filteredProperties = cityFilter === "all" 
      ? properties 
      : properties.filter(property => {
          const cityMap: { [key: string]: string } = {
            "atlanta": "Atlanta",
            "dallas": "Dallas"
          };
          return property.city === (cityMap[cityFilter] || cityFilter);
        });

    filteredProperties.forEach((property) => {
      if (!property.latitude || !property.longitude) {
        return;
      }

      const lat = parseFloat(property.latitude);
      const lng = parseFloat(property.longitude);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return;
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
              ${property.totalUnits === 1 ? `${property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`} • ${property.bathrooms} bath • ` : ''}${property.totalUnits} units
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
    <section className="py-12 bg-white pt-[0px] pb-[0px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        

        {/* City Selector & Availability Filter */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-[10px] mb-[10px]">
          <div className="flex items-center space-x-4 bg-white p-2 rounded-xl shadow-sm">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="border-0 bg-transparent text-foreground font-medium focus:ring-0 focus:outline-none min-w-[120px]">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="atlanta">Atlanta, GA</SelectItem>
                <SelectItem value="dallas">Dallas, TX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4 bg-white p-2 rounded-xl shadow-sm">
            <Button
              variant={availabilityFilter ? "default" : "ghost"}
              size="sm"
              onClick={() => setAvailabilityFilter(true)}
              className={availabilityFilter ? "bg-primary text-white" : "text-foreground hover:bg-gray-100"}
            >
              Available
            </Button>
            <Button
              variant={!availabilityFilter ? "default" : "ghost"}
              size="sm"
              onClick={() => setAvailabilityFilter(false)}
              className={!availabilityFilter ? "bg-primary text-white" : "text-foreground hover:bg-gray-100"}
            >
              Not Available
            </Button>
          </div>
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
            <div className="p-6">
              <div className="text-center mb-6">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Property Locations</h3>
                <p className="text-gray-600">Current {cityFilter === "all" ? "All Cities" : cityFilter === "atlanta" ? "Atlanta" : "Dallas"} Properties</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(cityFilter === "all" ? properties : properties.filter(p => p.city.toLowerCase() === cityFilter)).map((property) => (
                  <div key={property.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{property.name}</h4>
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{property.address}</p>
                    <p className="text-xs text-gray-500 mb-3">{property.neighborhood}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {property.totalUnits === 1 ? `${property.bedrooms} bed • ${property.bathrooms} bath` : `${property.totalUnits} units`}
                      </span>
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
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
