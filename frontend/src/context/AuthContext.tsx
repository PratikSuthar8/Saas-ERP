import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../lib/api";

interface User {
  userId: string;
  tenantId: string;
  roles: string[];
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ mustChangePassword?: boolean }>;
  register: (companyName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          userId: payload.userId,
          tenantId: payload.tenantId,
          roles: payload.roles || [],
          mustChangePassword: payload.mustChangePassword || false,
        });
      } catch (e) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, mustChangePassword } = response.data.data;
    localStorage.setItem("token", token);
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser({
      userId: payload.userId,
      tenantId: payload.tenantId,
      roles: payload.roles || [],
      mustChangePassword: mustChangePassword || false,
    });
    return { mustChangePassword: mustChangePassword || false };
  };

  const register = async (companyName: string, email: string, password: string) => {
    const response = await api.post("/auth/register", { companyName, email, password });
    const { token } = response.data.data;
    localStorage.setItem("token", token);
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser({
      userId: payload.userId,
      tenantId: payload.tenantId,
      roles: payload.roles || [],
      mustChangePassword: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
