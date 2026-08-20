"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePublicAuth } from "./public-auth-context";

// Redirige vers la connexion si aucun compte public n'est actif, en conservant la page visée
// pour y revenir automatiquement après connexion (voir redirect= dans /auth/login).
export function useRequirePublicAuth() {
  const { user, isReady } = usePublicAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isReady && !user) router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
  }, [isReady, user, router, pathname]);

  return { user, isReady };
}
