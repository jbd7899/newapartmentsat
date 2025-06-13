import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import PhotoGallery from "@/components/photo-gallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { MapPin, Bed, Bath, Building } from "lucide-react";
import { useState } from "react";
import type { Property, Unit } from "@shared/schema";

export default function PropertyDetail() {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>();

  const { data: property, isLoading: propertyLoading } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
  });

  const { data: units = [], isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: [`/api/units`, id],
    queryFn: async () => {
      const response = await fetch(`/api/units?propertyId=${id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch units");
      return response.json();
    },
  });

  if (propertyLoading || unitsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-foreground">Loading property details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-4">Property Not Found</h1>
                <p className="text-muted-foreground">The property you're looking for doesn't exist.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{property.name}</h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms} bath</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>{property.totalUnits} units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="mb-8">
          <PhotoGallery images={property.images || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {property.description || "No description available."}
                </p>
              </CardContent>
            </Card>

            {/* Neighborhood */}
            {property.neighborhood && (
              <Card>
                <CardHeader>
                  <CardTitle>Neighborhood: {property.neighborhood}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    Discover the vibrant {property.neighborhood} neighborhood with its unique character, 
                    local attractions, and convenient amenities perfect for urban living.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Units */}
            <Card>
              <CardHeader>
                <CardTitle>Available Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {units.map((unit) => (
                    <div
                      key={unit.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">Unit {unit.unitNumber}</span>
                        <Badge variant={unit.isAvailable ? "default" : "secondary"}>
                          {unit.isAvailable ? "Available" : "Leased"}
                        </Badge>
                        {unit.rent && (
                          <span className="text-sm text-muted-foreground">
                            ${(unit.rent / 100).toLocaleString()}/month
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        {unit.availableDate && (
                          <span className="text-sm text-muted-foreground">
                            Available: {new Date(unit.availableDate).toLocaleDateString()}
                          </span>
                        )}
                        <Switch
                          checked={unit.isAvailable}
                          disabled
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Interested in this property?</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Schedule a Tour
                </Button>
                <Button variant="outline" className="w-full mt-2">
                  Contact Property Manager
                </Button>
              </CardContent>
            </Card>

            {/* Move-in Date Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Desired Move-in Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
