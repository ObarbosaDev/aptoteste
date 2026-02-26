import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Encomendas from "./pages/Encomendas";
import Visitantes from "./pages/Visitantes";
import Reservas from "./pages/Reservas";
import Avisos from "./pages/Avisos";
import Ocorrencias from "./pages/Ocorrencias";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/encomendas" element={<Encomendas />} />
      <Route path="/visitantes" element={<Visitantes />} />
      <Route path="/reservas" element={<Reservas />} />
      <Route path="/avisos" element={<Avisos />} />
      <Route path="/ocorrencias" element={<Ocorrencias />} />
      <Route path="/perfil" element={<Profile />} />
      <Route path="/pessoas" element={<UserManagement />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
