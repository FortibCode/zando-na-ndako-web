"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw, Eye } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, PaginatedData, Paiement } from "@/lib/types";
import { LoadingBlock, ErrorBlock, EmptyState } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { formatDate, formatMontant, fullName } from "@/lib/format";
import { PAIEMENT_METHODE_LABEL } from "@/lib/paiement-labels";
import { AdminTable, AdminPageHeader, IconAction, HeaderStat } from "@/components/AdminTable";

export default function RemboursementsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-remboursements", page],
    queryFn: async () => {
      const qs = buildQuery({ page, statut: "rembourse" });
      const res = await api.get<ApiEnvelope<PaginatedData<Paiement>>>(`/admin/transactions${qs}`);
      return res.data;
    },
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Remboursements"
        description="Historique des paiements remboursés — l'action de remboursement se fait depuis la fiche commande."
        icon={RotateCcw}
        action={<HeaderStat icon={RotateCcw} label={`${data?.total ?? "—"} remboursements`} tone="red" />}
      />

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les remboursements."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState message="Aucun remboursement enregistré pour le moment." />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <AdminTable headers={["Commande", "Client", "Moyen", "Montant", "Date", "Actions"]}>
          {items.map((p) => (
            <tr key={p.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-3.5">
                <span className="rounded-xl bg-[#1A2E5A]/8 px-3 py-1.5 text-sm font-black text-[#1A2E5A]">
                  {p.commande?.numero_commande ?? "—"}
                </span>
              </td>
              <td className="px-5 py-3.5 text-sm font-semibold text-slate-600">
                {p.commande?.client?.user ? fullName(p.commande.client.user.nom, p.commande.client.user.prenom) : "—"}
              </td>
              <td className="px-5 py-3.5 text-sm font-bold text-slate-700">{PAIEMENT_METHODE_LABEL[p.methode] ?? p.methode}</td>
              <td className="px-5 py-3.5 font-black text-red-600">{formatMontant(p.montant, p.devise)}</td>
              <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{p.created_at ? formatDate(p.created_at, true) : "—"}</td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end">
                  {p.commande && <IconAction icon={Eye} label="Voir la commande" href={`/admin/commandes/${p.commande.id}`} variant="info" />}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && data.total > 0 && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}
    </div>
  );
}
