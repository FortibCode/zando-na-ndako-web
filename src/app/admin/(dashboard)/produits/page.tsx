"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Package, Eye, EyeOff, Pencil, Trash2, ImageOff, Camera } from "lucide-react";
import { api, ApiError, resolveMediaUrl } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, ProduitAdmin, ProduitsAdminData, Categorie, TypeFraicheur } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { EtatStockBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatMontant } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, HeaderStat } from "@/components/AdminTable";

const ETATS = [
  { value: "", label: "Tous les états" },
  { value: "disponible", label: "Disponible" },
  { value: "stock_faible", label: "Stock faible" },
  { value: "rupture", label: "Rupture" },
];

export default function ProduitsPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canEdit = usePermission("edit_produits");
  const canDelete = usePermission("delete_produits");

  const [page, setPage] = useState(1);
  const [categorieId, setCategorieId] = useState("");
  const [etatStock, setEtatStock] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editTarget, setEditTarget] = useState<ProduitAdmin | null>(null);
  const [editForm, setEditForm] = useState({
    nom_produit: "", description: "", prix_unitaire: "", categorie_id: "", quantite_stock: "",
    unite_mesure: "", type_fraicheur: "frais" as TypeFraicheur,
  });
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProduitAdmin | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["categories-public"],
    queryFn: async () => (await api.get<ApiEnvelope<Categorie[]>>("/categories")).data,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-produits", page, categorieId, etatStock, search],
    queryFn: async () => {
      const qs = buildQuery({ page, categorie_id: categorieId, etat_stock: etatStock, search });
      const res = await api.get<ApiEnvelope<ProduitsAdminData>>(`/admin/produits${qs}`);
      return res.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "activer" | "desactiver" }) => api.post(`/admin/produits/${id}/${action}`),
    onSuccess: () => {
      notify("Statut du produit mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["admin-produits"] });
    },
    onError: (err) => notifyError(err, "Impossible de changer le statut de ce produit."),
  });

  const editMutation = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append("nom_produit", editForm.nom_produit);
      form.append("description", editForm.description || "");
      form.append("prix_unitaire", editForm.prix_unitaire);
      form.append("categorie_id", editForm.categorie_id);
      form.append("quantite_stock", editForm.quantite_stock);
      form.append("unite_mesure", editForm.unite_mesure);
      form.append("type_fraicheur", editForm.type_fraicheur);
      if (editPhotoFile) form.append("photo", editPhotoFile);
      return api.put(`/admin/produits/${editTarget!.id}`, form);
    },
    onSuccess: () => {
      notify("Produit mis à jour.");
      setEditTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-produits"] });
    },
    onError: (err) => notifyError(err, "Impossible de mettre à jour ce produit."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/produits/${id}`),
    onSuccess: () => {
      notify("Produit supprimé.");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-produits"] });
    },
    onError: (err) => notifyError(err, "Impossible de supprimer ce produit."),
  });

  function openEdit(p: ProduitAdmin) {
    setEditForm({
      nom_produit: p.nom_produit,
      description: p.description ?? "",
      prix_unitaire: String(p.prix_unitaire),
      categorie_id: p.categorie_id,
      quantite_stock: String(p.quantite_stock),
      unite_mesure: p.unite_mesure,
      type_fraicheur: p.type_fraicheur ?? "frais",
    });
    setEditPhotoFile(null);
    setEditPhotoPreview(resolveMediaUrl(p.photo_produit));
    setEditTarget(p);
  }

  function onPickEditPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditPhotoFile(file);
    setEditPhotoPreview(URL.createObjectURL(file));
  }

  const items = data?.data ?? [];
  const categoryOptions = [{ value: "", label: "Toutes les catégories" }, ...(categories ?? []).map((c) => ({ value: c.id, label: c.nom_categorie }))];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Produits"
        description="Catalogue produits de l'ensemble des vendeurs de la plateforme."
        icon={Package}
        action={
          <div className="flex items-center gap-2">
            <HeaderStat icon={Package} label={`${data?.total ?? "—"} produits`} tone="navy" />
            {data && data.counts.rupture + data.counts.stock_faible > 0 && (
              <HeaderStat icon={Package} label={`${data.counts.rupture + data.counts.stock_faible} à surveiller`} tone="gold" />
            )}
          </div>
        }
      />

      <FilterBar>
        <FilterSelect value={categorieId} onChange={(v) => { setPage(1); setCategorieId(v); }} options={categoryOptions} />
        <FilterSelect value={etatStock} onChange={(v) => { setPage(1); setEtatStock(v); }} options={ETATS} />
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}
          className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nom du produit…"
              className="w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm font-bold text-slate-700 placeholder-slate-400 focus:border-[#1A2E5A] focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-xl bg-[#1A2E5A] px-4 py-2.5 text-sm font-black text-white hover:bg-[#0B1A35] transition-colors">
            Rechercher
          </button>
        </form>
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les produits."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["Produit", "Vendeur", "Catégorie", "Prix", "Stock", "Statut", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucun produit trouvé."
        >
          {items.map((p) => {
            const img = resolveMediaUrl(p.photo_produit);
            return (
              <tr key={p.id} className="row-accent hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-100" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-300 ring-1 ring-slate-100">
                        <ImageOff size={16} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-800 truncate max-w-[220px]">{p.nom_produit}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.unite_mesure}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-bold text-slate-600">{p.vendeur?.nom_commerce ?? "—"}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-500">{p.categorie?.nom_categorie ?? "—"}</td>
                <td className="px-5 py-4 text-sm font-black text-slate-800">{formatMontant(p.prix_unitaire)}</td>
                <td className="px-5 py-4 text-sm font-bold text-slate-700">{p.quantite_stock} <span className="text-slate-400 font-medium">{p.unite_mesure}</span></td>
                <td className="px-5 py-4"><EtatStockBadge value={p.etat_stock} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    {canEdit && <IconAction icon={Pencil} label="Modifier" onClick={() => openEdit(p)} variant="ghost" />}
                    {canEdit && (
                      p.statut_disponibilite === "disponible" ? (
                        <IconAction icon={EyeOff} label="Désactiver" onClick={() => toggleMutation.mutate({ id: p.id, action: "desactiver" })} variant="danger" />
                      ) : (
                        <IconAction icon={Eye} label="Activer" onClick={() => toggleMutation.mutate({ id: p.id, action: "activer" })} variant="success" />
                      )
                    )}
                    {canDelete && <IconAction icon={Trash2} label="Supprimer" onClick={() => setDeleteTarget(p)} variant="danger" />}
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {editTarget && (
        <Modal
          title="Modifier le produit"
          onClose={() => setEditTarget(null)}
          footer={<>
            <Button variant="ghost" onClick={() => setEditTarget(null)} disabled={editMutation.isPending}>Annuler</Button>
            <Button variant="secondary" onClick={() => editMutation.mutate()} loading={editMutation.isPending}>Enregistrer</Button>
          </>}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">Photo du produit</label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                  {editPhotoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={editPhotoPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff size={20} className="text-slate-300" />
                  )}
                </div>
                <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickEditPhoto} />
                <button type="button" onClick={() => editFileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-black text-slate-600 hover:border-[#1A2E5A] hover:text-[#1A2E5A] transition-colors">
                  <Camera size={15} />
                  {editPhotoPreview ? "Changer l'image" : "Ajouter une image"}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Nom du produit</label>
              <input value={editForm.nom_produit} onChange={(e) => setEditForm((f) => ({ ...f, nom_produit: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Description</label>
              <textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Prix unitaire (FCFA)</label>
                <input type="number" min={0} value={editForm.prix_unitaire} onChange={(e) => setEditForm((f) => ({ ...f, prix_unitaire: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Quantité en stock</label>
                <input type="number" min={0} value={editForm.quantite_stock} onChange={(e) => setEditForm((f) => ({ ...f, quantite_stock: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Unité de mesure</label>
                <input value={editForm.unite_mesure} onChange={(e) => setEditForm((f) => ({ ...f, unite_mesure: e.target.value }))}
                  placeholder="Ex : kg, pièce, litre"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Type de fraîcheur</label>
                <select value={editForm.type_fraicheur} onChange={(e) => setEditForm((f) => ({ ...f, type_fraicheur: e.target.value as TypeFraicheur }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none">
                  <option value="frais">Frais</option>
                  <option value="fume">Fumé</option>
                  <option value="congele">Congelé</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Catégorie</label>
              <select value={editForm.categorie_id} onChange={(e) => setEditForm((f) => ({ ...f, categorie_id: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none">
                {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.nom_categorie}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer ce produit"
          message={`Confirmez-vous la suppression définitive de « ${deleteTarget.nom_produit} » ? Cette action est irréversible.`}
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
