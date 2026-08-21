"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PackageSearch, Search } from 'lucide-react';
import { fetchProduits, produitToDisplayProduct, type Produit } from '@/lib/api';
import { ProductCard } from '@/components/landing/ProductCard';
import { useLanguage } from '@/lib/language-context';

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogPageInner />
    </Suspense>
  );
}

function CatalogPageInner() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [priceMax, setPriceMax] = useState<number>(50000);

  useEffect(() => {
    fetchProduits()
      .then(setProduits)
      .catch(() => setProduits([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = produits;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => p.nom_produit.toLowerCase().includes(q));
    }
    return list.filter((p) => {
      const price = typeof p.prix_unitaire === 'number' ? p.prix_unitaire : parseFloat(p.prix_unitaire);
      return price <= priceMax;
    });
  }, [produits, query, priceMax]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{t('client.produits.title', 'Tous nos produits')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {loading ? t('client.common.loading', 'Chargement…') : `${filtered.length} ${t('client.categoriesPage.productSuffix', 'produit')}${filtered.length > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Filtre Prix Max */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 shadow-xs">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Prix max:</span>
            <input
              type="range"
              min={1000}
              max={50000}
              step={1000}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-24 accent-[#0B2545] cursor-pointer"
            />
            <span className="text-xs font-black text-[#0B2545] dark:text-amber-400 min-w-[70px]">
              {priceMax.toLocaleString('fr-FR')} FCFA
            </span>
          </div>

          {/* Recherche */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('client.produits.searchPlaceholder', 'Rechercher un produit…')}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#0B2545]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PackageSearch className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('client.produits.emptyTitle', 'Aucun produit trouvé')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={produitToDisplayProduct(p)} />
          ))}
        </div>
      )}
    </main>
  );
}
