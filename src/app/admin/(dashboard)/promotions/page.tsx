"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Pencil, Trash2, Package, Plus, X, Camera, ImageOff } from "lucide-react";
import { api, ApiError, resolveMediaUrl } from "@/lib/api";
import type { ApiEnvelope, PaginatedData, PromotionAdmin, PromotionProduitAdmin, TypeReduction, ProduitAdmin, ProduitsAdminData } from "@/lib/types";
import { LoadingBlock, ErrorBlock, EmptyState } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatDate, formatMontant, toDatetimeLocal, fromDatetimeLocal } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminPageHeader, IconAction, HeaderStat } from "@/components/AdminTable";

type PromoForm = {
  titre: string; description: string; type_reduction: TypeReduction; valeur_reduction: string;
  date_debut: string; date_fin: string; statut_actif: boolean;
};

const EMPTY_FORM: PromoForm = {
  titre: "", description: "", type_reduction: "pourcentage", valeur_reduction: "",
  date_debut: "", date_fin: "", statut_actif: true,
};

export default function PromotionsPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canManage = usePermission("manage_promotions");

  const [page, setPage] = useState(1);
  const [actifUniquement, setActifUniquement] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PromotionAdmin | null>(null);
  const [form, setForm] = useState<PromoForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromotionAdmin | null>(null);
  const [produitsTarget, setProduitsTarget] = useState<PromotionAdmin | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-promotions", page, actifUniquement],
    queryFn: async () => (await api.get<ApiEnvelope<PaginatedData<PromotionAdmin>>>(
      `/admin/promotions?page=${page}${actifUniquement ? "&actif_uniquement=1" : ""}`
    )).data,
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = new FormData();
      payload.append("titre", form.titre);
      payload.append("description", form.description || "");
      payload.append("type_reduction", form.type_reduction);
      payload.append("valeur_reduction", form.valeur_reduction);
      payload.append("date_debut", fromDatetimeLocal(form.date_debut) ?? "");
      payload.append("date_fin", fromDatetimeLocal(form.date_fin) ?? "");
      payload.append("statut_actif", form.statut_actif ? "1" : "0");
      if (imageFile) payload.append("image_bandeau", imageFile);
      return editTarget ? api.put(`/admin/promotions/${editTarget.id}`, payload) : api.post("/admin/promotions", payload);
    },
    onSuccess: () => {
      notify(editTarget ? "Promotion mise à jour." : "Promotion créée.");
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
    },
    onError: (err) => notifyError(err, "Impossible d'enregistrer cette promotion."),
  });

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/promotions/${id}`),
    onSuccess: () => {
      notify("Promotion supprimée.");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
    },
    onError: (err) => notifyError(err, "Impossible de supprimer cette promotion."),
  });

  function openCreate() { setEditTarget(null); setForm(EMPTY_FORM); setImageFile(null); setImagePreview(null); setFormOpen(true); }
  function openEdit(p: PromotionAdmin) {
    setEditTarget(p);
    setForm({
      titre: p.titre, description: p.description ?? "", type_reduction: p.type_reduction,
      valeur_reduction: String(p.valeur_reduction), date_debut: toDatetimeLocal(p.date_debut),
      date_fin: toDatetimeLocal(p.date_fin), statut_actif: p.statut_actif,
    });
    setImageFile(null);
    setImagePreview(resolveMediaUrl(p.image_bandeau));
    setFormOpen(true);
  }

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Promotions"
        description="Réductions appliquées directement sur le prix affiché de produits sélectionnés."
        icon={Megaphone}
        action={
          <div className="flex items-center gap-3">
            <HeaderStat icon={Megaphone} label={`${data?.total ?? "—"} promotions`} tone="gold" />
            <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-black text-slate-700 cursor-pointer">
              <input type="checkbox" checked={actifUniquement} onChange={(e) => { setPage(1); setActifUniquement(e.target.checked); }}
                className="h-4 w-4 rounded border-slate-300 text-[#1A2E5A] focus:ring-[#1A2E5A]" />
              Actives uniquement
            </label>
            {canManage && (
              <Button variant="secondary" onClick={openCreate}>
                <Plus size={14} /> Nouvelle promotion
              </Button>
            )}
          </div>
        }
      />

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les promotions."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && items.length === 0 && <EmptyState message="Aucune promotion créée pour le moment." />}

      {!isLoading && !isError && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((p) => {
            const actif = p.statut_actif && new Date(p.date_debut) <= new Date() && new Date(p.date_fin) >= new Date();
            const bannerUrl = resolveMediaUrl(p.image_bandeau);
            return (
              <div key={p.id} className="surface-card surface-card-interactive rounded-2xl p-5">
                {bannerUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bannerUrl} alt="" className="mb-3 h-28 w-full rounded-xl object-cover" />
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 truncate">{p.titre}</h3>
                    {p.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{p.description}</p>}
                  </div>
                  <Badge tone={actif ? "green" : "gray"}>{actif ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-lg bg-[#F1A105]/10 px-2.5 py-1 text-xs font-black text-[#8a5c03]">
                    -{p.valeur_reduction}{p.type_reduction === "pourcentage" ? "%" : " FCFA"}
                  </span>
                  <span className="text-[12.5px] text-slate-400 font-medium">
                    {formatDate(p.date_debut)} → {formatDate(p.date_fin)}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={() => setProduitsTarget(p)} className="flex items-center gap-1.5 text-xs font-bold text-[#1A2E5A] hover:underline">
                    <Package size={13} /> {p.produits?.length ?? 0} produit(s)
                  </button>
                  {canManage && (
                    <div className="flex gap-2">
                      <IconAction icon={Pencil} label="Modifier" onClick={() => openEdit(p)} variant="ghost" />
                      <IconAction icon={Trash2} label="Supprimer" onClick={() => setDeleteTarget(p)} variant="danger" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {formOpen && (
        <Modal
          title={editTarget ? "Modifier la promotion" : "Nouvelle promotion"}
          onClose={() => setFormOpen(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saveMutation.isPending}>Annuler</Button>
            <Button variant="secondary" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}
              disabled={!form.titre.trim() || !form.valeur_reduction || !form.date_debut || !form.date_fin}>
              Enregistrer
            </Button>
          </>}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">Bannière</label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff size={20} className="text-slate-300" />
                  )}
                </div>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
                <button type="button" onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-black text-slate-600 hover:border-[#1A2E5A] hover:text-[#1A2E5A] transition-colors">
                  <Camera size={15} />
                  {imagePreview ? "Changer l'image" : "Ajouter une image"}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Titre</label>
              <input value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Type de réduction</label>
                <select value={form.type_reduction} onChange={(e) => setForm((f) => ({ ...f, type_reduction: e.target.value as TypeReduction }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none">
                  <option value="pourcentage">Pourcentage</option>
                  <option value="montant_fixe">Montant fixe (FCFA)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Valeur</label>
                <input type="number" min={0} value={form.valeur_reduction} onChange={(e) => setForm((f) => ({ ...f, valeur_reduction: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Date de début</label>
                <input type="datetime-local" value={form.date_debut} onChange={(e) => setForm((f) => ({ ...f, date_debut: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Date de fin</label>
                <input type="datetime-local" value={form.date_fin} onChange={(e) => setForm((f) => ({ ...f, date_fin: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.statut_actif} onChange={(e) => setForm((f) => ({ ...f, statut_actif: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-[#1A2E5A] focus:ring-[#1A2E5A]" />
              <span className="text-xs font-bold text-slate-700">Promotion active</span>
            </label>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer cette promotion"
          message={`Confirmez-vous la suppression de « ${deleteTarget.titre} » ? Les produits associés seront détachés.`}
          confirmLabel="Supprimer" danger
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {produitsTarget && (
        <PromotionProduitsModal
          promotion={produitsTarget}
          canManage={canManage}
          onClose={() => setProduitsTarget(null)}
        />
      )}
    </div>
  );
}

function PromotionProduitsModal({ promotion, canManage, onClose }: { promotion: PromotionAdmin; canManage: boolean; onClose: () => void }) {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduit, setSelectedProduit] = useState("");
  const [prixPromo, setPrixPromo] = useState("");

  const { data: promoDetail } = useQuery({
    queryKey: ["admin-promotion-detail", promotion.id],
    queryFn: async () => (await api.get<ApiEnvelope<PaginatedData<PromotionAdmin>>>("/admin/promotions?per_page=1000")).data.data.find((p) => p.id === promotion.id) ?? promotion,
    initialData: promotion,
  });

  const { data: produitsList } = useQuery({
    queryKey: ["admin-produits-picker"],
    queryFn: async () => (await api.get<ApiEnvelope<ProduitsAdminData>>("/admin/produits")).data.data,
  });

  const addMutation = useMutation({
    mutationFn: () => api.post(`/admin/promotions/${promotion.id}/produits`, { produit_id: selectedProduit, prix_promo: Number(prixPromo) }),
    onSuccess: () => {
      notify("Produit ajouté à la promotion.");
      setSelectedProduit(""); setPrixPromo("");
      queryClient.invalidateQueries({ queryKey: ["admin-promotion-detail", promotion.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
    },
    onError: (err) => notifyError(err, "Impossible d'ajouter ce produit."),
  });

  const removeMutation = useMutation({
    mutationFn: (produitId: string) => api.delete(`/admin/promotions/${promotion.id}/produits/${produitId}`),
    onSuccess: () => {
      notify("Produit retiré.");
      queryClient.invalidateQueries({ queryKey: ["admin-promotion-detail", promotion.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
    },
    onError: (err) => notifyError(err, "Impossible de retirer ce produit."),
  });

  const produits = promoDetail?.produits ?? [];

  return (
    <Modal title={`Produits — ${promotion.titre}`} onClose={onClose} footer={<Button variant="ghost" onClick={onClose}>Fermer</Button>}>
      <div className="space-y-4">
        {produits.length === 0 ? (
          <p className="text-xs font-semibold text-slate-400">Aucun produit rattaché à cette promotion.</p>
        ) : (
          <div className="divide-y divide-slate-50 -mx-1">
            {produits.map((pp: PromotionProduitAdmin) => {
              const img = resolveMediaUrl(pp.produit?.photo_produit ?? null);
              return (
                <div key={pp.id} className="flex items-center gap-3 px-1 py-2.5">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-100" />
                  ) : <div className="h-9 w-9 rounded-lg bg-slate-50 ring-1 ring-slate-100" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-800 truncate">{pp.produit?.nom_produit ?? "Produit"}</p>
                    <p className="text-[12.5px] text-slate-400">Prix promo : {formatMontant(pp.prix_promo)}</p>
                  </div>
                  {canManage && (
                    <button onClick={() => removeMutation.mutate(pp.produit_id)} className="text-slate-300 hover:text-[#C00000] transition-colors">
                      <X size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {canManage && (
          <div className="rounded-xl bg-slate-50 p-3 space-y-2.5">
            <select value={selectedProduit} onChange={(e) => setSelectedProduit(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1A2E5A] focus:outline-none">
              <option value="">Sélectionner un produit…</option>
              {(produitsList ?? []).filter((p: ProduitAdmin) => !produits.some((pp: PromotionProduitAdmin) => pp.produit_id === p.id)).map((p: ProduitAdmin) => (
                <option key={p.id} value={p.id}>{p.nom_produit} ({formatMontant(p.prix_unitaire)})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input type="number" min={0} placeholder="Prix promotionnel" value={prixPromo} onChange={(e) => setPrixPromo(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              <Button variant="secondary" onClick={() => addMutation.mutate()} loading={addMutation.isPending} disabled={!selectedProduit || !prixPromo}>
                Ajouter
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
