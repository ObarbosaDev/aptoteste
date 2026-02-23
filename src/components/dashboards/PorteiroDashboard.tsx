import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DoorOpen, QrCode } from "lucide-react";
import { mockPackages, mockVisitors } from "@/data/mock";
import { useNavigate } from "react-router-dom";

const PorteiroDashboard = () => {
  const navigate = useNavigate();
  const pendingPkgs = mockPackages.filter((p) => p.status === "pendente");
  const visitorsToday = mockVisitors.filter((v) => v.entryAt.startsWith("2026-02-23"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel do Porteiro</h1>
        <p className="text-muted-foreground">Ações rápidas e resumo do dia</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button className="h-auto flex-col gap-2 py-6" onClick={() => navigate("/encomendas")}>
          <Package className="h-6 w-6" />
          <span>Registrar Encomenda</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-6" onClick={() => navigate("/visitantes")}>
          <DoorOpen className="h-6 w-6" />
          <span>Registrar Visitante</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-6" onClick={() => navigate("/encomendas")}>
          <QrCode className="h-6 w-6" />
          <span>Validar QR Code</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary"><Package className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-bold">{pendingPkgs.length}</p>
                <p className="text-xs text-muted-foreground">Encomendas pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-info/10 p-2.5 text-info"><DoorOpen className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-bold">{visitorsToday.length}</p>
                <p className="text-xs text-muted-foreground">Visitantes hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Encomendas Pendentes</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingPkgs.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">{p.description}</p>
                  <p className="text-xs text-muted-foreground">{p.residentName} · {p.block}/{p.unit} · {p.type}</p>
                </div>
                <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">Pendente</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PorteiroDashboard;
