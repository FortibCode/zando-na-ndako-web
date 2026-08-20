"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { fetchPopularProductsFromApi } from '@/lib/api';
import type { Product } from './data';
import { ProductCard } from './ProductCard';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setIsLoading(true);
      fetchPopularProductsFromApi()
        .then((data) => setProducts(data))
        .finally(() => setIsLoading(false));
    };
    load();
    // Un produit modifié/ajouté/désactivé côté admin (ou vendeur) doit apparaître sans que le
    // visiteur ait besoin de recharger la page — même logique que Categories.tsx.
    const interval = setInterval(() => load({ silent: true }), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full h-full">
      <div className="flex flex-col justify-between h-full rounded-3xl border border-slate-200/60 bg-white p-5 sm:p-8 shadow-xs">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#c00000] icon-glow-red" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">Nos produits vedettes</h2>
          </div>
          <Link href="/produits" className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B2545] hover:underline">
            <span>Voir tout</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-auto">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
