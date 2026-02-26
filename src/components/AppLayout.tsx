import { useAuth, AppRole } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
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
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-sidebar-foreground text-sm">CondoApp</span>
          <p className="text-[10px] text-sidebar-muted leading-none">Gestão Condominial</p>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filtered.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
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
            <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider">Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {management.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="text-sidebar-foreground hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
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
                    className="text-sidebar-foreground hover:bg-sidebar-accent"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.full_name || "Carregando..."}</p>
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
  const { profile, role, loading } = useAuth();

  const toggleDark = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebarContent />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
            <SidebarTrigger />
            <div className="flex-1" />
            {role && (
              <span className="text-xs font-medium text-muted-foreground rounded-full bg-primary/10 px-3 py-1">
                {roleLabels[role]}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={toggleDark} className="h-8 w-8">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
