"use client";

import { Globe, Home, MapPin } from "lucide-react";
import type { DashboardSegments } from "@/lib/types";
import { formatMontant } from "@/lib/format";
import { ErrorBlock, EmptyState } from "@/components/Spinner";
import { ListSkeleton } from "./DashboardSkeleton";

const SEGMENT_META = {
  local: { label: "Locale", icon: Home, bar: "from-[#26407a] to-[#1A2E5A]" },
  diaspora: { label: "Diaspora", icon: Globe, bar: "from-[#7c3aed] to-[#5b21b6]" },
};

export function SegmentsPanel({
  data,
  loading,
  error,
  onRetry,
}: {
  data: DashboardSegments | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) return <ListSkeleton rows={6} />;

  const clientele = data?.clientele ?? [];
  const zones = data?.zones ?? [];
  const totalCa = clientele.reduce((s, c) => s + (Number(c.chiffre_affaires) || 0), 0);

  return (
    <div className="surface-card rounded-2xl p-5">
      <h3 className="font-black text-slate-800 text-sm mb-1">Clientèle locale vs diaspora</h3>
      <p className="text-xs text-slate-400 mb-4">Répartition du chiffre d&apos;affaires par origine des clients</p>

      {error && <ErrorBlock message={error} onRetry={onRetry} />}
      {!error && totalCa === 0 && (
        <EmptyState message="Aucune donnée disponible — aucune vente sur cette période." />
      )}
      {!error && totalCa > 0 && (
        <div className="space-y-3 mb-6">
          {clientele.map((c) => {
            const meta = SEGMENT_META[c.segment];
            const Icon = meta.icon;
            const ca = Number(c.chiffre_affaires) || 0;
            const pct = totalCa > 0 ? Math.round((ca / totalCa) * 100) : 0;
            return (
              <div key={c.segment}>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-600">
                    <Icon size={13} />
                    <span>{meta.label}</span>
                    <span className="text-slate-400 font-semibold">· {c.commandes} cmd.</span>
                  </div>
                  <span className="font-black text-slate-800">
                    {formatMontant(ca)} <span className="text-slate-400 font-semibold">({pct}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full bg-linear-to-r ${meta.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[12.5px] font-bold text-slate-400 uppercase tracking-wide mb-3">Performance par zone</p>
      {!error && zones.length === 0 && (
        <EmptyState message="Aucune donnée disponible — aucune vente rattachée à une zone sur cette période." />
      )}
      {!error && zones.length > 0 && (
        <div className="space-y-3">
          {zones.map((z) => (
            <div key={z.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <MapPin size={12} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{z.nom_zone}</p>
                  <p className="text-[12px] text-slate-400 truncate">
                    {z.ville} · {z.commandes} cmd.
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-black text-emerald-600">{formatMontant(z.chiffre_affaires)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
