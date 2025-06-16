import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import PhotoGallery from '@/components/photo-gallery';
import PropertyMap from '@/components/property-map';
import LeadFormDialog from '@/components/lead-form-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Bed,
  Bath,
  Building,
  AlertCircle,
  RefreshCw,
  Camera,
} from 'lucide-react';
import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import type { Property, Unit } from '@shared/schema';

interface PhotoData {
  exterior: string[];
  interior: string[];
  amenities: string[];
  units: Record<string, string[]>;
}

export default function PropertyDetail() {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [leadOpen, setLeadOpen] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortOrder, setSortOrder] = useState('rentAsc');

  const {
    data: property,
    isLoading: propertyLoading,
    isError: propertyError,
    error: propertyErrorMsg,
    refetch: refetchProperty,
  } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    retry: 2,
    retryDelay: 1000,
  });

  const {
    data: units = [],
    isLoading: unitsLoading,
    isError: unitsError,
    error: unitsErrorMsg,
    refetch: refetchUnits,
  } = useQuery<Unit[]>({
    queryKey: [`/api/units`, id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/units?propertyId=${id}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(
            `Failed to fetch units: ${response.status} ${response.statusText}`,
          );
        }
        return response.json();
      } catch (err: any) {
        throw new Error(err?.message || 'Unable to load units');
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  const { data: photos } = useQuery<PhotoData>({
    queryKey: ['/api/photos/property', id],
    queryFn: () => apiRequest(`/api/photos/property/${id}`),
    enabled: !!id,
    staleTime: 30 * 1000,
  });

  // Handle error states
  if (propertyError || unitsError) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-red-800 font-semibold text-xl mb-2">
              Error Loading Property
            </h2>
            <p className="text-red-600 mb-6">
              {propertyErrorMsg?.message ||
                unitsErrorMsg?.message ||
                'Unable to load property details. Please try again.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  refetchProperty();
                  refetchUnits();
                }}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => window.history.back()} variant="secondary">
                Go Back
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  Property Not Found
                </h1>
                <p className="text-muted-foreground">
                  The property you're looking for doesn't exist.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const processedUnits = [...units]
    .filter((u) => !onlyAvailable || u.isAvailable)
    .sort((a, b) => {
      if (sortOrder === 'rentAsc') return (a.rent ?? 0) - (b.rent ?? 0);
      if (sortOrder === 'rentDesc') return (b.rent ?? 0) - (a.rent ?? 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <PhotoGallery
            images={
              photos
                ? [...photos.exterior, ...photos.interior, ...photos.amenities]
                : []
            }
          />
        </div>

        {/* Property Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {property.name}
              </h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                <span>
                  {property.address}, {property.city}, {property.state}{' '}
                  {property.zipCode}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {property.totalUnits === 1 && (
                <>
                  <div className="flex items-center space-x-2">
                    <Bed className="w-4 h-4" />
                    <span>
                      {property.bedrooms === 0
                        ? 'Studio'
                        : `${property.bedrooms} bed`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bath className="w-4 h-4" />
                    <span>{property.bathrooms} bath</span>
                  </div>
                </>
              )}
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>{property.totalUnits} units</span>
              </div>
            </div>
          </div>
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
                  {property.description || 'No description available.'}
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
                    Discover the vibrant {property.neighborhood} neighborhood
                    with its unique character, local attractions, and convenient
                    amenities perfect for urban living.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  name={property.name}
                />
              </CardContent>
            </Card>

            {/* Units */}
            <Card>
              <CardHeader>
                <CardTitle>Available Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={onlyAvailable}
                      onCheckedChange={setOnlyAvailable}
                      className="data-[state=checked]:bg-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      Available only
                    </span>
                  </div>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rentAsc">Rent Low-High</SelectItem>
                      <SelectItem value="rentDesc">Rent High-Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-6">
                  {processedUnits.map((unit) => {
                    const unitPhotos = photos?.units[unit.id] || [];
                    return (
                      <div key={unit.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">
                              Unit {unit.unitNumber}
                            </span>
                            <Badge
                              variant={
                                unit.isAvailable ? 'default' : 'secondary'
                              }
                            >
                              {unit.isAvailable ? 'Available' : 'Leased'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {unit.bedrooms} bed • {unit.bathrooms} bath
                            </span>
                            {unit.rent && (
                              <span className="text-sm text-muted-foreground">
                                ${(unit.rent / 100).toLocaleString()}/month
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            {unit.availableDate && (
                              <span className="text-sm text-muted-foreground">
                                Available:{' '}
                                {new Date(
                                  unit.availableDate,
                                ).toLocaleDateString()}
                              </span>
                            )}
                            <Switch
                              checked={unit.isAvailable}
                              disabled
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                        </div>

                        {/* Unit Photos */}
                        {unitPhotos.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                              <Camera className="w-4 h-4" />
                              Unit Photos ({unitPhotos.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {unitPhotos.slice(0, 6).map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Unit ${unit.unitNumber} photo ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border hover:shadow-md transition-shadow"
                                  loading="lazy"
                                />
                              ))}
                            </div>
                            {unitPhotos.length > 6 && (
                              <p className="text-sm text-gray-500 mt-2">
                                +{unitPhotos.length - 6} more photos
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => setLeadOpen(true)}
                >
                  Schedule a Tour
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => setLeadOpen(true)}
                >
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

      <LeadFormDialog
        open={leadOpen}
        onOpenChange={setLeadOpen}
        defaultDate={selectedDate}
      />
      <Footer />
    </div>
  );
}
