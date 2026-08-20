"use client";

import { useCallback, useEffect, useState } from "react";

// Aucune route backend n'existe pour les favoris (ni sur mobile, ni ici) — mêmes clés/logique
// que mobile/src/contexts/client-context.tsx (@zando_client_favorites), en localStorage côté web.
const STORAGE_KEY = "zando_client_favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("zando-favorites-changed"));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());
    const onChange = () => setFavorites(readFavorites());
    window.addEventListener("zando-favorites-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("zando-favorites-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    const current = readFavorites();
    const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
    writeFavorites(next);
    setFavorites(next);
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
