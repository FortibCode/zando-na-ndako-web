"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ticket, Pencil, Trash2, Plus } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, PaginatedData, CouponAdmin, TypeReduction } from "@/lib/types";
import { LoadingBlock, ErrorBlock, EmptyState } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatDate, formatMontant, toDatetimeLocal, fromDatetimeLocal } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminPageHeader, AdminTable, FilterBar, FilterSelect, IconAction, HeaderStat } from "@/components/AdminTable";

type CouponForm = {
  code: string; description: string; type_reduction: TypeReduction; valeur_reduction: string;
  montant_minimum_commande: string; montant_maximum_reduction: string;
  date_debut: string; date_fin: string;
  limite_utilisation_totale: string; limite_utilisation_par_client: string;
  statut_actif: boolean;
};

const EMPTY_FORM: CouponForm = {
  code: "", description: "", type_reduction: "pourcentage", valeur_reduction: "",
  montant_minimum_commande: "0", montant_maximum_reduction: "",
  date_debut: "", date_fin: "",
  limite_utilisation_totale: "", limite_utilisation_par_client: "1",
  statut_actif: true,
};

const STATUTS = [
  { value: "", label: "Tous les statuts" },
  { value: "actif", label: "Actif" },
  { value: "inactif", label: "Désactivé" },
  { value: "expire", label: "Expiré" },
];

export default function CouponsPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canManage = usePermission("manage_coupons");

  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CouponAdmin | null>(null);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<CouponAdmin | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-coupons", page, statut, search],
    queryFn: async () => {
      const qs = buildQuery({ page, statut, search });
      return (await api.get<ApiEnvelope<PaginatedData<CouponAdmin>>>(`/admin/coupons${qs}`)).data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const base = {
        description: form.description || null,
        type_reduction: form.type_reduction,
        valeur_reduction: Number(form.valeur_reduction),
        montant_minimum_commande: Number(form.montant_minimum_commande || 0),
        montant_maximum_reduction: form.montant_maximum_reduction ? Number(form.montant_maximum_reduction) : null,
        date_debut: fromDatetimeLocal(form.date_debut),
        date_fin: fromDatetimeLocal(form.date_fin),
        limite_utilisation_totale: form.limite_utilisation_totale ? Number(form.limite_utilisation_totale) : null,
        limite_utilisation_par_client: form.limite_utilisation_par_client ? Number(form.limite_utilisation_par_client) : null,
        statut_actif: form.statut_actif,
      };
      return editTarget
        ? api.put(`/admin/coupons/${editTarget.id}`, base)
        : api.post("/admin/coupons", { ...base, code: form.code });
    },
    onSuccess: () => {
      notify(editTarget ? "Coupon mis à jour." : "Coupon créé.");
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: (err) => notifyError(err, "Impossible d'enregistrer ce coupon."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      notify("Coupon supprimé.");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: (err) => notifyError(err, "Impossible de supprimer ce coupon."),
  });

  function openCreate() { setEditTarget(null); setForm(EMPTY_FORM); setFormOpen(true); }
  function openEdit(c: CouponAdmin) {
    setEditTarget(c);
    setForm({
      code: c.code, description: c.description ?? "", type_reduction: c.type_reduction,
      valeur_reduction: String(c.valeur_reduction), montant_minimum_commande: String(c.montant_minimum_commande),
      montant_maximum_reduction: c.montant_maximum_reduction !== null ? String(c.montant_maximum_reduction) : "",
      date_debut: toDatetimeLocal(c.date_debut), date_fin: toDatetimeLocal(c.date_fin),
      limite_utilisation_totale: c.limite_utilisation_totale !== null ? String(c.limite_utilisation_totale) : "",
      limite_utilisation_par_client: c.limite_utilisation_par_client !== null ? String(c.limite_utilisation_par_client) : "",
      statut_actif: c.statut_actif,
    });
    setFormOpen(true);
  }

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Coupons"
        description="Codes promo saisis par les clients au moment du paiement."
        icon={Ticket}
        action={
          <div className="flex items-center gap-3">
            <HeaderStat icon={Ticket} label={`${data?.total ?? "—"} coupons`} tone="navy" />
            {canManage && (
              <Button variant="secondary" onClick={openCreate}>
                <Plus size={14} /> Nouveau coupon
              </Button>
            )}
          </div>
        }
      />

      <FilterBar>
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}
          className="flex items-center gap-2 ml-auto">
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Code du coupon…"
            className="w-48 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 placeholder-slate-400 focus:border-[#1A2E5A] focus:outline-none" />
          <button type="submit" className="rounded-xl bg-[#1A2E5A] px-4 py-2.5 text-sm font-black text-white hover:bg-[#0B1A35] transition-colors">
            Rechercher
          </button>
        </form>
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les coupons."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && items.length === 0 && <EmptyState message="Aucun coupon créé pour le moment." />}

      {!isLoading && !isError && items.length > 0 && (
        <AdminTable headers={["Code", "Réduction", "Min. commande", "Utilisations", "Validité", "Statut", "Actions"]}>
          {items.map((c) => {
            const actif = c.statut_actif && new Date(c.date_fin) >= new Date();
            return (
              <tr key={c.id} className="row-accent hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3.5">
                  <code className="rounded-lg bg-[#1A2E5A]/8 px-2.5 py-1 text-xs font-black text-[#1A2E5A] tracking-wide">{c.code}</code>
                </td>
                <td className="px-5 py-3.5 text-xs font-bold text-slate-700">
                  -{c.valeur_reduction}{c.type_reduction === "pourcentage" ? "%" : " FCFA"}
                  {c.montant_maximum_reduction && <span className="text-slate-400 font-medium"> (max {formatMontant(c.montant_maximum_reduction)})</span>}
                </td>
                <td className="px-5 py-3.5 text-xs font-semibold text-slate-500">{formatMontant(c.montant_minimum_commande)}</td>
                <td className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                  {c.commandes_count ?? 0}{c.limite_utilisation_totale ? ` / ${c.limite_utilisation_totale}` : ""}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-400 font-medium">{formatDate(c.date_debut)} → {formatDate(c.date_fin)}</td>
                <td className="px-5 py-3.5"><Badge tone={actif ? "green" : "gray"}>{actif ? "Actif" : "Inactif"}</Badge></td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    {canManage && (
                      <>
                        <IconAction icon={Pencil} label="Modifier" onClick={() => openEdit(c)} variant="ghost" />
                        <IconAction icon={Trash2} label="Supprimer" onClick={() => setDeleteTarget(c)} variant="danger" />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      )}

      {data && data.total > 0 && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {formOpen && (
        <Modal
          title={editTarget ? "Modifier le coupon" : "Nouveau coupon"}
          onClose={() => setFormOpen(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saveMutation.isPending}>Annuler</Button>
            <Button variant="secondary" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}
              disabled={(!editTarget && !form.code.trim()) || !form.valeur_reduction || !form.date_debut || !form.date_fin}>
              Enregistrer
            </Button>
          </>}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Code {editTarget && <span className="font-normal text-slate-400">(non modifiable)</span>}</label>
              <input value={form.code} disabled={!!editTarget} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-black uppercase tracking-wide focus:border-[#1A2E5A] focus:outline-none disabled:bg-slate-50 disabled:text-slate-400" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Type de réduction</label>
                <select value={form.type_reduction} onChange={(e) => setForm((f) => ({ ...f, type_reduction: e.target.value as TypeReduction }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none">
                  <option value="pourcentage">Pourcentage</option>
                  <option value="montant_fixe">Montant fixe (FCFA)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Valeur</label>
                <input type="number" min={0} value={form.valeur_reduction} onChange={(e) => setForm((f) => ({ ...f, valeur_reduction: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Commande minimum (FCFA)</label>
                <input type="number" min={0} value={form.montant_minimum_commande} onChange={(e) => setForm((f) => ({ ...f, montant_minimum_commande: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Réduction maximum (FCFA)</label>
                <input type="number" min={0} placeholder="Illimité" value={form.montant_maximum_reduction} onChange={(e) => setForm((f) => ({ ...f, montant_maximum_reduction: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Date de début</label>
                <input type="datetime-local" value={form.date_debut} onChange={(e) => setForm((f) => ({ ...f, date_debut: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Date de fin</label>
                <input type="datetime-local" value={form.date_fin} onChange={(e) => setForm((f) => ({ ...f, date_fin: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Limite d&apos;utilisations totale</label>
                <input type="number" min={1} placeholder="Illimité" value={form.limite_utilisation_totale} onChange={(e) => setForm((f) => ({ ...f, limite_utilisation_totale: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Limite par client</label>
                <input type="number" min={1} placeholder="Illimité" value={form.limite_utilisation_par_client} onChange={(e) => setForm((f) => ({ ...f, limite_utilisation_par_client: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.statut_actif} onChange={(e) => setForm((f) => ({ ...f, statut_actif: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-[#1A2E5A] focus:ring-[#1A2E5A]" />
              <span className="text-xs font-bold text-slate-700">Coupon actif</span>
            </label>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer ce coupon"
          message={`Confirmez-vous la suppression du coupon « ${deleteTarget.code} » ?`}
          confirmLabel="Supprimer" danger
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
