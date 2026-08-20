"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { DashboardPayments } from "@/lib/types";
import { formatMontant } from "@/lib/format";
import { ErrorBlock, EmptyState } from "@/components/Spinner";
import { ChartSkeleton } from "./DashboardSkeleton";

const COLORS = ["#1A2E5A", "#2E7D32", "#F1A105", "#C00000", "#7c3aed", "#0284c7"];

export function PaymentMethodsChart({
  data,
  loading,
  error,
  onRetry,
}: {
  data: DashboardPayments | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) return <ChartSkeleton height={230} />;

  const methodes = data?.methodes ?? [];

  return (
    <div className="surface-card rounded-2xl p-5">
      <h3 className="font-black text-slate-800 text-sm mb-1">Modes de paiement</h3>
      <p className="text-xs text-slate-400 mb-4">{data && data.total > 0 ? `${formatMontant(data.total)} au total` : " "}</p>

      {error && <ErrorBlock message={error} onRetry={onRetry} />}
      {!error && methodes.length === 0 && (
        <EmptyState message="Aucune donnée disponible — aucun paiement validé sur cette période." />
      )}
      {!error && methodes.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={methodes} cx="50%" cy="50%" innerRadius={46} outerRadius={72} paddingAngle={3} dataKey="montant" stroke="none">
                {methodes.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [formatMontant(v as number), ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2.5">
            {methodes.map((m, i) => (
              <div key={m.methode} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-bold text-slate-600 truncate">{m.label}</span>
                </div>
                <span className="shrink-0 font-black text-slate-800">
                  {formatMontant(m.montant)} <span className="text-slate-400 font-semibold">({m.pourcentage}%)</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
