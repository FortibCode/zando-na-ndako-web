"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  clearPublicSession,
  getPublicToken,
  getStoredPublicUser,
  publicLogin,
  setPublicSession,
} from "@/lib/api";

export interface PublicUser {
  id: string;
  nom_complet?: string;
  email?: string | null;
  telephone?: string;
  type_utilisateur: "client" | "vendeur" | "livreur" | "administrateur";
  statut_compte?: string;
  photo_profil?: string | null;
  [key: string]: any;
}

interface PublicAuthContextValue {
  user: PublicUser | null;
  isReady: boolean;
  login: (credential: string, motDePasse: string) => Promise<PublicUser>;
  logout: () => void;
  setSession: (token: string, user: PublicUser) => void;
}

const PublicAuthContext = createContext<PublicAuthContextValue | null>(null);

export function PublicAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(getStoredPublicUser<PublicUser>());
    setIsReady(true);
  }, []);

  const login = useCallback(async (credential: string, motDePasse: string) => {
    try {
      const { token, user: loggedUser } = await publicLogin(credential, motDePasse);
      setPublicSession(token, loggedUser);
      setUser(loggedUser);
      return loggedUser as PublicUser;
    } catch (err) {
      throw err instanceof ApiError ? err : new ApiError("Impossible de se connecter.");
    }
  }, []);

  const logout = useCallback(() => {
    clearPublicSession();
    setUser(null);
  }, []);

  const setSession = useCallback((token: string, sessionUser: PublicUser) => {
    setPublicSession(token, sessionUser);
    setUser(sessionUser);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, login, logout, setSession }),
    [user, isReady, login, logout, setSession],
  );

  return <PublicAuthContext.Provider value={value}>{children}</PublicAuthContext.Provider>;
}

export function usePublicAuth() {
  const ctx = useContext(PublicAuthContext);
  if (!ctx) throw new Error("usePublicAuth doit être utilisé dans un PublicAuthProvider.");
  return ctx;
}

export function isPublicAuthenticated(): boolean {
  return Boolean(getPublicToken());
}
