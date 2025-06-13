import { useQuery } from "@tanstack/react-query";
import PropertyCard from "./property-card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyGridProps {
  cityFilter: string;
  availabilityFilter: boolean;
}

export default function PropertyGrid({ cityFilter, availabilityFilter }: PropertyGridProps) {
  const { data: properties = [], isLoading, isError, error, refetch } = useQuery<Property[]>({
    queryKey: ["/api/properties", cityFilter, availabilityFilter],
    queryFn: async () => {
      try {
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
        if (!response.ok) {
          throw new Error(`Failed to fetch properties: ${response.status} ${response.statusText}`);
        }
        return response.json();
      } catch (err: any) {
        throw new Error(err?.message || "Unable to load properties");
      }
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
        ) : isError ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-red-800 font-medium mb-2">Failed to Load Properties</h3>
              <p className="text-red-600 text-sm mb-4">
                {error?.message || "Unable to fetch properties. Please check your connection and try again."}
              </p>
              <Button 
                onClick={() => refetch()} 
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
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
