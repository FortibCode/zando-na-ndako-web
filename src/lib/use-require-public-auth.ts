"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePublicAuth } from "./public-auth-context";

// Redirige vers la connexion si aucun compte public n'est actif, en conservant la page visée
// pour y revenir automatiquement après connexion (voir redirect= dans /auth/login).
export function useRequirePublicAuth() {
  const { user, isReady, isLoggingOut } = usePublicAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Pendant une déconnexion volontaire, user passe à null mais la destination est déjà décidée
    // par l'appelant de logout() (ex: retour à "/") — ne pas la court-circuiter avec /auth/login.
    if (isReady && !user && !isLoggingOut.current) router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
  }, [isReady, user, router, pathname, isLoggingOut]);

  return { user, isReady };
}
