"use client";

import { useState } from 'react';
import { Fish, Leaf, ShoppingCart, Smartphone, Sparkles, Sprout } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useToast } from '@/lib/toast-context';

const APP_CATEGORIES = [
  { id: 1, name: 'Légumes & Feuilles', icon: Leaf, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 2, name: 'Poissons & Viandes', icon: Fish, color: 'bg-red-50 text-red-800 border-red-200' },
  { id: 3, name: 'Tubercules', icon: Sprout, color: 'bg-amber-50 text-amber-800 border-amber-200' },
];

export function AppBanner() {
  const { notify } = useToast();
  const [activeCat, setActiveCat] = useState(0);

  return (
    <section className="w-full h-full perspective-800">
      <div className="relative flex flex-col justify-between h-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2545] via-[#101c38] to-[#1a2e5a] p-6 sm:p-8 text-white shadow-xl card-3d border border-white/10">
        {/* Ambient background glow circles */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#c00000]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#f1a105]/15 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 h-full relative z-10">
          <div className="space-y-4 text-center lg:col-span-7 lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-white/15">
              <Smartphone className="h-3.5 w-3.5" /> Application Mobile Officielle
            </span>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Téléchargez l&apos;application <br />
              <span className="gradient-text-gold">Zando na Ndako</span>
            </h2>

            <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-md">
              Faites vos courses au marché de Brazzaville depuis votre téléphone, où que vous soyez.
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 lg:justify-start">
              <button
                onClick={() => notify('Redirection vers Google Play Store…', 'info')}
                className="group flex items-center gap-2.5 rounded-2xl border border-slate-700/80 bg-black/60 px-4 py-2.5 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-black hover:scale-105 hover:border-amber-500/50 cursor-pointer"
              >
                <svg className="h-5 w-5 fill-current text-white transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a1.99 1.99 0 01-.61-1.428V3.242c0-.555.228-1.057.609-1.428zM15.206 13.414l2.584 2.584-12.87 7.43 10.286-10.014zM15.206 10.586L4.92 1.01l12.87 7.43-2.584 2.146zM19.344 11.23l2.842 1.64c.554.32.554 1.22 0 1.54l-2.842 1.64-2.138-2.14 2.138-2.68z"/>
                </svg>
                <div className="text-left leading-tight">
                  <p className="text-[8px] font-bold tracking-wider text-slate-400 uppercase">DISPONIBLE SUR</p>
                  <p className="text-xs font-black">Google Play</p>
                </div>
              </button>

              <button
                onClick={() => notify('Redirection vers Apple App Store…', 'info')}
                className="group flex items-center gap-2.5 rounded-2xl border border-slate-700/80 bg-black/60 px-4 py-2.5 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-black hover:scale-105 hover:border-amber-500/50 cursor-pointer"
              >
                <svg className="h-5 w-5 fill-current text-white transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.82c.66-.8 1.11-1.92.99-3.04-.96.04-2.13.64-2.82 1.44-.61.71-1.14 1.86-.99 2.97 1.07.08 2.16-.57 2.82-1.37z"/>
                </svg>
                <div className="text-left leading-tight">
                  <p className="text-[8px] font-bold tracking-wider text-slate-400 uppercase">Télécharger dans l&apos;</p>
                  <p className="text-xs font-black">App Store</p>
                </div>
              </button>
            </div>
          </div>

          {/* Interactive 3D Phone Mockup */}
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <div className="group/phone relative w-56 sm:w-64 rounded-[32px] border-4 border-slate-900 bg-white p-2.5 text-slate-800 shadow-2xl transition-transform duration-500 hover:-rotate-3 hover:scale-105 cursor-pointer">
              {/* Phone Notch */}
              <div className="mx-auto mb-2 h-3.5 w-20 rounded-b-xl bg-slate-900" />

              {/* Phone Screen App Interface */}
              <div className="space-y-2.5 p-1 text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <Logo size="sm" showSubtitle={false} />
                  <div className="relative p-1">
                    <ShoppingCart className="h-3.5 w-3.5 text-[#0B2545]" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#c00000] animate-ping" />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-extrabold text-[#0B2545]">
                  <span>Nos catégories</span>
                  <Sparkles className="h-3 w-3 text-amber-500" />
                </div>

                {/* Interactive Category Buttons inside Mockup */}
                <div className="grid grid-cols-3 gap-1">
                  {APP_CATEGORIES.map((cat, idx) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCat(idx)}
                      className={`rounded-lg p-1.5 text-center border transition-all ${cat.color} ${
                        activeCat === idx ? 'ring-2 ring-[#0B2545] scale-105 shadow-xs' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <cat.icon className="mx-auto h-3.5 w-3.5" />
                      <span className="mt-0.5 block text-[7px] font-bold leading-tight">{cat.name}</span>
                    </button>
                  ))}
                </div>

                {/* Simulated product preview inside phone */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 flex items-center gap-2 animate-scale-in">
                  <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                    {(() => { const ActiveIcon = APP_CATEGORIES[activeCat].icon; return <ActiveIcon className="h-4.5 w-4.5 text-amber-700" />; })()}
                  </div>
                  <div className="leading-tight">
                    <p className="text-[9px] font-black text-slate-900">{APP_CATEGORIES[activeCat].name}</p>
                    <p className="text-[8px] font-bold text-[#c00000]">Disponible à Brazzaville</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
