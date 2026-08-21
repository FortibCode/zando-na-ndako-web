"use client";

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquareQuote, Quote, Star } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { fetchAvisPublics, resolveMediaUrl, type AvisPublic } from '@/lib/api';

const AVATAR_COLORS = ['bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'];

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
}

export function Testimonials() {
  const { t } = useLanguage();
  const [avis, setAvis] = useState<AvisPublic[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchAvisPublics().then(setAvis).catch(() => setAvis([]));
  }, []);

  // Auto-slide effect every 4.5 seconds
  useEffect(() => {
    if (isPaused || !avis || avis.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % avis.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, avis]);

  const hasAvis = !!avis && avis.length > 0;
  const current = hasAvis ? avis![activeIndex] : null;
  const photoUrl = current ? resolveMediaUrl(current.client.photo) : null;

  const handleNext = () => hasAvis && setActiveIndex((prev) => (prev + 1) % avis!.length);
  const handlePrev = () => hasAvis && setActiveIndex((prev) => (prev - 1 + avis!.length) % avis!.length);

  return (
    <section id="testimonials" className="w-full h-full">
      <div
        className="flex flex-col justify-between h-full rounded-3xl border border-slate-200/60 bg-white p-5 sm:p-7 shadow-xs relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5 text-[#0B2545]" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900">{t('client.testimonials.title', 'Ce que disent nos clients')}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t('client.testimonials.subtitle', "Avis vérifiés d'utilisateurs au Congo.")}</p>
          </div>

          {/* Navigation Controls */}
          {hasAvis && avis!.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-[#0B2545] hover:text-white hover:border-[#0B2545] transition-all cursor-pointer"
                aria-label={t('client.testimonials.prevAria', 'Témoignage précédent')}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-[#0B2545] hover:text-white hover:border-[#0B2545] transition-all cursor-pointer"
                aria-label={t('client.testimonials.nextAria', 'Témoignage suivant')}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Display Card */}
        <div className="relative my-auto py-2">
          {current ? (
            <div
              key={current.id}
              className="animate-scale-in flex flex-col justify-between rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 via-white to-amber-50/20 p-5 shadow-xs transition-all duration-500 min-h-[190px]"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-amber-500/20" />

              <div>
                {/* Star Rating — reflète la vraie note laissée, jamais figée à 5 */}
                <div className="mb-3 flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(current.note) ? 'fill-amber-400 text-amber-400 icon-glow-gold' : 'text-slate-200'}`} />
                  ))}
                </div>

                {/* Comment */}
                <p className="mb-4 text-xs sm:text-sm leading-relaxed font-semibold text-slate-800 italic">
                  &ldquo;{current.commentaire}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt={current.client.nom}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-[#0B2545]/20 shadow-xs"
                  />
                ) : (
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-black ring-2 ring-[#0B2545]/20 ${AVATAR_COLORS[activeIndex % AVATAR_COLORS.length]}`}>
                    {initials(current.client.nom)}
                  </div>
                )}
                <div className="leading-tight">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">{current.client.nom}</h4>
                  {current.client.ville && <p className="text-[11px] font-extrabold text-[#0B2545]">{current.client.ville}</p>}
                </div>
              </div>
            </div>
          ) : (
            // Aucun faux témoignage de repli : tant qu'aucun client n'a laissé de vrai avis commenté,
            // on l'annonce honnêtement plutôt que d'inventer un avis (même esprit que les autres
            // écrans "avis" de l'app).
            <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5 min-h-[190px]">
              <MessageSquareQuote className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs sm:text-sm font-bold text-slate-500">{t('client.testimonials.emptyTitle', 'Pas encore de témoignage')}</p>
              <p className="text-[11px] text-slate-400 mt-1">{t('client.testimonials.emptyDesc', 'Les avis laissés par nos clients apparaîtront bientôt ici.')}</p>
            </div>
          )}
        </div>

        {/* Dynamic Indicator Dots */}
        {hasAvis && avis!.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {avis!.map((a, idx) => (
              <button
                key={a.id}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeIndex
                    ? 'w-7 bg-[#0B2545]'
                    : 'w-2 bg-slate-200 hover:bg-slate-400'
                }`}
                aria-label={`${t('client.testimonials.dotAriaPrefix', 'Aller au témoignage')} ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
