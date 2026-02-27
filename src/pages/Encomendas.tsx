import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeTable } from "@/hooks/useSupabaseData";
import { Package, Plus, QrCode, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type PackageRow = Tables<"packages">;

const statusLabel: Record<string, string> = { pendente: "Pendente", retirada: "Retirada", devolvida: "Devolvida" };
const statusStyle: Record<string, string> = {
  pendente: "bg-warning/10 text-warning",
  retirada: "bg-success/10 text-success",
  devolvida: "bg-muted text-muted-foreground",
};

const Encomendas = () => {
  const { user, role } = useAuth();
  const { data: packages, loading } = useRealtimeTable<PackageRow>("packages", "received_at", false);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<PackageRow | null>(null);
  const [showQr, setShowQr] = useState<PackageRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [block, setBlock] = useState("");
  const [unit, setUnit] = useState("");
  const [residentName, setResidentName] = useState("");
  const [type, setType] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState("");

  const canManage = role === "porteiro" || role === "sindico";
  const filtered = filter === "all" ? packages : packages.filter((p) => p.status === filter);

  const handleSubmit = async () => {
    if (!description || !type || !block || !unit || !residentName) {
      toast.error("Preencha todos os campos");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("packages").insert({
        block, unit, resident_name: residentName, type, description,
        created_by: user?.id,
      });
      if (error) {
        toast.error("Erro ao registrar: " + error.message);
      } else {
        toast.success("Encomenda registrada!");
        setDialogOpen(false);
        setBlock(""); setUnit(""); setResidentName(""); setType(undefined); setDescription("");
      }
    } catch (err: any) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickup = async (pkg: PackageRow) => {
    try {
      const { error } = await supabase.from("packages").update({
        status: "retirada",
        picked_up_at: new Date().toISOString(),
        picked_up_by: pkg.resident_name,
      }).eq("id", pkg.id);
      if (error) toast.error("Erro: " + error.message);
      else { toast.success("Retirada confirmada!"); setShowQr(null); }
    } catch (err: any) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado. Tente novamente.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Encomendas</h1>
          <p className="text-muted-foreground">Gestão de encomendas do condomínio</p>
        </div>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Nova Encomenda</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar Encomenda</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Bloco</Label><Input placeholder="A" value={block} onChange={(e) => setBlock(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Unidade</Label><Input placeholder="101" value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
                </div>
                <div className="space-y-1"><Label>Morador</Label><Input placeholder="Nome do morador" value={residentName} onChange={(e) => setResidentName(e.target.value)} /></div>
                <div className="space-y-1"><Label>Tipo</Label>
                  <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caixa">Caixa</SelectItem>
                      <SelectItem value="envelope">Envelope</SelectItem>
                      <SelectItem value="sacola">Sacola</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Descrição</Label><Input placeholder="Descrição da encomenda" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Registrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-2">
        {[{ v: "all", l: "Todas" }, { v: "pendente", l: "Pendentes" }, { v: "retirada", l: "Retiradas" }].map((f) => (
          <Button key={f.v} variant={filter === f.v ? "default" : "outline"} size="sm" onClick={() => setFilter(f.v)}>{f.l}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Nenhuma encomenda encontrada</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Morador</TableHead>
                  <TableHead>Bloco/Unid</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.description}</TableCell>
                    <TableCell>{p.resident_name}</TableCell>
                    <TableCell>{p.block}/{p.unit}</TableCell>
                    <TableCell className="capitalize">{p.type}</TableCell>
                    <TableCell><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[p.status] || ""}`}>{statusLabel[p.status] || p.status}</span></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(p)}><Eye className="h-3.5 w-3.5" /></Button>
                        {p.status === "pendente" && canManage && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowQr(p)}><QrCode className="h-3.5 w-3.5" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes da Encomenda</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Descrição</p><p className="font-medium">{selected.description}</p></div>
                <div><p className="text-muted-foreground">Tipo</p><p className="font-medium capitalize">{selected.type}</p></div>
                <div><p className="text-muted-foreground">Morador</p><p className="font-medium">{selected.resident_name}</p></div>
                <div><p className="text-muted-foreground">Bloco/Unid</p><p className="font-medium">{selected.block}/{selected.unit}</p></div>
                <div><p className="text-muted-foreground">Recebido</p><p className="font-medium">{new Date(selected.received_at).toLocaleString("pt-BR")}</p></div>
                <div><p className="text-muted-foreground">Status</p><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[selected.status] || ""}`}>{statusLabel[selected.status] || selected.status}</span></div>
              </div>
              {selected.picked_up_at && (
                <div className="border-t pt-3 text-sm">
                  <p className="text-muted-foreground">Retirado por <span className="font-medium text-foreground">{selected.picked_up_by}</span> em {new Date(selected.picked_up_at).toLocaleString("pt-BR")}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR / Pickup Dialog */}
      <Dialog open={!!showQr} onOpenChange={() => setShowQr(null)}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader><DialogTitle>Confirmar Retirada</DialogTitle></DialogHeader>
          {showQr && (
            <div className="space-y-4">
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{showQr.resident_name} · {showQr.block}/{showQr.unit}</p>
              <p className="text-sm font-medium">{showQr.description}</p>
              <Button className="w-full" onClick={() => handlePickup(showQr)}>Confirmar Retirada</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Encomendas;
