"use client";

import { useCallback, useEffect, useState } from "react";
import { Landmark, Plus, Pencil, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ApiEnvelope, TauxChangeAdmin } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatDate } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminPageHeader, AdminTable, IconAction } from "@/components/AdminTable";

// Taux de conversion utilisés pour tout calcul en devise réelle (paiements diaspora, tableaux de
// bord) — jusqu'ici seulement peuplés par TauxChangeSeeder.php, aucun admin ne pouvait les corriger
// sans écriture DB directe.
export default function TauxChangePage() {
  const { notify, notifyError } = useToast();
  const canCreate = usePermission("create_taux_change");
  const canEdit = usePermission("edit_taux_change");
  const canDelete = usePermission("delete_taux_change");

  const [items, setItems] = useState<TauxChangeAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TauxChangeAdmin | null>(null);
  const [deviseSource, setDeviseSource] = useState("");
  const [deviseCible, setDeviseCible] = useState("");
  const [valeurTaux, setValeurTaux] = useState("");
  const [sourceTaux, setSourceTaux] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TauxChangeAdmin | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiEnvelope<TauxChangeAdmin[]>>("/admin/taux-change");
      setItems(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les taux de change.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setDeviseSource("");
    setDeviseCible("FCFA");
    setValeurTaux("");
    setSourceTaux("");
    setFormOpen(true);
  }
  function openEdit(t: TauxChangeAdmin) {
    setEditing(t);
    setDeviseSource(t.devise_source);
    setDeviseCible(t.devise_cible);
    setValeurTaux(String(t.valeur_taux));
    setSourceTaux(t.source_taux ?? "");
    setFormOpen(true);
  }

  async function saveForm() {
    setSaving(true);
    try {
      const payload = {
        devise_source: deviseSource.trim().toUpperCase(),
        devise_cible: deviseCible.trim().toUpperCase(),
        valeur_taux: Number(valeurTaux),
        source_taux: sourceTaux.trim() || null,
      };
      if (editing) {
        await api.put(`/admin/taux-change/${editing.id}`, payload);
        notify("Taux de change mis à jour.");
      } else {
        await api.post("/admin/taux-change", payload);
        notify("Taux de change créé.");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      notifyError(err, "Impossible d'enregistrer ce taux de change.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/taux-change/${deleteTarget.id}`);
      notify("Taux de change supprimé.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      notifyError(err, "Impossible de supprimer ce taux de change.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const isValid = deviseSource.trim().length > 0 && deviseCible.trim().length > 0 && Number(valeurTaux) > 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Taux de change"
        description="Taux de conversion utilisés pour les paiements diaspora et les tableaux de bord."
        icon={Landmark}
        action={
          canCreate ? (
            <Button variant="primary" onClick={openCreate}>
              <Plus size={14} /> Nouveau taux
            </Button>
          ) : undefined
        }
      />

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}

      {!loading && !error && (
        <AdminTable
          headers={["Conversion", "Taux", "Source", "Mis à jour", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucun taux de change enregistré."
        >
          {items.map((t) => (
            <tr key={t.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-4">
                <span className="rounded-xl bg-[#1A2E5A]/8 px-2.5 py-1 text-sm font-black text-[#1A2E5A]">
                  {t.devise_source} → {t.devise_cible}
                </span>
              </td>
              <td className="px-5 py-4 text-sm font-bold text-slate-700">{Number(t.valeur_taux).toLocaleString("fr-FR", { maximumFractionDigits: 6 })}</td>
              <td className="px-5 py-4 text-sm text-slate-500">{t.source_taux || "—"}</td>
              <td className="px-5 py-4 text-sm text-slate-400 font-medium">{formatDate(t.date_maj, true)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  {canEdit && <IconAction icon={Pencil} label="Modifier" onClick={() => openEdit(t)} variant="ghost" />}
                  {canDelete && <IconAction icon={Trash2} label="Supprimer" onClick={() => setDeleteTarget(t)} variant="danger" />}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {formOpen && (
        <Modal
          title={editing ? "Modifier le taux de change" : "Nouveau taux de change"}
          onClose={() => setFormOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saving}>Annuler</Button>
              <Button variant="secondary" onClick={saveForm} loading={saving} disabled={!isValid}>Enregistrer</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Devise source</label>
                <input value={deviseSource} onChange={(e) => setDeviseSource(e.target.value.toUpperCase())} maxLength={10}
                  className="focus-premium w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono font-bold uppercase transition-colors focus:border-[#1A2E5A] focus:outline-none"
                  placeholder="USD" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Devise cible</label>
                <input value={deviseCible} onChange={(e) => setDeviseCible(e.target.value.toUpperCase())} maxLength={10}
                  className="focus-premium w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono font-bold uppercase transition-colors focus:border-[#1A2E5A] focus:outline-none"
                  placeholder="FCFA" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Valeur du taux</label>
              <input value={valeurTaux} onChange={(e) => setValeurTaux(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal"
                className="focus-premium w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium transition-colors focus:border-[#1A2E5A] focus:outline-none"
                placeholder="Ex : 2800" />
              <p className="mt-1.5 text-[11px] text-slate-400">1 {deviseSource || "devise source"} = ce nombre de {deviseCible || "devise cible"}.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Source du taux (optionnel)</label>
              <input value={sourceTaux} onChange={(e) => setSourceTaux(e.target.value)} maxLength={255}
                className="focus-premium w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium transition-colors focus:border-[#1A2E5A] focus:outline-none"
                placeholder="Ex : Banque Centrale" />
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer ce taux de change"
          message={`Confirmez-vous la suppression du taux ${deleteTarget.devise_source} → ${deleteTarget.devise_cible} ? Toute conversion utilisant cette paire retombera sur le montant non converti.`}
          confirmLabel="Supprimer"
          danger
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
