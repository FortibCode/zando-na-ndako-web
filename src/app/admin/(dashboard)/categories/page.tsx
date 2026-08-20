"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tags, Plus, Pencil, Trash2, Camera, ImageOff } from "lucide-react";
import { api, ApiError, resolveMediaUrl } from "@/lib/api";
import type { ApiEnvelope, Categorie } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/lib/toast-context";
import { AdminPageHeader, IconAction } from "@/components/AdminTable";

// L'API sérialise la relation Eloquent sousCategories() en snake_case ("sous_categories").
interface CategorieApi extends Categorie { sous_categories?: Categorie[]; }

// Les catégories créées avant l'ajout de l'upload d'image peuvent encore porter un symbole
// texte dans `icone` — on ne le traite comme une image que s'il ressemble à un chemin de
// stockage ("photos/categories/xxx.jpg") ou à une URL absolue.
function categorieImageUrl(icone: string | null | undefined): string | null {
  if (!icone) return null;
  if (icone.startsWith("http") || icone.includes("/")) return resolveMediaUrl(icone);
  return null;
}
function categorieLegacyEmoji(icone: string | null | undefined): string | null {
  if (!icone) return null;
  return categorieImageUrl(icone) ? null : icone;
}

export default function CategoriesPage() {
  const { notify, notifyError } = useToast();
  const [items, setItems] = useState<CategorieApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Categorie | null>(null);
  const [nom, setNom] = useState("");
  const [parentId, setParentId] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Categorie | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<ApiEnvelope<CategorieApi[]>>("/categories");
      setItems(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les catégories.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate(defaultParentId = "") {
    setEditing(null); setNom(""); setParentId(defaultParentId); setPhotoFile(null); setPhotoPreview(null); setFormOpen(true);
  }
  function openEdit(c: Categorie) {
    setEditing(c); setNom(c.nom_categorie); setParentId(c.categorie_parente_id ?? "");
    setPhotoFile(null); setPhotoPreview(categorieImageUrl(c.icone));
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
      form.append("nom_categorie", nom);
      form.append("categorie_parente_id", parentId);
      if (photoFile) form.append("photo", photoFile);
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, form);
        notify("Catégorie mise à jour.");
      } else {
        await api.post("/admin/categories", form);
        notify("Catégorie créée.");
      }
      setFormOpen(false); load();
    } catch (err) { notifyError(err, "Impossible d'enregistrer cette catégorie."); }
    finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return; setDeleteLoading(true);
    try {
      await api.delete(`/admin/categories/${deleteTarget.id}`);
      notify("Catégorie supprimée."); setDeleteTarget(null); load();
    } catch (err) { notifyError(err, "Impossible de supprimer cette catégorie (peut-être utilisée par des produits)."); }
    finally { setDeleteLoading(false); }
  }

  // Catégories principales seulement, pour le sélecteur "catégorie parente" — une sous-catégorie
  // ne peut pas elle-même avoir une sous-catégorie.
  const parentOptions = items.filter((c) => !c.categorie_parente_id && c.id !== editing?.id);

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Catégories de produits"
        description="Gérez les catégories et sous-catégories du catalogue Zando na Ndako."
        icon={Tags}
        action={
          <Button variant="primary" onClick={() => openCreate()}>
            <Plus size={14} /> Nouvelle catégorie
          </Button>
        }
      />

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((categorie) => {
            const imgUrl = categorieImageUrl(categorie.icone);
            const legacyEmoji = categorieLegacyEmoji(categorie.icone);
            const enfants = categorie.sous_categories ?? [];
            return (
              <div key={categorie.id}
                className="surface-card surface-card-interactive group relative overflow-hidden rounded-2xl p-5 min-h-[160px]">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-linear-to-r from-[#C00000] to-[#F1A105]" />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl text-2xl shrink-0 bg-[#C00000]/8">
                      {imgUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                      ) : legacyEmoji ? (
                        legacyEmoji
                      ) : (
                        <ImageOff size={18} className="text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black truncate text-base text-slate-800">{categorie.nom_categorie}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {enfants.length > 0 ? `${enfants.length} sous-catégorie${enfants.length > 1 ? "s" : ""}` : "Catégorie principale"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconAction icon={Pencil} label="Modifier" onClick={() => openEdit(categorie)} variant="ghost" />
                    <IconAction icon={Trash2} label="Supprimer" onClick={() => setDeleteTarget(categorie)} variant="danger" />
                  </div>
                </div>

                {enfants.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-0.5">
                    {enfants.map((enfant) => (
                      <div key={enfant.id} className="group/child flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50 transition-colors">
                        <span className="flex items-center gap-1.5 min-w-0 text-xs font-bold text-slate-600 truncate">
                          <span className="text-slate-300 shrink-0">↳</span>
                          <span className="truncate">{enfant.nom_categorie}</span>
                        </span>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/child:opacity-100 transition-opacity">
                          <IconAction icon={Pencil} label="Modifier" onClick={() => openEdit(enfant)} variant="ghost" />
                          <IconAction icon={Trash2} label="Supprimer" onClick={() => setDeleteTarget(enfant)} variant="danger" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => openCreate(categorie.id)}
                  className="focus-premium mt-3.5 flex items-center gap-1.5 text-xs font-black text-[#1A2E5A] hover:underline cursor-pointer">
                  <Plus size={13} /> Ajouter une sous-catégorie
                </button>
              </div>
            );
          })}

          {/* Add new card */}
          <button onClick={() => openCreate()}
            className="focus-premium flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-transparent p-5 text-sm font-bold text-slate-400 hover:border-[#C00000] hover:text-[#C00000] transition-all cursor-pointer min-h-[160px]">
            <Plus size={18} /> Ajouter une catégorie
          </button>
        </div>
      )}

      {/* Form Modal */}
      {formOpen && (
        <Modal title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"} onClose={() => setFormOpen(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saving}>Annuler</Button>
            <Button variant="secondary" onClick={saveForm} loading={saving} disabled={!nom.trim()}>Enregistrer</Button>
          </>}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">Photo de la catégorie</label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff size={20} className="text-slate-300" />
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="focus-premium flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-black text-slate-600 hover:border-[#1A2E5A] hover:text-[#1A2E5A] transition-all cursor-pointer">
                  <Camera size={15} />
                  {photoPreview ? "Changer l'image" : "Ajouter une image"}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Nom de la catégorie</label>
              <input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={100}
                className="focus-premium w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium transition-colors focus:border-[#1A2E5A] focus:outline-none"
                placeholder="Ex : Légumes & Feuilles" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Catégorie parente</label>
              <select value={parentId} onChange={(e) => setParentId(e.target.value)}
                className="focus-premium w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium transition-colors focus:border-[#1A2E5A] focus:outline-none">
                <option value="">Aucune (catégorie principale)</option>
                {parentOptions.map((c) => <option key={c.id} value={c.id}>{c.nom_categorie}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog title="Supprimer cette catégorie"
          message={`Confirmez-vous la suppression de « ${deleteTarget.nom_categorie} » ? Cette action est irréversible.`}
          confirmLabel="Supprimer" danger loading={deleteLoading} onConfirm={confirmDelete} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
