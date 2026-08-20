"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Truck, Eye, RefreshCw } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, PaginatedData, Livraison, StatutLivraison, Livreur } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { Badge, statutLabel } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { formatDate, fullName } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, UserAvatar, HeaderStat } from "@/components/AdminTable";

const STATUTS: { value: StatutLivraison | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "assigne", label: "Assignée" },
  { value: "en_cours", label: "En cours" },
  { value: "en_route_client", label: "En route vers le client" },
  { value: "livree", label: "Livrée" },
  { value: "echouee", label: "Échouée" },
];

const STATUT_TONE: Record<string, "navy" | "gold" | "green" | "red"> = {
  assigne: "navy", en_cours: "gold", en_route_client: "gold", livree: "green", echouee: "red",
};

export default function LivraisonsPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canReassign = usePermission("reassign_livraisons");

  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");
  const [reassignTarget, setReassignTarget] = useState<Livraison | null>(null);
  const [selectedLivreur, setSelectedLivreur] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-livraisons", page, statut],
    queryFn: async () => {
      const qs = buildQuery({ page, statut });
      const res = await api.get<ApiEnvelope<PaginatedData<Livraison>>>(`/admin/livraisons${qs}`);
      return res.data;
    },
  });

  const { data: livreurs, isLoading: livreursLoading } = useQuery({
    queryKey: ["admin-livreurs-valides"],
    queryFn: async () => (await api.get<ApiEnvelope<PaginatedData<Livreur>>>("/admin/livreurs?statut=valide&disponible=1&per_page=200")).data.data,
    enabled: !!reassignTarget,
  });

  const reassignMutation = useMutation({
    mutationFn: () => api.post(`/admin/livraisons/${reassignTarget!.id}/reattribuer`, { livreur_id: selectedLivreur }),
    onSuccess: () => {
      notify("Livraison réattribuée.");
      setReassignTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-livraisons"] });
    },
    onError: (err) => notifyError(err, "Impossible de réattribuer cette livraison."),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Livraisons"
        description="Missions de livraison en cours — distinctes des comptes livreurs."
        icon={Truck}
        action={<HeaderStat icon={Truck} label={`${data?.total ?? "—"} livraisons`} tone="violet" />}
      />

      <FilterBar>
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les livraisons."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["Commande", "Client", "Livreur", "Statut", "Collecte", "Livraison", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucune livraison trouvée."
        >
          {items.map((l) => (
            <tr key={l.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-3.5">
                <span className="rounded-lg bg-[#1A2E5A]/8 px-2.5 py-1 text-xs font-black text-[#1A2E5A]">
                  {l.commande?.numero_commande ?? "—"}
                </span>
              </td>
              <td className="px-5 py-3.5">
                {l.commande?.client?.user ? (
                  <UserAvatar
                    name={fullName(l.commande.client.user.nom, l.commande.client.user.prenom)}
                    initials={`${l.commande.client.user.nom?.[0] ?? ""}${l.commande.client.user.prenom?.[0] ?? ""}`}
                    color="bg-sky-600"
                  />
                ) : <span className="text-slate-400 text-xs">—</span>}
              </td>
              <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">
                {l.livreur?.user ? fullName(l.livreur.user.nom, l.livreur.user.prenom) : "—"}
              </td>
              <td className="px-5 py-3.5"><Badge tone={STATUT_TONE[l.statut_livraison]}>{statutLabel(l.statut_livraison)}</Badge></td>
              <td className="px-5 py-3.5 text-xs text-slate-400 font-medium">{l.date_collecte ? formatDate(l.date_collecte, true) : "—"}</td>
              <td className="px-5 py-3.5 text-xs text-slate-400 font-medium">{l.date_livraison ? formatDate(l.date_livraison, true) : "—"}</td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-2">
                  <IconAction icon={Eye} label="Voir le détail" href={`/admin/livraisons/${l.id}`} variant="info" />
                  {canReassign && l.statut_livraison !== "livree" && (
                    <IconAction icon={RefreshCw} label="Réattribuer" onClick={() => { setReassignTarget(l); setSelectedLivreur(l.livreur_id); }} variant="ghost" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {reassignTarget && (
        <Modal
          title={`Réattribuer la livraison — ${reassignTarget.commande?.numero_commande ?? ""}`}
          onClose={() => setReassignTarget(null)}
          footer={<>
            <Button variant="ghost" onClick={() => setReassignTarget(null)} disabled={reassignMutation.isPending}>Annuler</Button>
            <Button onClick={() => reassignMutation.mutate()} loading={reassignMutation.isPending} disabled={!selectedLivreur}>Réattribuer</Button>
          </>}
        >
          {livreursLoading || !livreurs ? <LoadingBlock label="Chargement des livreurs…" /> : livreurs.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun livreur validé disponible.</p>
          ) : (
            <select value={selectedLivreur} onChange={(e) => setSelectedLivreur(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none">
              <option value="" disabled>Sélectionner un livreur…</option>
              {livreurs.map((l) => <option key={l.id} value={l.id}>{l.user ? fullName(l.user.nom, l.user.prenom) : l.id} — {l.type_vehicule}</option>)}
            </select>
          )}
        </Modal>
      )}
    </div>
  );
}
