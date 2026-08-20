"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';
import { discountLabel, fetchProduits, fetchProduitsPromotions, resolveMediaUrl, type Produit } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80';

// Bandeau « Promo du jour » — équivalent web de mobile/src/app/client/(tabs)/index.tsx (section
// Promo Banner, ~L116-156). Contrairement à une première version de ce composant, le bandeau
// s'affiche TOUJOURS, comme sur mobile : s'il n'y a aucune promotion active (GET
// /produits/promotions vide), mobile ne masque rien — il retombe sur un produit générique
// (le premier produit "Poissons & Viandes" du catalogue, sinon le tout premier produit) avec un
// texte générique ("Poisson frais" / "Découvrez notre sélection de poissons frais du jour").
export function PromoBanner() {
  const { t } = useLanguage();
  const [promoProduit, setPromoProduit] = useState<Produit | null>(null);
  const [fallbackProduit, setFallbackProduit] = useState<Produit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProduitsPromotions().then((data) => data.find((p) => p.promotions && p.promotions.length > 0) || null),
      fetchProduits().then((data) => data.find((p) => p.categorie?.nom_categorie === 'Poissons & Viandes') || data[0] || null),
    ])
      .then(([promo, fallback]) => { setPromoProduit(promo); setFallbackProduit(fallback); })
      .catch(() => { setPromoProduit(null); setFallbackProduit(null); })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="h-[168px] sm:h-[152px] rounded-3xl bg-slate-100 animate-pulse" />;
  }

  const promo = promoProduit?.promotions?.[0];
  const displayProduit = promoProduit || fallbackProduit;
  const image = resolveMediaUrl(displayProduit?.photo_produit) || FALLBACK_IMAGE;
  const href = promoProduit
    ? `/produit/${promoProduit.id}`
    : fallbackProduit
      ? `/categorie/${encodeURIComponent(fallbackProduit.categorie?.nom_categorie || '')}`
      : '/produits';

  return (
    <section>
      <p className="mb-3 text-sm font-black text-slate-900">{t('client.promoBanner.promoOfDayLabel', 'Promo du jour')}</p>
      <div className="relative overflow-hidden rounded-3xl bg-[#0B2545] p-5 sm:p-7 shadow-lg shadow-[#0B2545]/20">
        <div className="relative z-10 flex items-center gap-4 sm:gap-6">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
              <Tag className="h-3 w-3" /> {promoProduit ? t('client.promoBanner.offerNow', 'Offre du moment') : t('client.promoBanner.freshOffer', 'Offre fraîche')}
            </span>
            <h3 className="mt-3 truncate text-lg sm:text-xl font-black text-white">{promoProduit?.nom_produit || t('client.promoBanner.defaultProductName', 'Poisson frais')}</h3>
            <p className="mt-1 text-xs sm:text-sm font-bold text-white/70">
              {promoProduit && promo ? `${discountLabel(promo)} ${t('client.promoBanner.discountSuffix', 'sur ce produit en ce moment')}` : t('client.promoBanner.defaultDescription', 'Découvrez notre sélection de poissons frais du jour')}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href={href}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#e01313] px-4 py-2 text-xs font-black text-white transition-colors hover:bg-[#c00000]"
              >
                {t('client.promoBanner.discoverOffer', "Découvrir l'offre")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/promotions" className="text-xs font-extrabold text-white/70 transition-colors hover:text-white hover:underline">
                {t('client.promoBanner.viewAllPromotions', 'Voir toutes les promotions')}
              </Link>
            </div>
          </div>
          <div className="hidden h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white/10 shadow-xl sm:block sm:h-28 sm:w-28">
            <img src={image} alt={displayProduit?.nom_produit || t('client.promoBanner.defaultProductName', 'Poisson frais')} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
