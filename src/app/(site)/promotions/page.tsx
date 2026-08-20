"use client";

import { useEffect, useState } from 'react';
import { Percent } from 'lucide-react';
import { discountLabel, fetchProduitsPromotions, produitToDisplayProduct, type Produit } from '@/lib/api';
import { ProductCard } from '@/components/landing/ProductCard';
import { useLanguage } from '@/lib/language-context';

// Équivalent web de mobile/src/app/client/promo.tsx : liste tous les produits ayant une
// promotion active, avec le badge de réduction. Réutilise le même ProductCard que le catalogue
// (/produits) — seul un badge de réduction est superposé par-dessus.
export default function PromotionsPage() {
  const { t } = useLanguage();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduitsPromotions()
      .then(setProduits)
      .catch(() => setProduits([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t('client.promotions.title', 'Promotions')}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {loading ? t('client.promotions.loading', 'Chargement…') : t('client.promotions.subtitle', 'Offres en cours chez nos vendeurs')}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : produits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Percent className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">{t('client.promotions.emptyTitle', 'Aucune promotion en cours')}</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {t('client.promotions.emptyDesc', "Revenez bientôt : les réductions mises en place par nos vendeurs s'affichent ici automatiquement.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {produits.map((p) => {
            const promo = p.promotions?.[0];
            return (
              <div key={p.id} className="relative">
                <ProductCard product={produitToDisplayProduct(p)} />
                {promo && (
                  <span className="absolute top-4 left-4 z-10 rounded-full bg-[#e01313] px-2.5 py-1 text-[10px] font-black text-white shadow-sm">
                    {discountLabel(promo)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
