import { useAuth } from "@/contexts/AuthContext";
import SindicoDashboard from "@/components/dashboards/SindicoDashboard";
import PorteiroDashboard from "@/components/dashboards/PorteiroDashboard";
import MoradorDashboard from "@/components/dashboards/MoradorDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case "sindico":
      return <SindicoDashboard />;
    case "porteiro":
      return <PorteiroDashboard />;
    case "morador":
      return <MoradorDashboard />;
  }
};

export default Dashboard;
