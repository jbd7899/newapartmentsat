import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const hasAvailableUnits = true; // This would be calculated based on units data

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
      <div className="relative overflow-hidden">
        <img
          src={property.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
          alt={`${property.name} exterior`}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-foreground">{property.name}</h3>
          <Badge variant={hasAvailableUnits ? "default" : "secondary"}>
            {hasAvailableUnits ? "Available" : "Leased"}
          </Badge>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {property.city}, {property.state}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} beds`}</span>
          <span>{property.bathrooms} baths</span>
          <span>{property.totalUnits} units</span>
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
