import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  cityFilter: string;
  setCityFilter: (city: string) => void;
  availabilityFilter: boolean;
  setAvailabilityFilter: (available: boolean) => void;
}

export default function HeroSection({
  cityFilter,
  setCityFilter,
  availabilityFilter,
  setAvailabilityFilter,
}: HeroSectionProps) {
  return (
    <section className="relative warm-gradient py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Unique and architecturally charming<br />
            <span className="text-primary">urban living</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Family owned and managed rental properties in vibrant urban neighborhoods.
          </p>

          {/* City Selector & Availability Filter */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center space-x-4 bg-white p-2 rounded-xl shadow-sm">
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="border-0 bg-transparent text-foreground font-medium focus:ring-0 focus:outline-none min-w-[120px]">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="atlanta">Atlanta, GA</SelectItem>
                  <SelectItem value="dallas">Dallas, TX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4 bg-white p-2 rounded-xl shadow-sm">
              <Button
                variant={availabilityFilter ? "default" : "ghost"}
                size="sm"
                onClick={() => setAvailabilityFilter(true)}
                className={availabilityFilter ? "bg-primary text-white" : "text-foreground hover:bg-gray-100"}
              >
                Available
              </Button>
              <Button
                variant={!availabilityFilter ? "default" : "ghost"}
                size="sm"
                onClick={() => setAvailabilityFilter(false)}
                className={!availabilityFilter ? "bg-primary text-white" : "text-foreground hover:bg-gray-100"}
              >
                Not Available
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
