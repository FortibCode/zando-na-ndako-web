"use client";

import { useState } from 'react';
import Link from 'next/link';


import { resolveMediaUrl } from '@/lib/api';
import { deriveTypeBoutiqueIcon } from '@/lib/typeBoutiqueIcon';

// Carte "type de boutique" (parcours boutique d'abord) — affiche le vrai logo envoyé par un admin
// (voir /admin/types-boutique) s'il existe ; sinon une icône de repli spécifique au type (jamais une
// image inventée), même logique que deriveStoreEmoji() côté mobile (client/(tabs)/categories.tsx).
export function CategoryCard({ type, logo, index = 0 }: { type: string; logo?: string | null; index?: number }) {
  const logoUrl = resolveMediaUrl(logo);
  const Icon = deriveTypeBoutiqueIcon(type);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link
      href={`/boutiques/${encodeURIComponent(type)}`}
      className="group relative flex shrink-0 snap-start flex-col items-center justify-between rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 text-center transition-all duration-300 hover:-translate-y-2.5 hover:shadow-2xl hover:border-[#0B2545]/20 w-full min-h-[175px] card-3d shine-effect cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#0B2545]/5 via-transparent to-[#c00000]/3 pointer-events-none" />

      <div className="relative mb-3.5 w-full">
        <div className="relative flex h-28 sm:h-32 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50 shadow-inner group-hover:shadow-md transition-shadow">
          {logoUrl && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <Icon className="h-10 w-10 text-[#0B2545]/70" />
          )}
        </div>
      </div>


      <span className="relative z-10 text-xs sm:text-sm font-black text-slate-800 leading-snug capitalize group-hover:text-[#0B2545] transition-colors duration-200 mt-1">
        {type}
      </span>

      <div className="mt-2.5 h-1 w-0 rounded-full bg-linear-to-r from-[#0B2545] to-[#c00000] transition-all duration-300 group-hover:w-12" />
    </Link>
  );
}
