import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  Plus, 
  Edit, 
  Trash, 
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
  Camera
} from "lucide-react";
import { z } from "zod";

export default function Admin() {
  const { toast } = useToast();
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [expandedProperties, setExpandedProperties] = useState<Set<number>>(new Set());
  const [selectedPropertyForUnit, setSelectedPropertyForUnit] = useState<number | null>(null);

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: units = [], isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<LeadSubmission[]>({
    queryKey: ["/api/lead-submissions"],
  });

  const propertyForm = useForm({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      bedrooms: 0,
      bathrooms: "",
      totalUnits: 1,
      description: "",
      neighborhood: "",
      images: [],
      latitude: "",
      longitude: "",
    },
  });

  const unitForm = useForm({
    resolver: zodResolver(insertUnitSchema),
    defaultValues: {
      propertyId: 0,
      unitNumber: "",
      isAvailable: false,
      availableDate: null,
      rent: 0,
      images: [],
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertPropertySchema>) => {
      const response = await apiRequest("POST", "/api/properties", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setIsPropertyDialogOpen(false);
      propertyForm.reset();
      toast({ title: "Success", description: "Property created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create property", variant: "destructive" });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<z.infer<typeof insertPropertySchema>> }) => {
      const response = await apiRequest("PUT", `/api/properties/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setIsPropertyDialogOpen(false);
      setEditingProperty(null);
      propertyForm.reset();
      toast({ title: "Success", description: "Property updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update property", variant: "destructive" });
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertUnitSchema>) => {
      const response = await apiRequest("POST", "/api/units", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      setIsUnitDialogOpen(false);
      unitForm.reset();
      toast({ title: "Success", description: "Unit created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create unit", variant: "destructive" });
    },
  });

  const updateUnitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<z.infer<typeof insertUnitSchema>> }) => {
      const response = await apiRequest("PUT", `/api/units/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      setIsUnitDialogOpen(false);
      setEditingUnit(null);
      unitForm.reset();
      toast({ title: "Success", description: "Unit updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update unit", variant: "destructive" });
    },
  });

  const onPropertySubmit = (data: z.infer<typeof insertPropertySchema>) => {
    if (editingProperty) {
      updatePropertyMutation.mutate({ id: editingProperty.id, data });
    } else {
      createPropertyMutation.mutate(data);
    }
  };

  const onUnitSubmit = (data: z.infer<typeof insertUnitSchema>) => {
    if (editingUnit) {
      updateUnitMutation.mutate({ id: editingUnit.id, data });
    } else {
      createUnitMutation.mutate(data);
    }
  };

  const openPropertyDialog = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      propertyForm.reset(property);
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
        availableDate: unit.availableDate ? new Date(unit.availableDate).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingUnit(null);
      unitForm.reset({
        propertyId: propertyId || 0,
        unitNumber: "",
        isAvailable: false,
        availableDate: '',
        rent: 0,
        images: [],
      });
    }
    setSelectedPropertyForUnit(propertyId || null);
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage properties, units, and view lead submissions</p>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
            <TabsTrigger value="properties" className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <Building2 className="w-4 h-4" />
              Properties & Units
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
              <Users className="w-4 h-4" />
              Lead Submissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-6">
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
                  <Button onClick={() => openPropertyDialog()} className="bg-primary hover:bg-primary/90">
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
                              <FormLabel>Property Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={propertyForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="GA">GA</SelectItem>
                                    <SelectItem value="TX">TX</SelectItem>
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
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={propertyForm.control}
                          name="bedrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bedrooms</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                              <FormLabel>Bathrooms</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 1.5, 2" />
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
                              <FormLabel>Total Units</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                              <Textarea {...field} />
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
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsPropertyDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90">
                          {editingProperty ? "Update" : "Create"} Property
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {propertiesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading properties...</p>
                </div>
              ) : (
                properties.map((property) => {
                  const propertyUnits = units.filter(unit => unit.propertyId === property.id);
                  const availableUnits = propertyUnits.filter(unit => unit.isAvailable);
                  const isExpanded = expandedProperties.has(property.id);

                  return (
                    <Card key={property.id} className="overflow-hidden border-l-4 border-l-blue-500">
                      <Collapsible open={isExpanded} onOpenChange={() => togglePropertyExpansion(property.id)}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <Home className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg font-semibold text-gray-900">
                                    {property.name}
                                  </CardTitle>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{property.address}, {property.city}, {property.state}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                      {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`}
                                    </span>
                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                      {property.bathrooms} bath
                                    </span>
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                      {availableUnits.length}/{property.totalUnits} available
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPropertyDialog(property);
                                  }}
                                  className="bg-white hover:bg-gray-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openUnitDialog(undefined, property.id);
                                  }}
                                  className="bg-green-50 text-green-600 hover:bg-green-100"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Unit
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
                              </div>

                              {propertyUnits.length === 0 ? (
                                <div className="text-center py-6 bg-gray-50 rounded-lg">
                                  <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                  <p className="text-gray-500 mb-3">No units added yet</p>
                                  <Button
                                    size="sm"
                                    onClick={() => openUnitDialog(undefined, property.id)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Unit
                                  </Button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {propertyUnits.map((unit) => (
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
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toggleUnitAvailability(unit.id, unit.isAvailable)}
                                            className="h-8 w-8 p-0"
                                          >
                                            {unit.isAvailable ? (
                                              <EyeOff className="w-3 h-3" />
                                            ) : (
                                              <Eye className="w-3 h-3" />
                                            )}
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

                                        <div className="pt-2 border-t">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full text-xs"
                                            onClick={() => openUnitDialog(unit)}
                                          >
                                            <Camera className="w-3 h-3 mr-1" />
                                            Manage Photos
                                          </Button>
                                        </div>
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
                })
              )}
            </div>

            {/* Unit Dialog */}
            <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
              <DialogContent className="max-w-md">
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
                          <FormLabel>Property</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value?.toString()}
                              disabled={!!selectedPropertyForUnit}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                              <SelectContent>
                                {properties.map((property) => (
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
                          <FormLabel>Unit Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 101, A1, etc." />
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
                          <FormLabel>Monthly Rent ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="1200"
                              onChange={(e) => field.onChange(parseInt(e.target.value) * 100 || 0)}
                              value={field.value ? field.value / 100 : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={unitForm.control}
                      name="availableDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={unitForm.control}
                      name="isAvailable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Available for Rent
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Mark this unit as available for new tenants
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsUnitDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        {editingUnit ? "Update" : "Create"} Unit
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
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
            </div>

            {leadsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading lead submissions...</p>
              </div>
            ) : leadSubmissions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lead submissions yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  When potential tenants fill out your contact forms, their information will appear here for you to review and follow up.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {leadSubmissions.map((lead) => (
                  <Card key={lead.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <Users className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                              <p className="text-sm text-gray-600">New inquiry</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Email:</span>
                              <a 
                                href={`mailto:${lead.email}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {lead.email}
                              </a>
                            </div>
                            
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Phone:</span>
                                <a 
                                  href={`tel:${lead.phone}`}
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  {lead.phone}
                                </a>
                              </div>
                            )}
                          </div>

                          {lead.message && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Message:</h4>
                              <p className="text-gray-700 text-sm leading-relaxed">{lead.message}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Submitted {new Date(lead.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Reply
                          </Button>
                          {lead.phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`tel:${lead.phone}`, '_blank')}
                              className="bg-green-50 text-green-600 hover:bg-green-100"
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
