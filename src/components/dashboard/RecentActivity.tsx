"use client";

import type { LucideIcon } from "lucide-react";
import { ShoppingBag, CreditCard, UserPlus, Store, PackageCheck, XCircle, Bike } from "lucide-react";
import type { ActivityItem } from "@/lib/types";
import { ErrorBlock, EmptyState } from "@/components/Spinner";
import { ListSkeleton } from "./DashboardSkeleton";

const TYPE_META: Record<string, { icon: LucideIcon; color: string }> = {
  commande: { icon: ShoppingBag, color: "bg-[#1A2E5A]/8 text-[#1A2E5A]" },
  livraison: { icon: PackageCheck, color: "bg-emerald-50 text-emerald-600" },
  annulation: { icon: XCircle, color: "bg-red-50 text-red-600" },
  paiement: { icon: CreditCard, color: "bg-amber-50 text-amber-600" },
  client: { icon: UserPlus, color: "bg-sky-50 text-sky-600" },
  vendeur: { icon: Store, color: "bg-violet-50 text-violet-600" },
  mission: { icon: Bike, color: "bg-slate-100 text-slate-600" },
};

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function RecentActivity({
  data,
  loading,
  error,
  onRetry,
}: {
  data: ActivityItem[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) return <ListSkeleton rows={7} />;

  const items = data ?? [];

  return (
    <div className="surface-card rounded-2xl p-5">
      <h3 className="font-black text-slate-800 text-sm mb-4">Activité récente</h3>

      {error && <ErrorBlock message={error} onRetry={onRetry} />}
      {!error && items.length === 0 && <EmptyState message="Aucune donnée disponible — aucune activité récente." />}
      {!error && items.length > 0 && (
        <div className="space-y-1">
          {items.map((item, i) => {
            const meta = TYPE_META[item.type] ?? { icon: ShoppingBag, color: "bg-slate-100 text-slate-500" };
            const Icon = meta.icon;
            return (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                  <Icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800">{item.titre}</p>
                  <p className="text-[12.5px] text-slate-500 truncate">{item.description}</p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold text-slate-400 whitespace-nowrap">{timeAgo(item.date)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
