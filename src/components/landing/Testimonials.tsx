"use client";

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquareQuote, Quote, Star } from 'lucide-react';
import { TESTIMONIALS } from './data';

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide effect every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[activeIndex];

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
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Ce que disent nos clients</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Avis vérifiés d&apos;utilisateurs au Congo.</p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-[#0B2545] hover:text-white hover:border-[#0B2545] transition-all cursor-pointer"
              aria-label="Témoignage précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-[#0B2545] hover:text-white hover:border-[#0B2545] transition-all cursor-pointer"
              aria-label="Témoignage suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Display Card */}
        <div className="relative my-auto py-2">
          <div
            key={current.id}
            className="animate-scale-in flex flex-col justify-between rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 via-white to-amber-50/20 p-5 shadow-xs transition-all duration-500 min-h-[190px]"
          >
            <Quote className="absolute top-4 right-4 h-8 w-8 text-amber-500/20" />

            <div>
              {/* Star Rating */}
              <div className="mb-3 flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 icon-glow-gold" />
                ))}
              </div>

              {/* Comment */}
              <p className="mb-4 text-xs sm:text-sm leading-relaxed font-semibold text-slate-800 italic">
                &ldquo;{current.comment}&rdquo;
              </p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <img
                src={current.avatar}
                alt={current.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-[#0B2545]/20 shadow-xs"
              />
              <div className="leading-tight">
                <h4 className="text-xs sm:text-sm font-black text-slate-900">{current.name}</h4>
                <p className="text-[11px] font-extrabold text-[#0B2545]">{current.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Indicator Dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {TESTIMONIALS.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIndex
                  ? 'w-7 bg-[#0B2545]'
                  : 'w-2 bg-slate-200 hover:bg-slate-400'
              }`}
              aria-label={`Aller au témoignage ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
