"use client";

import type { LucideIcon } from "lucide-react";
import { Bike, Clock, CheckCircle2, XCircle, Wallet } from "lucide-react";
import type { DashboardDeliveries } from "@/lib/types";
import { formatMontant, fullName } from "@/lib/format";
import { ErrorBlock, EmptyState } from "@/components/Spinner";
import { ListSkeleton } from "./DashboardSkeleton";

function MiniStat({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3.5 text-center ring-1 ring-slate-100">
      <Icon size={16} className={`mx-auto mb-1.5 ${tone}`} />
      <p className="font-tnum text-lg font-black text-slate-900">{value}</p>
      <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide truncate">{label}</p>
    </div>
  );
}

export function DeliveryStats({
  data,
  loading,
  error,
  onRetry,
}: {
  data: DashboardDeliveries | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) return <ListSkeleton rows={4} />;

  return (
    <div className="surface-card rounded-2xl p-5">
      <h3 className="font-black text-slate-800 text-sm mb-4">Livraisons</h3>

      {error && <ErrorBlock message={error} onRetry={onRetry} />}
      {!error && data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <MiniStat icon={Bike} label="Total" value={data.total} tone="text-[#1A2E5A]" />
            <MiniStat icon={CheckCircle2} label="Terminées" value={data.terminees} tone="text-emerald-600" />
            <MiniStat icon={Clock} label="En cours" value={data.en_cours} tone="text-[#F1A105]" />
            <MiniStat icon={XCircle} label="Échouées" value={data.echouees} tone="text-red-500" />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Temps moyen de livraison</span>
            </div>
            <span className="text-xs font-black text-slate-800">
              {data.duree_moyenne_minutes ? `${data.duree_moyenne_minutes} min` : "—"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100 mb-5">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">Revenus de livraison</span>
            </div>
            <span className="text-xs font-black text-emerald-700">{formatMontant(data.revenus_livraison)}</span>
          </div>

          {data.top_livreurs.length === 0 ? (
            <EmptyState message="Aucune donnée disponible — aucune livraison terminée sur cette période." />
          ) : (
            <div className="space-y-3">
              <p className="text-[12.5px] font-bold text-slate-400 uppercase tracking-wide">Meilleurs livreurs</p>
              {data.top_livreurs.map((l, i) => (
                <div key={l.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11.5px] font-black text-slate-500">
                      {i + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate">{fullName(l.nom, l.prenom)}</span>
                  </div>
                  <span className="shrink-0 rounded-lg bg-sky-50 px-2 py-0.5 text-[12.5px] font-black text-sky-700">
                    {l.livraisons} livr.
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
