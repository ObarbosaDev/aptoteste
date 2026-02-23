import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockVisitors } from "@/data/mock";
import { VisitorStatus } from "@/types";
import { Plus, LogOut as ExitIcon } from "lucide-react";

const statusStyle: Record<VisitorStatus, string> = {
  dentro: "bg-success/10 text-success",
  saiu: "bg-muted text-muted-foreground",
};

const Visitantes = () => {
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? mockVisitors : mockVisitors.filter((v) => v.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visitantes</h1>
          <p className="text-muted-foreground">Controle de entrada e saída</p>
        </div>
        <Dialog>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Registrar Entrada</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Visitante</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1"><Label>Nome</Label><Input placeholder="Nome do visitante" /></div>
              <div className="space-y-1"><Label>Documento (CPF)</Label><Input placeholder="000.000.000-00" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Bloco</Label><Input placeholder="A" /></div>
                <div className="space-y-1"><Label>Unidade</Label><Input placeholder="101" /></div>
              </div>
              <div className="space-y-1"><Label>Veículo (opcional)</Label><Input placeholder="Placa" /></div>
              <Button className="w-full">Registrar Entrada</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        {[{ v: "all", l: "Todos" }, { v: "dentro", l: "Dentro" }, { v: "saiu", l: "Saiu" }].map((f) => (
          <Button key={f.v} variant={filter === f.v ? "default" : "outline"} size="sm" onClick={() => setFilter(f.v)}>{f.l}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
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
                  <TableCell>{v.block}/{v.unit} - {v.residentName}</TableCell>
                  <TableCell>{new Date(v.entryAt).toLocaleString("pt-BR")}</TableCell>
                  <TableCell><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[v.status]}`}>{v.status === "dentro" ? "Dentro" : "Saiu"}</span></TableCell>
                  <TableCell>
                    {v.status === "dentro" && (
                      <Button variant="outline" size="sm"><ExitIcon className="mr-1 h-3 w-3" />Registrar Saída</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Visitantes;
