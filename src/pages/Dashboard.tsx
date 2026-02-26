import { useAuth } from "@/contexts/AuthContext";
import SindicoDashboard from "@/components/dashboards/SindicoDashboard";
import PorteiroDashboard from "@/components/dashboards/PorteiroDashboard";
import MoradorDashboard from "@/components/dashboards/MoradorDashboard";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { role, profile } = useAuth();

  if (!role) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  switch (role) {
    case "sindico":
      return <SindicoDashboard />;
    case "porteiro":
      return <PorteiroDashboard />;
    case "morador":
      return <MoradorDashboard userName={profile?.full_name || "Morador"} />;
  }
};

export default Dashboard;
