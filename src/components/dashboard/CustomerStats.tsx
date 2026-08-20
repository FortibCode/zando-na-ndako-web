"use client";

import type { LucideIcon } from "lucide-react";
import { Users, UserPlus, UserCheck, Repeat, Globe } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DashboardCustomers } from "@/lib/types";
import { ErrorBlock, EmptyState } from "@/components/Spinner";
import { ChartSkeleton } from "./DashboardSkeleton";

function MiniStat({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3.5 text-center ring-1 ring-slate-100">
      <Icon size={16} className={`mx-auto mb-1.5 ${tone}`} />
      <p className="font-tnum text-lg font-black text-slate-900">{value}</p>
      <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide truncate">{label}</p>
    </div>
  );
}

export function CustomerStats({
  data,
  loading,
  error,
  onRetry,
}: {
  data: DashboardCustomers | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) return <ChartSkeleton height={280} />;

  return (
    <div className="surface-card rounded-2xl p-5">
      <h3 className="font-black text-slate-800 text-sm mb-4">Clients</h3>

      {error && <ErrorBlock message={error} onRetry={onRetry} />}
      {!error && data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
            <MiniStat icon={Users} label="Total" value={data.total_clients} tone="text-[#1A2E5A]" />
            <MiniStat icon={UserPlus} label="Nouveaux" value={data.nouveaux_clients} tone="text-[#F1A105]" />
            <MiniStat icon={UserCheck} label="Actifs" value={data.clients_actifs} tone="text-emerald-600" />
            <MiniStat icon={Repeat} label="Récurrents" value={data.clients_recurrents} tone="text-sky-500" />
            <MiniStat icon={Globe} label="Diaspora" value={data.clients_diaspora} tone="text-violet-500" />
          </div>

          {data.evolution_inscriptions.length === 0 ? (
            <EmptyState message="Aucune donnée disponible — aucune inscription sur cette période." />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={data.evolution_inscriptions} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v} inscription(s)`, ""]}
                  labelFormatter={(v) => new Date(String(v)).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}
                />
                <Line type="monotone" dataKey="total" stroke="#1A2E5A" strokeWidth={2.5} dot={{ r: 3, fill: "#1A2E5A" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </div>
  );
}
