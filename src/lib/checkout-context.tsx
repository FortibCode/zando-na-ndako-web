"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Beneficiaire, DeliveryAddress } from "./api";

export type DeliverySlot = { day: "today" | "tomorrow"; label: string; debut: string; fin: string };

interface CheckoutContextValue {
  address: DeliveryAddress | null;
  setAddress: (address: DeliveryAddress | null) => void;
  beneficiaire: Beneficiaire | null;
  setBeneficiaire: (beneficiaire: Beneficiaire | null) => void;
  slot: DeliverySlot | null;
  setSlot: (slot: DeliverySlot | null) => void;
  reset: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

// Calcule les horodatages ISO d'un créneau à partir du jour et du libellé (ex: "10h - 12h") —
// même logique que mobile/src/contexts/client-context.tsx:computeSlotDates, pour rester compatible
// avec la contrainte backend "after:now" sur creneau_livraison_debut.
export function computeSlotDates(day: "today" | "tomorrow", label: string): { debut: string; fin: string } {
  const [startStr, endStr] = label.split(" - ");
  const base = new Date();
  if (day === "tomorrow") base.setDate(base.getDate() + 1);
  const [startH] = startStr.replace("h", ":").split(":").map(Number);
  const [endH] = endStr.replace("h", ":").split(":").map(Number);
  const debut = new Date(base);
  debut.setHours(startH, 0, 0, 0);
  const fin = new Date(base);
  fin.setHours(endH, 0, 0, 0);
  if (debut.getTime() <= Date.now()) {
    debut.setDate(debut.getDate() + 1);
    fin.setDate(fin.getDate() + 1);
  }
  return { debut: debut.toISOString(), fin: fin.toISOString() };
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<DeliveryAddress | null>(null);
  const [beneficiaire, setBeneficiaire] = useState<Beneficiaire | null>(null);
  const [slot, setSlot] = useState<DeliverySlot | null>(null);

  const reset = useCallback(() => {
    setAddress(null);
    setBeneficiaire(null);
    setSlot(null);
  }, []);

  const value = useMemo(
    () => ({ address, setAddress, beneficiaire, setBeneficiaire, slot, setSlot, reset }),
    [address, beneficiaire, slot, reset],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout doit être utilisé dans un <CheckoutProvider>.");
  return ctx;
}
