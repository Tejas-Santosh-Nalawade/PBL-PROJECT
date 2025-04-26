import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from 'next-themes';
import Dashboard from "@/pages/dashboard";
import QuestionPapers from "@/pages/question-papers";
import StudyResources from "@/pages/study-resources";
import AiAssistant from "@/pages/ai-assistant";
import Community from "@/pages/community";
import VideoResources from "@/pages/video-resources";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/question-papers" component={QuestionPapers} />
      <ProtectedRoute path="/study-resources" component={StudyResources} />
      <ProtectedRoute path="/ai-assistant" component={AiAssistant} />
      <ProtectedRoute path="/community" component={Community} />
      <ProtectedRoute path="/video-resources" component={VideoResources} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/settings" component={Settings} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
