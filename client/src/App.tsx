import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/missions" component={MissionPlanning} />
      <Route path="/fleet" component={FleetManagement} />
      <Route path="/monitor" component={MissionMonitoring} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Router />
      </AppShell>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
