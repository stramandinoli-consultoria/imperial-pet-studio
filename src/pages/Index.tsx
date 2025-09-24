import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-imperial.jpg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

type Props = { initialSection?: "servicos" | "produtos" | "contato" };

const Index = ({ initialSection }: Props) => {
  const { add } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (initialSection) {
      const el = document.getElementById(initialSection);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [initialSection]);

  return (
    <Layout>
      <Helmet>
        <title>Imperial Pet Studio | Banho e Tosa & Pet Shop</title>
        <meta name="description" content="Banho e tosa com elegância. Brinquedos, roupas e ração para cães e gatos. Agende online na Imperial Pet Studio." />
        <link rel="canonical" href="https://imperialpets.com.br/" />
      </Helmet>

      {/* Hero */}
      <section className="relative">
        <div className="container grid items-center gap-8 py-12 md:grid-cols-2 md:py-16">
          <div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">Imperial Pet Studio</h1>
            <p className="mt-3 text-lg text-muted-foreground">Elegância para o seu melhor amigo. Banho e tosa premium, com produtos selecionados para cães e gatos.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {user ? (
                <Button variant="hero" size="lg" asChild>
                  <Link to="/agendamento">Agendar Banho & Tosa</Link>
                </Button>
              ) : (
                <Button variant="hero" size="lg" asChild>
                  <Link to="/login">Agendar Banho & Tosa</Link>
                </Button>
              )}
              <a href="#produtos" className="inline-flex"><Button variant="outline" size="lg">Ver Produtos</Button></a>
            </div>
          </div>
          <div className="relative">
            <img src={heroImage} alt="Cão e gato após banho e tosa no estúdio" className="rounded-xl shadow-[var(--shadow-elev)] object-cover w-full h-[320px] md:h-[420px]" loading="eager" />
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-[hsl(var(--ring)/0.25)]"></div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="container py-12 md:py-16">
        <h2 className="text-3xl font-semibold">Serviços de Banho & Tosa</h2>
        <p className="mt-2 text-muted-foreground">Cuidamos do seu pet com carinho e técnica profissional.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Banho Premium", desc: "Higienização completa com produtos hipoalergênicos.", price: "a partir de R$ 60" },
            { title: "Tosa na Tesoura", desc: "Corte artístico e personalizado para cada raça.", price: "a partir de R$ 90" },
            { title: "Higiene Completa", desc: "Corte de unhas, limpeza de ouvidos e hidratação.", price: "a partir de R$ 45" },
          ].map((s) => (
            <Card key={s.title} className="shadow-sm">
              <CardHeader>
                <CardTitle>{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{s.desc}</p>
                <p className="mt-3 font-semibold">{s.price}</p>
                <div className="mt-4">
                  {user ? (
                    <Button variant="hero" asChild>
                      <Link to="/agendamento">Agendar</Link>
                    </Button>
                  ) : (
                    <Button variant="hero" asChild>
                      <Link to="/login">Agendar</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Produtos */}
      <section id="produtos" className="container py-12 md:py-16">
        <h2 className="text-3xl font-semibold">Produtos para Cães e Gatos</h2>
        <p className="mt-2 text-muted-foreground">Brinquedos, roupas e ração selecionados para todas as idades.</p>
        <Tabs defaultValue="brinquedos" className="mt-6">
          <TabsList>
            <TabsTrigger value="brinquedos">Brinquedos</TabsTrigger>
            <TabsTrigger value="roupas">Roupas</TabsTrigger>
            <TabsTrigger value="racao">Ração</TabsTrigger>
          </TabsList>
          {(["brinquedos","roupas","racao"] as const).map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.filter(p => p.category === cat).map((p) => (
                  <Card key={p.id} className="overflow-hidden">
                    <img src={p.image} alt={`Produto ${p.name}`} className="h-52 w-full object-cover" loading="lazy" />
                    <CardContent className="pt-4">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{p.pet === 'caes' ? 'para cães' : p.pet === 'gatos' ? 'para gatos' : 'para ambos'}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-semibold">R$ {p.price.toFixed(2)}</span>
                        <Button size="sm" variant="hero" onClick={() => add(p)}>Adicionar</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Contato */}
      <section id="contato" className="container py-12 md:py-16">
        <h2 className="text-3xl font-semibold">Entre em Contato</h2>
        <p className="mt-2 text-muted-foreground">Agende um horário ou tire dúvidas. Responderemos rapidamente.</p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2">
          <input required name="nome" placeholder="Seu nome" className="h-11 rounded-md border bg-background px-3" />
          <input required name="email" type="email" placeholder="Seu e-mail" className="h-11 rounded-md border bg-background px-3" />
          <input required name="telefone" placeholder="Telefone/WhatsApp" className="h-11 rounded-md border bg-background px-3 sm:col-span-2" />
          <textarea required name="mensagem" placeholder="Mensagem" className="min-h-32 rounded-md border bg-background px-3 py-2 sm:col-span-2" />
          <div>
            <Button variant="hero">Enviar</Button>
          </div>
        </form>
      </section>
    </Layout>
  );
};

export default Index;
