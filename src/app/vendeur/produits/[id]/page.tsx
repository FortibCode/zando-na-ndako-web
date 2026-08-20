"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Loader2, PackagePlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { LoadingBlock } from "@/components/Spinner";
import {
  ApiError,
  fetchVendeurProduits,
  gererVendeurStock,
  modifierVendeurProduit,
  resolveMediaUrl,
  type Produit,
} from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLanguage();
  const FRAICHEUR_OPTIONS = [
    { id: "frais" as const, label: t("vendor.produitDetail.freshFrais", "Frais") },
    { id: "fume" as const, label: t("vendor.produitDetail.freshFume", "Fumé") },
    { id: "congele" as const, label: t("vendor.produitDetail.freshCongele", "Congelé") },
  ];
  const { id } = use(params);

  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [unite, setUnite] = useState("");
  const [fraicheur, setFraicheur] = useState<"frais" | "fume" | "congele">("frais");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [stockDelta, setStockDelta] = useState("");
  const [stockBusy, setStockBusy] = useState(false);

  useEffect(() => {
    // Pas de GET /vendeur/produits/{id} dédié côté backend — on retrouve le produit dans la liste.
    fetchVendeurProduits()
      .then((list) => {
        const found = list.find((p) => p.id === id) || null;
        setProduit(found);
        if (found) {
          setNom(found.nom_produit);
          setDescription(found.description || "");
          setPrix(String(found.prix_unitaire));
          setUnite(found.unite_mesure);
          setFraicheur(found.type_fraicheur || "frais");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingBlock label={t("vendor.produitDetail.loading", "Chargement du produit…")} />;
  if (!produit) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-bold text-slate-700">{t("vendor.produitDetail.notFound", "Produit introuvable.")}</p>
        <Link href="/vendeur/produits" className="inline-flex items-center gap-2 mt-4 text-xs font-extrabold text-[#0B2545] hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("vendor.produitDetail.backToProductsNotFound", "Retour à mes produits")}
        </Link>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await modifierVendeurProduit(id, {
        nom_produit: nom.trim(),
        description: description.trim(),
        prix_unitaire: Number(prix),
        unite_mesure: unite.trim(),
        type_fraicheur: fraicheur,
      });
      setProduit(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("vendor.produitDetail.saveError", "Impossible d'enregistrer les modifications."));
    } finally {
      setSaving(false);
    }
  };

  const handleStockAdd = async () => {
    const qty = Number(stockDelta);
    if (!qty || qty <= 0) return;
    setStockBusy(true);
    try {
      const nouveauStock = await gererVendeurStock(id, qty, "ajouter");
      setProduit((prev) => (prev ? { ...prev, quantite_stock: nouveauStock, statut_disponibilite: "disponible" } : prev));
      setStockDelta("");
    } finally {
      setStockBusy(false);
    }
  };

  return (
    <div className="max-w-xl">
      <Link href="/vendeur/produits" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0B2545] transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("vendor.produitDetail.backToProductsLink", "Mes produits")}
      </Link>
      <PageHeader title={t("vendor.produitDetail.title", "Modifier le produit")} />

      <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white mb-6">
        <img src={resolveMediaUrl(produit.photo_produit) || FALLBACK_IMAGE} alt="" className="h-16 w-16 rounded-xl object-cover shrink-0" />
        <div className="text-xs text-slate-500">
          <p className="font-bold text-slate-800">{produit.categorie?.nom_categorie || t("vendor.produits.noCategory", "Sans catégorie")}</p>
          <p className="flex items-center gap-1.5 mt-1"><Info className="h-3.5 w-3.5" /> {t("vendor.produitDetail.notModifiableNote", "Photo et catégorie non modifiables après création.")}</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-slate-200 bg-white mb-6">
        <p className="text-sm font-black text-slate-900 mb-3">{t("vendor.produitDetail.currentStockPrefix", "Stock actuel :")} {produit.quantite_stock}</p>
        <div className="flex gap-2">
          <input type="number" min="1" value={stockDelta} onChange={(e) => setStockDelta(e.target.value)} placeholder={t("vendor.produitDetail.stockAddPlaceholder", "Quantité à ajouter")}
            className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
          <Button type="button" variant="secondary" onClick={handleStockAdd} disabled={!stockDelta || stockBusy} className="!py-2">
            {stockBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />} {t("vendor.produitDetail.addBtn", "Ajouter")}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t("vendor.produitDetail.nameLabel", "Nom du produit")}</label>
          <input required value={nom} onChange={(e) => setNom(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t("vendor.produitDetail.descriptionLabel", "Description")}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:border-[#0B2545]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t("vendor.produitDetail.priceLabel", "Prix unitaire (FCFA)")}</label>
            <input required type="number" min="0" value={prix} onChange={(e) => setPrix(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t("vendor.produitDetail.unitLabel", "Unité de mesure")}</label>
            <input required value={unite} onChange={(e) => setUnite(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t("vendor.produitDetail.freshnessLabel", "Fraîcheur")}</label>
          <select value={fraicheur} onChange={(e) => setFraicheur(e.target.value as typeof fraicheur)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0B2545]">
            {FRAICHEUR_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>

        {error && <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <Button type="submit" variant="primary" disabled={saving} className="w-full !py-3">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? t("vendor.produitDetail.savedBtn", "Enregistré !") : t("vendor.produitDetail.saveBtn", "Enregistrer les modifications")}
        </Button>
      </form>
    </div>
  );
}
