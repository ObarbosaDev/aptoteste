import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, QrCode, AlertTriangle, Megaphone, Loader2, ArrowRight } from "lucide-react";
import { useRealtimeTable } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type PackageRow = Tables<"packages">;
type NoticeRow = Tables<"notices">;

interface Props { userName?: string; }

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
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <h1>Meu Painel</h1>
        <p>Bem-vindo(a), {userName}</p>
      </div>

      {myPending.length > 0 && (
        <Card className="border-0 gradient-primary text-primary-foreground shadow-elevated overflow-hidden">
          <CardContent className="flex items-center gap-5 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Package className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-heading font-bold">Você tem {myPending.length} encomenda(s) aguardando!</p>
              <p className="text-sm opacity-80">Dirija-se à portaria para retirada</p>
            </div>
            <Button onClick={() => navigate("/encomendas")} className="bg-white/20 hover:bg-white/30 text-primary-foreground border-0 backdrop-blur font-semibold">
              Ver encomendas <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="shadow-card border-0">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-heading font-bold">Encomendas Pendentes</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary" onClick={() => navigate("/encomendas")}>Ver todas</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {myPending.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma encomenda pendente</p>}
              {myPending.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border bg-muted/30 p-4 hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div>
                    <p className="font-semibold text-sm">{p.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.type} · Recebido em {new Date(p.received_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg"><QrCode className="mr-1.5 h-3.5 w-3.5" />QR Code</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading font-bold">Avisos do Condomínio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {notices.slice(0, 3).map((n, i) => (
                <div key={n.id} className="rounded-xl border bg-muted/30 p-4 hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Megaphone className="h-3.5 w-3.5" />
                    </div>
                    <p className="font-semibold text-sm flex-1">{n.title}</p>
                    {n.is_new && <span className="rounded-full gradient-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Novo</span>}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 pl-9">{n.content}</p>
                </div>
              ))}
              {notices.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">Nenhum aviso</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/ocorrencias")} className="rounded-xl border-2 hover:border-primary/30 font-semibold">
          <AlertTriangle className="mr-2 h-4 w-4" />Abrir ocorrência
        </Button>
      </div>
    </div>
  );
};

export default MoradorDashboard;
