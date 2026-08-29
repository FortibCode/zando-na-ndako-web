"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  // Le passage de `user` à null pendant une déconnexion volontaire déclenche aussi les gardes
  // useRequirePublicAuth() / vendeur/layout.tsx qui, en réagissant au même changement d'état,
  // redirigeaient systématiquement vers /auth/login?redirect=... juste après — écrasant la
  // redirection voulue par l'appelant (ex: vers "/"). Ce ref permet à ces gardes de savoir qu'une
  // déconnexion volontaire est en cours et de laisser l'appelant décider seul de la destination.
  isLoggingOut: React.RefObject<boolean>;
}

const PublicAuthContext = createContext<PublicAuthContextValue | null>(null);

export function PublicAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isLoggingOut = useRef(false);

  useEffect(() => {
    setUser(getStoredPublicUser<PublicUser>());
    setIsReady(true);
  }, []);

  const login = useCallback(async (credential: string, motDePasse: string) => {
    try {
      const { token, user: loggedUser } = await publicLogin(credential, motDePasse);
      setPublicSession(token, loggedUser);
      isLoggingOut.current = false;
      setUser(loggedUser);
      return loggedUser as PublicUser;
    } catch (err) {
      throw err instanceof ApiError ? err : new ApiError("Impossible de se connecter.");
    }
  }, []);

  const logout = useCallback(() => {
    isLoggingOut.current = true;
    clearPublicSession();
    setUser(null);
  }, []);

  const setSession = useCallback((token: string, sessionUser: PublicUser) => {
    setPublicSession(token, sessionUser);
    isLoggingOut.current = false;
    setUser(sessionUser);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, login, logout, setSession, isLoggingOut }),
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
