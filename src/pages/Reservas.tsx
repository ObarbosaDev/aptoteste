import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeTable } from "@/hooks/useSupabaseData";
import { Plus, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type ReservationRow = Tables<"reservations">;

const statusLabel: Record<string, string> = { pendente: "Pendente", aprovada: "Aprovada", rejeitada: "Rejeitada" };
const statusStyle: Record<string, string> = {
  pendente: "bg-warning/10 text-warning",
  aprovada: "bg-success/10 text-success",
  rejeitada: "bg-destructive/10 text-destructive",
};
const spaces = ["Salão de Festas", "Churrasqueira", "Quadra Esportiva", "Piscina", "Academia"];

const Reservas = () => {
  const { role, profile } = useAuth();
  const isSindico = role === "sindico";
  const { data: reservations, loading } = useRealtimeTable<ReservationRow>("reservations", "date", false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [space, setSpace] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!space || !date || !startTime || !endTime) { toast.error("Preencha todos os campos obrigatórios"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("reservations").insert({
        space, date, start_time: startTime, end_time: endTime, notes: notes || null,
        resident_id: profile?.id || null,
        resident_name: profile?.full_name || "",
        unit: profile?.unit || "",
        block: profile?.block || "",
      });
      if (error) toast.error("Erro: " + error.message);
      else {
        toast.success("Reserva solicitada!");
        setDialogOpen(false);
        setSpace(""); setDate(""); setStartTime(""); setEndTime(""); setNotes("");
      }
    } catch (err: any) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
      if (error) toast.error("Erro: " + error.message);
      else toast.success(status === "aprovada" ? "Reserva aprovada!" : "Reserva rejeitada");
    } catch (err: any) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado. Tente novamente.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reservas</h1>
          <p className="text-muted-foreground">Espaços comuns do condomínio</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nova Reserva</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Solicitar Reserva</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1"><Label>Espaço</Label>
                <Select value={space} onValueChange={setSpace}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{spaces.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Data</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Início</Label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
                <div className="space-y-1"><Label>Fim</Label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
              </div>
              <div className="space-y-1"><Label>Observações</Label><Input placeholder="Opcional" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
              <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Solicitar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {spaces.map((s) => {
          const count = reservations.filter((r) => r.space === s && r.status === "aprovada").length;
          return (
            <Card key={s}><CardContent className="p-4 text-center">
              <p className="text-sm font-medium">{s}</p>
              <p className="text-xs text-muted-foreground">{count} reserva(s) ativa(s)</p>
            </CardContent></Card>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : reservations.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">Nenhuma reserva encontrada</div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{r.space}</p>
                  <p className="text-sm text-muted-foreground">{r.resident_name} · {r.block}/{r.unit}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("pt-BR")} · {r.start_time} - {r.end_time}</p>
                  {r.notes && <p className="text-xs text-destructive mt-1">{r.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[r.status] || ""}`}>{statusLabel[r.status] || r.status}</span>
                  {isSindico && r.status === "pendente" && (
                    <>
                      <Button variant="outline" size="icon" className="h-7 w-7 text-success" onClick={() => handleStatus(r.id, "aprovada")}><Check className="h-3.5 w-3.5" /></Button>
                      <Button variant="outline" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleStatus(r.id, "rejeitada")}><X className="h-3.5 w-3.5" /></Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reservas;
