"use client";

import { useCallback, useEffect, useState } from "react";
import { Flag, Plus, Pencil, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ApiEnvelope, LitigeMotifAdmin } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminPageHeader, IconAction } from "@/components/AdminTable";

// Motifs proposés au client/vendeur pour ouvrir un litige (litiges.motif) — remplace l'ancienne
// constante LitigeController::MOTIFS, jusqu'ici recopiée indépendamment côté mobile et web.
export default function LitigeMotifsPage() {
  const { notify, notifyError } = useToast();
  const canCreate = usePermission("create_litige_motifs");
  const canEdit = usePermission("edit_litige_motifs");
  const canDelete = usePermission("delete_litige_motifs");

  const [items, setItems] = useState<LitigeMotifAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LitigeMotifAdmin | null>(null);
  const [code, setCode] = useState("");
  const [libelle, setLibelle] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LitigeMotifAdmin | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiEnvelope<LitigeMotifAdmin[]>>("/admin/litige-motifs");
      setItems(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les motifs de litige.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setCode("");
    setLibelle("");
    setFormOpen(true);
  }
  function openEdit(m: LitigeMotifAdmin) {
    setEditing(m);
    setCode(m.code);
    setLibelle(m.libelle);
    setFormOpen(true);
  }

  async function saveForm() {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/litige-motifs/${editing.id}`, { code: code.trim(), libelle: libelle.trim() });
        notify("Motif mis à jour.");
      } else {
        await api.post("/admin/litige-motifs", { code: code.trim(), libelle: libelle.trim() });
        notify("Motif créé.");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      notifyError(err, "Impossible d'enregistrer ce motif.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/litige-motifs/${deleteTarget.id}`);
      notify("Motif supprimé.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      notifyError(err, "Impossible de supprimer ce motif (peut-être utilisé par un litige).");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Motifs de litige"
        description="Motifs proposés au client/vendeur pour ouvrir un litige — remplace l'ancienne liste fixe codée dans le backend."
        icon={Flag}
        action={
          canCreate ? (
            <Button variant="primary" onClick={openCreate}>
              <Plus size={14} /> Nouveau motif
            </Button>
          ) : undefined
        }
      />

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((m) => (
            <div key={m.id} className="surface-card group relative overflow-hidden rounded-2xl p-5">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-linear-to-r from-[#C00000] to-[#F1A105]" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-black truncate text-base text-slate-800">{m.libelle}</p>
                  <p className="text-xs text-slate-400 font-mono font-medium mt-0.5 truncate">{m.code}</p>
                </div>
                {(canEdit || canDelete) && (
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit && <IconAction icon={Pencil} label="Modifier" onClick={() => openEdit(m)} variant="ghost" />}
                    {canDelete && <IconAction icon={Trash2} label="Supprimer" onClick={() => setDeleteTarget(m)} variant="danger" />}
                  </div>
                )}
              </div>
            </div>
          ))}

          {canCreate && (
            <button
              onClick={openCreate}
              className="focus-premium flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-transparent p-5 text-sm font-bold text-slate-400 hover:border-[#C00000] hover:text-[#C00000] transition-all cursor-pointer min-h-[96px]"
            >
              <Plus size={18} /> Ajouter un motif
            </button>
          )}
        </div>
      )}

      {formOpen && (
        <Modal
          title={editing ? "Modifier le motif" : "Nouveau motif"}
          onClose={() => setFormOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saving}>Annuler</Button>
              <Button variant="secondary" onClick={saveForm} loading={saving} disabled={!code.trim() || !libelle.trim()}>Enregistrer</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Libellé affiché</label>
              <input value={libelle} onChange={(e) => setLibelle(e.target.value)} maxLength={150}
                className="focus-premium w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium transition-colors focus:border-[#1A2E5A] focus:outline-none"
                placeholder="Ex : Colis perdu" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Code technique</label>
              <input value={code} onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "_"))} maxLength={100}
                className="focus-premium w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono font-medium transition-colors focus:border-[#1A2E5A] focus:outline-none"
                placeholder="Ex : colis_perdu" />
              <p className="mt-1.5 text-[11px] text-slate-400">
                Lettres, chiffres, tirets et underscores uniquement. {editing ? "Renommer met à jour tous les litiges déjà ouverts sous ce motif." : ""}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer ce motif"
          message={`Confirmez-vous la suppression de « ${deleteTarget.libelle} » ? Impossible si un litige l'utilise encore.`}
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
