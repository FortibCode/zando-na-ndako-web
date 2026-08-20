export const PAIEMENT_METHODE_LABEL: Record<string, string> = {
  stripe: "Carte bancaire (Stripe)",
  carte_locale: "Carte bancaire",
  paypal: "PayPal",
  mtn_momo: "MTN Mobile Money",
  airtel_money: "Airtel Money",
  paiement_livraison: "Paiement à la livraison",
};

export const PAIEMENT_STATUT_TONE: Record<string, "gold" | "green" | "red" | "gray"> = {
  en_attente: "gold",
  valide: "green",
  echoue: "red",
  rembourse: "gray",
};

export const PAIEMENT_STATUT_LABEL: Record<string, string> = {
  en_attente: "En attente",
  valide: "Validé",
  echoue: "Échoué",
  rembourse: "Remboursé",
};
