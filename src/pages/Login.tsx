import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, User } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAdmin: userIsAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = searchParams.get("tipo") === "admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const success = await login(email, password);

    if (success) {
      if (isAdmin) {
        // Verificar se o usuário tem permissão de admin após o login
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        if (userData.isAdmin) {
          navigate("/admin");
        } else {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão de administrador.",
            variant: "destructive",
          });
          // Faz logout pois não é admin
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
        }
      } else {
        navigate("/agendamento");
      }
    } else {
      toast({
        title: "Erro",
        description: "Email ou senha incorretos.",
        variant: "destructive"
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <Helmet>
        <title>Login | Imperial Pet Studio</title>
        <meta name="description" content="Faça login para acessar a área de agendamentos da Imperial Pet Studio." />
      </Helmet>

      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                {isAdmin ? (
                  <div className="bg-primary/10 text-primary rounded-full p-3">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                ) : (
                  <div className="bg-muted rounded-full p-3">
                    <User className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl">
                {isAdmin ? "Acesso Administrativo" : "Entrar na sua conta"}
              </CardTitle>
              <p className="text-muted-foreground">
                {isAdmin
                  ? "Entre com suas credenciais de administrador"
                  : "Entre com seus dados para acessar o agendamento"}
              </p>
              <div className="flex justify-center gap-2 mt-3">
                <Button
                  variant={!isAdmin ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchParams({})}
                >
                  <User className="h-3.5 w-3.5 mr-1" />
                  Cliente
                </Button>
                <Button
                  variant={isAdmin ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchParams({ tipo: "admin" })}
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  Admin
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="hero"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Entrando..." : isAdmin ? "Entrar como Admin" : "Entrar"}
                </Button>
              </form>
              
              {!isAdmin && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Ainda não tem uma conta?{" "}
                  <Link to="/register" className="text-primary hover:underline">
                    Cadastre-se aqui
                  </Link>
                </p>
              </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Login;