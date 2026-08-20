"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { DashboardSales } from "@/lib/types";
import { formatMontant } from "@/lib/format";
import { ErrorBlock, EmptyState } from "@/components/Spinner";
import { ChartSkeleton } from "./DashboardSkeleton";

function formatAxisDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function SalesTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length || label === undefined) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-xl text-xs">
      <p className="font-black text-slate-800 mb-1.5">
        {new Date(String(label)).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
      </p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="font-bold" style={{ color: p.color }}>
          {p.dataKey === "revenus" ? `Revenus : ${formatMontant(p.value as number)}` : `Commandes : ${p.value}`}
        </p>
      ))}
    </div>
  );
}

export function SalesChart({
  data,
  loading,
  error,
  onRetry,
}: {
  data: DashboardSales | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) return <ChartSkeleton height={280} />;

  return (
    <div className="surface-card rounded-2xl p-5">
      <div className="mb-5">
        <h3 className="font-black text-slate-800 text-sm">Évolution des ventes</h3>
        <p className="text-xs text-slate-400 mt-0.5">Chiffre d&apos;affaires et commandes dans le temps</p>
      </div>

      {error && <ErrorBlock message={error} onRetry={onRetry} />}
      {!error && (!data || data.points.length === 0) && (
        <EmptyState message="Aucune donnée disponible — aucune vente enregistrée sur cette période." />
      )}
      {!error && data && data.points.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data.points} margin={{ top: 5, right: 8, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSalesRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSalesOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1A2E5A" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#1A2E5A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatAxisDate}
              tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="revenus"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}K` : `${v}`)}
            />
            <YAxis
              yAxisId="commandes"
              orientation="right"
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={(props) => <SalesTooltip {...props} />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontWeight: 700 }}
              formatter={(v) => (v === "revenus" ? "Revenus (FCFA)" : "Commandes")}
            />
            <Area
              yAxisId="revenus"
              type="monotone"
              dataKey="revenus"
              name="revenus"
              stroke="#2E7D32"
              strokeWidth={2.5}
              fill="url(#gradSalesRev)"
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Area
              yAxisId="commandes"
              type="monotone"
              dataKey="commandes"
              name="commandes"
              stroke="#1A2E5A"
              strokeWidth={2}
              fill="url(#gradSalesOrders)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
