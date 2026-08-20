"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Route, AlertTriangle, Clock, UserCheck, Star } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ApiEnvelope, CommandeEnAttente, LivreurDisponible } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Badge, StatutCommandeBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { formatDate, formatMontant, fullName } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminPageHeader, AdminTable, HeaderStat } from "@/components/AdminTable";

export default function AttributionPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canAssign = usePermission("assign_commandes");
  const [target, setTarget] = useState<CommandeEnAttente | null>(null);
  const [selectedLivreur, setSelectedLivreur] = useState("");

  const { data: file, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-attribution-file"],
    queryFn: async () => (await api.get<ApiEnvelope<CommandeEnAttente[]> & { meta: { total: number; en_retard: number; delai_alerte_minutes: number } }>("/admin/attribution/file-attente")),
    refetchInterval: 30_000,
  });

  const { data: livreurs, isLoading: livreursLoading } = useQuery({
    queryKey: ["admin-attribution-livreurs"],
    queryFn: async () => (await api.get<ApiEnvelope<LivreurDisponible[]> & { meta: { max_missions_simultanees: number } }>("/admin/attribution/livreurs")),
    enabled: !!target,
  });

  const attribuerMutation = useMutation({
    mutationFn: () => api.post(`/admin/commandes/${target?.id}/attribuer`, { livreur_id: selectedLivreur }),
    onSuccess: () => {
      notify("Commande attribuée avec succès.");
      setTarget(null);
      setSelectedLivreur("");
      queryClient.invalidateQueries({ queryKey: ["admin-attribution-file"] });
    },
    onError: (err) => notifyError(err, "Impossible d'attribuer cette commande."),
  });

  const items = file?.data ?? [];
  const meta = file?.meta;

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Attribution des commandes"
        description="Commandes en attente d'un livreur — auto-acceptées par un livreur disponible ou attribuées manuellement ici."
        icon={Route}
        action={
          <div className="flex items-center gap-3">
            <HeaderStat icon={Clock} label={`${meta?.total ?? "—"} en attente`} tone="navy" />
            <HeaderStat icon={AlertTriangle} label={`${meta?.en_retard ?? "—"} en retard`} tone={meta && meta.en_retard > 0 ? "red" : "slate"} />
          </div>
        }
      />

      {meta && (
        <p className="text-xs font-medium text-slate-400">
          Une commande est signalée « en retard » après {meta.delai_alerte_minutes} minutes sans attribution — seuil modifiable dans Paramètres.
        </p>
      )}

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger la file d'attribution."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["Commande", "Client", "Vendeur", "Adresse", "Montant", "Depuis", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucune commande en attente d'attribution."
        >
          {items.map((c) => (
            <tr key={c.id} className={`row-accent hover:bg-slate-50/70 transition-colors ${c.en_retard ? "bg-red-50/40" : ""}`}>
              <td className="px-5 py-3.5">
                <p className="text-xs font-black text-slate-800">{c.numero_commande}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <StatutCommandeBadge value={c.statut_commande} />
                  {c.en_retard && (
                    <Badge tone="red">
                      <AlertTriangle size={10} className="mr-1 inline" /> En retard
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-5 py-3.5 text-xs font-bold text-slate-700">
                {c.client ? fullName(c.client.nom, c.client.prenom) : "—"}
              </td>
              <td className="px-5 py-3.5 text-xs font-medium text-slate-500">{c.vendeur ?? "—"}</td>
              <td className="px-5 py-3.5 text-xs text-slate-500 max-w-55 truncate">{c.adresse_livraison}</td>
              <td className="px-5 py-3.5 text-xs font-black text-slate-800">{formatMontant(c.montant_total)}</td>
              <td className="px-5 py-3.5 text-xs text-slate-400 font-medium whitespace-nowrap">{formatDate(c.date_commande, true)}</td>
              <td className="px-5 py-3.5 text-right">
                {canAssign && (
                  <Button
                    variant="ghost"
                    className="py-1.5! px-3! text-[12.5px]!"
                    onClick={() => { setTarget(c); setSelectedLivreur(""); }}
                  >
                    <UserCheck size={13} /> Attribuer
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {target && (
        <Modal
          title={`Attribuer un livreur — ${target.numero_commande}`}
          onClose={() => setTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setTarget(null)} disabled={attribuerMutation.isPending}>Annuler</Button>
              <Button onClick={() => attribuerMutation.mutate()} loading={attribuerMutation.isPending} disabled={!selectedLivreur}>
                Attribuer
              </Button>
            </>
          }
        >
          {livreursLoading || !livreurs ? (
            <LoadingBlock label="Chargement des livreurs disponibles…" />
          ) : livreurs.data.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun livreur disponible pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {livreurs.data.map((l) => (
                <label
                  key={l.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    selectedLivreur === l.id ? "border-[#1A2E5A] bg-[#1A2E5A]/5" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="livreur"
                      value={l.id}
                      checked={selectedLivreur === l.id}
                      onChange={() => setSelectedLivreur(l.id)}
                      className="h-4 w-4 accent-[#1A2E5A]"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{fullName(l.nom, l.prenom)}</p>
                      <p className="flex items-center gap-1 text-[12.5px] text-slate-400">
                        <Star size={11} className="fill-amber-400 text-amber-400" /> {l.note_moyenne ?? "—"} · {l.missions_actives} mission(s) active(s)
                      </p>
                    </div>
                  </div>
                  {l.surcharge && (
                    <Badge tone="gold">
                      <AlertTriangle size={10} className="mr-1 inline" /> Surchargé
                    </Badge>
                  )}
                </label>
              ))}
              {livreurs.meta && (
                <p className="pt-1 text-[12px] text-slate-400">
                  Un livreur est signalé « surchargé » au-delà de {livreurs.meta.max_missions_simultanees} missions actives simultanées — seuil modifiable dans Paramètres.
                </p>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
