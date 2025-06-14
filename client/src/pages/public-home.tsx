import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useBranding } from "@/hooks/useBranding";
import MapSection from "@/components/map-section";
import PropertyGrid from "@/components/property-grid";
import ApartmentFinder from "@/components/apartment-finder";
import NeighborhoodSection from "@/components/neighborhood-section";
import Footer from "@/components/footer";

export default function PublicHome() {
  const { data: branding } = useBranding();
  const [cityFilter, setCityFilter] = useState<string>("atlanta");
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building className="h-8 w-8" style={{ color: branding?.primaryColor || "#2563eb" }} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {branding?.companyName || "UrbanLiving"}
            </span>
          </div>
          <Link href="/">
            <Button size="sm" style={{ backgroundColor: branding?.primaryColor || "#2563eb" }} className="hover:opacity-90 text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </header>
      <MapSection
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        availabilityFilter={availabilityFilter}
        setAvailabilityFilter={setAvailabilityFilter}
      />
      <PropertyGrid cityFilter={cityFilter} availabilityFilter={availabilityFilter} />
      <ApartmentFinder />
      <NeighborhoodSection />
      <Footer />
    </div>
  );
}
