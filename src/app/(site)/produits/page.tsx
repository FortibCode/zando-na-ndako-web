"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PackageSearch, Search } from 'lucide-react';
import { fetchProduits, produitToDisplayProduct, type Produit } from '@/lib/api';
import { ProductCard } from '@/components/landing/ProductCard';

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogPageInner />
    </Suspense>
  );
}

function CatalogPageInner() {
  const searchParams = useSearchParams();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    fetchProduits()
      .then(setProduits)
      .catch(() => setProduits([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return produits;
    return produits.filter((p) => p.nom_produit.toLowerCase().includes(q));
  }, [produits, query]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Tous nos produits</h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? 'Chargement…' : `${filtered.length} produit${filtered.length > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit…"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0B2545]"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PackageSearch className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">Aucun produit trouvé</p>
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
