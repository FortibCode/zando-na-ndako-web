"use client";

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, PackageSearch, SlidersHorizontal } from 'lucide-react';
import { fetchCategoriesFromApi, fetchProduits, produitToDisplayProduct, type Produit } from '@/lib/api';
import { ProductCard } from '@/components/landing/ProductCard';
import { useLanguage } from '@/lib/language-context';

type Sort = 'pertinence' | 'prix_asc' | 'prix_desc';
type Availability = 'tous' | 'disponible' | 'rupture';

export default function CategoryPage({ params }: { params: Promise<{ nom: string }> }) {
  const { t } = useLanguage();
  const { nom } = use(params);
  const categoryName = decodeURIComponent(nom);

  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<Sort>('pertinence');
  const [availability, setAvailability] = useState<Availability>('tous');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Le backend filtre /produits?categorie= par categorie_id (UUID), pas par nom — il faut
    // d'abord résoudre l'id réel à partir du nom porté par l'URL.
    fetchCategoriesFromApi()
      .then((categories) => {
        const match = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
        if (!match) return [];
        return fetchProduits({ categorie: match.id });
      })
      .then((data) => { if (!cancelled) setProduits(data); })
      .catch(() => { if (!cancelled) setProduits([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [categoryName]);

  const filtered = useMemo(() => {
    let list = [...produits];
    if (availability !== 'tous') {
      list = list.filter((p) => p.statut_disponibilite === availability);
    }
    if (sort === 'prix_asc') list.sort((a, b) => Number(a.prix_unitaire) - Number(b.prix_unitaire));
    if (sort === 'prix_desc') list.sort((a, b) => Number(b.prix_unitaire) - Number(a.prix_unitaire));
    return list;
  }, [produits, sort, availability]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0B2545] transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> {t('client.categoryDetail.home', 'Accueil')}
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{categoryName}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? t('client.common.loading', 'Chargement…') : `${filtered.length} ${t('client.categoriesPage.productSuffix', 'produit')}${filtered.length > 1 ? 's' : ''} ${t('client.categoryDetail.productsAvailableSuffix', 'disponible')}${filtered.length > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value as Availability)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0B2545]"
          >
            <option value="tous">{t('client.categoryDetail.availabilityAll', 'Toute disponibilité')}</option>
            <option value="disponible">{t('client.categoryDetail.inStock', 'En stock')}</option>
            <option value="rupture">{t('client.categoryDetail.outOfStock', 'Rupture')}</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0B2545]"
          >
            <option value="pertinence">{t('client.categoryDetail.sortRelevance', 'Pertinence')}</option>
            <option value="prix_asc">{t('client.categoryDetail.sortPriceAsc', 'Prix croissant')}</option>
            <option value="prix_desc">{t('client.categoryDetail.sortPriceDesc', 'Prix décroissant')}</option>
          </select>
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
          <p className="text-sm font-bold text-slate-700">{t('client.categoryDetail.emptyTitle', 'Aucun produit dans cette catégorie pour le moment')}</p>
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
