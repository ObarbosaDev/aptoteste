import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockNotices } from "@/data/mock";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Megaphone, CalendarDays, MapPin } from "lucide-react";

const Avisos = () => {
  const { role } = useAuth();
  const isSindico = role === "sindico";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Avisos & Assembleias</h1>
          <p className="text-muted-foreground">Comunicados do condomínio</p>
        </div>
        {isSindico && (
          <Dialog>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Novo Aviso</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Aviso</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1"><Label>Título</Label><Input placeholder="Título do aviso" /></div>
                <div className="space-y-1"><Label>Conteúdo</Label><Textarea placeholder="Conteúdo do aviso" rows={4} /></div>
                <div className="space-y-1"><Label>Tipo</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Aviso</Button>
                    <Button variant="outline" size="sm">Assembleia</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Data (opcional)</Label><Input type="date" /></div>
                  <div className="space-y-1"><Label>Local (opcional)</Label><Input placeholder="Local" /></div>
                </div>
                <Button className="w-full">Publicar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {mockNotices.map((n) => (
          <Card key={n.id} className={n.isNew ? "border-primary/30" : ""}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-lg p-2 ${n.type === "assembleia" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{n.title}</h3>
                    {n.isNew && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">Novo</span>}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">{n.type}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{n.content}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Por {n.authorName}</span>
                    <span>{new Date(n.createdAt).toLocaleDateString("pt-BR")}</span>
                    {n.date && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(n.date).toLocaleDateString("pt-BR")}</span>}
                    {n.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{n.location}</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Avisos;
