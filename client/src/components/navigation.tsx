import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";

interface NavItem {
  href: string;
  label: string;
}

interface NavigationProps {
  navItems?: NavItem[];
}

export default function Navigation({ navItems }: NavigationProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { data: branding } = useBranding();

  const items: NavItem[] = navItems || [{ href: "/", label: "Properties" }];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="text-xl font-bold cursor-pointer" style={{ color: branding?.primaryColor || "#2563eb" }}>
                {branding?.companyName || "UrbanLiving"}
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                    {item.label}
                  </span>
                </Link>
              ))}
              <Link href="/admin">
                <Button className="bg-primary text-white hover:bg-primary/90 transition-colors">
                  Admin
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <span 
                        className="text-foreground hover:text-primary text-lg font-medium cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </span>
                    </Link>
                  ))}
                  <Link href="/admin">
                    <Button 
                      className="bg-primary text-white hover:bg-primary/90 w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
