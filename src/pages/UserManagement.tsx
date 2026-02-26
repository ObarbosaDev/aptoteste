import { useState, useEffect } from "react";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Loader2, Users, Shield, DoorOpen, User } from "lucide-react";
import { toast } from "sonner";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  unit: string;
  block: string;
  role: AppRole;
}

const roleLabels: Record<AppRole, string> = { sindico: "Síndico", porteiro: "Porteiro", morador: "Morador" };
const roleIcons: Record<AppRole, React.ElementType> = { sindico: Shield, porteiro: DoorOpen, morador: User };
const roleColors: Record<AppRole, string> = {
  sindico: "bg-primary/10 text-primary",
  porteiro: "bg-info/10 text-info",
  morador: "bg-success/10 text-success",
};

const UserManagement = () => {
  const { role: currentRole } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New user form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("morador");
  const [newUnit, setNewUnit] = useState("");
  const [newBlock, setNewBlock] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");

    if (profiles && roles) {
      const merged: UserWithRole[] = profiles.map((p: any) => {
        const userRole = roles.find((r: any) => r.user_id === p.user_id);
        return {
          ...p,
          role: (userRole?.role as AppRole) || "morador",
        };
      });
      setUsers(merged);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setSaving(true);

    // We sign up via Supabase auth - the trigger will create profile & role
    const { error } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
      options: {
        data: { full_name: newName, role: newRole },
      },
    });

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    // Note: Since we're signing up from the sindico's session, we need to handle this carefully
    // The trigger will create the profile. Let's refresh the list.
    toast.success(`${roleLabels[newRole]} adicionado com sucesso!`);
    setOpen(false);
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("morador");
    setNewUnit("");
    setNewBlock("");
    setSaving(false);

    // Refresh after a short delay for the trigger to complete
    setTimeout(fetchUsers, 1000);
  };

  if (currentRole !== "sindico") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Acesso restrito ao síndico.</p>
      </div>
    );
  }

  const filtered = filter === "all" ? users : users.filter((u) => u.role === filter);

  const stats = [
    { label: "Total", value: users.length, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Moradores", value: users.filter((u) => u.role === "morador").length, icon: User, color: "bg-success/10 text-success" },
    { label: "Porteiros", value: users.filter((u) => u.role === "porteiro").length, icon: DoorOpen, color: "bg-info/10 text-info" },
    { label: "Síndicos", value: users.filter((u) => u.role === "sindico").length, icon: Shield, color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Pessoas</h1>
          <p className="text-muted-foreground">Adicione e gerencie moradores, porteiros e síndicos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Adicionar Pessoa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Nova Pessoa</DialogTitle></DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome completo</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome da pessoa" required />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@exemplo.com" required />
              </div>
              <div className="space-y-1.5">
                <Label>Senha inicial</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
              </div>
              <div className="space-y-1.5">
                <Label>Perfil</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morador">Morador</SelectItem>
                    <SelectItem value="porteiro">Porteiro</SelectItem>
                    <SelectItem value="sindico">Síndico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newRole === "morador" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Bloco</Label>
                    <Input value={newBlock} onChange={(e) => setNewBlock(e.target.value)} placeholder="A" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Unidade</Label>
                    <Input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="101" />
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Adicionar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg p-2 ${s.color}`}><s.icon className="h-4 w-4" /></div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        {[{ v: "all", l: "Todos" }, { v: "morador", l: "Moradores" }, { v: "porteiro", l: "Porteiros" }, { v: "sindico", l: "Síndicos" }].map((f) => (
          <Button key={f.v} variant={filter === f.v ? "default" : "outline"} size="sm" onClick={() => setFilter(f.v)}>{f.l}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pessoa</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Bloco/Unid</TableHead>
                  <TableHead>Perfil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => {
                  const Icon = roleIcons[u.role];
                  const initials = u.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-muted text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{u.full_name || "Sem nome"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>{u.block && u.unit ? `${u.block}/${u.unit}` : "-"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[u.role]}`}>
                          <Icon className="h-3 w-3" />
                          {roleLabels[u.role]}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhuma pessoa encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
