import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { insertBrandingSchema, type Branding } from "@shared/schema";
import { useBranding } from "@/hooks/useBranding";

export default function BrandingForm() {
  const { data: branding } = useBranding();
  const queryClient = useQueryClient();

  const form = useForm<Partial<Branding>>({
    resolver: zodResolver(insertBrandingSchema.partial()),
    defaultValues: {
      companyName: "",
      logoUrl: "",
      primaryColor: "#2563eb",
      secondaryColor: "#4f46e5",
      cities: [],
      header: "",
      subtitle: "",
      footerText: "",
    },
  });

  useEffect(() => {
    if (branding) {
      form.reset(branding);
    }
  }, [branding, form]);

  const mutation = useMutation({
    mutationFn: async (values: Partial<Branding>) => {
      return apiRequest("/api/branding", "PUT", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branding"] });
    },
    onError: (error) => {
      console.error("Branding update failed:", error);
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className="space-y-4 max-w-xl"
    >
      <div>
        <Label>Company Name</Label>
        <Input {...form.register("companyName")} />
      </div>
      <div>
        <Label>Logo URL</Label>
        <Input {...form.register("logoUrl")} />
      </div>
      <div>
        <Label>Primary Color</Label>
        <Input type="color" {...form.register("primaryColor")} />
      </div>
      <div>
        <Label>Secondary Color</Label>
        <Input type="color" {...form.register("secondaryColor")} />
      </div>
      <div>
        <Label>Cities (comma separated)</Label>
        <Input {...form.register("cities", { 
          setValueAs: (v) => {
            if (!v || typeof v !== 'string') return [];
            return v.split(',').map((c) => c.trim()).filter(Boolean);
          }
        })} />
      </div>
      <div>
        <Label>Header</Label>
        <Input {...form.register("header")} />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Textarea {...form.register("subtitle")} />
      </div>
      <div>
        <Label>Footer Text</Label>
        <Textarea {...form.register("footerText")} />
      </div>
      <Button type="submit" disabled={mutation.isPending} className="bg-primary text-white hover:bg-primary/90">
        Save Branding
      </Button>
    </form>
  );
}
