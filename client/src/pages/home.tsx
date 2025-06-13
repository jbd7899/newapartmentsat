import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Users, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import MapSection from "@/components/map-section";
import PropertyGrid from "@/components/property-grid";
import ApartmentFinder from "@/components/apartment-finder";
import NeighborhoodSection from "@/components/neighborhood-section";
import Footer from "@/components/footer";

export default function Home() {
  const { user } = useAuth();
  const [cityFilter, setCityFilter] = useState<string>("atlanta");
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean>(true);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email;
    }
    return "User";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with User Info */}
      <header className="bg-white border-b shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">UrbanLiving</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profileImageUrl} alt={getUserDisplayName(user)} />
                  <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getUserDisplayName(user)}</p>
                  {user?.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {getUserDisplayName(user)}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your property portfolio and explore rental opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
