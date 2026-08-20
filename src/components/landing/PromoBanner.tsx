"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';
import { discountLabel, fetchProduitsPromotions, resolveMediaUrl, type Produit } from '@/lib/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80';

// Bandeau « Promo du jour » — équivalent web de mobile/src/app/client/(tabs)/index.tsx (section
// Promo Banner, ~L116-156). Backé par la vraie promo active la plus récente (GET
// /produits/promotions) ; s'efface entièrement s'il n'y a aucune promotion en cours plutôt que
// d'inventer une fausse offre.
export function PromoBanner() {
  const [produit, setProduit] = useState<Produit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProduitsPromotions()
      .then((data) => setProduit(data[0] || null))
      .catch(() => setProduit(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="h-[168px] sm:h-[152px] rounded-3xl bg-slate-100 animate-pulse" />;
  }

  if (!produit) return null;

  const promo = produit.promotions?.[0];
  const image = resolveMediaUrl(produit.photo_produit) || FALLBACK_IMAGE;

  return (
    <section>
      <p className="mb-3 text-sm font-black text-slate-900">Promo du jour</p>
      <div className="relative overflow-hidden rounded-3xl bg-[#0B2545] p-5 sm:p-7 shadow-lg shadow-[#0B2545]/20">
        <div className="relative z-10 flex items-center gap-4 sm:gap-6">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
              <Tag className="h-3 w-3" /> Offre du moment
            </span>
            <h3 className="mt-3 truncate text-lg sm:text-xl font-black text-white">{produit.nom_produit}</h3>
            <p className="mt-1 text-xs sm:text-sm font-bold text-white/70">
              {promo ? `${discountLabel(promo)} sur ce produit en ce moment` : 'Découvrez notre sélection du jour'}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href={`/produit/${produit.id}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#e01313] px-4 py-2 text-xs font-black text-white transition-colors hover:bg-[#c00000]"
              >
                Découvrir l&apos;offre <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/promotions" className="text-xs font-extrabold text-white/70 transition-colors hover:text-white hover:underline">
                Voir toutes les promotions
              </Link>
            </div>
          </div>
          <div className="hidden h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white/10 shadow-xl sm:block sm:h-28 sm:w-28">
            <img src={image} alt={produit.nom_produit} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
