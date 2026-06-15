import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    confirmPassword: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, email, phone, password, confirmPassword } = formData;
    
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios (*)",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const success = await register(
      name, 
      email, 
      phone, 
      password, 
      formData.cpf || undefined,
      formData.logradouro || undefined,
      formData.numero || undefined,
      formData.complemento || undefined,
      formData.bairro || undefined,
      formData.cidade || undefined,
      formData.estado || undefined,
      formData.cep || undefined
    );
    
    if (success) {
      toast({
        title: "Sucesso!",
        description: "Cadastro realizado com sucesso.",
      });
      navigate("/agendamento");
    } else {
      toast({
        title: "Erro",
        description: "Este e-mail já está cadastrado.",
        variant: "destructive"
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <Helmet>
        <title>Cadastro | Imperial Pet Studio</title>
        <meta name="description" content="Crie sua conta para agendar serviços na Imperial Pet Studio." />
      </Helmet>

      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Criar sua conta</CardTitle>
              <p className="text-muted-foreground">
                Cadastre-se para agendar serviços para seu pet
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seção: Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Dados Pessoais</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Seção: Endereço */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Endereço</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logradouro">Rua/Logradouro</Label>
                    <Input
                      id="logradouro"
                      name="logradouro"
                      type="text"
                      placeholder="Rua Exemplo"
                      value={formData.logradouro}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        name="numero"
                        type="text"
                        placeholder="123"
                        value={formData.numero}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        name="complemento"
                        type="text"
                        placeholder="Apt 45"
                        value={formData.complemento}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        name="cep"
                        type="text"
                        placeholder="12345-678"
                        value={formData.cep}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        name="bairro"
                        type="text"
                        placeholder="Bairro"
                        value={formData.bairro}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        name="cidade"
                        type="text"
                        placeholder="São Paulo"
                        value={formData.cidade}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        name="estado"
                        type="text"
                        placeholder="SP"
                        value={formData.estado}
                        onChange={handleChange}
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Segurança */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Segurança</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="hero"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Cadastrando..." : "Criar conta"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Faça login aqui
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Register;