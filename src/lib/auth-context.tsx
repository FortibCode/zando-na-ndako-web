"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearSession, getStoredUser, getToken, setSession } from "@/lib/api";
import type { LoginUser } from "@/lib/types";

interface LoginResponse {
  success: boolean;
  message?: string;
  data: { token: string; token_type: string; user: LoginUser };
}

interface AuthContextValue {
  user: LoginUser | null;
  isReady: boolean;
  login: (credential: string, motDePasse: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser<LoginUser>());
    setIsReady(true);
  }, []);

  const login = useCallback(async (credential: string, motDePasse: string) => {
    const res = await api.post<LoginResponse>(
      "/login",
      { credential, mot_de_passe: motDePasse },
      { auth: false },
    );
    if (res.data.user.type_utilisateur !== "administrateur") {
      throw new Error(
        "Ce compte n'est pas un compte administrateur. Le back-office est réservé aux administrateurs.",
      );
    }
    setSession(res.data.token, res.data.user);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    // best-effort : on invalide côté serveur mais on ne bloque pas la déconnexion locale dessus
    api.post("/logout").catch(() => undefined);
    clearSession();
    setUser(null);
    router.replace("/admin/login");
  }, [router]);

  const value = useMemo(() => ({ user, isReady, login, logout }), [user, isReady, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un <AuthProvider>.");
  return ctx;
}

export function hasStoredToken(): boolean {
  return !!getToken();
}
