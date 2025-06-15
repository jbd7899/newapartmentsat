import { useState } from "react";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import MapSection from "@/components/map-section";
import PropertyGrid from "@/components/property-grid";
import ApartmentFinder from "@/components/apartment-finder";
import NeighborhoodSection from "@/components/neighborhood-section";
import Footer from "@/components/footer";

export default function PublicHome() {
  const [cityFilter, setCityFilter] = useState<string>("atlanta");
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean>(true);

  const navItems = [
    { href: "#properties", label: "Properties" },
    { href: "#neighborhoods", label: "Neighborhoods" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation navItems={navItems} />
      <HeroSection />
      <MapSection
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        availabilityFilter={availabilityFilter}
        setAvailabilityFilter={setAvailabilityFilter}
      />
      <div id="properties">
        <PropertyGrid cityFilter={cityFilter} availabilityFilter={availabilityFilter} />
      </div>
      <div id="contact">
        <ApartmentFinder />
      </div>
      <div id="neighborhoods">
        <NeighborhoodSection />
      </div>
      <Footer />
    </div>
  );
}
