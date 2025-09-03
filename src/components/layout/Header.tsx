import { Link, NavLink } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md transition-colors ${isActive ? "bg-secondary text-foreground" : "hover:bg-muted"}`;

export const Header = () => {
  const { items, total, remove, updateQty } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/lovable-uploads/a4e1bfcb-a28a-4f19-b3b6-1f4dc6820291.png" alt="Logo Imperial Pet Studio - cachorro coroado" className="h-10 w-auto" loading="eager" />
          <span className="text-lg font-semibold">Imperial Pet Studio</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navLinkClass}>Início</NavLink>
          <NavLink to="/servicos" className={navLinkClass}>Serviços</NavLink>
          <NavLink to="/produtos" className={navLinkClass}>Produtos</NavLink>
          <NavLink to="/contato" className={navLinkClass}>Contato</NavLink>
        </nav>

        <div className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
};
