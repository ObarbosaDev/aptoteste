import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import { useIsMobile } from "@/hooks/use-mobile";
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Package, Users, CalendarDays, Megaphone, AlertTriangle,
  LogOut, Building2, Moon, Sun, DoorOpen,
} from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRole } from "@/types";

type NavItem = { title: string; url: string; icon: React.ElementType; roles: UserRole[] };

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["sindico", "porteiro", "morador"] },
  { title: "Encomendas", url: "/encomendas", icon: Package, roles: ["sindico", "porteiro", "morador"] },
  { title: "Visitantes", url: "/visitantes", icon: DoorOpen, roles: ["sindico", "porteiro"] },
  { title: "Reservas", url: "/reservas", icon: CalendarDays, roles: ["sindico", "morador"] },
  { title: "Avisos", url: "/avisos", icon: Megaphone, roles: ["sindico", "morador"] },
  { title: "Ocorrências", url: "/ocorrencias", icon: AlertTriangle, roles: ["sindico", "morador"] },
];

function AppSidebarContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const filtered = navItems.filter((i) => i.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Sidebar className="border-r-0">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Building2 className="h-4 w-4" />
        </div>
        <span className="font-semibold text-sidebar-foreground">CondoApp</span>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted">Navegação</SidebarGroupLabel>
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
      </SidebarContent>

      <div className="mt-auto border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-muted capitalize">{user.role}</p>
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
  const { user } = useAuth();

  const toggleDark = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  const roleLabel: Record<UserRole, string> = {
    sindico: "Síndico",
    porteiro: "Porteiro",
    morador: "Morador",
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebarContent />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-3 border-b px-4">
            <SidebarTrigger />
            <div className="flex-1" />
            {user && (
              <span className="text-xs font-medium text-muted-foreground rounded-full bg-primary/10 px-3 py-1">
                {roleLabel[user.role]}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={toggleDark} className="h-8 w-8">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
