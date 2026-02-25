import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, QrCode, AlertTriangle, Megaphone, Loader2 } from "lucide-react";
import { useRealtimeTable } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type PackageRow = Tables<"packages">;
type NoticeRow = Tables<"notices">;

interface Props {
  userName?: string;
}

const MoradorDashboard = ({ userName = "Morador" }: Props) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: packages, loading: pkgLoading } = useRealtimeTable<PackageRow>("packages", "received_at", false);
  const { data: notices, loading: noticeLoading } = useRealtimeTable<NoticeRow>("notices", "created_at", false);

  const myPending = packages.filter(
    (p) => p.status === "pendente" && p.unit === profile?.unit && p.block === profile?.block
  );

  const loading = pkgLoading || noticeLoading;
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu Painel</h1>
        <p className="text-muted-foreground">Bem-vindo(a), {userName}</p>
      </div>

      {myPending.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-primary p-2.5 text-primary-foreground"><Package className="h-5 w-5" /></div>
            <div className="flex-1">
              <p className="text-lg font-bold">Você tem {myPending.length} encomenda(s) aguardando!</p>
              <p className="text-sm text-muted-foreground">Dirija-se à portaria para retirada</p>
            </div>
            <Button onClick={() => navigate("/encomendas")}>Ver encomendas</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Encomendas Pendentes</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/encomendas")}>Ver todas</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myPending.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma encomenda pendente</p>}
              {myPending.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">{p.description}</p>
                    <p className="text-xs text-muted-foreground">{p.type} · Recebido em {new Date(p.received_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <Button variant="outline" size="sm"><QrCode className="mr-1 h-3 w-3" />QR Code</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Avisos do Condomínio</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notices.slice(0, 3).map((n) => (
                <div key={n.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium text-sm">{n.title}</p>
                    {n.is_new && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">Novo</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{n.content}</p>
                </div>
              ))}
              {notices.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nenhum aviso</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/ocorrencias")}><AlertTriangle className="mr-2 h-4 w-4" />Abrir ocorrência</Button>
      </div>
    </div>
  );
};

export default MoradorDashboard;
