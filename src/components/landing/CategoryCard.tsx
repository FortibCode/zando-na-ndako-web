"use client";

import Link from 'next/link';
import type { Category } from './data';

export function CategoryCard({ category, index = 0 }: { category: Category; index?: number }) {
  return (
    <Link
      href={`/categorie/${encodeURIComponent(category.name)}`}
      className="group relative flex shrink-0 snap-start flex-col items-center justify-between rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 text-center transition-all duration-300 hover:-translate-y-2.5 hover:shadow-2xl hover:border-[#0B2545]/20 w-full min-h-[175px] card-3d shine-effect cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Background Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#0B2545]/5 via-transparent to-[#c00000]/3 pointer-events-none" />

      {/* Enlarged Image container with 3D depth */}
      <div className="relative mb-3.5 w-full">
        <div className="relative h-28 sm:h-32 w-full overflow-hidden rounded-2xl bg-slate-50 shadow-inner group-hover:shadow-md transition-shadow">
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Enlarged Category Name */}
      <span className="relative z-10 text-xs sm:text-sm font-black text-slate-800 leading-snug group-hover:text-[#0B2545] transition-colors duration-200 mt-1">
        {category.name}
      </span>

      {/* Bottom accent line */}
      <div className="mt-2.5 h-1 w-0 rounded-full bg-linear-to-r from-[#0B2545] to-[#c00000] transition-all duration-300 group-hover:w-12" />
    </Link>
  );
}
