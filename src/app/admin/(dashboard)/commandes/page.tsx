"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Bike, PenLine, Eye, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { Commande, ApiEnvelope, PaginatedData, StatutCommande, Livreur } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { StatutCommandeBadge, statutLabel } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { formatDate, formatMontant, fullName } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, UserAvatar, HeaderStat, RefreshButton } from "@/components/AdminTable";

const STATUTS: { value: StatutCommande | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "confirmee", label: "Confirmée" },
  { value: "achat_marche", label: "Achat au marché" },
  { value: "preparation", label: "Préparation" },
  { value: "en_route", label: "En route" },
  { value: "en_route_client", label: "En route vers le client" },
  { value: "livree", label: "Livrée" },
  { value: "annulee", label: "Annulée" },
];

export default function CommandesPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canAssign = usePermission("assign_commandes");
  const canEditStatus = usePermission("edit_commande_status");
  const canDelete = usePermission("delete_commandes");
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");

  const [assignTarget, setAssignTarget] = useState<Commande | null>(null);
  const [selectedLivreur, setSelectedLivreur] = useState("");

  const [statusTarget, setStatusTarget] = useState<Commande | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatutCommande>("confirmee");

  const [deleteTarget, setDeleteTarget] = useState<Commande | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["admin-commandes", page, statut],
    queryFn: async () => {
      const qs = buildQuery({ page, statut, per_page: 5 });
      const res = await api.get<ApiEnvelope<PaginatedData<Commande>>>(`/admin/commandes${qs}`);
      return res.data;
    },
    refetchInterval: 30_000,
  });

  const { data: livreurs, isLoading: livreursLoading } = useQuery({
    queryKey: ["admin-livreurs-valides"],
    queryFn: async () => (await api.get<ApiEnvelope<PaginatedData<Livreur>>>("/admin/livreurs?statut=valide&disponible=1&per_page=200")).data.data,
    enabled: !!assignTarget,
  });

  const assignMutation = useMutation({
    mutationFn: () => api.post(`/admin/commandes/${assignTarget!.id}/attribuer`, { livreur_id: selectedLivreur }),
    onSuccess: () => {
      notify("Commande attribuée avec succès.");
      setAssignTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-commandes"] });
    },
    onError: (err) => notifyError(err, "Impossible d'attribuer cette commande."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/commandes/${id}`),
    onSuccess: () => {
      notify("Commande supprimée définitivement.");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-commandes"] });
    },
    onError: (err) => notifyError(err, "Impossible de supprimer cette commande."),
  });

  function openAssign(commande: Commande) { setAssignTarget(commande); setSelectedLivreur(commande.livreur_id ?? ""); }
  function openStatus(commande: Commande) { setStatusTarget(commande); setSelectedStatus(commande.statut_commande); }

  const statusMutation = useMutation({
    mutationFn: () => api.put(`/admin/commandes/${statusTarget!.id}/statut`, { statut: selectedStatus }),
    onSuccess: () => {
      notify("Statut mis à jour.");
      setStatusTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-commandes"] });
    },
    onError: (err) => notifyError(err, "Impossible de modifier le statut."),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Gestion des commandes"
        description="Attribution des livreurs, suivi des statuts et alertes de retard."
        icon={ClipboardList}
        action={
          <div className="flex items-center gap-3">
            <HeaderStat icon={ClipboardList} label={`${data?.total ?? "—"} commandes`} tone="gold" />
            <RefreshButton onClick={() => refetch()} loading={isFetching} />
          </div>
        }
      />

      <FilterBar>
        <FilterSelect
          value={statut}
          onChange={(v) => { setPage(1); setStatut(v); }}
          options={STATUTS}
        />
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les commandes."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["N° Commande", "Client", "Vendeur", "Livreur", "Montant", "Statut", "Date", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucune commande trouvée."
        >
          {items.map((c) => (
            <tr key={c.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-3.5">
                <span className="rounded-lg bg-[#1A2E5A]/8 px-2.5 py-1 text-xs font-black text-[#1A2E5A]">
                  {c.numero_commande}
                </span>
              </td>
              <td className="px-5 py-3.5">
                {c.client?.user ? (
                  <UserAvatar
                    name={fullName(c.client.user.nom, c.client.user.prenom)}
                    initials={`${c.client.user.nom?.[0] ?? ""}${c.client.user.prenom?.[0] ?? ""}`}
                    color="bg-sky-600"
                  />
                ) : <span className="text-slate-400 text-xs">—</span>}
              </td>
              <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">{c.vendeur?.nom_commerce ?? "—"}</td>
              <td className="px-5 py-3.5">
                {c.livreur?.user ? (
                  <span className="text-sm font-semibold text-slate-600">
                    {fullName(c.livreur.user.nom, c.livreur.user.prenom)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-600 border border-amber-100">
                    Non attribué
                  </span>
                )}
              </td>
              <td className="px-5 py-3.5 font-black text-slate-800">{formatMontant(c.montant_total, c.devise_paiement)}</td>
              <td className="px-5 py-3.5"><StatutCommandeBadge value={c.statut_commande} /></td>
              <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{formatDate(c.date_commande, true)}</td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-2">
                  <IconAction icon={Eye} label="Voir la commande" href={`/admin/commandes/${c.id}`} variant="info" />
                  {canAssign && <IconAction icon={Bike} label="Attribuer un livreur" onClick={() => openAssign(c)} variant="ghost" />}
                  {canEditStatus && <IconAction icon={PenLine} label="Modifier le statut" onClick={() => openStatus(c)} variant="ghost" />}
                  {canDelete && ["annulee", "confirmee"].includes(c.statut_commande) && (
                    <IconAction icon={Trash2} label="Supprimer définitivement" onClick={() => setDeleteTarget(c)} variant="danger" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {/* Assign Modal */}
      {assignTarget && (
        <Modal
          title={`Attribuer la commande ${assignTarget.numero_commande}`}
          onClose={() => setAssignTarget(null)}
          footer={<>
            <Button variant="ghost" onClick={() => setAssignTarget(null)} disabled={assignMutation.isPending}>Annuler</Button>
            <Button onClick={() => assignMutation.mutate()} loading={assignMutation.isPending} disabled={!selectedLivreur}>Attribuer</Button>
          </>}
        >
          {livreursLoading || !livreurs ? <LoadingBlock label="Chargement des livreurs…" /> : livreurs.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun livreur validé disponible.</p>
          ) : (
            <select value={selectedLivreur} onChange={(e) => setSelectedLivreur(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none">
              <option value="" disabled>Sélectionner un livreur…</option>
              {livreurs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.user ? fullName(l.user.nom, l.user.prenom) : l.id} — {l.type_vehicule}
                </option>
              ))}
            </select>
          )}
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer définitivement cette commande"
          message={`Confirmez-vous la suppression de la commande ${deleteTarget.numero_commande} ? Cette action est irréversible — la commande, ses lignes et son paiement seront effacés. Réservé aux commandes annulées ou de test.`}
          confirmLabel="Supprimer"
          danger
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* Status Modal */}
      {statusTarget && (
        <Modal
          title={`Statut de la commande ${statusTarget.numero_commande}`}
          onClose={() => setStatusTarget(null)}
          footer={<>
            <Button variant="ghost" onClick={() => setStatusTarget(null)} disabled={statusMutation.isPending}>Annuler</Button>
            <Button onClick={() => statusMutation.mutate()} loading={statusMutation.isPending}>Mettre à jour</Button>
          </>}
        >
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as StatutCommande)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none">
            {STATUTS.filter((s) => s.value).map((s) => (
              <option key={s.value} value={s.value}>{statutLabel(s.value)}</option>
            ))}
          </select>
        </Modal>
      )}
    </div>
  );
}
