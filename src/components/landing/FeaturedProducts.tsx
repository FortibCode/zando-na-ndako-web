"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { fetchProduitsPage, produitToDisplayProduct, type Produit } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { Pagination } from '@/components/Pagination';
import { ProductCard } from './ProductCard';

const PER_PAGE = 5;

export function FeaturedProducts() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Produit[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState<number | null>(null);
  const [to, setTo] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPage = useCallback((pageNum: number, opts?: { silent?: boolean }) => {
    if (!opts?.silent) setIsLoading(true);
    return fetchProduitsPage(pageNum, PER_PAGE)
      .then((result) => {
        setProducts(result.items);
        setPage(result.currentPage);
        setLastPage(result.lastPage);
        setTotal(result.total);
        setFrom(result.from);
        setTo(result.to);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadPage(1);
    // Un produit modifié/ajouté/désactivé côté admin (ou vendeur) doit apparaître sans que le
    // visiteur ait besoin de recharger la page — même logique que Categories.tsx. Ne recharge en
    // silence que la page actuellement affichée, pour ne pas faire sauter le visiteur ailleurs
    // dans la pagination pendant qu'il consulte le catalogue.
    const interval = setInterval(() => {
      setPage((current) => {
        loadPage(current, { silent: true });
        return current;
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, [loadPage]);

  return (
    <section className="w-full h-full">
      <div className="flex flex-col justify-between h-full rounded-3xl border border-slate-200/60 bg-white p-5 sm:p-8 shadow-xs">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#c00000] icon-glow-red" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">{t('client.featuredProducts.title', 'Tous nos produits')}</h2>
          </div>
          <Link href="/categories" className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B2545] hover:underline">
            <span>{t('client.featuredProducts.viewAll', 'Voir tout')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5 my-auto">
            {[...Array(PER_PAGE)].map((_, i) => (
              <div key={i} className="h-72 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-16">{t('client.featuredProducts.empty', 'Aucun produit publié pour le moment.')}</p>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5 my-auto">
              {products.map((p) => (
                <ProductCard key={p.id} product={produitToDisplayProduct(p)} />
              ))}
            </div>
            <Pagination currentPage={page} lastPage={lastPage} total={total} from={from} to={to} onChange={loadPage} />
          </>
        )}
      </div>
    </section>
  );
}
