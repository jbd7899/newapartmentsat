import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import PhotoManager from "@/components/photo-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Share2 } from "lucide-react";
import BrandingForm from "@/components/admin/branding-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertPropertySchema, insertUnitSchema } from "@shared/schema";
import type { Property, Unit, LeadSubmission } from "@shared/schema";
import Metrics from "@/components/admin/metrics";
import SearchBox from "@/components/admin/search-box";
import PropertyThumbnail from "@/components/admin/property-thumbnail";
import { 
  Plus, 
  Edit, 
  Trash, 
  Trash2,
  Upload, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Camera,
  AlertCircle,
  RefreshCw,
  UserCheck
} from "lucide-react";
import { z } from "zod";

export default function Admin() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [expandedProperties, setExpandedProperties] = useState<Set<number>>(new Set());
  const [photoManagerProperty, setPhotoManagerProperty] = useState<Property | null>(null);
  const [propertySearch, setPropertySearch] = useState("");
  const [leadSearch, setLeadSearch] = useState("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Queries with enhanced error handling
  const properties = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/properties");
      } catch (error: any) {
        throw new Error(error?.message || "Failed to fetch properties");
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  const units = useQuery({
    queryKey: ["/api/units"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/units");
      } catch (error: any) {
        throw new Error(error?.message || "Failed to fetch units");
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  const leadSubmissions = useQuery({
    queryKey: ["/api/lead-submissions"],
    queryFn: async () => {
      try {
        return await apiRequest("/api/lead-submissions");
      } catch (error: any) {
        throw new Error(error?.message || "Failed to fetch lead submissions");
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Property form
  const propertyFormSchema = insertPropertySchema.omit({ images: true }).extend({
    description: z.string().optional(),
    neighborhood: z.string().optional(),
    amenities: z.string().optional(),
    petPolicy: z.string().optional(),
    floorPlans: z.string().optional(),
    images: z.array(z.string()).optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  });

  const propertyForm = useForm({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      bedrooms: 0,
      bathrooms: "",
      totalUnits: 0,
      description: "",
      neighborhood: "",
      amenities: "",
      petPolicy: "",
      floorPlans: "",
      images: [],
      latitude: "",
      longitude: "",
    },
  });

  // Unit form
  const unitFormSchema = insertUnitSchema.omit({ images: true }).extend({
    availableDate: z.string().optional(),
    images: z.array(z.string()).optional(),
  });

  const unitForm = useForm({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      propertyId: 0,
      unitNumber: "",
      bedrooms: 0,
      bathrooms: "",
      isAvailable: false,
      availableDate: "",
      rent: 0,
      images: [],
    },
  });

  const isAvailableWatch = unitForm.watch("isAvailable");

  useEffect(() => {
    if (!isAvailableWatch) {
      unitForm.setValue("availableDate", "");
    }
  }, [isAvailableWatch]);

  // Mutations with enhanced error handling
  const createPropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await apiRequest("/api/properties", "POST", data);
        return response;
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to create property";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setIsPropertyDialogOpen(false);
      propertyForm.reset();
      toast({ 
        title: "Success", 
        description: "Property created successfully" 
      });
    },
    onError: (error: any) => {
      console.error("Create property error:", error);
      toast({ 
        title: "Failed to create property", 
        description: error.message || "Please check your input and try again",
        variant: "destructive" 
      });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      try {
        const response = await apiRequest(`/api/properties/${id}`, "PUT", data);
        return response;
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to update property";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setIsPropertyDialogOpen(false);
      propertyForm.reset();
      setEditingProperty(null);
      toast({ 
        title: "Success", 
        description: "Property updated successfully" 
      });
    },
    onError: (error: any) => {
      console.error("Update property error:", error);
      toast({ 
        title: "Failed to update property", 
        description: error.message || "Please check your input and try again",
        variant: "destructive" 
      });
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        // Validate required fields
        if (!data.propertyId || !data.unitNumber) {
          throw new Error("Property and unit number are required");
        }
        const response = await apiRequest("/api/units", "POST", data);
        return response;
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to create unit";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      setIsUnitDialogOpen(false);
      unitForm.reset();
      setEditingUnit(null);
      toast({ 
        title: "Success", 
        description: "Unit created successfully" 
      });
    },
    onError: (error: any) => {
      console.error("Create unit error:", error);
      toast({ 
        title: "Failed to create unit", 
        description: error.message || "Please check your input and try again",
        variant: "destructive" 
      });
    },
  });

  const updateUnitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      try {
        if (!id) {
          throw new Error("Unit ID is required");
        }
        const response = await apiRequest(`/api/units/${id}`, "PUT", data);
        return response;
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to update unit";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      setIsUnitDialogOpen(false);
      unitForm.reset();
      setEditingUnit(null);
      toast({ 
        title: "Success", 
        description: "Unit updated successfully" 
      });
    },
    onError: (error: any) => {
      console.error("Update unit error:", error);
      toast({ 
        title: "Failed to update unit", 
        description: error.message || "Please check your input and try again",
        variant: "destructive" 
      });
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: async (unitId: number) => {
      try {
        if (!unitId) {
          throw new Error("Unit ID is required");
        }
        const response = await apiRequest(`/api/units/${unitId}`, "DELETE");
        return response;
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to delete unit";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({ 
        title: "Success", 
        description: "Unit deleted successfully" 
      });
    },
    onError: (error: any) => {
      console.error("Delete unit error:", error);
      toast({ 
        title: "Failed to delete unit", 
        description: error.message || "Unable to delete unit. Please try again.",
        variant: "destructive" 
      });
    },
  });

  // Form handlers
  const onPropertySubmit = (data: any) => {
    try {
      const submitData = {
        ...data,
        description: data.description || null,
        neighborhood: data.neighborhood || null,
        amenities: data.amenities || null,
        petPolicy: data.petPolicy || null,
        floorPlans: data.floorPlans || null,
        images: data.images || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      };

      if (editingProperty) {
        updatePropertyMutation.mutate({
          id: editingProperty.id,
          data: submitData,
        });
      } else {
        createPropertyMutation.mutate(submitData);
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields are filled correctly",
        variant: "destructive"
      });
    }
  };

  const onUnitSubmit = (data: any) => {
    try {
      const submitData = {
        ...data,
        availableDate: data.availableDate ? new Date(data.availableDate).toISOString() : null,
        rent: data.rent ? Math.round(data.rent * 100) : null,
        bedrooms: parseInt(data.bedrooms) || 0,
        bathrooms: data.bathrooms,
      };

      if (editingUnit) {
        updateUnitMutation.mutate({ id: editingUnit.id, data: submitData });
      } else {
        createUnitMutation.mutate(submitData);
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields are filled correctly",
        variant: "destructive"
      });
    }
  };

  const openPropertyDialog = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      propertyForm.reset({
        ...property,
        description: property.description || "",
        neighborhood: property.neighborhood || "",
        amenities: property.amenities || "",
        petPolicy: property.petPolicy || "",
        floorPlans: property.floorPlans || "",
        images: (property.images as any) || [],
        latitude: property.latitude || "",
        longitude: property.longitude || "",
      });
    } else {
      setEditingProperty(null);
      propertyForm.reset();
    }
    setIsPropertyDialogOpen(true);
  };

  const openUnitDialog = (unit?: Unit, propertyId?: number) => {
    if (unit) {
      setEditingUnit(unit);
      unitForm.reset({
        ...unit,
        propertyId: unit.propertyId,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        availableDate: unit.availableDate ? new Date(unit.availableDate).toISOString().split('T')[0] : "",
        rent: unit.rent ? unit.rent / 100 : 0,
        images: (unit.images as any) || [],
      });
    } else {
      setEditingUnit(null);
      unitForm.reset({
        propertyId: propertyId || 0,
        unitNumber: "",
        bedrooms: 0,
        bathrooms: "",
        isAvailable: true,
        availableDate: "",
        rent: 0,
        images: [],
      });
    }
    setIsUnitDialogOpen(true);
  };

  const togglePropertyExpansion = (propertyId: number) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedProperties(newExpanded);
  };

  const toggleUnitAvailability = async (unitId: number, currentStatus: boolean) => {
    try {
      await updateUnitMutation.mutateAsync({
        id: unitId,
        data: { isAvailable: !currentStatus }
      });
    } catch (error) {
      console.error('Failed to update unit availability');
    }
  };

  const deleteUnit = async (unitId: number) => {
    if (window.confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
      try {
        await deleteUnitMutation.mutateAsync(unitId);
      } catch (error) {
        console.error('Failed to delete unit');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage properties, units, and view lead submissions</p>
          </div>
          <Card className="md:max-w-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Public Listing Link</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm break-all">{window.location.origin + '/public'}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(window.location.origin + '/public')}
                title="Copy link"
              >
                <Copy className="w-4 h-4" />
              </Button>
          </CardContent>
        </Card>
        <Metrics properties={properties.data} units={units.data} leads={leadSubmissions.data} />
      </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1">
            <TabsTrigger value="properties" className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <Building2 className="w-4 h-4" />
              Properties & Units
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <Users className="w-4 h-4" />
              Lead Submissions
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <Building2 className="w-4 h-4" />
              Branding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-6">
            {properties.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-gray-600">Loading properties...</span>
                </div>
              </div>
            ) : properties.isError ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-red-800 font-medium mb-2">Failed to load properties</h3>
                  <p className="text-red-600 text-sm mb-4">
                    {properties.error?.message || "Unable to fetch property data. Please check your connection and try again."}
                  </p>
                  <Button 
                    onClick={() => properties.refetch()} 
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">Properties & Units</h2>
                      <p className="text-sm text-gray-600">Manage your rental properties and unit availability</p>
                    </div>
                  </div>
                  <Dialog open={isPropertyDialogOpen} onOpenChange={setIsPropertyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => openPropertyDialog()}
                        className="bg-primary hover:bg-primary/90"
                        disabled={createPropertyMutation.isPending}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Property
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProperty ? "Edit Property" : "Add New Property"}
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...propertyForm}>
                        <form onSubmit={propertyForm.handleSubmit(onPropertySubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={propertyForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Property Name *</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="The Loft District" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={propertyForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address *</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="123 Main Street" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <FormField
                              control={propertyForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City *</FormLabel>
                                  <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select city" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Atlanta">Atlanta</SelectItem>
                                        <SelectItem value="Dallas">Dallas</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={propertyForm.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State *</FormLabel>
                                  <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select state" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="GA">Georgia</SelectItem>
                                        <SelectItem value="TX">Texas</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={propertyForm.control}
                              name="zipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ZIP Code *</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="30309" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <FormField
                              control={propertyForm.control}
                              name="bedrooms"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bedrooms *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={propertyForm.control}
                              name="bathrooms"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bathrooms *</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="1.5" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={propertyForm.control}
                              name="totalUnits"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Total Units *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={propertyForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Optional property description" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={propertyForm.control}
                            name="neighborhood"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Neighborhood</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Optional neighborhood name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={propertyForm.control}
                            name="amenities"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amenities</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Pool, Gym, Parking" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={propertyForm.control}
                            name="petPolicy"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pet Policy</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Cats and dogs allowed" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={propertyForm.control}
                            name="floorPlans"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Floor Plans</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Link or description" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                              control={propertyForm.control}
                              name="latitude"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Latitude</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="33.74900" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={propertyForm.control}
                              name="longitude"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Longitude</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="-84.38800" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsPropertyDialogOpen(false)}
                              disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              className="bg-primary hover:bg-primary/90"
                              disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}
                            >
                              {createPropertyMutation.isPending || updatePropertyMutation.isPending ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              ) : null}
                              {editingProperty ? "Update" : "Create"} Property
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  <SearchBox placeholder="Search properties" onChange={setPropertySearch} />
                </div>

                {/* Properties List */}
                <div className="space-y-4">
                  {properties.data
                    ?.filter((p: Property) =>
                      p.name.toLowerCase().includes(propertySearch.toLowerCase())
                    )
                    .map((property: Property) => {
                    const propertyUnits = units.data?.filter((unit: Unit) => unit.propertyId === property.id) || [];
                    const isExpanded = expandedProperties.has(property.id);

                    return (
                      <Card key={property.id} className="border-2 border-gray-200 hover:border-blue-300 transition-all">
                        <Collapsible open={isExpanded} onOpenChange={() => togglePropertyExpansion(property.id)}>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="bg-blue-100 p-2 rounded-lg">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <PropertyThumbnail property={property} />
                                  <div>
                                    <CardTitle className="text-xl font-semibold text-gray-900">
                                      {property.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {property.address}, {property.city}, {property.state}
                                      </span>
                                      {property.totalUnits === 1 && (
                                        <span>{`${property.bedrooms} bed • ${property.bathrooms} bath`}</span>
                                      )}
                                      <span>{property.totalUnits} units</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPhotoManagerProperty(property);
                                    }}
                                    className="text-gray-600 hover:text-green-600"
                                    title="Manage Photos"
                                  >
                                    <Camera className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openPropertyDialog(property);
                                    }}
                                    className="text-gray-600 hover:text-blue-600"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Units ({propertyUnits.length})
                                  </h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openUnitDialog(undefined, property.id)}
                                    className="text-xs"
                                    disabled={createUnitMutation.isPending}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Unit
                                  </Button>
                                </div>

                                {units.isLoading ? (
                                  <div className="flex items-center justify-center py-6">
                                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                                    <span className="ml-2 text-gray-600">Loading units...</span>
                                  </div>
                                ) : propertyUnits.length === 0 ? (
                                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                                    <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 mb-3">No units added yet</p>
                                    <Button
                                      size="sm"
                                      onClick={() => openUnitDialog(undefined, property.id)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                      disabled={createUnitMutation.isPending}
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add First Unit
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {propertyUnits.map((unit: Unit) => (
                                      <div
                                        key={unit.id}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                          unit.isAvailable
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-red-200 bg-red-50'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <div className={`p-1 rounded ${
                                              unit.isAvailable ? 'bg-green-100' : 'bg-red-100'
                                            }`}>
                                              {unit.isAvailable ? (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                              ) : (
                                                <XCircle className="w-4 h-4 text-red-600" />
                                              )}
                                            </div>
                                            <span className="font-medium text-gray-900">
                                              Unit {unit.unitNumber}
                                            </span>
                                          </div>
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => openUnitDialog(unit)}
                                              className="h-8 w-8 p-0"
                                              disabled={updateUnitMutation.isPending}
                                            >
                                              <Edit className="w-3 h-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => toggleUnitAvailability(unit.id, unit.isAvailable)}
                                              className="h-8 w-8 p-0"
                                              disabled={updateUnitMutation.isPending}
                                            >
                                              {unit.isAvailable ? (
                                                <EyeOff className="w-3 h-3" />
                                              ) : (
                                                <Eye className="w-3 h-3" />
                                              )}
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => deleteUnit(unit.id)}
                                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                              disabled={deleteUnitMutation.isPending}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <Badge
                                              variant={unit.isAvailable ? "default" : "secondary"}
                                              className={unit.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                                            >
                                              {unit.isAvailable ? "Available" : "Not Available"}
                                            </Badge>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Bed/Bath:</span>
                                            <span className="text-gray-900">
                                              {unit.bedrooms} bed • {unit.bathrooms} bath
                                            </span>
                                          </div>
                                          
                                          {unit.rent && (
                                            <div className="flex items-center justify-between">
                                              <span className="text-gray-600">Rent:</span>
                                              <span className="font-medium text-gray-900 flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                {(unit.rent / 100).toLocaleString()}/mo
                                              </span>
                                            </div>
                                          )}

                                          {unit.availableDate && (
                                            <div className="flex items-center justify-between">
                                              <span className="text-gray-600">Available:</span>
                                              <span className="text-gray-900 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(unit.availableDate).toLocaleDateString()}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}

            {/* Unit Dialog */}
            <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingUnit ? "Edit Unit" : "Add New Unit"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...unitForm}>
                  <form onSubmit={unitForm.handleSubmit(onUnitSubmit)} className="space-y-4">
                    <FormField
                      control={unitForm.control}
                      name="propertyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property *</FormLabel>
                          <FormControl>
                            <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                              <SelectContent>
                                {properties.data
                                  ?.filter((p: Property) =>
                                    p.name.toLowerCase().includes(propertySearch.toLowerCase())
                                  )
                                  .map((property: Property) => (
                                    <SelectItem key={property.id} value={property.id.toString()}>
                                      {property.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={unitForm.control}
                      name="unitNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="101" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={unitForm.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={unitForm.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={unitForm.control}
                      name="rent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Rent</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              placeholder="1500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {isAvailableWatch && (
                      <FormField
                        control={unitForm.control}
                        name="availableDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={unitForm.control}
                      name="isAvailable"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Available for Rent</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsUnitDialogOpen(false)}
                        disabled={createUnitMutation.isPending || updateUnitMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={createUnitMutation.isPending || updateUnitMutation.isPending}
                      >
                        {createUnitMutation.isPending || updateUnitMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        {editingUnit ? "Update" : "Create"} Unit
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            {leadSubmissions.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
                  <span className="text-gray-600">Loading lead submissions...</span>
                </div>
              </div>
            ) : leadSubmissions.isError ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-red-800 font-medium mb-2">Failed to load lead submissions</h3>
                  <p className="text-red-600 text-sm mb-4">
                    {leadSubmissions.error?.message || "Unable to fetch lead data. Please check your connection and try again."}
                  </p>
                  <Button 
                    onClick={() => leadSubmissions.refetch()} 
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">Lead Submissions</h2>
                      <p className="text-sm text-gray-600">View and manage prospective tenant inquiries</p>
                    </div>
                  </div>
                  <SearchBox placeholder="Search leads" onChange={setLeadSearch} />
                </div>

                <div className="grid gap-4">
                  {leadSubmissions.data?.filter((l: LeadSubmission) =>
                    l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
                    l.email.toLowerCase().includes(leadSearch.toLowerCase())
                  ).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No lead submissions yet</p>
                    </div>
                  ) : (
                    leadSubmissions.data
                      ?.filter((l: LeadSubmission) =>
                        l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
                        l.email.toLowerCase().includes(leadSearch.toLowerCase())
                      )
                      .map((submission: LeadSubmission) => (
                      <Card key={submission.id} className="border-2 border-gray-200 hover:border-green-300 transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <Users className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{submission.name}</h3>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {submission.email}
                                </p>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>Submitted</p>
                              <p>{submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Unknown'}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            {submission.moveInDate && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Move-in Date</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(submission.moveInDate).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            {submission.desiredBedrooms && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Desired Bedrooms</p>
                                <p className="text-sm text-gray-600">{submission.desiredBedrooms}</p>
                              </div>
                            )}
                          </div>
                          
                          {submission.additionalInfo && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-1">Additional Information</p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {submission.additionalInfo}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                              <Mail className="w-4 h-4 mr-2" />
                              Contact
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className={
                                submission.contacted
                                  ? "text-gray-500 border-gray-200"
                                  : "text-blue-600 border-blue-200 hover:bg-blue-50"
                              }
                              onClick={async () => {
                                const response = await fetch(`/api/lead-submissions/${submission.id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ contacted: !submission.contacted }),
                                  credentials: "include",
                                });
                                if (response.ok) {
                                  leadSubmissions.refetch();
                                }
                              }}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              {submission.contacted ? "Mark Uncontacted" : "Mark Contacted"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </TabsContent>
          <TabsContent value="branding" className="space-y-6">
            <BrandingForm />
          </TabsContent>
        </Tabs>
      </div>

      {/* Photo Manager Modal */}
      {photoManagerProperty && (
        <PhotoManager
          property={photoManagerProperty}
          units={units.data?.filter((unit: Unit) => unit.propertyId === photoManagerProperty.id) || []}
          onClose={() => setPhotoManagerProperty(null)}
        />
      )}
    </div>
  );
}