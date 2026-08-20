"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import type { PeriodValue } from "@/lib/types";
import type { PeriodSelection } from "@/lib/useDashboardSection";

const OPTIONS: { value: PeriodValue; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "3m", label: "3 derniers mois" },
  { value: "year", label: "Cette année" },
  { value: "custom", label: "Période personnalisée" },
];

export function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodSelection;
  onChange: (next: PeriodSelection) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white pl-3 pr-7 py-1.5 shadow-premium-sm hover:border-slate-300 transition-colors">
        <CalendarDays size={14} className="text-slate-400 shrink-0" />
        <select
          value={value.period}
          onChange={(e) => onChange({ ...value, period: e.target.value as PeriodValue })}
          className="appearance-none bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-1"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {value.period === "custom" && (
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white pl-3 pr-2.5 py-1.5 shadow-premium-sm">
          <span className="text-xs font-bold text-slate-500">Du</span>
          <input
            type="date"
            value={value.start}
            max={value.end || today}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className="w-[118px] rounded-lg border-none bg-transparent py-1 text-xs font-bold text-slate-700 focus:outline-none focus:bg-slate-50"
          />
          <span className="text-slate-300">–</span>
          <input
            type="date"
            value={value.end}
            min={value.start}
            max={today}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className="w-[118px] rounded-lg border-none bg-transparent py-1 text-xs font-bold text-slate-700 focus:outline-none focus:bg-slate-50"
          />
        </div>
      )}
    </div>
  );
}
