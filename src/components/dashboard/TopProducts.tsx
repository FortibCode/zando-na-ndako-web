"use client";

import { Package } from "lucide-react";
import type { DashboardProducts } from "@/lib/types";
import { formatMontant } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/api";
import { ErrorBlock, EmptyState } from "@/components/Spinner";
import { ListSkeleton } from "./DashboardSkeleton";

export function TopProducts({
  data,
  loading,
  error,
  onRetry,
}: {
  data: DashboardProducts | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) return <ListSkeleton rows={6} />;

  const produits = data?.produits ?? [];
  const maxQty = Math.max(1, ...produits.map((p) => Number(p.quantite_vendue) || 0));

  return (
    <div className="surface-card rounded-2xl p-5">
      <h3 className="font-black text-slate-800 text-sm mb-4">Produits les plus vendus</h3>

      {error && <ErrorBlock message={error} onRetry={onRetry} />}
      {!error && produits.length === 0 && (
        <EmptyState message="Aucune donnée disponible — aucun produit vendu sur cette période." />
      )}
      {!error && produits.length > 0 && (
        <div className="space-y-3.5">
          {produits.map((p, i) => {
            const qty = Number(p.quantite_vendue) || 0;
            const pct = Math.round((qty / maxQty) * 100);
            const img = resolveMediaUrl(p.photo_produit);
            return (
              <div key={p.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11.5px] font-black text-slate-500">
                  {i + 1}
                </span>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-slate-100" />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-300 ring-1 ring-slate-100">
                    <Package size={15} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{p.nom_produit}</p>
                  <p className="text-[12px] text-slate-400 truncate">{p.nom_commerce ?? "—"}</p>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-linear-to-r from-[#26407a] to-[#1A2E5A]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-black text-slate-800">{qty} vendu(s)</p>
                  <p className="text-[12px] font-bold text-emerald-600">{formatMontant(p.revenus)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
