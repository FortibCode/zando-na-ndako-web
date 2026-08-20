"use client";

import { useEffect, useState } from 'react';
import { Check, Clock, MapPin, Search, Truck, X } from 'lucide-react';
import { DEFAULT_ZONES, fetchDeliveryZonesFromApi, type DeliveryZone } from '@/lib/api';

interface ZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedZone: DeliveryZone;
  onSelectZone: (zone: DeliveryZone) => void;
}

export function ZoneModal({ isOpen, onClose, selectedZone, onSelectZone }: ZoneModalProps) {
  const [zones, setZones] = useState<DeliveryZone[]>(DEFAULT_ZONES);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDeliveryZonesFromApi().then(setZones);
  }, []);

  if (!isOpen) return null;

  const filtered = zones.filter(
    (z) =>
      z.name.toLowerCase().includes(search.toLowerCase()) ||
      z.neighborhoods.some((n) => n.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl z-10 border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0B2545]/10 text-[#0B2545]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Zone de livraison</h2>
              <p className="text-xs text-slate-500">Choisissez votre commune ou secteur</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Fermer le modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une commune (Poto-Poto, Bacongo, Ouenzé...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#0B2545] focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Zone List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">Aucune zone trouvée pour « {search} ».</p>
          ) : (
            filtered.map((zone) => {
              const isSelected = selectedZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    onSelectZone(zone);
                    onClose();
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#0B2545] bg-[#0B2545]/5 ring-2 ring-[#0B2545]/20'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{zone.name}</span>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B2545] text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      <span className="font-semibold text-slate-700">Quartiers :</span> {zone.neighborhoods.join(', ')}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Truck className="h-3 w-3" /> {zone.fee}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="h-3 w-3" /> {zone.minTime}-{zone.maxTime} min
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
