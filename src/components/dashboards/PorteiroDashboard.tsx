import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DoorOpen, QrCode, Loader2 } from "lucide-react";
import { useDashboardStats, useRealtimeTable } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type PackageRow = Tables<"packages">;

const PorteiroDashboard = () => {
  const navigate = useNavigate();
  const { stats, loading } = useDashboardStats();
  const { data: packages } = useRealtimeTable<PackageRow>("packages", "received_at", false);
  const pendingPkgs = packages.filter((p) => p.status === "pendente");

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <h1>Painel do Porteiro</h1>
        <p>Ações rápidas e resumo do dia — tempo real</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button className="h-auto flex-col gap-3 py-8 gradient-primary border-0 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow rounded-xl" onClick={() => navigate("/encomendas")}>
          <Package className="h-7 w-7" /><span className="font-semibold">Registrar Encomenda</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-3 py-8 hover:bg-muted/50 rounded-xl border-2 transition-all hover:border-primary/30" onClick={() => navigate("/visitantes")}>
          <DoorOpen className="h-7 w-7" /><span className="font-semibold">Registrar Visitante</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-3 py-8 hover:bg-muted/50 rounded-xl border-2 transition-all hover:border-primary/30" onClick={() => navigate("/encomendas")}>
          <QrCode className="h-7 w-7" /><span className="font-semibold">Validar QR Code</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="shadow-card border-0 hover:shadow-card-hover transition-shadow duration-300">
          <CardContent className="p-5"><div className="flex items-center gap-4">
            <div className="stat-icon bg-primary/10 text-primary"><Package className="h-5 w-5" /></div>
            <div><p className="text-2xl font-heading font-bold">{stats.pendingPackages}</p><p className="text-xs text-muted-foreground font-medium">Encomendas pendentes</p></div>
          </div></CardContent>
        </Card>
        <Card className="shadow-card border-0 hover:shadow-card-hover transition-shadow duration-300">
          <CardContent className="p-5"><div className="flex items-center gap-4">
            <div className="stat-icon bg-info/10 text-info"><DoorOpen className="h-5 w-5" /></div>
            <div><p className="text-2xl font-heading font-bold">{stats.visitorsToday}</p><p className="text-xs text-muted-foreground font-medium">Visitantes hoje</p></div>
          </div></CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-0">
        <CardContent className="p-6">
          <h3 className="text-base font-heading font-bold mb-4">Encomendas Pendentes</h3>
          {pendingPkgs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma encomenda pendente</p>
          ) : (
            <div className="space-y-2.5">
              {pendingPkgs.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border bg-muted/30 p-4 hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div>
                    <p className="font-semibold text-sm">{p.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.resident_name} · {p.block}/{p.unit} · {p.type}</p>
                  </div>
                  <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">Pendente</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PorteiroDashboard;
