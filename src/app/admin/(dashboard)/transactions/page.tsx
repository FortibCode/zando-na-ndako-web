"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Receipt, Eye } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, PaginatedData, Paiement, StatutPaiement } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/Badge";
import { formatDate, formatMontant, fullName } from "@/lib/format";
import { PAIEMENT_METHODE_LABEL, PAIEMENT_STATUT_TONE, PAIEMENT_STATUT_LABEL } from "@/lib/paiement-labels";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, HeaderStat } from "@/components/AdminTable";

const METHODES = [
  { value: "", label: "Tous les moyens" },
  { value: "mtn_momo", label: "MTN Mobile Money" },
  { value: "airtel_money", label: "Airtel Money" },
  { value: "carte_locale", label: "Carte bancaire" },
  { value: "stripe", label: "Carte (Stripe)" },
  { value: "paypal", label: "PayPal" },
  { value: "paiement_livraison", label: "Paiement à la livraison" },
];

const STATUTS: { value: StatutPaiement | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "valide", label: "Validé" },
  { value: "echoue", label: "Échoué" },
  { value: "rembourse", label: "Remboursé" },
];

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [methode, setMethode] = useState("");
  const [statut, setStatut] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-transactions", page, methode, statut, dateDebut, dateFin],
    queryFn: async () => {
      const qs = buildQuery({ page, methode, statut, date_debut: dateDebut, date_fin: dateFin });
      const res = await api.get<ApiEnvelope<PaginatedData<Paiement>>>(`/admin/transactions${qs}`);
      return res.data;
    },
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Transactions"
        description="Historique détaillé des paiements de la plateforme, tous moyens confondus."
        icon={Receipt}
        action={<HeaderStat icon={Receipt} label={`${data?.total ?? "—"} transactions`} tone="navy" />}
      />

      <FilterBar>
        <FilterSelect value={methode} onChange={(v) => { setPage(1); setMethode(v); }} options={METHODES} />
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
        <div className="flex items-center gap-2">
          <input type="date" value={dateDebut} onChange={(e) => { setPage(1); setDateDebut(e.target.value); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 focus:border-[#1A2E5A] focus:outline-none" />
          <span className="text-slate-300 font-bold">–</span>
          <input type="date" value={dateFin} onChange={(e) => { setPage(1); setDateFin(e.target.value); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 focus:border-[#1A2E5A] focus:outline-none" />
        </div>
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les transactions."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["Commande", "Client", "Moyen", "Montant", "Statut", "Date", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucune transaction trouvée."
        >
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
              <td className="px-5 py-3.5 font-black text-slate-800">{formatMontant(p.montant, p.devise)}</td>
              <td className="px-5 py-3.5"><Badge tone={PAIEMENT_STATUT_TONE[p.statut]}>{PAIEMENT_STATUT_LABEL[p.statut]}</Badge></td>
              <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{p.date_paiement ? formatDate(p.date_paiement, true) : "—"}</td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end">
                  {p.commande && <IconAction icon={Eye} label="Voir la commande" href={`/admin/commandes/${p.commande.id}`} variant="info" />}
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
