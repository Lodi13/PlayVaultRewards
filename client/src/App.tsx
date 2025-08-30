import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Surveys from "@/pages/surveys";
import Games from "@/pages/games";
import Rewards from "@/pages/rewards";
import Referrals from "@/pages/referrals";
import Leaderboard from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/Navigation";
import MobileNav from "@/components/MobileNav";
import XPNotification from "@/components/XPNotification";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/surveys" component={Surveys} />
          <Route path="/games" component={Games} />
          <Route path="/rewards" component={Rewards} />
          <Route path="/referrals" component={Referrals} />
          <Route path="/leaderboard" component={Leaderboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isLoading && isAuthenticated && (
        <>
          <Navigation />
          <MobileNav />
        </>
      )}
      <Router />
      <XPNotification />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
