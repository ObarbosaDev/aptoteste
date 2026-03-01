import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, DoorOpen, AlertTriangle, Loader2, TrendingUp } from "lucide-react";
import { useDashboardStats, useRealtimeTable } from "@/hooks/useSupabaseData";
import type { Tables } from "@/integrations/supabase/types";

type OccurrenceRow = Tables<"occurrences">;

const statConfig = [
  { label: "Encomendas Pendentes", icon: Package, bgClass: "bg-primary/10", textClass: "text-primary" },
  { label: "Moradores Ativos", icon: Users, bgClass: "bg-success/10", textClass: "text-success" },
  { label: "Visitantes Hoje", icon: DoorOpen, bgClass: "bg-info/10", textClass: "text-info" },
  { label: "Ocorrências Abertas", icon: AlertTriangle, bgClass: "bg-warning/10", textClass: "text-warning" },
];

const SindicoDashboard = () => {
  const { stats, loading } = useDashboardStats();
  const { data: occurrences } = useRealtimeTable<OccurrenceRow>("occurrences", "created_at", false);

  const statValues = [stats.pendingPackages, stats.activeResidents, stats.visitorsToday, stats.openOccurrences];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <h1>Dashboard do Síndico</h1>
        <p>Visão geral do condomínio — atualizado em tempo real</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statConfig.map((s, i) => (
          <Card key={s.label} className="shadow-card hover:shadow-card-hover transition-shadow duration-300 border-0 overflow-hidden group">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`stat-icon ${s.bgClass} ${s.textClass} group-hover:scale-110 transition-transform duration-300`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{statValues[i]}</p>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card border-0">
        <CardHeader className="flex-row items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-heading">Últimas Ocorrências</CardTitle>
        </CardHeader>
        <CardContent>
          {occurrences.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma ocorrência registrada</p>
          ) : (
            <div className="space-y-2.5">
              {occurrences.slice(0, 5).map((o, i) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl border bg-muted/30 p-4 hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div>
                    <p className="font-semibold text-sm">{o.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{o.resident_name} · {o.block}/{o.unit}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    o.status === "aberta" ? "bg-destructive/10 text-destructive" :
                    o.status === "em_andamento" ? "bg-warning/10 text-warning" :
                    "bg-success/10 text-success"
                  }`}>
                    {o.status === "em_andamento" ? "Em andamento" : o.status === "aberta" ? "Aberta" : "Resolvida"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SindicoDashboard;
