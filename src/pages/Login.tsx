import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Shield, DoorOpen, User } from "lucide-react";

const roles: { value: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "sindico", label: "Síndico", icon: Shield, desc: "Gestão completa do condomínio" },
  { value: "porteiro", label: "Porteiro", icon: DoorOpen, desc: "Controle de encomendas e visitantes" },
  { value: "morador", label: "Morador", icon: User, desc: "Acompanhe suas encomendas e avisos" },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("sindico");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">CondoApp</h1>
          <p className="mt-1 text-muted-foreground">Sistema de Gestão Condominial</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Entrar</CardTitle>
            <CardDescription>Selecione um perfil para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue="demo@condo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" defaultValue="••••••••" />
              </div>

              <div className="space-y-2">
                <Label>Perfil de acesso</Label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-all ${
                        selectedRole === r.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <r.icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{r.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center pt-1">
                  {roles.find((r) => r.value === selectedRole)?.desc}
                </p>
              </div>

              <Button type="submit" className="w-full">
                Acessar sistema
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
