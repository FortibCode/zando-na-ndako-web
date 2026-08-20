"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, MapPin } from 'lucide-react';
import { GroceryBasketIllustration } from '@/components/GroceryBasketIllustration';
import { DEFAULT_ZONES, type DeliveryZone } from '@/lib/api';
import { Benefits } from './Benefits';
import { ZoneModal } from './ZoneModal';

export function Hero() {
  const [selectedZone, setSelectedZone] = useState<DeliveryZone>(DEFAULT_ZONES[0]);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/60 via-white to-white pt-8 pb-16 lg:pt-12 lg:pb-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="space-y-6 text-center lg:col-span-6 lg:text-left">
          <button
            onClick={() => setIsZoneModalOpen(true)}
            className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-100/90 px-4 py-1.5 text-xs font-bold text-slate-800 transition-all hover:bg-slate-200/80 hover:scale-102 cursor-pointer shadow-xs"
          >
            <MapPin className="h-3.5 w-3.5 text-[#0B2545]" />
            <span>Livraison à <strong className="text-[#0B2545] font-black">{selectedZone.name}</strong></span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <h1 className="animate-fade-in text-4xl leading-[1.1] font-black tracking-tight sm:text-5xl lg:text-6xl" style={{ animationDelay: '80ms' }}>
            <span className="block text-[#0B2545]">Le marché</span>
            <span className="mt-1 block text-[#D32F2F]">vient chez vous</span>
          </h1>

          <p className="animate-fade-in mx-auto max-w-lg text-sm leading-relaxed font-medium text-slate-600 sm:text-base lg:mx-0 lg:text-lg" style={{ animationDelay: '140ms' }}>
            Vos produits frais et essentiels, livrés chez vous en toute simplicité et en un temps record.
          </p>

          <div className="animate-fade-in flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row lg:justify-start" style={{ animationDelay: '200ms' }}>
            <Link
              href="/produits"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0B2545] px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#0B2545]/20 transition-all hover:bg-[#061830] active:scale-95 sm:w-auto"
            >
              <span>Commander maintenant</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/auth/register"
              className="flex w-full items-center justify-center rounded-full border-2 border-[#0B2545] bg-white px-8 py-3.5 text-sm font-extrabold text-[#0B2545] transition-all hover:bg-slate-50 active:scale-95 sm:w-auto"
            >
              Créer un compte
            </Link>
          </div>

          <Benefits />
        </div>

        <div className="flex justify-center lg:col-span-6 lg:justify-end">
          <GroceryBasketIllustration />
        </div>
      </div>

      {/* Delivery Zone Selection Modal */}
      <ZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        selectedZone={selectedZone}
        onSelectZone={setSelectedZone}
      />
    </section>
  );
}
