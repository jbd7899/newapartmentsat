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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertPropertySchema, insertUnitSchema } from "@shared/schema";
import type { Property, Unit, LeadSubmission } from "@shared/schema";
import { Plus, Edit, Trash, Upload } from "lucide-react";
import { z } from "zod";

export default function Admin() {
  const { toast } = useToast();
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

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

  const openUnitDialog = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      unitForm.reset({
        ...unit,
        availableDate: unit.availableDate ? new Date(unit.availableDate) : null,
      });
    } else {
      setEditingUnit(null);
      unitForm.reset();
    }
    setIsUnitDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-warm">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage properties, units, and view lead submissions</p>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
            <TabsTrigger value="leads">Lead Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-neutral">Properties</h2>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertiesLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading properties...</p>
                </div>
              ) : (
                properties.map((property) => (
                  <Card key={property.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{property.name}</span>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPropertyDialog(property)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {property.address}, {property.city}, {property.state}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`}</span>
                        <span>{property.bathrooms} bath</span>
                        <span>{property.totalUnits} units</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="units" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-neutral">Units</h2>
              <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openUnitDialog()} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Unit
                  </Button>
                </DialogTrigger>
                <DialogContent>
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
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
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
                              <Input {...field} />
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
                            <FormLabel>Rent (in cents)</FormLabel>
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
                        control={unitForm.control}
                        name="isAvailable"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Available</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsUnitDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90">
                          {editingUnit ? "Update" : "Create"} Unit
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {unitsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading units...</p>
                </div>
              ) : (
                units.map((unit) => {
                  const property = properties.find(p => p.id === unit.propertyId);
                  return (
                    <Card key={unit.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">Unit {unit.unitNumber}</span>
                            <span className="text-sm text-muted-foreground">
                              {property?.name || `Property ${unit.propertyId}`}
                            </span>
                            <Badge variant={unit.isAvailable ? "default" : "secondary"}>
                              {unit.isAvailable ? "Available" : "Leased"}
                            </Badge>
                            {unit.rent && (
                              <span className="text-sm text-muted-foreground">
                                ${(unit.rent / 100).toLocaleString()}/month
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUnitDialog(unit)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <h2 className="text-2xl font-semibold text-neutral">Lead Submissions</h2>
            
            <div className="space-y-4">
              {leadsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading leads...</p>
                </div>
              ) : leads.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No lead submissions yet.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                leads.map((lead) => (
                  <Card key={lead.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{lead.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(lead.submittedAt!).toLocaleDateString()}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Email:</strong> {lead.email}</p>
                        {lead.moveInDate && (
                          <p><strong>Move-in Date:</strong> {new Date(lead.moveInDate).toLocaleDateString()}</p>
                        )}
                        {lead.desiredBedrooms && (
                          <p><strong>Desired Bedrooms:</strong> {lead.desiredBedrooms}</p>
                        )}
                        {lead.additionalInfo && (
                          <p><strong>Additional Info:</strong> {lead.additionalInfo}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
