"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LifeBuoy, Eye } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, PaginatedData, TicketSupport, StatutTicket, CategorieTicket, PrioriteTicket } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/Badge";
import { formatDate, fullName } from "@/lib/format";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, UserAvatar, HeaderStat, RefreshButton } from "@/components/AdminTable";

const STATUTS: { value: StatutTicket | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "ouvert", label: "Ouvert" },
  { value: "en_cours", label: "En cours" },
  { value: "en_attente", label: "En attente" },
  { value: "resolu", label: "Résolu" },
  { value: "ferme", label: "Fermé" },
];

const CATEGORIES: { value: CategorieTicket | ""; label: string }[] = [
  { value: "", label: "Toutes les catégories" },
  { value: "commande", label: "Commande" },
  { value: "paiement", label: "Paiement" },
  { value: "livraison", label: "Livraison" },
  { value: "vendeur", label: "Vendeur" },
  { value: "livreur", label: "Livreur" },
  { value: "produit", label: "Produit" },
  { value: "remboursement", label: "Remboursement" },
  { value: "compte", label: "Compte" },
  { value: "autre", label: "Autre" },
];

const PRIORITES: { value: PrioriteTicket | ""; label: string }[] = [
  { value: "", label: "Toutes les priorités" },
  { value: "basse", label: "Basse" },
  { value: "normale", label: "Normale" },
  { value: "haute", label: "Haute" },
  { value: "urgente", label: "Urgente" },
];

const STATUT_TONE: Record<StatutTicket, "gold" | "green" | "red" | "gray" | "navy"> = {
  ouvert: "red", en_cours: "gold", en_attente: "navy", resolu: "green", ferme: "gray",
};
const STATUT_LABEL: Record<StatutTicket, string> = {
  ouvert: "Ouvert", en_cours: "En cours", en_attente: "En attente", resolu: "Résolu", ferme: "Fermé",
};
const PRIORITE_TONE: Record<PrioriteTicket, "gray" | "navy" | "gold" | "red"> = {
  basse: "gray", normale: "navy", haute: "gold", urgente: "red",
};
const PRIORITE_LABEL: Record<PrioriteTicket, string> = {
  basse: "Basse", normale: "Normale", haute: "Haute", urgente: "Urgente",
};

export default function TicketsPage() {
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");
  const [categorie, setCategorie] = useState("");
  const [priorite, setPriorite] = useState("");
  const [nonAssignes, setNonAssignes] = useState(false);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["admin-tickets", page, statut, categorie, priorite, nonAssignes],
    queryFn: async () => {
      const qs = buildQuery({ page, statut, categorie, priorite, non_assignes: nonAssignes ? 1 : undefined, per_page: 5 });
      return (await api.get<ApiEnvelope<PaginatedData<TicketSupport>>>(`/admin/tickets${qs}`)).data;
    },
    refetchInterval: 30_000,
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Tickets support"
        description="Réclamations et demandes d'assistance des clients, vendeurs et livreurs."
        icon={LifeBuoy}
        action={
          <div className="flex items-center gap-3">
            <HeaderStat icon={LifeBuoy} label={`${data?.total ?? "—"} tickets`} tone="red" />
            <RefreshButton onClick={() => refetch()} loading={isFetching} />
          </div>
        }
      />

      <FilterBar>
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
        <FilterSelect value={categorie} onChange={(v) => { setPage(1); setCategorie(v); }} options={CATEGORIES} />
        <FilterSelect value={priorite} onChange={(v) => { setPage(1); setPriorite(v); }} options={PRIORITES} />
        <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 cursor-pointer">
          <input type="checkbox" checked={nonAssignes} onChange={(e) => { setPage(1); setNonAssignes(e.target.checked); }}
            className="h-4 w-4 rounded border-slate-300 text-[#1A2E5A] focus:ring-[#1A2E5A]" />
          Non assignés
        </label>
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les tickets."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["N° Ticket", "Utilisateur", "Sujet", "Priorité", "Assigné à", "Statut", "Dernière activité", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucun ticket support."
        >
          {items.map((t) => (
            <tr key={t.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-3.5">
                <span className="rounded-xl bg-[#1A2E5A]/8 px-3 py-1.5 text-sm font-black text-[#1A2E5A]">{t.numero}</span>
              </td>
              <td className="px-5 py-3.5">
                {t.user ? (
                  <UserAvatar
                    name={fullName(t.user.nom, t.user.prenom)}
                    initials={`${t.user.nom?.[0] ?? ""}${t.user.prenom?.[0] ?? ""}`}
                    color="bg-sky-600"
                  />
                ) : <span className="text-slate-400 text-xs">—</span>}
              </td>
              <td className="px-5 py-3.5 max-w-[220px]">
                <p className="text-sm font-black text-slate-800 truncate">{t.sujet}</p>
                <p className="text-xs text-slate-400 capitalize mt-0.5">{t.categorie}</p>
              </td>
              <td className="px-5 py-3.5"><Badge tone={PRIORITE_TONE[t.priorite]}>{PRIORITE_LABEL[t.priorite]}</Badge></td>
              <td className="px-5 py-3.5 text-sm font-semibold text-slate-600">
                {t.admin_assigne?.user ? fullName(t.admin_assigne.user.nom, t.admin_assigne.user.prenom) : "—"}
              </td>
              <td className="px-5 py-3.5"><Badge tone={STATUT_TONE[t.statut]}>{STATUT_LABEL[t.statut]}</Badge></td>
              <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">
                {formatDate(t.date_derniere_reponse ?? t.created_at, true)}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end">
                  <IconAction icon={Eye} label="Voir le ticket" href={`/admin/tickets/${t.id}`} variant="info" />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}
    </div>
  );
}
