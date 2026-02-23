import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockOccurrences } from "@/data/mock";
import { useAuth } from "@/contexts/AuthContext";
import { OccurrenceStatus } from "@/types";
import { Plus, AlertTriangle, Clock, CheckCircle, MessageSquare } from "lucide-react";

const statusLabel: Record<OccurrenceStatus, string> = { aberta: "Aberta", em_andamento: "Em andamento", resolvida: "Resolvida" };
const statusStyle: Record<OccurrenceStatus, string> = {
  aberta: "bg-destructive/10 text-destructive",
  em_andamento: "bg-warning/10 text-warning",
  resolvida: "bg-success/10 text-success",
};
const statusIcon: Record<OccurrenceStatus, React.ElementType> = {
  aberta: AlertTriangle, em_andamento: Clock, resolvida: CheckCircle,
};

const Ocorrencias = () => {
  const { user } = useAuth();
  const isSindico = user?.role === "sindico";
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<typeof mockOccurrences[0] | null>(null);

  const filtered = filter === "all" ? mockOccurrences : mockOccurrences.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ocorrências</h1>
          <p className="text-muted-foreground">Registro e acompanhamento</p>
        </div>
        <Dialog>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nova Ocorrência</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Abrir Ocorrência</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1"><Label>Tipo</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="barulho">Barulho</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="seguranca">Segurança</SelectItem>
                    <SelectItem value="limpeza">Limpeza</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Título</Label><Input placeholder="Resumo da ocorrência" /></div>
              <div className="space-y-1"><Label>Descrição</Label><Textarea placeholder="Descreva o problema em detalhes" rows={4} /></div>
              <Button className="w-full">Registrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        {[{ v: "all", l: "Todas" }, { v: "aberta", l: "Abertas" }, { v: "em_andamento", l: "Em andamento" }, { v: "resolvida", l: "Resolvidas" }].map((f) => (
          <Button key={f.v} variant={filter === f.v ? "default" : "outline"} size="sm" onClick={() => setFilter(f.v)}>{f.l}</Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((o) => {
          const Icon = statusIcon[o.status];
          return (
            <Card key={o.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelected(o)}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`rounded-lg p-2 ${statusStyle[o.status]}`}><Icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{o.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{o.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{o.residentName} · {o.block}/{o.unit} · {new Date(o.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[o.status]}`}>{statusLabel[o.status]}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog with Timeline */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Tipo</p><p className="font-medium capitalize">{selected.type}</p></div>
                <div><p className="text-muted-foreground">Status</p><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[selected.status]}`}>{statusLabel[selected.status]}</span></div>
                <div><p className="text-muted-foreground">Morador</p><p className="font-medium">{selected.residentName}</p></div>
                <div><p className="text-muted-foreground">Unidade</p><p className="font-medium">{selected.block}/{selected.unit}</p></div>
              </div>
              <div className="text-sm"><p className="text-muted-foreground mb-1">Descrição</p><p>{selected.description}</p></div>

              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-3">Timeline</p>
                <div className="space-y-3">
                  {selected.timeline.map((e, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        {i < selected.timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium">{e.action}</p>
                        <p className="text-xs text-muted-foreground">{e.by} · {new Date(e.date).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isSindico && selected.status !== "resolvida" && (
                <div className="border-t pt-3 space-y-2">
                  <Label>Responder</Label>
                  <Textarea placeholder="Escreva uma resposta ou atualização..." rows={3} />
                  <Button className="w-full"><MessageSquare className="mr-2 h-4 w-4" />Enviar Resposta</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Ocorrencias;
