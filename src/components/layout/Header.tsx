import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingCart, User, LogOut, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md transition-colors ${isActive ? "bg-secondary text-foreground" : "hover:bg-muted"}`;

export const Header = () => {
  const { items, total, remove, updateQty } = useCart();
  const { user, logout } = useAuth();
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

          {/* Carrinho */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="hero" size="sm" aria-label="Abrir carrinho">
                <ShoppingCart />
                <span className="hidden sm:inline">Carrinho ({items.length})</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Seu carrinho</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {items.length === 0 && <p className="text-muted-foreground">Seu carrinho está vazio.</p>}
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={`Produto ${item.name}`} className="h-20 w-20 rounded-md object-cover" loading="lazy" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">R$ {item.price.toFixed(2)}</p>
                        </div>
                        <button className="text-sm text-destructive hover:underline" onClick={() => remove(item.id)}>Remover</button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">Qtd.</label>
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => updateQty(item.id, Number(e.target.value))}
                          className="h-9 w-16 rounded-md border bg-background px-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {items.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <Button variant="hero" className="w-full">Finalizar compra</Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Menu do Usuário */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/agendamento">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendamentos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
