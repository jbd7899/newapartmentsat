import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import PropertyDetail from "@/pages/property-detail";
import Admin from "@/pages/admin";
import PublicHome from "@/pages/public-home";
import NotFound from "@/pages/not-found";
import { useApplyBranding } from "@/hooks/useApplyBranding";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={PublicHome} />
      <Route path="/property/:id" component={PropertyDetail} />
      {isLoading || !isAuthenticated ? (
        <Route path="/admin" component={Landing} />
      ) : (
        <>
          <Route path="/admin/dashboard" component={Admin} />
          <Route path="/admin" component={Home} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  useApplyBranding();
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
