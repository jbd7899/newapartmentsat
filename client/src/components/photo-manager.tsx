import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Upload, Image as ImageIcon, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Property, Unit } from "@shared/schema";

interface PhotoManagerProps {
  property: Property;
  units: Unit[];
  onClose: () => void;
}

interface PhotoData {
  exterior: string[];
  interior: string[];
  amenities: string[];
  units: Record<string, string[]>;
}

export default function PhotoManager({ property, units, onClose }: PhotoManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: photos, refetch } = useQuery<PhotoData>({
    queryKey: ['/api/photos/property', property.id],
    queryFn: () => apiRequest(`/api/photos/property/${property.id}`)
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      return response.json();
    },
    onSuccess: () => {
      refetch();
      // Invalidate property photos cache
      queryClient.invalidateQueries({ queryKey: ['/api/photos/property', property.id] });
      toast({ title: "Photos uploaded successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Upload failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (photoPath: string) => {
      return apiRequest('/api/photos', 'DELETE', { path: photoPath });
    },
    onSuccess: () => {
      refetch();
      // Invalidate property photos cache
      queryClient.invalidateQueries({ queryKey: ['/api/photos/property', property.id] });
      toast({ title: "Photo deleted successfully" });
    },
    onError: () => {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  });

  const handleFileUpload = async (files: FileList, type: string, unitId?: number) => {
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('photos', file);
    });

    formData.append('propertyId', property.id.toString());
    formData.append('propertyName', `${property.city.toLowerCase()}-${property.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
    formData.append('type', type);
    
    if (unitId) {
      const unit = units.find(u => u.id === unitId);
      formData.append('unitId', unitId.toString());
      formData.append('unitNumber', unit?.unitNumber || '');
    }

    try {
      await uploadMutation.mutateAsync(formData);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileUpload = (type: string, unitId?: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files) {
          handleFileUpload(target.files, type, unitId);
        }
      };
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent, type: string, unitId?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(`${type}-${unitId || 'property'}`);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, type: string, unitId?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Filter for image files only
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length > 0) {
        const dataTransfer = new DataTransfer();
        imageFiles.forEach(file => dataTransfer.items.add(file));
        handleFileUpload(dataTransfer.files, type, unitId);
      } else {
        toast({ 
          title: "Invalid file type", 
          description: "Please upload only image files (JPG, PNG, WebP)",
          variant: "destructive" 
        });
      }
    }
  };

  const PhotoGrid = ({ images, type, unitId }: { images: string[], type: string, unitId?: number }) => {
    const dropZoneId = `${type}-${unitId || 'property'}`;
    const isDragOver = dragOver === dropZoneId;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium capitalize">{type.replace('-', ' ')} Photos</h4>
          <Button
            size="sm"
            onClick={() => triggerFileUpload(type, unitId)}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
        </div>
        
        <div
          className={`border-2 border-dashed rounded-lg transition-colors relative ${
            isDragOver 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
              : "border-gray-300 dark:border-gray-600"
          }`}
          onDragOver={(e) => handleDragOver(e, type, unitId)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, type, unitId)}
        >
          {images.length > 0 ? (
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`${type} photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteMutation.mutate(image)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {isDragOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400 font-medium">
                    Drop images here to upload
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              {isDragOver ? (
                <div className="text-blue-600 dark:text-blue-400">
                  <Upload className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-medium">Drop images here to upload</p>
                </div>
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No {type.replace('-', ' ')} photos yet
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Drag and drop images here or click to upload
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => triggerFileUpload(type, unitId)}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Photo Manager</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {property.name} - {property.address}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="property" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="property">Property Photos</TabsTrigger>
              <TabsTrigger value="units">
                Unit Photos 
                <Badge variant="secondary" className="ml-2">
                  {units.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="property" className="space-y-6 mt-6">
              <PhotoGrid 
                images={photos?.exterior || []} 
                type="exterior" 
              />
              <PhotoGrid 
                images={photos?.interior || []} 
                type="interior" 
              />
              <PhotoGrid 
                images={photos?.amenities || []} 
                type="amenities" 
              />
            </TabsContent>
            
            <TabsContent value="units" className="space-y-6 mt-6">
              {units.map(unit => (
                <Card key={unit.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Unit {unit.unitNumber}
                      {unit.isAvailable ? (
                        <Badge variant="default" className="ml-2">Available</Badge>
                      ) : (
                        <Badge variant="secondary" className="ml-2">Occupied</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PhotoGrid 
                      images={photos?.units[unit.id] || []} 
                      type="unit" 
                      unitId={unit.id}
                    />
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}