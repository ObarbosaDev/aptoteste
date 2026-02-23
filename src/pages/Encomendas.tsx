import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockPackages } from "@/data/mock";
import { Package as PackageType, PackageStatus } from "@/types";
import { Package, Plus, QrCode, Eye } from "lucide-react";

const statusLabel: Record<PackageStatus, string> = { pendente: "Pendente", retirada: "Retirada", devolvida: "Devolvida" };
const statusStyle: Record<PackageStatus, string> = {
  pendente: "bg-warning/10 text-warning",
  retirada: "bg-success/10 text-success",
  devolvida: "bg-muted text-muted-foreground",
};

const Encomendas = () => {
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<PackageType | null>(null);
  const [showQr, setShowQr] = useState<PackageType | null>(null);

  const filtered = filter === "all" ? mockPackages : mockPackages.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Encomendas</h1>
          <p className="text-muted-foreground">Gestão de encomendas do condomínio</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nova Encomenda</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Encomenda</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Bloco</Label><Input placeholder="A" /></div>
                <div className="space-y-1"><Label>Unidade</Label><Input placeholder="101" /></div>
              </div>
              <div className="space-y-1"><Label>Morador</Label><Input placeholder="Nome do morador" /></div>
              <div className="space-y-1"><Label>Tipo</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="envelope">Envelope</SelectItem>
                    <SelectItem value="sacola">Sacola</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Descrição</Label><Input placeholder="Descrição da encomenda" /></div>
              <Button className="w-full">Registrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        {[{ v: "all", l: "Todas" }, { v: "pendente", l: "Pendentes" }, { v: "retirada", l: "Retiradas" }].map((f) => (
          <Button key={f.v} variant={filter === f.v ? "default" : "outline"} size="sm" onClick={() => setFilter(f.v)}>{f.l}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
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
                  <TableCell>{p.residentName}</TableCell>
                  <TableCell>{p.block}/{p.unit}</TableCell>
                  <TableCell className="capitalize">{p.type}</TableCell>
                  <TableCell><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[p.status]}`}>{statusLabel[p.status]}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(p)}><Eye className="h-3.5 w-3.5" /></Button>
                      {p.status === "pendente" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowQr(p)}><QrCode className="h-3.5 w-3.5" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                <div><p className="text-muted-foreground">Morador</p><p className="font-medium">{selected.residentName}</p></div>
                <div><p className="text-muted-foreground">Bloco/Unid</p><p className="font-medium">{selected.block}/{selected.unit}</p></div>
                <div><p className="text-muted-foreground">Recebido</p><p className="font-medium">{new Date(selected.receivedAt).toLocaleString("pt-BR")}</p></div>
                <div><p className="text-muted-foreground">Status</p><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[selected.status]}`}>{statusLabel[selected.status]}</span></div>
              </div>
              {selected.pickedUpAt && (
                <div className="border-t pt-3 text-sm">
                  <p className="text-muted-foreground">Retirado por <span className="font-medium text-foreground">{selected.pickedUpBy}</span> em {new Date(selected.pickedUpAt).toLocaleString("pt-BR")}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!showQr} onOpenChange={() => setShowQr(null)}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader><DialogTitle>QR Code de Retirada</DialogTitle></DialogHeader>
          {showQr && (
            <div className="space-y-4">
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed">
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`h-6 w-6 rounded-sm ${Math.random() > 0.4 ? "bg-foreground" : "bg-muted"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{showQr.residentName} · {showQr.block}/{showQr.unit}</p>
              <Button className="w-full">Confirmar Retirada</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Encomendas;
