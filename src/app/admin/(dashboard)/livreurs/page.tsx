"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bike, Car, Star, Check, Ban, Eye } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { Livreur, ApiEnvelope, PaginatedData, StatutValidation } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { Badge, StatutValidationBadge } from "@/components/Badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { fullName, initials } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, UserAvatar, HeaderStat } from "@/components/AdminTable";

const STATUTS: { value: StatutValidation | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "valide", label: "Validé" },
  { value: "suspendu", label: "Suspendu" },
];

function VehiculeIcon({ type, size = 20 }: { type: string; size?: number }) {
  const Icon = type === "voiture" ? Car : Bike;
  return <Icon size={size} className="text-slate-500" />;
}

export default function LivreursPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [validateTarget, setValidateTarget] = useState<Livreur | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Livreur | null>(null);
  const canValidate = usePermission("validate_livreurs");
  const canSuspend = usePermission("suspendre_livreurs");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("statut");
    if (s) setStatut(s);
    setInitialized(true);
  }, []);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-livreurs", page, statut],
    queryFn: async () => {
      const qs = buildQuery({ page, statut });
      const res = await api.get<ApiEnvelope<PaginatedData<Livreur>>>(`/admin/livreurs${qs}`);
      return res.data;
    },
    enabled: initialized,
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/livreurs/${id}/valider`),
    onSuccess: () => {
      notify("Livreur validé avec succès.");
      setValidateTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-livreurs"] });
    },
    onError: (err) => notifyError(err, "Impossible de valider ce livreur."),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/livreurs/${id}/suspendre`),
    onSuccess: () => {
      notify("Livreur suspendu.");
      setSuspendTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-livreurs"] });
    },
    onError: (err) => notifyError(err, "Impossible de suspendre ce livreur."),
  });

  const items = data?.data ?? [];
  const loading = !initialized || isLoading;

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Gestion des livreurs"
        description="Validation, suivi de disponibilité et performances des livreurs."
        icon={Bike}
        action={<HeaderStat icon={Bike} label={`${data?.total ?? "—"} livreurs`} tone="violet" />}
      />

      <FilterBar>
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
      </FilterBar>

      {loading && <LoadingBlock />}
      {!loading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les livreurs."} onRetry={() => refetch()} />
      )}

      {!loading && !isError && (
        <AdminTable
          headers={["Livreur", "Véhicule", "Note", "Disponibilité", "Statut", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucun livreur trouvé."
        >
          {items.map((l) => (
            <tr key={l.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-4">
                {l.user ? (
                  <UserAvatar
                    name={fullName(l.user.nom, l.user.prenom)}
                    subtitle={l.user.telephone}
                    initials={initials(l.user.nom, l.user.prenom)}
                    color="bg-violet-600"
                  />
                ) : <span className="text-slate-400 text-xs">—</span>}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <VehiculeIcon type={l.type_vehicule} size={24} />
                  <div>
                    <p className="text-sm font-bold text-slate-700 capitalize">{l.type_vehicule}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{l.immatriculation_vehicule}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black text-slate-800">{l.note_moyenne}</span>
                  <span className="text-sm text-slate-400">/5</span>
                </div>
              </td>
              <td className="px-5 py-4">
                <Badge tone={l.statut_disponibilite === "disponible" ? "green" : "gray"}>
                  {l.statut_disponibilite === "disponible" ? "Disponible" : "Indisponible"}
                </Badge>
              </td>
              <td className="px-5 py-4"><StatutValidationBadge value={l.statut_validation} /></td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <IconAction icon={Eye} label="Voir la fiche" href={`/admin/livreurs/${l.id}`} variant="info" />
                  {canValidate && l.statut_validation !== "valide" && (
                    <IconAction icon={Check} label="Valider" onClick={() => setValidateTarget(l)} variant="success" />
                  )}
                  {canSuspend && l.statut_validation !== "suspendu" && (
                    <IconAction icon={Ban} label="Suspendre" onClick={() => setSuspendTarget(l)} variant="danger" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {validateTarget && (
        <ConfirmDialog title="Valider ce livreur"
          message="Confirmez-vous la validation de ce livreur ? Il pourra recevoir des missions de livraison."
          confirmLabel="Valider" loading={validateMutation.isPending}
          onConfirm={() => validateMutation.mutate(validateTarget.id)} onClose={() => setValidateTarget(null)} />
      )}
      {suspendTarget && (
        <ConfirmDialog title="Suspendre ce livreur"
          message="Confirmez-vous la suspension de ce livreur ? Il ne recevra plus de nouvelles missions."
          confirmLabel="Suspendre" danger loading={suspendMutation.isPending}
          onConfirm={() => suspendMutation.mutate(suspendTarget.id)} onClose={() => setSuspendTarget(null)} />
      )}
    </div>
  );
}
