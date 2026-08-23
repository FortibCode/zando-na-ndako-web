"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquareWarning, Star, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, PaginatedData, AvisAdmin } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatDate } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, HeaderStat } from "@/components/AdminTable";

const TYPES_CIBLE: { value: string; label: string }[] = [
  { value: "", label: "Toutes les cibles" },
  { value: "vendeur", label: "Vendeurs" },
  { value: "livreur", label: "Livreurs" },
  { value: "client", label: "Clients" },
];

const NOTES_MAX: { value: string; label: string }[] = [
  { value: "", label: "Toutes les notes" },
  { value: "2", label: "2 étoiles ou moins" },
  { value: "3", label: "3 étoiles ou moins" },
];

// Modération des avis/notations (App\Models\NotationAvis) : jusqu'ici aucune vue admin n'existait
// pour repérer et retirer un avis abusif ou frauduleux. Volontairement pas de création — un faux
// avis n'a pas de sens métier, seulement voir et supprimer.
export default function AvisPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canDelete = usePermission("delete_avis");
  const [page, setPage] = useState(1);
  const [typeCible, setTypeCible] = useState("");
  const [noteMax, setNoteMax] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AvisAdmin | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-avis", page, typeCible, noteMax],
    queryFn: async () => {
      const qs = buildQuery({ page, type_cible: typeCible, note_max: noteMax });
      const res = await api.get<ApiEnvelope<PaginatedData<AvisAdmin>>>(`/admin/avis${qs}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/avis/${id}`),
    onSuccess: () => {
      notify("Avis supprimé.");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-avis"] });
    },
    onError: (err) => notifyError(err, "Impossible de supprimer cet avis."),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Modération des avis"
        description="Repérez et retirez un avis abusif ou frauduleux."
        icon={MessageSquareWarning}
        action={<HeaderStat icon={MessageSquareWarning} label={`${data?.total ?? "—"} avis`} tone="gold" />}
      />

      <FilterBar>
        <FilterSelect value={typeCible} onChange={(v) => { setPage(1); setTypeCible(v); }} options={TYPES_CIBLE} />
        <FilterSelect value={noteMax} onChange={(v) => { setPage(1); setNoteMax(v); }} options={NOTES_MAX} />
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les avis."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["Auteur", "Note", "Commentaire", "Cible", "Date", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucun avis trouvé."
        >
          {items.map((a) => (
            <tr key={a.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-4">
                <p className="text-sm font-bold text-slate-700">{a.notateur_nom}</p>
                <p className="text-[11px] text-slate-400 capitalize">{a.type_notateur}</p>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black text-slate-800">{a.note}</span>
                  <span className="text-xs text-slate-400">/5</span>
                </div>
              </td>
              <td className="px-5 py-4 max-w-xs">
                <p className="text-sm text-slate-600 line-clamp-2">{a.commentaire || "—"}</p>
              </td>
              <td className="px-5 py-4">
                <p className="text-sm font-bold text-slate-700">{a.cible_nom}</p>
                <p className="text-[11px] text-slate-400 capitalize">{a.type_cible}</p>
              </td>
              <td className="px-5 py-4 text-sm text-slate-400 font-medium">{formatDate(a.date_notation, true)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  {canDelete && <IconAction icon={Trash2} label="Supprimer" onClick={() => setDeleteTarget(a)} variant="danger" />}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer cet avis"
          message={`Confirmez-vous la suppression de l'avis de « ${deleteTarget.notateur_nom} » sur « ${deleteTarget.cible_nom} » ? Cette action est irréversible et recalcule la note moyenne.`}
          confirmLabel="Supprimer"
          danger
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
