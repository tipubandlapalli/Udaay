import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/LoginScreen";
import HomeScreen from "./pages/HomeScreen";
import IssueDetailScreen from "./pages/IssueDetailScreen";
import TicketsScreen from "./pages/TicketsScreen";
import ProfileScreen from "./pages/ProfileScreen";
import MapScreen from "./pages/MapScreen";
import ReportScreen from "./pages/ReportScreen";
import OfficerDashboard from "./pages/OfficerDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import useScrollToTop from "./hooks/use-scroll-to-top";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/home" element={<MapScreen />} />
          <Route path="/issues" element={<HomeScreen />} />
          <Route path="/issues/:id" element={<IssueDetailScreen />} />
          <Route path="/report" element={<ProtectedRoute><ReportScreen /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><TicketsScreen /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><TicketsScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/officer" element={<ProtectedRoute><OfficerDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
