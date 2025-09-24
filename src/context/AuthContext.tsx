import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  updateProfile: (name: string, email: string, phone: string) => Promise<boolean>;
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

  // Simular carregamento inicial - verificar se há usuário salvo
  useEffect(() => {
    const savedUser = localStorage.getItem("imperial_pet_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simular autenticação - em produção, seria uma chamada para API
    const users = JSON.parse(localStorage.getItem("imperial_pet_users") || "[]");
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
      };
      setUser(userData);
      localStorage.setItem("imperial_pet_user", JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simular registro - em produção, seria uma chamada para API
    const users = JSON.parse(localStorage.getItem("imperial_pet_users") || "[]");
    
    // Verificar se email já existe
    if (users.find((u: any) => u.email === email)) {
      setIsLoading(false);
      return false;
    }
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      password, // Em produção, seria hasheado
    };
    
    users.push(newUser);
    localStorage.setItem("imperial_pet_users", JSON.stringify(users));
    
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
    };
    
    setUser(userData);
    localStorage.setItem("imperial_pet_user", JSON.stringify(userData));
    setIsLoading(false);
    return true;
  };

  const updateProfile = async (name: string, email: string, phone: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simular atualização - em produção, seria uma chamada para API
      const users = JSON.parse(localStorage.getItem("imperial_pet_users") || "[]");
      const userIndex = users.findIndex((u: any) => u.id === user?.id);
      
      if (userIndex === -1) {
        setIsLoading(false);
        return false;
      }
      
      // Verificar se o novo email já existe (e não é o email atual do usuário)
      const emailExists = users.find((u: any) => u.email === email && u.id !== user?.id);
      if (emailExists) {
        setIsLoading(false);
        return false;
      }
      
      // Atualizar dados do usuário
      users[userIndex] = { ...users[userIndex], name, email, phone };
      localStorage.setItem("imperial_pet_users", JSON.stringify(users));
      
      // Atualizar usuário logado
      const updatedUser = { id: user!.id, name, email, phone };
      setUser(updatedUser);
      localStorage.setItem("imperial_pet_user", JSON.stringify(updatedUser));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simular verificação de senha - em produção, seria uma chamada para API
      const users = JSON.parse(localStorage.getItem("imperial_pet_users") || "[]");
      const userIndex = users.findIndex((u: any) => u.id === user?.id);
      
      if (userIndex === -1) {
        setIsLoading(false);
        return false;
      }
      
      // Verificar senha atual
      if (users[userIndex].password !== currentPassword) {
        setIsLoading(false);
        return false;
      }
      
      // Atualizar senha
      users[userIndex].password = newPassword;
      localStorage.setItem("imperial_pet_users", JSON.stringify(users));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("imperial_pet_user");
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