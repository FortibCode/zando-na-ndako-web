"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users, Eye, Check, Ban, UserPlus, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { AppUser, ApiEnvelope, PaginatedData, TypeUtilisateur, StatutCompte } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { StatutCompteBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import { formatDate, fullName, initials } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, UserAvatar, HeaderStat, RefreshButton } from "@/components/AdminTable";

const TYPES: { value: TypeUtilisateur | ""; label: string }[] = [
  { value: "", label: "Tous les types" },
  { value: "client", label: "Client" },
  { value: "vendeur", label: "Vendeur" },
  { value: "livreur", label: "Livreur" },
  { value: "administrateur", label: "Administrateur" },
];

const STATUTS: { value: StatutCompte | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "actif", label: "Actif" },
  { value: "suspendu", label: "Suspendu" },
  { value: "en_attente_validation", label: "En attente" },
];

const TYPE_COLOR: Record<string, string> = {
  client: "bg-sky-600", vendeur: "bg-emerald-600",
  livreur: "bg-violet-600", administrateur: "bg-[#C00000]",
};
const TYPE_LABEL: Record<string, string> = {
  client: "Client", vendeur: "Vendeur",
  livreur: "Livreur", administrateur: "Admin",
};

export default function UtilisateursPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canManageStatus = usePermission("manage_users_status");
  const canDelete = usePermission("delete_users");
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [statut, setStatut] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [suspendTarget, setSuspendTarget] = useState<AppUser | null>(null);
  const [motif, setMotif] = useState("");
  const [activateTarget, setActivateTarget] = useState<AppUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["admin-utilisateurs", page, type, statut, search],
    queryFn: async () => {
      const qs = buildQuery({ page, type, statut, search });
      const res = await api.get<ApiEnvelope<PaginatedData<AppUser>>>(`/admin/utilisateurs${qs}`);
      return res.data;
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/utilisateurs/${id}/activer`),
    onSuccess: () => {
      notify("Compte activé.");
      setActivateTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-utilisateurs"] });
    },
    onError: (err) => notifyError(err, "Impossible d'activer ce compte."),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) => api.post(`/admin/utilisateurs/${id}/suspendre`, { motif }),
    onSuccess: () => {
      notify("Compte suspendu.");
      setSuspendTarget(null);
      setMotif("");
      queryClient.invalidateQueries({ queryKey: ["admin-utilisateurs"] });
    },
    onError: (err) => notifyError(err, "Impossible de suspendre ce compte."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/utilisateurs/${id}`),
    onSuccess: () => {
      notify("Compte supprimé.");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-utilisateurs"] });
    },
    onError: (err) => notifyError(err, "Impossible de supprimer ce compte — il a peut-être des commandes ou d'autres données liées."),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Gestion des utilisateurs"
        description="Clients, vendeurs, livreurs et administrateurs de la plateforme."
        icon={Users}
        action={
          <div className="flex items-center gap-3">
            <HeaderStat icon={Users} label={`${data?.total ?? "—"} utilisateurs`} tone="sky" />
            <RefreshButton onClick={() => refetch()} loading={isFetching} />
            {canManageStatus && (
              <Link
                href="/admin/utilisateurs/nouveau"
                className="focus-premium inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer bg-linear-to-b from-[#26407a] to-[#101c38] text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_20px_-4px_rgba(11,37,69,0.45)] hover:from-[#31519a] hover:to-[#172b54] hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_12px_24px_-4px_rgba(11,37,69,0.55)] active:scale-[0.98]"
              >
                <UserPlus size={14} /> Ajouter un utilisateur
              </Link>
            )}
          </div>
        }
      />

      <FilterBar>
        <FilterSelect value={type} onChange={(v) => { setPage(1); setType(v); }} options={TYPES} />
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}
          className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nom, email ou téléphone…"
              className="w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm font-bold text-slate-700 placeholder-slate-400 focus:border-[#1A2E5A] focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-xl bg-[#1A2E5A] px-4 py-2.5 text-sm font-black text-white hover:bg-[#0B1A35] transition-colors">
            Rechercher
          </button>
        </form>
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les utilisateurs."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["Utilisateur", "Contact", "Type", "Statut", "Inscrit le", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucun utilisateur trouvé."
        >
          {items.map((u) => (
            <tr key={u.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-4">
                <UserAvatar
                  name={fullName(u.nom, u.prenom)}
                  initials={initials(u.nom, u.prenom)}
                  color={TYPE_COLOR[u.type_utilisateur] ?? "bg-slate-500"}
                />
              </td>
              <td className="px-5 py-4">
                <p className="text-sm font-semibold text-slate-700">{u.email ?? "—"}</p>
                <p className="text-xs text-slate-400 mt-0.5">{u.telephone}</p>
              </td>
              <td className="px-5 py-4">
                <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-black text-slate-600">
                  {TYPE_LABEL[u.type_utilisateur] ?? u.type_utilisateur}
                </span>
              </td>
              <td className="px-5 py-4"><StatutCompteBadge value={u.statut_compte} /></td>
              <td className="px-5 py-4 text-sm text-slate-400 font-medium">{formatDate(u.date_inscription)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <IconAction icon={Eye} label="Voir le profil" href={`/admin/utilisateurs/${u.id}`} variant="info" />
                  {canManageStatus && u.statut_compte !== "actif" && (
                    <IconAction icon={Check} label="Activer" onClick={() => setActivateTarget(u)} variant="success" />
                  )}
                  {canManageStatus && u.statut_compte !== "suspendu" && (
                    <IconAction icon={Ban} label="Suspendre" onClick={() => setSuspendTarget(u)} variant="danger" />
                  )}
                  {canDelete && u.type_utilisateur !== "administrateur" && (
                    <IconAction icon={Trash2} label="Supprimer définitivement" onClick={() => setDeleteTarget(u)} variant="danger" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {activateTarget && (
        <ConfirmDialog title="Activer ce compte"
          message={`Confirmez-vous l'activation du compte de ${fullName(activateTarget.nom, activateTarget.prenom)} ?`}
          confirmLabel="Activer" loading={activateMutation.isPending}
          onConfirm={() => activateMutation.mutate(activateTarget.id)} onClose={() => setActivateTarget(null)} />
      )}
      {suspendTarget && (
        <Modal title="Suspendre ce compte" onClose={() => { setSuspendTarget(null); setMotif(""); }}
          footer={<>
            <Button variant="ghost" onClick={() => { setSuspendTarget(null); setMotif(""); }} disabled={suspendMutation.isPending}>Annuler</Button>
            <Button variant="danger" onClick={() => suspendMutation.mutate({ id: suspendTarget.id, motif })} loading={suspendMutation.isPending} disabled={!motif.trim()}>Suspendre</Button>
          </>}
        >
          <p className="mb-4 text-sm text-slate-600">
            Suspension du compte de <strong>{fullName(suspendTarget.nom, suspendTarget.prenom)}</strong>. Les sessions actives seront révoquées.
          </p>
          <label className="mb-1.5 block text-xs font-black text-slate-700">Motif de suspension (obligatoire)</label>
          <textarea value={motif} onChange={(e) => setMotif(e.target.value)} rows={3} maxLength={500}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000] focus:outline-none"
            placeholder="Ex : comportement frauduleux, violation des CGU…" />
        </Modal>
      )}
      {deleteTarget && (
        <ConfirmDialog title="Supprimer définitivement ce compte"
          message={`Confirmez-vous la suppression du compte de ${fullName(deleteTarget.nom, deleteTarget.prenom)} ? Action irréversible, réservée aux comptes de test — la suppression échouera si ce compte a des commandes, produits ou autres données réelles liées.`}
          confirmLabel="Supprimer" danger loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
