import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import MapSection from "@/components/map-section";
import PropertyGrid from "@/components/property-grid";
import ApartmentFinder from "@/components/apartment-finder";
import NeighborhoodSection from "@/components/neighborhood-section";
import Footer from "@/components/footer";
import { useState } from "react";

export default function Home() {
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection 
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        availabilityFilter={availabilityFilter}
        setAvailabilityFilter={setAvailabilityFilter}
      />
      <MapSection />
      <PropertyGrid 
        cityFilter={cityFilter}
        availabilityFilter={availabilityFilter}
      />
      <ApartmentFinder />
      <NeighborhoodSection />
      <Footer />
    </div>
  );
}
