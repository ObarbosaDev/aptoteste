import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeTable } from "@/hooks/useSupabaseData";
import { Plus, Megaphone, CalendarDays, MapPin, Loader2 } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Avisos & Assembleias</h1>
          <p className="text-muted-foreground">Comunicados do condomínio</p>
        </div>
        {isSindico && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Novo Aviso</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Aviso</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1"><Label>Título</Label><Input placeholder="Título do aviso" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div className="space-y-1"><Label>Conteúdo</Label><Textarea placeholder="Conteúdo do aviso" rows={4} value={content} onChange={(e) => setContent(e.target.value)} /></div>
                <div className="space-y-1"><Label>Tipo</Label>
                  <div className="flex gap-2">
                    <Button variant={type === "aviso" ? "default" : "outline"} size="sm" onClick={() => setType("aviso")}>Aviso</Button>
                    <Button variant={type === "assembleia" ? "default" : "outline"} size="sm" onClick={() => setType("assembleia")}>Assembleia</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Data (opcional)</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Local (opcional)</Label><Input placeholder="Local" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
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
            <Card key={n.id} className={n.is_new ? "border-primary/30" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-lg p-2 ${n.type === "assembleia" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{n.title}</h3>
                      {n.is_new && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">Novo</span>}
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">{n.type}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{n.content}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Por {n.author_name}</span>
                      <span>{new Date(n.created_at).toLocaleDateString("pt-BR")}</span>
                      {n.date && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{n.date}</span>}
                      {n.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{n.location}</span>}
                    </div>
                  </div>
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
