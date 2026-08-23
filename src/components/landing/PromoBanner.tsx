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
    return <div className="h-[200px] rounded-3xl bg-slate-100 animate-pulse" />;
  }

  const promo = promoProduit?.promotions?.[0];
  const displayProduit = promoProduit || fallbackProduit;
  const image = resolveMediaUrl(displayProduit?.photo_produit) || FALLBACK_IMAGE;
  const href = promoProduit
    ? `/produit/${promoProduit.id}`
    : fallbackProduit
      ? `/boutique/${fallbackProduit.vendeur_id}`
      : '/categories';

  const badgeText = promoProduit && promo
    ? discountLabel(promo)
    : t('client.promoBanner.freshOffer', 'Offre fraîche');

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-black text-slate-900 tracking-wide uppercase flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#e01313] animate-ping" />
          {t('client.promoBanner.promoOfDayLabel', 'Promo du jour')}
        </p>
        <Link href="/promotions" className="text-xs font-extrabold text-[#0B2545] hover:underline flex items-center gap-1">
          {t('client.promoBanner.viewAllPromotions', 'Voir toutes les promotions')} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061830] via-[#0B2545] to-[#134074] p-6 sm:p-8 shadow-2xl shadow-[#0B2545]/30 border border-white/10">
        {/* Luminescences décoratives d'arrière-plan */}
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Bloc texte principal */}
          <div className="md:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e01313] to-[#ff5252] px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-500/30">
              <Tag className="h-3.5 w-3.5" />
              <span>{promoProduit ? t('client.promoBanner.offerNow', 'Offre du moment') : t('client.promoBanner.freshOffer', 'Offre fraîche')}</span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                {promoProduit?.nom_produit || t('client.promoBanner.defaultProductName', 'Poisson frais de saison')}
              </h3>
              <p className="mt-2 text-sm sm:text-base font-medium text-slate-200/90 max-w-xl">
                {promoProduit && promo
                  ? `${discountLabel(promo)} ${t('client.promoBanner.discountSuffix', 'sur ce produit en ce moment — profitez de la meilleure qualité au meilleur prix.')}`
                  : t('client.promoBanner.defaultDescription', 'Découvrez notre sélection de poissons frais du jour, pêchés et livrés rapidement chez vous.')}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={href}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e01313] to-[#c00000] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-xl shadow-red-600/30 transition-all hover:scale-105 hover:shadow-red-600/50 active:scale-95"
              >
                {t('client.promoBanner.discoverOffer', "Découvrir l'offre")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Bloc visuel image avec macaron flottant */}
          <div className="md:col-span-4 flex justify-center md:justify-end">
            <div className="relative group">
              {/* Badge promotionnel en surimpression */}
              <div className="absolute -top-3 -left-3 z-20 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1.5 text-xs font-black text-slate-900 shadow-xl shadow-amber-500/40 border border-white/40 transform -rotate-6 group-hover:rotate-0 transition-transform">
                ⚡ {badgeText}
              </div>

              {/* Conteneur de l'image */}
              <div className="relative h-36 w-36 sm:h-44 sm:w-44 md:h-48 md:w-48 overflow-hidden rounded-3xl border-2 border-white/20 bg-white/5 p-2 shadow-2xl backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                <img
                  src={image}
                  alt={displayProduit?.nom_produit || t('client.promoBanner.defaultProductName', 'Poisson frais')}
                  className="h-full w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
