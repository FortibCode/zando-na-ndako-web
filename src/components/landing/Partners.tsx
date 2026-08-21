"use client";

import { useEffect, useState } from 'react';
import { BadgeCheck, Star, Store } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { fetchTopVendeurs, resolveMediaUrl, type TopVendeur } from '@/lib/api';

export function Partners() {
  const { t } = useLanguage();
  const [vendeurs, setVendeurs] = useState<TopVendeur[] | null>(null);

  useEffect(() => {
    fetchTopVendeurs().then(setVendeurs).catch(() => setVendeurs([]));
  }, []);

  // Pas de partenaire inventé : tant qu'aucun vendeur n'a de note réelle, la section ne s'affiche
  // simplement pas — cette rangée est seule sur sa ligne (pas de disposition en grille à préserver).
  if (!vendeurs || vendeurs.length === 0) return null;

  return (
    <section id="partners" className="w-full">
      <div className="rounded-3xl border border-slate-200/60 bg-white p-5 sm:p-7 shadow-xs">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-[#0B2545]" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900">{t('client.partners.title', 'Nos partenaires & vendeurs de confiance')}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t('client.partners.subtitle', 'Les meilleurs marchés et producteurs locaux livrés chez vous.')}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/60 shadow-xs self-start sm:self-auto hover:scale-105 transition-transform cursor-pointer">
            <BadgeCheck className="h-4 w-4 text-emerald-600 icon-glow-green" /> {t('client.partners.verifiedBadge', '100% Vendeurs vérifiés')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vendeurs.map((vendeur, idx) => {
            const image = resolveMediaUrl(vendeur.photo_boutique);
            return (
              <div
                key={vendeur.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-300 card-3d shine-effect hover:bg-white hover:border-slate-200 hover:shadow-xl cursor-pointer"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative mb-3 h-32 w-full overflow-hidden rounded-xl bg-slate-100">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={vendeur.nom_commerce}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <Store className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-slate-900 shadow-sm border border-white/60">
                    <Star size={10} className="fill-amber-400 text-amber-400" /> {vendeur.note_moyenne.toFixed(1)}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black text-slate-900 group-hover:text-[#0B2545] transition-colors">{vendeur.nom_commerce}</h3>
                    <BadgeCheck className="h-4 w-4 text-[#0B2545] shrink-0" />
                  </div>
                  <p className="text-[11px] font-bold text-[#0B2545] mt-0.5">{vendeur.categorie_principale}</p>
                  {vendeur.ville && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{vendeur.ville}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
