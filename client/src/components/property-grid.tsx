import { useQuery } from "@tanstack/react-query";
import PropertyCard from "./property-card";
import { Button } from "@/components/ui/button";
import type { Property } from "@shared/schema";

interface PropertyGridProps {
  cityFilter: string;
  availabilityFilter: boolean;
}

export default function PropertyGrid({ cityFilter, availabilityFilter }: PropertyGridProps) {
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties", cityFilter, availabilityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (cityFilter !== "all") {
        // Map frontend city values to backend expected format
        const cityMap: { [key: string]: string } = {
          "atlanta": "Atlanta",
          "dallas": "Dallas"
        };
        params.append("city", cityMap[cityFilter] || cityFilter);
      }
      params.append("isAvailable", availabilityFilter.toString());

      const response = await fetch(`/api/properties?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    },
  });

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Featured Properties</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover unique rental opportunities in vibrant urban neighborhoods
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="flex space-x-4 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-4">No Properties Found</h3>
              <p className="text-gray-600 mb-6">
                There are no properties matching your current filters. Try adjusting your search criteria.
              </p>
              <Button variant="outline">Clear Filters</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {!isLoading && properties.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="bg-white text-primary border-2 border-primary px-8 py-3 hover:bg-primary hover:text-white transition-colors font-medium"
            >
              View All Properties
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
