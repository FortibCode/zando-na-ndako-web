"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, LabelList } from "recharts";
import type { DashboardOrders } from "@/lib/types";
import { ErrorBlock, EmptyState } from "@/components/Spinner";
import { ChartSkeleton } from "./DashboardSkeleton";

const STATUS_COLORS: Record<string, string> = {
  confirmee: "#1A2E5A",
  achat_marche: "#F1A105",
  preparation: "#f59e0b",
  en_route: "#0284c7",
  livree: "#2E7D32",
  annulee: "#C00000",
};

export function OrdersStatusChart({
  data,
  loading,
  error,
  onRetry,
}: {
  data: DashboardOrders | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) return <ChartSkeleton height={260} />;

  const chartData = (data?.statuts ?? []).map((s) => ({ ...s, fill: STATUS_COLORS[s.statut] ?? "#94a3b8" }));

  return (
    <div className="surface-card rounded-2xl p-5">
      <h3 className="font-black text-slate-800 text-sm mb-1">Commandes par statut</h3>
      <p className="text-xs text-slate-400 mb-4">{data ? `${data.total} commande(s) au total` : " "}</p>

      {error && <ErrorBlock message={error} onRetry={onRetry} />}
      {!error && (!data || data.total === 0) && (
        <EmptyState message="Aucune donnée disponible — aucune commande sur cette période." />
      )}
      {!error && data && data.total > 0 && (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              width={104}
              tick={{ fontSize: 11, fontWeight: 700, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(v) => [`${v} commande(s)`, ""]} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={22}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
              <LabelList dataKey="total" position="right" style={{ fontSize: 11, fontWeight: 800, fill: "#334155" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
