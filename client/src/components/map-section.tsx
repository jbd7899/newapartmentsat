import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import type { Property } from "@shared/schema";

interface MapSectionProps {
  cityFilter: string;
}

export default function MapSection({ cityFilter }: MapSectionProps) {
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const filteredProperties = cityFilter === "all" 
    ? properties 
    : properties.filter(p => p.city.toLowerCase() === cityFilter);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Explore Our Properties</h2>
          <p className="text-gray-600">Property locations in {cityFilter === "all" ? "Atlanta and Dallas" : cityFilter === "atlanta" ? "Atlanta, GA" : "Dallas, TX"}</p>
        </div>

        <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg" style={{ height: "400px" }}>
          <div className="p-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Property Locations</h3>
              <p className="text-gray-600">
                {filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'} in {
                  cityFilter === "all" ? "all cities" : 
                  cityFilter === "atlanta" ? "Atlanta" : "Dallas"
                }
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
              {filteredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{property.name}</h4>
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{property.address}</p>
                  <p className="text-xs text-gray-500 mb-3">{property.neighborhood}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`} • {property.bathrooms} bath
                    </span>
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}