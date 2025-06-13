import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import MapSection from "@/components/map-section";
import PropertyGrid from "@/components/property-grid";
import ApartmentFinder from "@/components/apartment-finder";
import NeighborhoodSection from "@/components/neighborhood-section";
import Footer from "@/components/footer";
import { useState } from "react";

export default function Home() {
  const [cityFilter, setCityFilter] = useState<string>("atlanta");
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <MapSection 
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        availabilityFilter={availabilityFilter}
        setAvailabilityFilter={setAvailabilityFilter}
      />
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
