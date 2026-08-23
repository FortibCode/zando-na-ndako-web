"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  unit: string;
  image: string;
  quantity: number;
  vendeurId?: string;
  vendeurName?: string;
};

interface CartContextValue {
  items: CartItem[];
  count: number;
  totalAmount: number;
  isOpen: boolean;
  /** true once the cart has been read from localStorage — lets pages that redirect on an
   * empty cart (e.g. checkout steps) wait for the real value instead of the initial []. */
  hydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: { id: string; name: string; price: string; priceValue: number; unit: string; image: string; vendeurId?: string; vendeurName?: string }, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "zando_public_cart";

function loadStoredItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Le panier "de travail" est purement local (même logique que le mobile : il n'est poussé
  // côté serveur qu'au moment de passer commande) — persisté ici pour survivre à un rechargement.
  useEffect(() => {
    setItems(loadStoredItems());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0),
    [items]
  );

  const addItem = (
    product: { id: string; name: string; price: string; priceValue: number; unit: string; image: string; vendeurId?: string; vendeurName?: string },
    quantity = 1
  ) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      // Une commande n'est rattachée qu'à un seul vendeur côté backend (voir
      // PanierController::ajouter / CommandeController::valider) : mélanger deux boutiques ferait
      // silencieusement disparaître les articles du second vendeur de la commande. Même garde-fou
      // que mobile (client-context.tsx addToCart), via window.confirm ici faute d'un système de
      // modale accessible depuis ce fichier (pas de composant React monté globalement, contrairement
      // à mobile/src/contexts/alert-context.tsx).
      const currentVendeurId = prev[0]?.vendeurId;
      if (product.vendeurId && currentVendeurId && currentVendeurId !== product.vendeurId) {
        const ok = typeof window !== "undefined" && window.confirm(
          `Votre panier contient déjà des produits de « ${prev[0]?.vendeurName || "cette boutique"} ». Le vider pour ajouter ce produit d'une autre boutique ?`
        );
        if (!ok) return prev;
        return [{ ...product, quantity }];
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      totalAmount,
      isOpen,
      hydrated,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((prev) => !prev),
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, count, totalAmount, isOpen, hydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un <CartProvider>.");
  return ctx;
}
