"use client";

import { Phone, Sparkles, Truck, X } from 'lucide-react';
import { useState } from 'react';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-linear-to-r from-[#0B2545] via-[#101c38] to-[#c00000] text-white text-xs font-semibold py-2 px-4 relative z-50 shadow-xs">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        {/* Left promo info */}
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap mx-auto sm:mx-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-black text-amber-300 uppercase tracking-wider">
            <Sparkles className="h-3 w-3 animate-spin-slow" /> Offre Spéciale
          </span>
          <span className="text-slate-100 font-bold text-[11px] sm:text-xs">
            Livraison gratuite à Brazzaville dès 15 000 FCFA avec le code <strong className="text-amber-300 font-black">ZANDO2024</strong>
          </span>
        </div>

        {/* Right contact info */}
        <div className="hidden sm:flex items-center gap-4 shrink-0 text-[11px]">
          <a
            href="tel:+242066454321"
            className="flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
          >
            <Phone className="h-3 w-3 text-amber-400" />
            <span>Support : <strong>+242 06 645 4321</strong></span>
          </a>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-300 hover:text-white p-0.5 transition-colors"
            aria-label="Fermer la barre d'annonce"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
