"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { fetchProduits, produitToDisplayProduct, type Produit } from "@/lib/api";
import { useFavorites } from "@/lib/favorites";
import { ProductCard } from "@/components/landing/ProductCard";
import { useLanguage } from "@/lib/language-context";

export default function FavoritesPage() {
  const { t } = useLanguage();
  const { favorites } = useFavorites();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduits().then(setProduits).catch(() => setProduits([])).finally(() => setLoading(false));
  }, []);

  const favoriteProducts = produits.filter((p) => favorites.includes(p.id));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <div className="flex items-center gap-2.5 mb-6">
        <Heart className="h-6 w-6 text-[#c00000] fill-current" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t('client.favoris.title', 'Mes favoris')}</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-72 rounded-3xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">{t('client.favoris.emptyMessage', "Vous n'avez pas encore de favoris")}</p>
          <Link href="/produits" className="mt-4 text-xs font-extrabold text-[#0B2545] hover:underline">{t('client.favoris.discoverCatalog', 'Découvrir le catalogue')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {favoriteProducts.map((p) => (
            <ProductCard key={p.id} product={produitToDisplayProduct(p)} />
          ))}
        </div>
      )}
    </main>
  );
}
