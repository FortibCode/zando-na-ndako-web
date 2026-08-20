"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, AlertTriangle, Gavel, Eye } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, Litige, PaginatedData, StatutLitige } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { StatutLitigeBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { formatDate, fullName } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, UserAvatar, HeaderStat, RefreshButton } from "@/components/AdminTable";

const STATUTS: { value: StatutLitige | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "ouvert", label: "Ouvert" },
  { value: "attente_vendeur", label: "En attente du vendeur" },
  { value: "attente_client", label: "En attente du client" },
  { value: "en_cours", label: "En cours" },
  { value: "escalade", label: "Escaladé" },
  { value: "resolu", label: "Résolu" },
  { value: "rejete", label: "Rejeté" },
  { value: "annule", label: "Annulé" },
];

export default function LitigesPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canTraiter = usePermission("traiter_litiges");

  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");
  const [target, setTarget] = useState<Litige | null>(null);
  const [newStatut, setNewStatut] = useState<StatutLitige>("en_cours");
  const [decision, setDecision] = useState("");

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["admin-litiges", page, statut],
    queryFn: async () => {
      const qs = buildQuery({ page, statut });
      return (await api.get<ApiEnvelope<PaginatedData<Litige>>>(`/admin/litiges${qs}`)).data;
    },
    refetchInterval: 30_000,
  });

  const traiterMutation = useMutation({
    mutationFn: () => api.post(`/admin/litiges/${target!.id}/traiter`, { statut: newStatut, decision }),
    onSuccess: () => {
      notify("Litige traité avec succès.");
      setTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-litiges"] });
    },
    onError: (err) => notifyError(err, "Impossible de traiter ce litige."),
  });

  function openTreat(l: Litige) {
    setTarget(l);
    setNewStatut(l.statut === "en_cours" ? "resolu" : "en_cours");
    setDecision("");
  }

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Gestion des litiges & réclamations"
        description="Traitement et arbitrage des litiges signalés par les clients ou vendeurs."
        icon={ShieldAlert}
        action={
          <div className="flex items-center gap-3">
            <HeaderStat icon={ShieldAlert} label={`${data?.total ?? "—"} litiges`} tone="red" />
            <RefreshButton onClick={() => refetch()} loading={isFetching} />
          </div>
        }
      />

      <FilterBar>
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les litiges."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["Motif & Description", "Commande", "Plaignant", "Ouvert le", "Traité par", "Statut", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucun litige signalé."
        >
          {items.map((l) => (
            <tr key={l.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-4 max-w-xs">
                <p className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                  {l.motif}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{l.description}</p>
                {l.decision && (
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                    <span className="font-black">Décision :</span> {l.decision}
                  </p>
                )}
              </td>
              <td className="px-5 py-4">
                <span className="rounded-xl bg-[#1A2E5A]/8 px-3 py-1.5 text-sm font-black text-[#1A2E5A]">
                  {l.commande?.numero_commande ?? l.commande_id}
                </span>
              </td>
              <td className="px-5 py-4">
                {l.plaignant ? (
                  <UserAvatar
                    name={fullName(l.plaignant.nom, l.plaignant.prenom)}
                    subtitle={l.plaignant.email ?? l.plaignant.telephone}
                    initials={`${l.plaignant.nom?.[0] ?? ""}${l.plaignant.prenom?.[0] ?? ""}`}
                    color="bg-red-600"
                  />
                ) : (
                  <span className="text-slate-400 text-xs">—</span>
                )}
              </td>
              <td className="px-5 py-4 text-sm text-slate-400 font-medium">{formatDate(l.date_ouverture, true)}</td>
              <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                {l.admin_traitant?.user ? fullName(l.admin_traitant.user.nom, l.admin_traitant.user.prenom) : "—"}
              </td>
              <td className="px-5 py-4">
                <StatutLitigeBadge value={l.statut} />
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <IconAction icon={Eye} label="Voir le détail" href={`/admin/litiges/${l.id}`} variant="info" />
                  {canTraiter && <IconAction icon={Gavel} label="Arbitrer / Traiter" onClick={() => openTreat(l)} variant="danger" />}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && (
        <Pagination
          currentPage={data.current_page}
          lastPage={data.last_page}
          total={data.total}
          from={data.from}
          to={data.to}
          onChange={setPage}
        />
      )}

      {target && (
        <Modal
          title={`Traiter le litige — Commande ${target.commande?.numero_commande ?? target.commande_id}`}
          onClose={() => setTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setTarget(null)} disabled={traiterMutation.isPending}>
                Annuler
              </Button>
              <Button variant="danger" onClick={() => traiterMutation.mutate()} loading={traiterMutation.isPending} disabled={!decision.trim()}>
                Enregistrer la décision
              </Button>
            </>
          }
        >
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50/60 p-4 text-sm text-slate-700">
            <p className="font-black text-red-900 flex items-center gap-1.5 mb-1">
              <AlertTriangle size={16} className="text-[#C00000]" />
              {target.motif}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">{target.description}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Nouveau statut du litige</label>
              <select
                value={newStatut}
                onChange={(e) => setNewStatut(e.target.value as StatutLitige)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium focus:border-[#1A2E5A] focus:outline-none"
              >
                <option value="en_cours">En cours de traitement</option>
                <option value="resolu">Résolu (Accord trouvé / Remboursement)</option>
                <option value="rejete">Rejeté (Réclamation non fondée)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">
                Décision administrative & explications (obligatoire)
              </label>
              <textarea
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000] focus:outline-none"
                placeholder="Indiquez la décision prise (remboursement, avertissement vendeur, clôture...) et la justification..."
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
