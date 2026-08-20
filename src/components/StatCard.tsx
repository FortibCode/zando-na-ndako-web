import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const ACCENT_MAP: Record<string, { icon: string; glow: string; ring: string; spark: string }> = {
  red:    { icon: "bg-linear-to-br from-[#e01313] to-[#8f0000]", glow: "shadow-[0_8px_20px_-4px_rgba(192,0,0,0.45)]", ring: "ring-[#C00000]/15", spark: "#C00000" },
  navy:   { icon: "bg-linear-to-br from-[#26407a] to-[#101c38]", glow: "shadow-[0_8px_20px_-4px_rgba(11,37,69,0.45)]", ring: "ring-[#1A2E5A]/15", spark: "#1A2E5A" },
  gold:   { icon: "bg-linear-to-br from-[#f7b83a] to-[#d4780a]", glow: "shadow-[0_8px_20px_-4px_rgba(241,161,5,0.45)]", ring: "ring-[#F1A105]/20", spark: "#F1A105" },
  green:  { icon: "bg-linear-to-br from-[#3d9a43] to-[#215c25]", glow: "shadow-[0_8px_20px_-4px_rgba(46,125,50,0.45)]", ring: "ring-[#2E7D32]/15", spark: "#2E7D32" },
  violet: { icon: "bg-linear-to-br from-[#8b5cf6] to-[#5b21b6]", glow: "shadow-[0_8px_20px_-4px_rgba(124,58,237,0.4)]", ring: "ring-violet-500/15", spark: "#7c3aed" },
  sky:    { icon: "bg-linear-to-br from-[#38bdf8] to-[#0369a1]", glow: "shadow-[0_8px_20px_-4px_rgba(2,132,199,0.4)]", ring: "ring-sky-500/15", spark: "#0284c7" },
};

export function StatCard({
  label,
  value,
  hint,
  accent = "navy",
  icon,
  trend,
  trendLabel,
  change,
  sparklineData,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: keyof typeof ACCENT_MAP;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  change?: number | null;
  sparklineData?: number[] | null;
}) {
  const colors = ACCENT_MAP[accent] ?? ACCENT_MAP.navy;
  const sparkline = sparklineData ?? [];

  return (
    <div className={`surface-card group relative overflow-hidden rounded-2xl p-5 ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-xl ${colors.ring}`}>
      {/* Background glow accent on hover */}
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-slate-100 opacity-0 transition-opacity duration-300 group-hover:opacity-40 blur-xl pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3">
        {icon && (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:scale-110 ${colors.icon} ${colors.glow}`}>
            {icon}
          </div>
        )}

        {trend && trendLabel && (
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-black tracking-tight ${
            trend === "up" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" : trend === "down" ? "bg-red-50 text-red-700 ring-1 ring-red-600/20" : "bg-slate-100 text-slate-600"
          }`}>
            {trend === "up" && <TrendingUp size={12} strokeWidth={2.5} />}
            {trend === "down" && <TrendingDown size={12} strokeWidth={2.5} />}
            <span>{trendLabel}</span>
          </div>
        )}
      </div>

      <div className="relative mt-4 min-w-0">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider truncate">{label}</p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <p className="font-tnum text-3xl font-black text-slate-900 truncate tracking-tight">{value}</p>
            {typeof change === "number" && (
              <div className={`inline-flex items-center gap-1 mt-1.5 text-xs font-black px-2.5 py-0.5 rounded-full ${change >= 0 ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" : "bg-red-50 text-red-700 ring-1 ring-red-600/20"}`}>
                {change >= 0 ? `+${change}%` : `${change}%`}
              </div>
            )}
          </div>

          {sparkline.length > 0 && (
            <svg width="88" height="28" viewBox="0 0 88 28" className="shrink-0 opacity-85 group-hover:opacity-100 transition-opacity">
              {(() => {
                const data = sparkline as number[];
                const w = 80;
                const h = 24;
                const min = Math.min(...data);
                const max = Math.max(...data);
                const range = max - min || 1;
                const step = w / Math.max(1, data.length - 1);
                const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
                return (
                  <>
                    <polyline fill="none" stroke={colors.spark} strokeWidth="2.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
                  </>
                );
              })()}
            </svg>
          )}
        </div>
        {hint && !trendLabel && <p className="mt-1.5 text-xs font-bold text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}


