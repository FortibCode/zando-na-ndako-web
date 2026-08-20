"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { ApiError, ajouterVendeurProduit, fetchCategoriesFromApi } from "@/lib/api";
import type { Category } from "@/components/landing/data";

const FRAICHEUR_OPTIONS = [
  { id: "frais", label: "Frais" },
  { id: "fume", label: "Fumé" },
  { id: "congele", label: "Congelé" },
] as const;

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [prix, setPrix] = useState("");
  const [unite, setUnite] = useState("");
  const [stock, setStock] = useState("");
  const [fraicheur, setFraicheur] = useState<"frais" | "fume" | "congele">("frais");
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoriesFromApi().then(setCategories);
  }, []);

  const isValid = nom.trim() && categorieId && Number(prix) > 0 && unite.trim() && stock !== "" && Number(stock) >= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    setError(null);
    try {
      const created = await ajouterVendeurProduit({
        nom_produit: nom.trim(),
        description: description.trim() || undefined,
        categorie_id: categorieId,
        prix_unitaire: Number(prix),
        unite_mesure: unite.trim(),
        quantite_stock: Number(stock),
        type_fraicheur: fraicheur,
        photo: photo || undefined,
      });
      router.push(`/vendeur/produits/${created.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'ajouter ce produit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <Link href="/vendeur/produits" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0B2545] transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Mes produits
      </Link>
      <PageHeader title="Ajouter un produit" description="Renseignez les informations de votre nouvel article." />

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0B2545] cursor-pointer transition-colors">
          <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
            {photo ? <img src={URL.createObjectURL(photo)} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-slate-400" />}
          </div>
          <div className="text-sm">
            <p className="font-bold text-slate-800">Photo du produit</p>
            <p className="text-xs text-slate-400">{photo ? photo.name : "JPEG, PNG ou WebP, 3 Mo max"}</p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        </label>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nom du produit</label>
          <input required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Banane Plantain (Makemba)"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:border-[#0B2545]" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie</label>
          <select required value={categorieId} onChange={(e) => setCategorieId(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0B2545]">
            <option value="">Sélectionner…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Prix unitaire (FCFA)</label>
            <input required type="number" min="0" value={prix} onChange={(e) => setPrix(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Unité de mesure</label>
            <input required value={unite} onChange={(e) => setUnite(e.target.value)} placeholder="Kg, Sachet, Régime…"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Stock initial</label>
            <input required type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Fraîcheur</label>
            <select value={fraicheur} onChange={(e) => setFraicheur(e.target.value as typeof fraicheur)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0B2545]">
              {FRAICHEUR_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <Button type="submit" variant="primary" disabled={!isValid || saving} className="w-full !py-3">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier le produit"}
        </Button>
      </form>
    </div>
  );
}
