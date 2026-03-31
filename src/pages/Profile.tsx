import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Navigate } from "react-router-dom";
import { User, Lock, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Se não estiver logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Preenche os dados do usuário quando carrega
  useEffect(() => {
    if (user) {
      setProfileData({
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        cpf: user.cpf || "",
        logradouro: user.logradouro || "",
        numero: user.numero || "",
        complemento: user.complemento || "",
        bairro: user.bairro || "",
        cidade: user.cidade || "",
        estado: user.estado || "",
        cep: user.cep || ""
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { nome, email, telefone, cpf, logradouro, numero, complemento, bairro, cidade, estado, cep } = profileData;
    
    if (!nome || !email || !telefone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingProfile(true);
    
    const success = await updateProfile(nome, email, telefone, cpf, logradouro, numero, complemento, bairro, cidade, estado, cep);
    
    if (success) {
      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Este e-mail pode já estar em uso.",
        variant: "destructive"
      });
    }
    
    setIsUpdatingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);
    
    const success = await changePassword(currentPassword, newPassword);
    
    if (success) {
      toast({
        title: "Sucesso!",
        description: "Senha alterada com sucesso.",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } else {
      toast({
        title: "Erro",
        description: "Senha atual incorreta.",
        variant: "destructive"
      });
    }
    
    setIsChangingPassword(false);
  };

  return (
    <Layout>
      <Helmet>
        <title>Meu Perfil | Imperial Pet Studio</title>
        <meta name="description" content="Gerencie suas informações pessoais e configurações de conta." />
      </Helmet>

      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="mt-2 text-muted-foreground">
              Gerencie suas informações pessoais e configurações de conta
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Informações Pessoais
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Alterar Senha
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Atualize suas informações de contato
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome completo</Label>
                      <Input
                        id="nome"
                        name="nome"
                        type="text"
                        placeholder="Seu nome completo"
                        value={profileData.nome}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          name="telefone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={profileData.telefone}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          name="cpf"
                          type="text"
                          placeholder="000.000.000-00"
                          value={profileData.cpf}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Endereço</p>

                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2 space-y-2">
                            <Label htmlFor="logradouro">Logradouro</Label>
                            <Input
                              id="logradouro"
                              name="logradouro"
                              type="text"
                              placeholder="Rua, Av., etc."
                              value={profileData.logradouro}
                              onChange={handleProfileChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="numero">Número</Label>
                            <Input
                              id="numero"
                              name="numero"
                              type="text"
                              placeholder="123"
                              value={profileData.numero}
                              onChange={handleProfileChange}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="complemento">Complemento</Label>
                            <Input
                              id="complemento"
                              name="complemento"
                              type="text"
                              placeholder="Apto, Bloco, etc."
                              value={profileData.complemento}
                              onChange={handleProfileChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input
                              id="bairro"
                              name="bairro"
                              type="text"
                              placeholder="Seu bairro"
                              value={profileData.bairro}
                              onChange={handleProfileChange}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1 space-y-2">
                            <Label htmlFor="cep">CEP</Label>
                            <Input
                              id="cep"
                              name="cep"
                              type="text"
                              placeholder="00000-000"
                              value={profileData.cep}
                              onChange={handleProfileChange}
                            />
                          </div>
                          <div className="col-span-1 space-y-2">
                            <Label htmlFor="cidade">Cidade</Label>
                            <Input
                              id="cidade"
                              name="cidade"
                              type="text"
                              placeholder="Sua cidade"
                              value={profileData.cidade}
                              onChange={handleProfileChange}
                            />
                          </div>
                          <div className="col-span-1 space-y-2">
                            <Label htmlFor="estado">Estado</Label>
                            <Input
                              id="estado"
                              name="estado"
                              type="text"
                              placeholder="SP"
                              maxLength={2}
                              value={profileData.estado}
                              onChange={handleProfileChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      variant="hero"
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? (
                        "Salvando..."
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Alterar Senha
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Mantenha sua conta segura com uma senha forte
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha atual</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        placeholder="Digite sua senha atual"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova senha</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Digite a nova senha novamente"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      variant="hero"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        "Alterando..."
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Alterar Senha
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;