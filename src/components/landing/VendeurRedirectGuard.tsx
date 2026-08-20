"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePublicAuth } from "@/lib/public-auth-context";

// Un vendeur connecté n'a rien à faire sur la vitrine publique — comme sur mobile où /vendor est
// une arborescence totalement séparée de /client, jamais un simple visiteur "supplémentaire".
export function VendeurRedirectGuard() {
  const { user, isReady } = usePublicAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && user?.type_utilisateur === "vendeur") {
      router.replace("/vendeur");
    }
  }, [isReady, user, router]);

  return null;
}
