import { useAuth, AppRole } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Package, CalendarDays, Megaphone, AlertTriangle,
  LogOut, Building2, Moon, Sun, DoorOpen, UserCircle, Users,
} from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavItem = { title: string; url: string; icon: React.ElementType; roles: AppRole[] };

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["sindico", "porteiro", "morador"] },
  { title: "Encomendas", url: "/encomendas", icon: Package, roles: ["sindico", "porteiro", "morador"] },
  { title: "Visitantes", url: "/visitantes", icon: DoorOpen, roles: ["sindico", "porteiro"] },
  { title: "Reservas", url: "/reservas", icon: CalendarDays, roles: ["sindico", "morador"] },
  { title: "Avisos", url: "/avisos", icon: Megaphone, roles: ["sindico", "morador"] },
  { title: "Ocorrências", url: "/ocorrencias", icon: AlertTriangle, roles: ["sindico", "morador"] },
];

const managementItems: NavItem[] = [
  { title: "Pessoas", url: "/pessoas", icon: Users, roles: ["sindico"] },
];

const roleLabels: Record<AppRole, string> = { sindico: "Síndico", porteiro: "Porteiro", morador: "Morador" };

function AppSidebarContent() {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  if (!role) return null;

  const filtered = navItems.filter((i) => i.roles.includes(role));
  const management = managementItems.filter((i) => i.roles.includes(role));

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const initials = profile?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <Sidebar className="border-r-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-lg shadow-primary/25">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <span className="font-heading font-bold text-sidebar-foreground text-sm tracking-tight">CondoApp</span>
          <p className="text-[10px] text-sidebar-muted leading-none mt-0.5">Gestão Condominial</p>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-widest font-semibold px-5">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filtered.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="mr-2.5 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {management.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-widest font-semibold px-5">Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {management.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                      >
                        <item.icon className="mr-2.5 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/perfil"
                    className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                  >
                    <UserCircle className="mr-2.5 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User card */}
      <div className="mt-auto border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-3">
          <Avatar className="h-9 w-9 ring-2 ring-sidebar-primary/20">
            <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{profile?.full_name || "Carregando..."}</p>
            <p className="text-[11px] text-sidebar-muted">{role ? roleLabels[role] : ""}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-sidebar-muted hover:text-sidebar-foreground h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Sidebar>
  );
}

export default function AppLayout() {
  const [dark, setDark] = useState(false);
  const { role, loading } = useAuth();

  const toggleDark = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="gradient-primary h-10 w-10 rounded-xl animate-pulse" />
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebarContent />
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center gap-3 border-b bg-card/80 backdrop-blur-xl px-6 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1" />
            {role && (
              <span className="text-xs font-semibold text-primary rounded-full gradient-primary bg-clip-text text-transparent px-3 py-1.5 border border-primary/20 bg-primary/5">
                {roleLabels[role]}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={toggleDark} className="h-9 w-9 rounded-xl hover:bg-accent">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-5 md:p-8 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
