import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeTable } from "@/hooks/useSupabaseData";
import { Plus, AlertTriangle, Clock, CheckCircle, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type OccurrenceRow = Tables<"occurrences">;
type EventRow = Tables<"occurrence_events">;

const statusLabel: Record<string, string> = { aberta: "Aberta", em_andamento: "Em andamento", resolvida: "Resolvida" };
const statusStyle: Record<string, string> = {
  aberta: "bg-destructive/10 text-destructive",
  em_andamento: "bg-warning/10 text-warning",
  resolvida: "bg-success/10 text-success",
};
const statusIcon: Record<string, React.ElementType> = {
  aberta: AlertTriangle, em_andamento: Clock, resolvida: CheckCircle,
};

const Ocorrencias = () => {
  const { role, profile, user } = useAuth();
  const isSindico = role === "sindico";
  const { data: occurrences, loading } = useRealtimeTable<OccurrenceRow>("occurrences", "created_at", false);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<OccurrenceRow | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reply, setReply] = useState("");

  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const filtered = filter === "all" ? occurrences : occurrences.filter((o) => o.status === filter);

  // Load events when selected
  useEffect(() => {
    if (!selected) { setEvents([]); return; }
    supabase.from("occurrence_events").select("*").eq("occurrence_id", selected.id).order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setEvents(data); });
  }, [selected]);

  const handleSubmit = async () => {
    if (!type || !title || !description) { toast.error("Preencha todos os campos"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("occurrences").insert({
      type, title, description,
      resident_id: user?.id,
      resident_name: profile?.full_name || "",
      unit: profile?.unit || "",
      block: profile?.block || "",
    });
    setSubmitting(false);
    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success("Ocorrência registrada!");
      setDialogOpen(false);
      setType(""); setTitle(""); setDescription("");
    }
  };

  const handleReply = async () => {
    if (!reply || !selected) return;
    const { error } = await supabase.from("occurrence_events").insert({
      occurrence_id: selected.id,
      action: reply,
      performed_by: profile?.full_name || "",
    });
    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success("Resposta enviada!");
      setReply("");
      // Refresh events
      const { data } = await supabase.from("occurrence_events").select("*").eq("occurrence_id", selected.id).order("created_at", { ascending: true });
      if (data) setEvents(data);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("occurrences").update({ status }).eq("id", id);
    if (error) toast.error("Erro: " + error.message);
    else toast.success("Status atualizado!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ocorrências</h1>
          <p className="text-muted-foreground">Registro e acompanhamento</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nova Ocorrência</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Abrir Ocorrência</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1"><Label>Tipo</Label>
                <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="barulho">Barulho</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="seguranca">Segurança</SelectItem>
                    <SelectItem value="limpeza">Limpeza</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Título</Label><Input placeholder="Resumo" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="space-y-1"><Label>Descrição</Label><Textarea placeholder="Descreva o problema" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
              <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        {[{ v: "all", l: "Todas" }, { v: "aberta", l: "Abertas" }, { v: "em_andamento", l: "Em andamento" }, { v: "resolvida", l: "Resolvidas" }].map((f) => (
          <Button key={f.v} variant={filter === f.v ? "default" : "outline"} size="sm" onClick={() => setFilter(f.v)}>{f.l}</Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">Nenhuma ocorrência encontrada</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const Icon = statusIcon[o.status] || AlertTriangle;
            return (
              <Card key={o.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelected(o)}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`rounded-lg p-2 ${statusStyle[o.status] || ""}`}><Icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{o.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{o.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{o.resident_name} · {o.block}/{o.unit} · {new Date(o.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[o.status] || ""}`}>{statusLabel[o.status] || o.status}</span>
                    {isSindico && o.status === "aberta" && (
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleStatusChange(o.id, "em_andamento"); }}>Em andamento</Button>
                    )}
                    {isSindico && o.status === "em_andamento" && (
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleStatusChange(o.id, "resolvida"); }}>Resolver</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Tipo</p><p className="font-medium capitalize">{selected.type}</p></div>
                <div><p className="text-muted-foreground">Status</p><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[selected.status] || ""}`}>{statusLabel[selected.status] || selected.status}</span></div>
                <div><p className="text-muted-foreground">Morador</p><p className="font-medium">{selected.resident_name}</p></div>
                <div><p className="text-muted-foreground">Unidade</p><p className="font-medium">{selected.block}/{selected.unit}</p></div>
              </div>
              <div className="text-sm"><p className="text-muted-foreground mb-1">Descrição</p><p>{selected.description}</p></div>

              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-3">Timeline</p>
                <div className="space-y-3">
                  {events.map((e, i) => (
                    <div key={e.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        {i < events.length - 1 && <div className="w-px flex-1 bg-border" />}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium">{e.action}</p>
                        <p className="text-xs text-muted-foreground">{e.performed_by} · {new Date(e.created_at).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && <p className="text-xs text-muted-foreground">Nenhum evento registrado</p>}
                </div>
              </div>

              {isSindico && selected.status !== "resolvida" && (
                <div className="border-t pt-3 space-y-2">
                  <Label>Responder</Label>
                  <Textarea placeholder="Escreva uma resposta..." rows={3} value={reply} onChange={(e) => setReply(e.target.value)} />
                  <Button className="w-full" onClick={handleReply}><MessageSquare className="mr-2 h-4 w-4" />Enviar Resposta</Button>
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
