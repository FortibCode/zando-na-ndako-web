"use client";

import { Store, Trophy } from "lucide-react";
import type { DashboardVendors } from "@/lib/types";
import { formatMontant, fullName } from "@/lib/format";
import { ErrorBlock, EmptyState } from "@/components/Spinner";
import { ListSkeleton } from "./DashboardSkeleton";

export function VendorStats({
  data,
  loading,
  error,
  onRetry,
}: {
  data: DashboardVendors | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) return <ListSkeleton rows={5} />;

  const top = data?.top_vendeurs ?? [];

  return (
    <div className="surface-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-black text-slate-800 text-sm">Vendeurs</h3>
        {data && (
          <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[12.5px] font-black text-emerald-700">
            <Store size={12} /> {data.vendeurs_actifs} actif(s)
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 mb-4">Classement par chiffre d&apos;affaires sur la période</p>

      {error && <ErrorBlock message={error} onRetry={onRetry} />}
      {!error && top.length === 0 && (
        <EmptyState message="Aucune donnée disponible — aucune vente vendeur sur cette période." />
      )}
      {!error && top.length > 0 && (
        <div className="space-y-3">
          {top.map((v, i) => (
            <div key={v.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12.5px] font-black ${
                    i === 0 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {i === 0 ? <Trophy size={13} /> : i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{v.nom_commerce}</p>
                  <p className="text-[12px] text-slate-400 truncate">
                    {fullName(v.nom, v.prenom)} · {v.commandes} cmd.
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-black text-emerald-600">{formatMontant(v.chiffre_affaires)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
