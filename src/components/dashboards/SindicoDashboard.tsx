import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, DoorOpen, AlertTriangle } from "lucide-react";
import { mockPackages, mockVisitors, mockOccurrences, packagesByMonth, occurrencesByType } from "@/data/mock";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(230,65%,52%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(0,72%,51%)", "hsl(199,89%,48%)"];

const SindicoDashboard = () => {
  const pendingPkgs = mockPackages.filter((p) => p.status === "pendente").length;
  const visitorsToday = mockVisitors.filter((v) => v.entryAt.startsWith("2026-02-23")).length;
  const openOccurrences = mockOccurrences.filter((o) => o.status !== "resolvida").length;

  const stats = [
    { label: "Encomendas Pendentes", value: pendingPkgs, icon: Package, color: "text-primary" },
    { label: "Moradores Ativos", value: 48, icon: Users, color: "text-success" },
    { label: "Visitantes Hoje", value: visitorsToday, icon: DoorOpen, color: "text-info" },
    { label: "Ocorrências Abertas", value: openOccurrences, icon: AlertTriangle, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard do Síndico</h1>
        <p className="text-muted-foreground">Visão geral do condomínio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-muted p-2.5 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Encomendas por Mês</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={packagesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(230,65%,52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Ocorrências por Tipo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={occurrencesByType} dataKey="total" nameKey="type" cx="50%" cy="50%" outerRadius={90} label={({ type }) => type}>
                  {occurrencesByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Últimas Ocorrências</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockOccurrences.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">{o.title}</p>
                  <p className="text-xs text-muted-foreground">{o.residentName} · {o.block}/{o.unit}</p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SindicoDashboard;
