import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarCheck, Dices, Gift, LogOut, Menu, X, ChevronRight, Users } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/clientes",
    label: "Clientes",
    icon: Users,
  },
  {
    href: "/admin/agendamentos",
    label: "Agendamentos",
    icon: CalendarCheck,
  },
  {
    href: "/admin/roleta",
    label: "Roleta - Sorteios",
    icon: Dices,
  },
  {
    href: "/admin/premios",
    label: "Gerenciar Prêmios",
    icon: Gift,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-5 border-b">
        <div className="bg-primary text-primary-foreground rounded-md p-1.5">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Painel Admin</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.nome?.split(" ")[0]}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.exact}
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t">
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <ChevronRight className="h-4 w-4" />
          Ir para o site
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-1"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-background border-r shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Mobile Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 z-50 bg-background border-r flex flex-col transition-transform duration-200 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-end p-2 border-b">
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-14 border-b bg-background flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-muted"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold truncate">{title}</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
