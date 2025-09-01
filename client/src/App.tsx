import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import Home from "@/pages/home";
import Designs from "@/pages/designs";
import Dashboard from "@/pages/dashboard";
import Signin from "@/pages/signin";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Admin from "@/pages/admin";

import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Restrictions from "@/pages/restrictions";
import Checkout from "@/pages/checkout";
import OrderSuccess from "@/pages/order-success";
import PaymentFailed from "@/pages/payment-failed";
import NotFound from "@/pages/not-found";

function Router() {
  // Initialize visitor tracking
  useVisitorTracking();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/designs" component={Designs} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/signin" component={Signin} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/admin" component={Admin} />

      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/restrictions" component={Restrictions} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-success" component={OrderSuccess} />
      <Route path="/payment-failed/:reason?" component={PaymentFailed} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
