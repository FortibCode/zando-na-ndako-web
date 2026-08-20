const TONE_CLASSES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.2)]",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 shadow-[0_2px_8px_-2px_rgba(239,68,68,0.2)]",
  gold: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-500/25 shadow-[0_2px_8px_-2px_rgba(245,158,11,0.2)]",
  navy: "bg-[#1A2E5A]/8 text-[#1A2E5A] ring-1 ring-inset ring-[#1A2E5A]/20 shadow-[0_2px_8px_-2px_rgba(26,46,90,0.15)]",
  gray: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300/60",
};

const DOT_CLASSES: Record<string, string> = {
  green: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]",
  red: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]",
  gold: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]",
  navy: "bg-[#1A2E5A] shadow-[0_0_6px_rgba(26,46,90,0.6)]",
  gray: "bg-slate-400",
};

export type BadgeTone = keyof typeof TONE_CLASSES;

export function Badge({ tone = "gray", dot = true, children }: { tone?: BadgeTone; dot?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[14.5px] font-black tracking-tight whitespace-nowrap transition-all ${TONE_CLASSES[tone]}`}
    >
      {dot && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${DOT_CLASSES[tone]}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${DOT_CLASSES[tone]}`} />
        </span>
      )}
      {children}
    </span>
  );
}


const STATUT_COMPTE_TONE: Record<string, BadgeTone> = {
  actif: "green",
  suspendu: "red",
  en_attente_validation: "gold",
};

const STATUT_VALIDATION_TONE: Record<string, BadgeTone> = {
  valide: "green",
  suspendu: "red",
  en_attente: "gold",
};

const STATUT_COMMANDE_TONE: Record<string, BadgeTone> = {
  confirmee: "navy",
  achat_marche: "gold",
  preparation: "gold",
  en_route: "navy",
  en_route_client: "navy",
  livree: "green",
  annulee: "red",
};

const STATUT_LITIGE_TONE: Record<string, BadgeTone> = {
  ouvert: "red",
  attente_vendeur: "gold",
  attente_client: "gold",
  en_cours: "navy",
  escalade: "red",
  resolu: "green",
  rejete: "gray",
  annule: "gray",
};

const ETAT_STOCK_TONE: Record<string, BadgeTone> = {
  disponible: "green",
  stock_faible: "gold",
  rupture: "red",
};

const LABELS: Record<string, string> = {
  actif: "Actif",
  suspendu: "Suspendu",
  en_attente_validation: "En attente de validation",
  en_attente: "En attente",
  valide: "Validé",
  confirmee: "Confirmée",
  achat_marche: "Achat au marché",
  preparation: "Préparation",
  en_route: "En route",
  en_route_client: "En route vers le client",
  livree: "Livrée",
  annulee: "Annulée",
  ouvert: "Ouvert",
  attente_vendeur: "En attente du vendeur",
  attente_client: "En attente du client",
  en_cours: "En cours",
  escalade: "Escaladé",
  resolu: "Résolu",
  rejete: "Rejeté",
  annule: "Annulé",
  disponible: "Disponible",
  indisponible: "Indisponible",
  stock_faible: "Stock faible",
  rupture: "Rupture",
  assigne: "Assignée",
  echouee: "Échouée",
};

export function statutLabel(value: string): string {
  return LABELS[value] ?? value;
}

export function StatutCompteBadge({ value }: { value: string }) {
  return <Badge tone={STATUT_COMPTE_TONE[value] ?? "gray"}>{statutLabel(value)}</Badge>;
}

export function StatutValidationBadge({ value }: { value: string }) {
  return <Badge tone={STATUT_VALIDATION_TONE[value] ?? "gray"}>{statutLabel(value)}</Badge>;
}

export function StatutCommandeBadge({ value }: { value: string }) {
  return <Badge tone={STATUT_COMMANDE_TONE[value] ?? "gray"}>{statutLabel(value)}</Badge>;
}

export function StatutLitigeBadge({ value }: { value: string }) {
  return <Badge tone={STATUT_LITIGE_TONE[value] ?? "gray"}>{statutLabel(value)}</Badge>;
}

export function EtatStockBadge({ value }: { value: string }) {
  return <Badge tone={ETAT_STOCK_TONE[value] ?? "gray"}>{statutLabel(value)}</Badge>;
}
