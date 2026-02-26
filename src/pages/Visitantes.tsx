import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeTable } from "@/hooks/useSupabaseData";
import { Plus, LogOut as ExitIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type VisitorRow = Tables<"visitors">;

const statusStyle: Record<string, string> = {
  dentro: "bg-success/10 text-success",
  saiu: "bg-muted text-muted-foreground",
};

const Visitantes = () => {
  const { user, role } = useAuth();
  const { data: visitors, loading } = useRealtimeTable<VisitorRow>("visitors", "entry_at", false);
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [block, setBlock] = useState("");
  const [unit, setUnit] = useState("");
  const [residentName, setResidentName] = useState("");
  const [vehicle, setVehicle] = useState("");

  const canManage = role === "porteiro" || role === "sindico";
  const filtered = filter === "all" ? visitors : visitors.filter((v) => v.status === filter);

  const handleSubmit = async () => {
    if (!name || !document || !block || !unit) { toast.error("Preencha os campos obrigatórios"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("visitors").insert({
        name, document, block, unit, resident_name: residentName, vehicle: vehicle || null,
        registered_by: user?.id,
      });
      if (error) toast.error("Erro: " + error.message);
      else {
        toast.success("Visitante registrado!");
        setDialogOpen(false);
        setName(""); setDocument(""); setBlock(""); setUnit(""); setResidentName(""); setVehicle("");
      }
    } catch (err: any) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = async (v: VisitorRow) => {
    try {
      const { error } = await supabase.from("visitors").update({
        status: "saiu", exit_at: new Date().toISOString(),
      }).eq("id", v.id);
      if (error) toast.error("Erro: " + error.message);
      else toast.success("Saída registrada!");
    } catch (err: any) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado. Tente novamente.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visitantes</h1>
          <p className="text-muted-foreground">Controle de entrada e saída</p>
        </div>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Registrar Entrada</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar Visitante</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1"><Label>Nome</Label><Input placeholder="Nome do visitante" value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-1"><Label>Documento (CPF)</Label><Input placeholder="000.000.000-00" value={document} onChange={(e) => setDocument(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Bloco</Label><Input placeholder="A" value={block} onChange={(e) => setBlock(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Unidade</Label><Input placeholder="101" value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
                </div>
                <div className="space-y-1"><Label>Morador visitado</Label><Input placeholder="Nome do morador" value={residentName} onChange={(e) => setResidentName(e.target.value)} /></div>
                <div className="space-y-1"><Label>Veículo (opcional)</Label><Input placeholder="Placa" value={vehicle} onChange={(e) => setVehicle(e.target.value)} /></div>
                <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Registrar Entrada
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-2">
        {[{ v: "all", l: "Todos" }, { v: "dentro", l: "Dentro" }, { v: "saiu", l: "Saiu" }].map((f) => (
          <Button key={f.v} variant={filter === f.v ? "default" : "outline"} size="sm" onClick={() => setFilter(f.v)}>{f.l}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Nenhum visitante encontrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.document}</TableCell>
                    <TableCell>{v.block}/{v.unit} - {v.resident_name}</TableCell>
                    <TableCell>{new Date(v.entry_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[v.status] || ""}`}>{v.status === "dentro" ? "Dentro" : "Saiu"}</span></TableCell>
                    <TableCell>
                      {v.status === "dentro" && canManage && (
                        <Button variant="outline" size="sm" onClick={() => handleExit(v)}><ExitIcon className="mr-1 h-3 w-3" />Registrar Saída</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Visitantes;
