import { Link, NavLink, useLocation } from "react-router-dom";
import { User, LogOut, Calendar, Heart, Dice5, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md transition-colors ${isActive ? "bg-secondary text-foreground" : "hover:bg-muted"}`;

export const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  // Efeito para rolar para o topo quando a rota muda
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Função para rolar para o topo quando clica no link "Início"
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={scrollToTop}>
          <img src="/images/logo-imperial.png" alt="Logo Imperial Pet Studio - cachorro coroado" className="h-10 w-auto" loading="eager" />
          <span className="text-lg font-semibold">Imperial Pet Studio</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navLinkClass} onClick={scrollToTop}>Início</NavLink>
          <NavLink to="/servicos" className={navLinkClass}>Serviços</NavLink>
          <NavLink to="/produtos" className={navLinkClass}>Produtos</NavLink>
          <NavLink to="/contato" className={navLinkClass}>Contato</NavLink>
          <NavLink to="/roleta" className={navLinkClass}>Roleta</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {/* Botão de Agendamento */}
          {user && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/agendamento">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Agendamento</span>
              </Link>
            </Button>
          )}

          {/* Menu do Usuário */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.nome.split(' ')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                {!isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/meus-pets">
                      <Heart className="h-4 w-4 mr-2" />
                      Meus Pets
                    </Link>
                  </DropdownMenuItem>
                )}
                {!isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/agendamento">
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendamentos
                    </Link>
                  </DropdownMenuItem>
                )}
                {!isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/roleta">
                      <Dice5 className="h-4 w-4 mr-2" />
                      Roleta da Sorte
                    </Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Painel Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/roleta/admin">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Roleta
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/login">
                    <User className="h-4 w-4 mr-2" />
                    Entrar como Cliente
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/login?tipo=admin">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Entrar como Admin
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
