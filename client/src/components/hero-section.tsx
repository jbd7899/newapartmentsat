

import { Button } from "@/components/ui/button";
import { useBranding } from "@/hooks/useBranding";
import { Link } from "wouter";

export default function HeroSection() {
  const { data: branding } = useBranding();
  return (
    <section className="relative warm-gradient py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            {branding?.header || "Unique and architecturally charming"}
            <br />
            <span className="text-primary">
              {branding?.companyName || "urban living"}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {branding?.subtitle ||
              "Family owned and managed rental properties in vibrant urban neighborhoods."}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="#properties">
              <Button className="bg-primary text-white hover:bg-primary/90">
                View Properties
              </Button>
            </Link>
            <Link href="#contact">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
