import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Property, Unit } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
}

interface PhotoData {
  exterior: string[];
  interior: string[];
  amenities: string[];
  units: Record<string, string[]>;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: [`/api/units`, property.id],
    queryFn: async () => {
      const response = await fetch(`/api/units?propertyId=${property.id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch units");
      return response.json();
    },
  });

  const { data: photos } = useQuery<PhotoData>({
    queryKey: ['/api/photos/property', property.id],
    queryFn: () => apiRequest(`/api/photos/property/${property.id}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const availableUnits = units.filter(unit => unit.isAvailable);
  const hasAvailableUnits = availableUnits.length > 0;
  const availabilityText = property.totalUnits > 1 
    ? `${availableUnits.length}/${property.totalUnits} available`
    : hasAvailableUnits ? "Available" : "Not Available";

  // Get the first available photo, prioritizing exterior photos
  const getPropertyImage = () => {
    if (photos?.exterior && photos.exterior.length > 0) {
      return photos.exterior[0];
    }
    if (photos?.interior && photos.interior.length > 0) {
      return photos.interior[0];
    }
    if (photos?.amenities && photos.amenities.length > 0) {
      return photos.amenities[0];
    }
    return null;
  };

  const propertyImage = getPropertyImage();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
      <div className="relative overflow-hidden">
        {propertyImage ? (
          <img
            src={propertyImage}
            alt={`${property.name} exterior`}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No photos available</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-foreground">{property.name}</h3>
          <Badge variant={hasAvailableUnits ? "default" : "secondary"}>
            {availabilityText}
          </Badge>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {property.city}, {property.state}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <span>{property.totalUnits} {property.totalUnits === 1 ? 'unit' : 'units'}</span>
          <span>{property.neighborhood}</span>
        </div>

        <Link href={`/property/${property.id}`}>
          <Button 
            className={`w-full transition-colors font-medium ${
              hasAvailableUnits 
                ? "bg-primary text-white hover:bg-primary/90" 
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            disabled={!hasAvailableUnits}
          >
            {hasAvailableUnits ? "View Details" : "Currently Leased"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
