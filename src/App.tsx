import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import AppErrorBoundary from "./components/AppErrorBoundary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function GlobalErrorHandlers() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      toast.error("Erro inesperado ao processar sua ação.");
      event.preventDefault();
    };

    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Unhandled error:", event.error || event.message);
      toast.error("Erro inesperado na tela. Tente novamente.");
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
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
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GlobalErrorHandlers />
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
