import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authApi, Cliente } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string, address?: string) => Promise<boolean>;
  updateProfile: (name: string, email: string, phone: string, address?: string) => Promise<boolean>;
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
            endereco: userData.endereco,
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
        endereco: response.cliente.endereco,
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

  const register = async (name: string, email: string, phone: string, password: string, address?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authApi.register({
        nome: name,
        email,
        password,
        telefone: phone,
        endereco: address,
      });
      
      // Salvar token
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userData", JSON.stringify(response.cliente));
      
      setUser({
        id: response.cliente.id,
        nome: response.cliente.nome,
        email: response.cliente.email,
        telefone: response.cliente.telefone,
        endereco: response.cliente.endereco,
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

  const updateProfile = async (name: string, email: string, phone: string, address?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authApi.updateProfile({
        nome: name,
        email,
        telefone: phone,
        endereco: address,
      });
      
      const updatedUser = {
        id: response.id,
        nome: response.nome,
        email: response.email,
        telefone: response.telefone,
        endereco: response.endereco,
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

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, changePassword, logout, isLoading }}>
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