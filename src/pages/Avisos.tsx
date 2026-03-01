import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeTable } from "@/hooks/useSupabaseData";
import { Plus, Megaphone, CalendarDays, MapPin, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type NoticeRow = Tables<"notices">;

const Avisos = () => {
  const { role, profile, user } = useAuth();
  const isSindico = role === "sindico";
  const { data: notices, loading } = useRealtimeTable<NoticeRow>("notices", "created_at", false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"aviso" | "assembleia">("aviso");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async () => {
    if (!title || !content) { toast.error("Preencha título e conteúdo"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("notices").insert({
        title, content, type,
        date: date || null, location: location || null,
        author_id: user?.id, author_name: profile?.full_name || "",
      });
      if (error) toast.error("Erro: " + error.message);
      else {
        toast.success("Aviso publicado!");
        setDialogOpen(false);
        setTitle(""); setContent(""); setType("aviso"); setDate(""); setLocation("");
      }
    } catch (err: any) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) toast.error("Erro ao excluir: " + error.message);
      else toast.success("Aviso excluído!");
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado. Tente novamente.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1>Avisos & Assembleias</h1>
          <p>Comunicados do condomínio</p>
        </div>
        {isSindico && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button className="gradient-primary border-0 shadow-lg shadow-primary/20 font-semibold"><Plus className="mr-2 h-4 w-4" />Novo Aviso</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Criar Aviso</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Título</Label><Input placeholder="Título do aviso" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conteúdo</Label><Textarea placeholder="Conteúdo do aviso" rows={4} value={content} onChange={(e) => setContent(e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo</Label>
                  <div className="flex gap-2">
                    <Button variant={type === "aviso" ? "default" : "outline"} size="sm" onClick={() => setType("aviso")} className={type === "aviso" ? "gradient-primary border-0" : "border-2"}>Aviso</Button>
                    <Button variant={type === "assembleia" ? "default" : "outline"} size="sm" onClick={() => setType("assembleia")} className={type === "assembleia" ? "gradient-primary border-0" : "border-2"}>Assembleia</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data (opcional)</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11" /></div>
                  <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Local (opcional)</Label><Input placeholder="Local" value={location} onChange={(e) => setLocation(e.target.value)} className="h-11" /></div>
                </div>
                <Button className="w-full h-11 gradient-primary border-0 font-semibold shadow-lg shadow-primary/20" onClick={handleSubmit} disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publicar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : notices.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">Nenhum aviso encontrado</div>
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <Card key={n.id} className={`shadow-card border-0 hover:shadow-card-hover transition-shadow duration-300 ${n.is_new ? "ring-1 ring-primary/20" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 stat-icon shrink-0 ${n.type === "assembleia" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold">{n.title}</h3>
                      {n.is_new && <span className="rounded-full gradient-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Novo</span>}
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize">{n.type}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{n.content}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Por {n.author_name}</span>
                      <span>{new Date(n.created_at).toLocaleDateString("pt-BR")}</span>
                      {n.date && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{n.date}</span>}
                      {n.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{n.location}</span>}
                    </div>
                  </div>
                  {isSindico && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir aviso</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir "{n.title}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(n.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

export default Avisos;
