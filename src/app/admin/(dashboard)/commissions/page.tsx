"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Landmark, Check, Eye } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, PaginatedData, CommissionAdmin, StatutCommission } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/Badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatDate, formatMontant } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, HeaderStat } from "@/components/AdminTable";

const STATUTS: { value: StatutCommission | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "validee", label: "Validée" },
];

export default function CommissionsPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canManage = usePermission("manage_commissions");
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");
  const [validateTarget, setValidateTarget] = useState<CommissionAdmin | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-commissions", page, statut],
    queryFn: async () => {
      const qs = buildQuery({ page, statut });
      const res = await api.get<ApiEnvelope<PaginatedData<CommissionAdmin>>>(`/admin/commissions${qs}`);
      return res.data;
    },
  });

  const validateMutation = useMutation({
    mutationFn: () => api.post(`/admin/commissions/${validateTarget!.id}/valider`),
    onSuccess: () => {
      notify("Commission validée.");
      setValidateTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-commissions"] });
    },
    onError: (err) => notifyError(err, "Impossible de valider cette commission."),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Commissions"
        description="Commission de 10% prélevée sur chaque commande livrée."
        icon={Landmark}
        action={<HeaderStat icon={Landmark} label={`${data?.total ?? "—"} commissions`} tone="gold" />}
      />

      <FilterBar>
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les commissions."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["Commande", "Vendeur", "Taux", "Montant", "Statut", "Calculée le", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucune commission trouvée."
        >
          {items.map((c) => (
            <tr key={c.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-3.5">
                <span className="rounded-xl bg-[#1A2E5A]/8 px-3 py-1.5 text-sm font-black text-[#1A2E5A]">
                  {c.commande?.numero_commande ?? "—"}
                </span>
              </td>
              <td className="px-5 py-3.5 text-sm font-semibold text-slate-600">{c.commande?.vendeur?.nom_commerce ?? "—"}</td>
              <td className="px-5 py-3.5 text-sm font-bold text-slate-500">{Math.round(Number(c.taux_commission) * 100)}%</td>
              <td className="px-5 py-3.5 font-black text-emerald-600">{formatMontant(c.montant_commission)}</td>
              <td className="px-5 py-3.5">
                <Badge tone={c.statut === "validee" ? "green" : "gold"}>{c.statut === "validee" ? "Validée" : "En attente"}</Badge>
              </td>
              <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{formatDate(c.date_calcul, true)}</td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-2">
                  {c.commande && <IconAction icon={Eye} label="Voir la commande" href={`/admin/commandes/${c.commande.id}`} variant="info" />}
                  {canManage && c.statut !== "validee" && (
                    <IconAction icon={Check} label="Valider" onClick={() => setValidateTarget(c)} variant="success" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {validateTarget && (
        <ConfirmDialog
          title="Valider cette commission"
          message={`Confirmez-vous la validation de la commission de ${formatMontant(validateTarget.montant_commission)} ?`}
          confirmLabel="Valider"
          loading={validateMutation.isPending}
          onConfirm={() => validateMutation.mutate()}
          onClose={() => setValidateTarget(null)}
        />
      )}
    </div>
  );
}
