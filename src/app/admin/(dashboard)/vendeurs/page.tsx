"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Store, Star, Check, Ban, Eye } from "lucide-react";
import { api, ApiError, fetchVendeurTypesDisponibles } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { Vendeur, ApiEnvelope, PaginatedData, StatutValidation } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { StatutValidationBadge } from "@/components/Badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { fullName, initials } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, UserAvatar, HeaderStat, RefreshButton } from "@/components/AdminTable";

const STATUTS: { value: StatutValidation | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "valide", label: "Validé" },
  { value: "suspendu", label: "Suspendu" },
];

export default function VendeursPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");
  const [categoriePrincipale, setCategoriePrincipale] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchVendeurTypesDisponibles().then(setTypes).catch(() => setTypes([]));
  }, []);
  const [validateTarget, setValidateTarget] = useState<Vendeur | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Vendeur | null>(null);
  const canValidate = usePermission("validate_vendeurs");
  const canSuspend = usePermission("suspendre_vendeurs");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("statut");
    if (s) setStatut(s);
    setInitialized(true);
  }, []);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["admin-vendeurs", page, statut, categoriePrincipale],
    queryFn: async () => {
      const qs = buildQuery({ page, statut, categorie_principale: categoriePrincipale, per_page: 5 });
      const res = await api.get<ApiEnvelope<PaginatedData<Vendeur>>>(`/admin/vendeurs${qs}`);
      return res.data;
    },
    enabled: initialized,
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/vendeurs/${id}/valider`),
    onSuccess: () => {
      notify("Vendeur validé avec succès.");
      setValidateTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-vendeurs"] });
    },
    onError: (err) => notifyError(err, "Impossible de valider ce vendeur."),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/vendeurs/${id}/suspendre`),
    onSuccess: () => {
      notify("Vendeur suspendu.");
      setSuspendTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-vendeurs"] });
    },
    onError: (err) => notifyError(err, "Impossible de suspendre ce vendeur."),
  });

  const items = data?.data ?? [];
  const loading = !initialized || isLoading;

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Gestion des vendeurs"
        description="Validation, suspension et suivi des performances des vendeurs partenaires."
        icon={Store}
        action={
          <div className="flex items-center gap-3">
            <HeaderStat icon={Store} label={`${data?.total ?? "—"} vendeurs`} tone="green" />
            <RefreshButton onClick={() => refetch()} loading={isFetching} />
          </div>
        }
      />

      <FilterBar>
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
        <FilterSelect
          value={categoriePrincipale}
          onChange={(v) => { setPage(1); setCategoriePrincipale(v); }}
          options={[{ value: "", label: "Tous les types" }, ...types.map((t) => ({ value: t, label: t }))]}
        />
      </FilterBar>

      {loading && <LoadingBlock />}
      {!loading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les vendeurs."} onRetry={() => refetch()} />
      )}

      {!loading && !isError && (
        <AdminTable
          headers={["Commerce", "Responsable", "Catégorie", "Note", "Statut", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucun vendeur trouvé."
        >
          {items.map((v) => (
            <tr key={v.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                    <Store size={17} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800">{v.nom_commerce}</p>
                    <p className="text-[12.5px] text-slate-400 font-medium capitalize">{v.categorie_principale}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                {v.user ? (
                  <UserAvatar
                    name={fullName(v.user.nom, v.user.prenom)}
                    subtitle={v.user.telephone}
                    initials={initials(v.user.nom, v.user.prenom)}
                    color="bg-emerald-600"
                  />
                ) : <span className="text-slate-400 text-xs">—</span>}
              </td>
              <td className="px-5 py-4">
                <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 capitalize">
                  {v.categorie_principale}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black text-slate-800">{v.note_moyenne}</span>
                  <span className="text-xs text-slate-400">/5</span>
                </div>
              </td>
              <td className="px-5 py-4"><StatutValidationBadge value={v.statut_validation} /></td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <IconAction icon={Eye} label="Voir la fiche" href={`/admin/vendeurs/${v.id}`} variant="info" />
                  {canValidate && v.statut_validation !== "valide" && (
                    <IconAction icon={Check} label="Valider" onClick={() => setValidateTarget(v)} variant="success" />
                  )}
                  {canSuspend && v.statut_validation !== "suspendu" && (
                    <IconAction icon={Ban} label="Suspendre" onClick={() => setSuspendTarget(v)} variant="danger" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {validateTarget && (
        <ConfirmDialog title="Valider ce vendeur"
          message={`Confirmez-vous la validation du vendeur « ${validateTarget.nom_commerce} » ?`}
          confirmLabel="Valider" loading={validateMutation.isPending}
          onConfirm={() => validateMutation.mutate(validateTarget.id)} onClose={() => setValidateTarget(null)} />
      )}
      {suspendTarget && (
        <ConfirmDialog title="Suspendre ce vendeur"
          message={`Confirmez-vous la suspension du vendeur « ${suspendTarget.nom_commerce} » ?`}
          confirmLabel="Suspendre" danger loading={suspendMutation.isPending}
          onConfirm={() => suspendMutation.mutate(suspendTarget.id)} onClose={() => setSuspendTarget(null)} />
      )}
    </div>
  );
}
