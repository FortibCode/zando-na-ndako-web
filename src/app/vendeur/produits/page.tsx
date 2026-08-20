"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { EtatStockBadge } from "@/components/Badge";
import { LoadingBlock, EmptyState } from "@/components/Spinner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { resolveMediaUrl, signalerVendeurRupture, supprimerVendeurProduit, fetchVendeurProduits, type Produit } from "@/lib/api";

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';

export default function VendeurProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Produit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchVendeurProduits().then(setProduits).catch(() => setProduits([])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await supprimerVendeurProduit(toDelete.id);
      setProduits((prev) => prev.filter((p) => p.id !== toDelete.id));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleRupture = async (id: string) => {
    setBusyId(id);
    try {
      await signalerVendeurRupture(id);
      setProduits((prev) => prev.map((p) => (p.id === id ? { ...p, statut_disponibilite: "rupture", quantite_stock: 0 } : p)));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Mes produits"
        description={loading ? undefined : `${produits.length} produit${produits.length > 1 ? "s" : ""}`}
        actions={
          <Link href="/vendeur/produits/nouveau">
            <Button variant="primary"><Plus className="h-4 w-4" /> Ajouter un produit</Button>
          </Link>
        }
      />

      {loading ? (
        <LoadingBlock label="Chargement de vos produits…" />
      ) : produits.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <Package className="h-12 w-12 text-slate-300 mb-3" />
          <EmptyState message="Vous n'avez pas encore de produit. Ajoutez-en un pour commencer à vendre." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {produits.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-sm transition-shadow">
              <div className="relative h-36 bg-slate-100">
                <img src={resolveMediaUrl(p.photo_produit) || FALLBACK_IMAGE} alt={p.nom_produit} className="h-full w-full object-cover" />
                <div className="absolute top-2 right-2"><EtatStockBadge value={p.statut_disponibilite} /></div>
              </div>
              <div className="p-4">
                <p className="text-sm font-black text-slate-900 truncate">{p.nom_produit}</p>
                <p className="text-xs text-slate-400 mt-0.5">{p.categorie?.nom_categorie || "Sans catégorie"}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-black text-[#c00000]">{Number(p.prix_unitaire).toLocaleString('fr-FR')} FCFA</span>
                  <span className="text-xs font-bold text-slate-500">Stock: {p.quantite_stock}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Link href={`/vendeur/produits/${p.id}`} className="flex-1">
                    <Button variant="ghost" className="w-full !py-2 !text-xs"><Pencil className="h-3.5 w-3.5" /> Modifier</Button>
                  </Link>
                  {p.statut_disponibilite !== "rupture" && (
                    <button
                      onClick={() => handleRupture(p.id)}
                      disabled={busyId === p.id}
                      className="flex items-center justify-center h-9 w-9 rounded-xl border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Signaler une rupture"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setToDelete(p)}
                    className="flex items-center justify-center h-9 w-9 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer ce produit ?"
          message={`« ${toDelete.nom_produit} » sera définitivement retiré de votre boutique.`}
          confirmLabel="Supprimer"
          danger
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
