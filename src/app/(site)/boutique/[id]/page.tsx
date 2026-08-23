"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Clock, MapPin, PackageSearch, SlidersHorizontal, Star, Store } from "lucide-react";
import { fetchProduitsBoutique, fetchVendeurDetail, produitToDisplayProduct, resolveMediaUrl, type ApiVendeur, type Produit } from "@/lib/api";
import { ProductCard } from "@/components/landing/ProductCard";
import { useLanguage } from "@/lib/language-context";

type Sort = "pertinence" | "prix_asc" | "prix_desc";
type Availability = "tous" | "disponible" | "rupture";

export default function BoutiqueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLanguage();

  const [vendeur, setVendeur] = useState<ApiVendeur | null>(null);
  const [loadingVendeur, setLoadingVendeur] = useState(true);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loadingProduits, setLoadingProduits] = useState(true);

  const [categorie, setCategorie] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("pertinence");
  const [availability, setAvailability] = useState<Availability>("tous");

  useEffect(() => {
    setLoadingVendeur(true);
    fetchVendeurDetail(id).then(setVendeur).catch(() => setVendeur(null)).finally(() => setLoadingVendeur(false));

    setLoadingProduits(true);
    fetchProduitsBoutique(id).then(setProduits).catch(() => setProduits([])).finally(() => setLoadingProduits(false));
  }, [id]);

  // Catégories produit disponibles DANS cette boutique — filtre local, comme les sections d'un
  // menu de restaurant plutôt qu'un axe de navigation global (voir mobile/src/app/client/boutique/[id].tsx).
  const categories = useMemo(
    () => Array.from(new Set(produits.map((p) => p.categorie?.nom_categorie).filter((c): c is string => !!c))),
    [produits]
  );

  const filtered = useMemo(() => {
    let list = [...produits];
    if (categorie !== "all") list = list.filter((p) => p.categorie?.nom_categorie === categorie);
    if (availability !== "tous") list = list.filter((p) => p.statut_disponibilite === availability);
    if (sort === "prix_asc") list.sort((a, b) => Number(a.prix_unitaire) - Number(b.prix_unitaire));
    if (sort === "prix_desc") list.sort((a, b) => Number(b.prix_unitaire) - Number(a.prix_unitaire));
    return list;
  }, [produits, categorie, availability, sort]);

  const isClosed = vendeur?.statut_boutique === "fermee";
  const isPaused = vendeur?.statut_boutique === "pause";
  const vendeurImage = vendeur ? resolveMediaUrl(vendeur.photo_boutique) : undefined;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0B2545] transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("client.categoryDetail.home", "Accueil")}
      </Link>

      {loadingVendeur ? (
        <div className="h-32 rounded-3xl bg-slate-100 animate-pulse mb-6" />
      ) : !vendeur ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Store className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">{t("boutique.notFound", "Boutique introuvable")}</p>
        </div>
      ) : (
        <>
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs mb-4">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                {vendeurImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vendeurImage} alt={vendeur.nom_commerce} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300"><Store className="h-8 w-8" /></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate">{vendeur.nom_commerce}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-600">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {vendeur.note_moyenne > 0 ? vendeur.note_moyenne.toFixed(1) : t("boutique.noRating", "Pas encore noté")}
                  </span>
                  {vendeur.ville && (
                    <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={13} /> {vendeur.ville}</span>
                  )}
                  {vendeur.horaires_ouverture && (
                    <span className="flex items-center gap-1 text-xs text-slate-500"><Clock size={13} /> {vendeur.horaires_ouverture}</span>
                  )}
                </div>
                {vendeur.message_boutique && <p className="text-xs text-slate-500 mt-2">{vendeur.message_boutique}</p>}
              </div>
            </div>
          </div>

          {(isClosed || isPaused) && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50/70 p-4">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-700">
                {isClosed
                  ? t("boutique.closedBanner", "Cette boutique est fermée pour le moment.")
                  : t("boutique.pausedBanner", "Cette boutique ne prend pas de nouvelles commandes pour le moment.")}
              </p>
            </div>
          )}
        </>
      )}

      {vendeur && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategorie("all")}
                className={`h-9 rounded-full px-4 text-xs font-bold border transition-colors cursor-pointer ${categorie === "all" ? "bg-[#0B2545] border-[#0B2545] text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                {t("client.categoryDetail.availabilityAll", "Tous")}
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategorie(c)}
                  className={`h-9 rounded-full px-4 text-xs font-bold border transition-colors cursor-pointer ${categorie === c ? "bg-[#0B2545] border-[#0B2545] text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as Availability)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0B2545]"
              >
                <option value="tous">{t("client.categoryDetail.availabilityAll", "Toute disponibilité")}</option>
                <option value="disponible">{t("client.categoryDetail.inStock", "En stock")}</option>
                <option value="rupture">{t("client.categoryDetail.outOfStock", "Rupture")}</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0B2545]"
              >
                <option value="pertinence">{t("client.categoryDetail.sortRelevance", "Pertinence")}</option>
                <option value="prix_asc">{t("client.categoryDetail.sortPriceAsc", "Prix croissant")}</option>
                <option value="prix_desc">{t("client.categoryDetail.sortPriceDesc", "Prix décroissant")}</option>
              </select>
            </div>
          </div>

          {loadingProduits ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => <div key={i} className="h-72 rounded-3xl bg-slate-100 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <PackageSearch className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">
                {produits.length === 0
                  ? t("boutique.emptyDesc", "Cette boutique n'a pas encore ajouté de produits.")
                  : t("catalogFilter.emptyDesc", "Essayez de modifier vos filtres.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={produitToDisplayProduct(p)} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
