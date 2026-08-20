"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

const ACCENT: Record<string, string> = {
  navy: "bg-linear-to-br from-[#26407a] to-[#101c38] shadow-[0_6px_16px_-4px_rgba(11,37,69,0.45)]",
  green: "bg-linear-to-br from-[#3d9a43] to-[#215c25] shadow-[0_6px_16px_-4px_rgba(46,125,50,0.45)]",
  gold: "bg-linear-to-br from-[#f7b83a] to-[#d4780a] shadow-[0_6px_16px_-4px_rgba(241,161,5,0.45)]",
  red: "bg-linear-to-br from-[#e01313] to-[#8f0000] shadow-[0_6px_16px_-4px_rgba(192,0,0,0.45)]",
};

export function KpiCard({
  icon: Icon,
  accent = "navy",
  label,
  value,
  evolutionPct,
}: {
  icon: LucideIcon;
  accent?: keyof typeof ACCENT;
  label: string;
  value: ReactNode;
  evolutionPct: number;
}) {
  const isFlat = evolutionPct === 0;
  const isUp = evolutionPct > 0;

  return (
    <div className="surface-card surface-card-interactive rounded-2xl p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white ${ACCENT[accent]}`}>
        <Icon size={19} strokeWidth={2.1} />
      </div>
      <p className="mt-3.5 text-[12.5px] font-bold text-slate-500 uppercase tracking-wide truncate">{label}</p>
      <p className="font-tnum text-2xl font-black text-slate-900 mt-1 tracking-tight truncate">{value}</p>
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-extrabold px-2 py-0.5 rounded-full ${
            isFlat ? "bg-slate-100 text-slate-500" : isUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}
        >
          {isFlat ? <Minus size={11} /> : isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {isUp ? `+${evolutionPct}` : evolutionPct}%
        </span>
        <span className="text-[12.5px] text-slate-400 font-medium truncate">vs période précédente</span>
      </div>
    </div>
  );
}
