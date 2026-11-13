import { createContext, useContext, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, session, type AuthResponse } from "./api";

type AuthState = {
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(session.token() ? session.email() : null);

  const finish = (a: AuthResponse) => {
    session.save(a);
    setEmail(a.email);
  };

  const value: AuthState = {
    email,
    login: async (e, p) => finish(await api.login(e, p)),
    register: async (e, p) => finish(await api.register(e, p)),
    logout: () => {
      session.clear();
      setEmail(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { email } = useAuth();
  const location = useLocation();
  if (!email) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
