import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      if (response.data?.user) {
        setUser(response.data.user);
        setToken(currentToken);
      } else {
        // Handle standard API structure variations
        const u = response.data?.user || response.data;
        if (u && u.id) {
          setUser(u);
        } else {
          throw new Error("Invalid response format");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { username, password });
      const { token: receivedToken, user: loggedUser } = response.data;
      
      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);
      setUser(loggedUser);
    } catch (error: any) {
      setLoading(false);
      throw error.response?.data?.details || error.response?.data?.error || "Login failed.";
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", { username, password });
      const { token: receivedToken, user: registeredUser } = response.data;
      
      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);
      setUser(registeredUser);
    } catch (error: any) {
      setLoading(false);
      throw error.response?.data?.details || error.response?.data?.error || "Registration failed.";
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, checkAuth }}>
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
