import React, { useState } from "react";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Shield, DoorOpen, User, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const roles: { value: AppRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "sindico", label: "Síndico", icon: Shield, desc: "Gestão completa do condomínio" },
  { value: "porteiro", label: "Porteiro", icon: DoorOpen, desc: "Controle de encomendas e visitantes" },
  { value: "morador", label: "Morador", icon: User, desc: "Acompanhe suas encomendas e avisos" },
];

const Login = () => {
  const { signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState<AppRole>("morador");
  const [signupUnit, setSignupUnit] = useState("");
  const [signupBlock, setSignupBlock] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName, signupRole, signupUnit, signupBlock);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Building2 className="h-9 w-9" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">CondoApp</h1>
          <p className="mt-1 text-muted-foreground">Sistema de Gestão Condominial</p>
        </div>

        <Card className="shadow-xl border-0 shadow-black/5">
          <Tabs value={tab} onValueChange={setTab}>
            <CardHeader className="pb-2">
              <TabsList className="w-full">
                <TabsTrigger value="login" className="flex-1">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">Criar Conta</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input id="login-email" type="email" placeholder="seu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-pw">Senha</Label>
                    <div className="relative">
                      <Input id="login-pw" type={showPw ? "text" : "password"} placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Nome completo</Label>
                    <Input placeholder="Seu nome" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>E-mail</Label>
                    <Input type="email" placeholder="seu@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Senha</Label>
                    <Input type="password" placeholder="Mínimo 6 caracteres" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Perfil</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {roles.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setSignupRole(r.value)}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all ${
                            signupRole === r.value
                              ? "border-primary bg-primary/5 text-primary shadow-sm"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          <r.icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{r.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-0.5">
                      {roles.find((r) => r.value === signupRole)?.desc}
                    </p>
                  </div>
                  {signupRole === "morador" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Bloco</Label>
                        <Input placeholder="A" value={signupBlock} onChange={(e) => setSignupBlock(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Unidade</Label>
                        <Input placeholder="101" value={signupUnit} onChange={(e) => setSignupUnit(e.target.value)} />
                      </div>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Criar Conta
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
