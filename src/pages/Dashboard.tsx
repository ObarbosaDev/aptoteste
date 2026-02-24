import { useAuth } from "@/contexts/AuthContext";
import SindicoDashboard from "@/components/dashboards/SindicoDashboard";
import PorteiroDashboard from "@/components/dashboards/PorteiroDashboard";
import MoradorDashboard from "@/components/dashboards/MoradorDashboard";

const Dashboard = () => {
  const { role, profile } = useAuth();
  if (!role) return null;

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
