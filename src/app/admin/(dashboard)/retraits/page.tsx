"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet, Check, Ban, Store, Bike } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, PaginatedData, RetraitVendeur, RetraitLivreur, StatutRetrait } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatDate, formatMontant, fullName } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, HeaderStat } from "@/components/AdminTable";

const STATUTS: { value: StatutRetrait | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "valide", label: "Validé" },
  { value: "rejete", label: "Rejeté" },
];

const STATUT_TONE: Record<string, "gold" | "green" | "red"> = { en_attente: "gold", valide: "green", rejete: "red" };
const STATUT_LABEL: Record<string, string> = { en_attente: "En attente", valide: "Validé", rejete: "Rejeté" };
const METHODE_LABEL: Record<string, string> = { mtn_momo: "MTN Mobile Money", airtel_money: "Airtel Money", virement: "Virement" };

type Acteur = "vendeurs" | "livreurs";
type RetraitRow = (RetraitVendeur | RetraitLivreur) & { id: string };

export default function RetraitsPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canManage = usePermission("manage_retraits");

  const [acteur, setActeur] = useState<Acteur>("vendeurs");
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");
  const [validateTarget, setValidateTarget] = useState<RetraitRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RetraitRow | null>(null);
  const [rejectMotif, setRejectMotif] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-retraits", acteur, page, statut],
    queryFn: async () => {
      const qs = buildQuery({ page, statut, per_page: 5 });
      const res = await api.get<ApiEnvelope<PaginatedData<RetraitRow>>>(`/admin/retraits/${acteur}${qs}`);
      return res.data;
    },
  });

  const validateMutation = useMutation({
    mutationFn: () => api.post(`/admin/retraits/${acteur}/${validateTarget!.id}/valider`),
    onSuccess: () => {
      notify("Retrait validé.");
      setValidateTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-retraits"] });
    },
    onError: (err) => notifyError(err, "Impossible de valider ce retrait."),
  });

  const rejectMutation = useMutation({
    mutationFn: () => api.post(`/admin/retraits/${acteur}/${rejectTarget!.id}/rejeter`, { motif: rejectMotif }),
    onSuccess: () => {
      notify("Retrait rejeté, solde recrédité.");
      setRejectTarget(null);
      setRejectMotif("");
      queryClient.invalidateQueries({ queryKey: ["admin-retraits"] });
    },
    onError: (err) => notifyError(err, "Impossible de rejeter ce retrait."),
  });

  function switchActeur(a: Acteur) { setActeur(a); setPage(1); }

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Retraits"
        description="Demandes de retrait des vendeurs et livreurs — le solde est débité dès la demande."
        icon={Wallet}
        action={<HeaderStat icon={Wallet} label={`${data?.total ?? "—"} demandes`} tone="navy" />}
      />

      <div className="flex gap-1 surface-card rounded-2xl p-1.5 w-fit">
        <button
          onClick={() => switchActeur("vendeurs")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition-colors ${acteur === "vendeurs" ? "bg-[#1A2E5A] text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <Store size={15} /> Vendeurs
        </button>
        <button
          onClick={() => switchActeur("livreurs")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition-colors ${acteur === "livreurs" ? "bg-[#1A2E5A] text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <Bike size={15} /> Livreurs
        </button>
      </div>

      <FilterBar>
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les retraits."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={[acteur === "vendeurs" ? "Vendeur" : "Livreur", "Montant", "Moyen", "Numéro de réception", "Statut", "Demandé le", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucune demande de retrait trouvée."
        >
          {items.map((r) => {
            const nom = acteur === "vendeurs"
              ? (r as RetraitVendeur).vendeur?.nom_commerce ?? "—"
              : (r as RetraitLivreur).livreur?.user ? fullName((r as RetraitLivreur).livreur!.user!.nom, (r as RetraitLivreur).livreur!.user!.prenom) : "—";
            return (
              <tr key={r.id} className="row-accent hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3.5 text-sm font-bold text-slate-700">{nom}</td>
                <td className="px-5 py-3.5 font-black text-slate-800">{formatMontant(r.montant)}</td>
                <td className="px-5 py-3.5 text-sm font-semibold text-slate-500">{METHODE_LABEL[r.methode_retrait] ?? r.methode_retrait}</td>
                <td className="px-5 py-3.5 text-sm font-mono font-semibold text-slate-500">{r.numero_reception ?? "—"}</td>
                <td className="px-5 py-3.5"><Badge tone={STATUT_TONE[r.statut]}>{STATUT_LABEL[r.statut]}</Badge></td>
                <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{formatDate(r.date_demande, true)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    {canManage && r.statut === "en_attente" && (
                      <>
                        <IconAction icon={Check} label="Valider" onClick={() => setValidateTarget(r)} variant="success" />
                        <IconAction icon={Ban} label="Rejeter" onClick={() => setRejectTarget(r)} variant="danger" />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {validateTarget && (
        <ConfirmDialog
          title="Valider ce retrait"
          message={`Confirmez-vous l'envoi de ${formatMontant(validateTarget.montant)} ? Le solde a déjà été débité à la demande.`}
          confirmLabel="Valider"
          loading={validateMutation.isPending}
          onConfirm={() => validateMutation.mutate()}
          onClose={() => setValidateTarget(null)}
        />
      )}

      {rejectTarget && (
        <Modal
          title="Rejeter ce retrait"
          onClose={() => { setRejectTarget(null); setRejectMotif(""); }}
          footer={<>
            <Button variant="ghost" onClick={() => { setRejectTarget(null); setRejectMotif(""); }} disabled={rejectMutation.isPending}>Annuler</Button>
            <Button variant="danger" onClick={() => rejectMutation.mutate()} loading={rejectMutation.isPending} disabled={!rejectMotif.trim()}>Rejeter</Button>
          </>}
        >
          <p className="mb-4 text-sm text-slate-600">
            Le solde de <strong>{formatMontant(rejectTarget.montant)}</strong> sera automatiquement recrédité.
          </p>
          <label className="mb-1.5 block text-xs font-black text-slate-700">Motif du rejet (obligatoire)</label>
          <textarea value={rejectMotif} onChange={(e) => setRejectMotif(e.target.value)} rows={3} maxLength={500}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000] focus:outline-none"
            placeholder="Ex : coordonnées de paiement invalides…" />
        </Modal>
      )}
    </div>
  );
}
