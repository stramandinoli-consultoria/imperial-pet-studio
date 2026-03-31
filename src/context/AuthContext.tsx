import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authApi, Cliente, roletaAdminApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  isAdmin?: boolean;
}

interface AdminInfo {
  id: number;
  nome: string;
  login: string;
  perfil: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  adminInfo: AdminInfo | null;
  adminLogin: (login: string, senha: string) => Promise<boolean>;
  adminLogout: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string, cpf?: string, logradouro?: string, numero?: string, complemento?: string, bairro?: string, cidade?: string, estado?: string, cep?: string) => Promise<boolean>;
  updateProfile: (nome: string, email: string, telefone: string, cpf?: string, logradouro?: string, numero?: string, complemento?: string, bairro?: string, cidade?: string, estado?: string, cep?: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(() => {
    const stored = localStorage.getItem("adminInfo");
    return stored ? JSON.parse(stored) : null;
  });
  const isAdmin = user?.isAdmin === true || (adminInfo !== null && !!localStorage.getItem("adminToken"));

  // Verificar se há usuário autenticado ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const userData = await authApi.getProfile();
          setUser({
            id: userData.id,
            nome: userData.nome,
            email: userData.email,
            telefone: userData.telefone,
            cpf: userData.cpf,
            logradouro: userData.logradouro,
            numero: userData.numero,
            complemento: userData.complemento,
            bairro: userData.bairro,
            cidade: userData.cidade,
            estado: userData.estado,
            cep: userData.cep,
            isAdmin: (userData as any).isAdmin ?? false,
          });
        } catch (error) {
          // Token inválido, remover
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authApi.login(email, password);
      
      // Salvar token
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userData", JSON.stringify(response.cliente));
      
      setUser({
        id: response.cliente.id,
        nome: response.cliente.nome,
        email: response.cliente.email,
        telefone: response.cliente.telefone,
        cpf: response.cliente.cpf,
        logradouro: response.cliente.logradouro,
        numero: response.cliente.numero,
        complemento: response.cliente.complemento,
        bairro: response.cliente.bairro,
        cidade: response.cliente.cidade,
        estado: response.cliente.estado,
        cep: response.cliente.cep,
        isAdmin: (response.cliente as any).isAdmin ?? false,
      });
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${response.cliente.nome}!`,
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Credenciais inválidas",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, phone: string, password: string, cpf?: string, logradouro?: string, numero?: string, complemento?: string, bairro?: string, cidade?: string, estado?: string, cep?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authApi.register({
        nome: name,
        email,
        password,
        telefone: phone,
        cpf,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
      });
      
      // Salvar token
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userData", JSON.stringify(response.cliente));
      
      setUser({
        id: response.cliente.id,
        nome: response.cliente.nome,
        email: response.cliente.email,
        telefone: response.cliente.telefone,
        cpf: response.cliente.cpf,
        logradouro: response.cliente.logradouro,
        numero: response.cliente.numero,
        complemento: response.cliente.complemento,
        bairro: response.cliente.bairro,
        cidade: response.cliente.cidade,
        estado: response.cliente.estado,
        cep: response.cliente.cep,
        isAdmin: (response.cliente as any).isAdmin ?? false,
      });
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: `Bem-vindo(a), ${response.cliente.nome}!`,
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Erro no registro:", error);
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Erro ao criar conta",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const updateProfile = async (nome: string, email: string, telefone: string, cpf?: string, logradouro?: string, numero?: string, complemento?: string, bairro?: string, cidade?: string, estado?: string, cep?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authApi.updateProfile({
        nome,
        email,
        telefone,
        cpf,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
      });
      
      const updatedUser = {
        id: response.id,
        nome: response.nome,
        email: response.email,
        telefone: response.telefone,
        cpf: response.cpf,
        logradouro: response.logradouro,
        numero: response.numero,
        complemento: response.complemento,
        bairro: response.bairro,
        cidade: response.cidade,
        estado: response.estado,
        cep: response.cep,
      };
      
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(response));
      
      toast({
        title: "Perfil atualizado com sucesso!",
        description: "Suas informações foram salvas.",
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error instanceof Error ? error.message : "Erro ao salvar informações",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // TODO: Implementar endpoint de mudança de senha na API
      // Por enquanto, retornamos false
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A alteração de senha será implementada em breve",
        variant: "destructive",
      });
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro ao alterar senha",
        description: error instanceof Error ? error.message : "Erro interno",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  const adminLogin = async (login: string, senha: string): Promise<boolean> => {
    try {
      const response = await roletaAdminApi.adminLogin(login, senha);
      localStorage.setItem("adminToken", response.token);
      localStorage.setItem("adminInfo", JSON.stringify(response.usuario));
      setAdminInfo(response.usuario);
      toast({ title: "Login admin realizado!", description: `Bem-vindo(a), ${response.usuario.nome}!` });
      return true;
    } catch (error) {
      toast({
        title: "Erro no login admin",
        description: error instanceof Error ? error.message : "Credenciais inválidas",
        variant: "destructive",
      });
      return false;
    }
  };

  const adminLogout = () => {
    setAdminInfo(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    toast({ title: "Admin desconectado" });
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, adminInfo, adminLogin, adminLogout, login, register, updateProfile, changePassword, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};