import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, DoorOpen, AlertTriangle, Loader2 } from "lucide-react";
import { useDashboardStats, useRealtimeTable } from "@/hooks/useSupabaseData";
import type { Tables } from "@/integrations/supabase/types";

type OccurrenceRow = Tables<"occurrences">;

const SindicoDashboard = () => {
  const { stats, loading } = useDashboardStats();
  const { data: occurrences } = useRealtimeTable<OccurrenceRow>("occurrences", "created_at", false);

  const statCards = [
    { label: "Encomendas Pendentes", value: stats.pendingPackages, icon: Package, color: "text-primary" },
    { label: "Moradores Ativos", value: stats.activeResidents, icon: Users, color: "text-success" },
    { label: "Visitantes Hoje", value: stats.visitorsToday, icon: DoorOpen, color: "text-info" },
    { label: "Ocorrências Abertas", value: stats.openOccurrences, icon: AlertTriangle, color: "text-warning" },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard do Síndico</h1>
        <p className="text-muted-foreground">Visão geral do condomínio — atualizado em tempo real</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-muted p-2.5 ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Últimas Ocorrências</CardTitle></CardHeader>
        <CardContent>
          {occurrences.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma ocorrência registrada</p>
          ) : (
            <div className="space-y-3">
              {occurrences.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">{o.title}</p>
                    <p className="text-xs text-muted-foreground">{o.resident_name} · {o.block}/{o.unit}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
