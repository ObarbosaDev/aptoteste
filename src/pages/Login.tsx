import React, { useState } from "react";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

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
    if (error) toast.error(error);
    else navigate("/dashboard");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres"); return; }
    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName, signupRole, signupUnit, signupBlock);
    setLoading(false);
    if (error) toast.error(error);
    else { toast.success("Conta criada com sucesso!"); navigate("/dashboard"); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary-glow/5 blur-3xl translate-y-1/3 -translate-x-1/4" />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-elevated">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-6 text-3xl font-heading font-extrabold tracking-tight text-foreground">CondoApp</h1>
          <p className="mt-1.5 text-muted-foreground">Sistema de Gestão Condominial</p>
        </div>

        <Card className="shadow-elevated border-0 overflow-hidden">
          <Tabs value={tab} onValueChange={setTab}>
            <CardHeader className="pb-2 pt-6 px-6">
              <TabsList className="w-full h-11 bg-muted/60 p-1">
                <TabsTrigger value="login" className="flex-1 font-semibold data-[state=active]:shadow-sm">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1 font-semibold data-[state=active]:shadow-sm">Criar Conta</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail</Label>
                    <Input id="login-email" type="email" placeholder="seu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-pw" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Senha</Label>
                    <div className="relative">
                      <Input id="login-pw" type={showPw ? "text" : "password"} placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="h-11 pr-10" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-11 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(!showPw)}>
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 gradient-primary border-0 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome completo</Label>
                    <Input placeholder="Seu nome" value={signupName} onChange={(e) => setSignupName(e.target.value)} required className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail</Label>
                    <Input type="email" placeholder="seu@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Senha</Label>
                    <Input type="password" placeholder="Mínimo 6 caracteres" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Perfil</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {roles.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setSignupRole(r.value)}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3.5 text-center transition-all duration-200 ${
                            signupRole === r.value
                              ? "border-primary bg-primary/8 text-primary shadow-sm shadow-primary/10"
                              : "border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50"
                          }`}
                        >
                          <r.icon className="h-5 w-5" />
                          <span className="text-xs font-semibold">{r.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">{roles.find((r) => r.value === signupRole)?.desc}</p>
                  </div>
                  {signupRole === "morador" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bloco</Label>
                        <Input placeholder="A" value={signupBlock} onChange={(e) => setSignupBlock(e.target.value)} className="h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unidade</Label>
                        <Input placeholder="101" value={signupUnit} onChange={(e) => setSignupUnit(e.target.value)} className="h-11" />
                      </div>
                    </div>
                  )}
                  <Button type="submit" className="w-full h-11 gradient-primary border-0 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow" disabled={loading}>
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
