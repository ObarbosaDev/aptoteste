import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockReservations } from "@/data/mock";
import { ReservationStatus } from "@/types";
import { Plus, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const statusLabel: Record<ReservationStatus, string> = { pendente: "Pendente", aprovada: "Aprovada", rejeitada: "Rejeitada" };
const statusStyle: Record<ReservationStatus, string> = {
  pendente: "bg-warning/10 text-warning",
  aprovada: "bg-success/10 text-success",
  rejeitada: "bg-destructive/10 text-destructive",
};

const spaces = ["Salão de Festas", "Churrasqueira", "Quadra Esportiva", "Piscina", "Academia"];

const Reservas = () => {
  const { role } = useAuth();
  const isSindico = role === "sindico";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reservas</h1>
          <p className="text-muted-foreground">Espaços comuns do condomínio</p>
        </div>
        <Dialog>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nova Reserva</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Solicitar Reserva</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1"><Label>Espaço</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{spaces.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Data</Label><Input type="date" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Início</Label><Input type="time" /></div>
                <div className="space-y-1"><Label>Fim</Label><Input type="time" /></div>
              </div>
              <div className="space-y-1"><Label>Observações</Label><Input placeholder="Opcional" /></div>
              <Button className="w-full">Solicitar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {spaces.map((s) => {
          const count = mockReservations.filter((r) => r.space === s && r.status === "aprovada").length;
          return (
            <Card key={s}>
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium">{s}</p>
                <p className="text-xs text-muted-foreground">{count} reserva(s) ativa(s)</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-3">
        {mockReservations.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{r.space}</p>
                <p className="text-sm text-muted-foreground">{r.residentName} · {r.block}/{r.unit}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("pt-BR")} · {r.startTime} - {r.endTime}</p>
                {r.notes && <p className="text-xs text-destructive mt-1">{r.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[r.status]}`}>{statusLabel[r.status]}</span>
                {isSindico && r.status === "pendente" && (
                  <>
                    <Button variant="outline" size="icon" className="h-7 w-7 text-success"><Check className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="icon" className="h-7 w-7 text-destructive"><X className="h-3.5 w-3.5" /></Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reservas;
