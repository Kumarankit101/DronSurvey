import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppShell from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import MissionPlanning from "@/pages/MissionPlanning";
import FleetManagement from "@/pages/FleetManagement";
import MissionMonitoring from "@/pages/MissionMonitoring";
import Reports from "@/pages/Reports";
import Home from "@/pages/Home";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Protected routes for authenticated users
function AuthenticatedRoutes() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/missions" component={MissionPlanning} />
        <Route path="/fleet" component={FleetManagement} />
        <Route path="/monitor" component={MissionMonitoring} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

// Main router component that decides what to render based on auth state
function MainRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show authentication page for non-logged in users
  if (!isAuthenticated) {
    return <Home />;
  }

  // Show authenticated routes for logged in users
  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
