"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Images, Plus, Pencil, Trash2, Camera } from "lucide-react";
import { api, ApiError, resolveMediaUrl } from "@/lib/api";
import type { ApiEnvelope, TypeBoutique } from "@/lib/types";
import { deriveTypeBoutiqueIcon } from "@/lib/typeBoutiqueIcon";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminPageHeader, IconAction } from "@/components/AdminTable";

// Le type de boutique (categorie_principale) est distinct de la catégorie de PRODUIT
// (admin/categories) : c'est l'axe de navigation principal côté client boutique-d'abord (voir
// admin_boutique_moderation), et jusqu'ici une liste fixe codée en dur côté backend
// (Vendeur::TYPES_BOUTIQUE) — cette page en fait une vraie entité gérable par un admin.
export default function TypesBoutiquePage() {
  const { notify, notifyError } = useToast();
  const canCreate = usePermission("create_types_boutique");
  const canEdit = usePermission("edit_types_boutique");
  const canDelete = usePermission("delete_types_boutique");

  const [items, setItems] = useState<TypeBoutique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TypeBoutique | null>(null);
  const [type, setType] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TypeBoutique | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiEnvelope<TypeBoutique[]>>("/admin/types-boutique");
      setItems(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les types de boutique.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setType("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormOpen(true);
  }
  function openEdit(t: TypeBoutique) {
    setEditing(t);
    setType(t.type);
    setPhotoFile(null);
    setPhotoPreview(resolveMediaUrl(t.logo));
    setFormOpen(true);
  }

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function saveForm() {
    setSaving(true);
    try {
      const form = new FormData();
      form.append("type", type.trim());
      if (photoFile) form.append("logo", photoFile);
      if (editing) {
        await api.put(`/admin/types-boutique/${editing.id}`, form);
        notify("Type de boutique mis à jour.");
      } else {
        await api.post("/admin/types-boutique", form);
        notify("Type de boutique créé.");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      notifyError(err, "Impossible d'enregistrer ce type de boutique.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/types-boutique/${deleteTarget.id}`);
      notify("Type de boutique supprimé.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      notifyError(err, "Impossible de supprimer ce type (peut-être utilisé par un vendeur).");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Types de boutique"
        description="Créez, renommez, illustrez et supprimez les types de boutique proposés à l'inscription vendeur — remplace l'ancienne liste fixe codée dans le backend."
        icon={Images}
        action={
          canCreate ? (
            <Button variant="primary" onClick={openCreate}>
              <Plus size={14} /> Nouveau type
            </Button>
          ) : undefined
        }
      />

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((t) => {
            const logoUrl = resolveMediaUrl(t.logo);
            const Icon = deriveTypeBoutiqueIcon(t.type);
            return (
              <div key={t.id} className="surface-card group relative flex flex-col items-center gap-3 rounded-2xl p-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-[#C00000]/8 ring-1 ring-slate-100">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt={t.type} className="h-full w-full object-cover" />
                  ) : (
                    <Icon className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <p className="text-xs font-black leading-snug text-slate-800">{t.type}</p>
                {(canEdit || canDelete) && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit && <IconAction icon={Pencil} label="Modifier" onClick={() => openEdit(t)} variant="ghost" />}
                    {canDelete && <IconAction icon={Trash2} label="Supprimer" onClick={() => setDeleteTarget(t)} variant="danger" />}
                  </div>
                )}
              </div>
            );
          })}

          {canCreate && (
            <button
              onClick={openCreate}
              className="focus-premium flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-transparent p-5 text-sm font-bold text-slate-400 transition-all hover:border-[#C00000] hover:text-[#C00000] cursor-pointer"
            >
              <Plus size={18} /> Ajouter un type
            </button>
          )}
        </div>
      )}

      {formOpen && (
        <Modal
          title={editing ? "Modifier le type de boutique" : "Nouveau type de boutique"}
          onClose={() => setFormOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saving}>Annuler</Button>
              <Button variant="secondary" onClick={saveForm} loading={saving} disabled={!type.trim()}>Enregistrer</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">Logo</label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Images size={20} className="text-slate-300" />
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="focus-premium flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-black text-slate-600 transition-all hover:border-[#1A2E5A] hover:text-[#1A2E5A] cursor-pointer"
                >
                  <Camera size={15} />
                  {photoPreview ? "Changer le logo" : "Ajouter un logo"}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Nom du type</label>
              <input
                value={type}
                onChange={(e) => setType(e.target.value)}
                maxLength={150}
                className="focus-premium w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium transition-colors focus:border-[#1A2E5A] focus:outline-none"
                placeholder="Ex : Fleuriste"
              />
              {editing && (
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Renommer met à jour tous les vendeurs déjà enregistrés sous ce type.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer ce type de boutique"
          message={`Confirmez-vous la suppression de « ${deleteTarget.type} » ? Impossible si un vendeur l'utilise encore.`}
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
