import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Save, UserCircle } from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = { sindico: "Síndico", porteiro: "Porteiro", morador: "Morador" };

const Profile = () => {
  const { profile, role, user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [block, setBlock] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone || "");
      setUnit(profile.unit || "");
      setBlock(profile.block || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: fullName,
        phone,
        unit,
        block,
      }).eq("user_id", user.id);
      if (error) {
        toast.error("Erro ao salvar perfil");
      } else {
        toast.success("Perfil atualizado!");
        await refreshProfile();
      }
    } catch (err: any) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const initials = fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-5 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                {initials || <UserCircle className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{fullName || "Seu nome"}</h2>
              <p className="text-muted-foreground">{profile?.email}</p>
              {role && (
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                  {roleLabels[role]}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome completo</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input value={profile?.email || ""} disabled className="bg-muted" />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-1.5">
                <Label>Perfil</Label>
                <Input value={role ? roleLabels[role] : ""} disabled className="bg-muted" />
              </div>
              <div className="space-y-1.5">
                <Label>Bloco</Label>
                <Input value={block} onChange={(e) => setBlock(e.target.value)} placeholder="A" />
              </div>
              <div className="space-y-1.5">
                <Label>Unidade</Label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="101" />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
