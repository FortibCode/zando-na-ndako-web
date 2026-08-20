"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertTriangle, PackageX, Store, Bike, Wallet, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "@/lib/api";
import type { ApiEnvelope, DashboardAlerts } from "@/lib/types";

const ALERT_DEFS: { key: keyof Omit<DashboardAlerts, "total">; label: string; href: string; icon: LucideIcon; tone: "red" | "gold" | "navy" }[] = [
  { key: "commandes_en_retard", label: "Commandes en retard", href: "/admin/commandes", icon: AlertTriangle, tone: "red" },
  { key: "litiges_ouverts", label: "Litiges ouverts", href: "/admin/litiges", icon: ShieldAlert, tone: "red" },
  { key: "paiements_en_attente", label: "Paiements en attente", href: "/admin/finances", icon: Wallet, tone: "gold" },
  { key: "produits_rupture", label: "Produits en rupture", href: "/admin/categories", icon: PackageX, tone: "gold" },
  { key: "vendeurs_en_attente", label: "Vendeurs en attente", href: "/admin/vendeurs?statut=en_attente", icon: Store, tone: "navy" },
  { key: "livreurs_en_attente", label: "Livreurs en attente", href: "/admin/livreurs?statut=en_attente", icon: Bike, tone: "navy" },
];

const TONE_CLASSES: Record<string, string> = {
  red: "bg-red-500/10 border-red-500/25 text-red-800 hover:bg-red-500/20 hover:border-red-500/40 shadow-[0_4px_12px_-2px_rgba(239,68,68,0.2)]",
  gold: "bg-amber-500/10 border-amber-500/25 text-amber-900 hover:bg-amber-500/20 hover:border-amber-500/40 shadow-[0_4px_12px_-2px_rgba(245,158,11,0.2)]",
  navy: "bg-[#1A2E5A]/10 border-[#1A2E5A]/25 text-[#1A2E5A] hover:bg-[#1A2E5A]/20 hover:border-[#1A2E5A]/40 shadow-[0_4px_12px_-2px_rgba(26,46,90,0.15)]",
};

export function AlertsPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard-alerts"],
    queryFn: async () => (await api.get<ApiEnvelope<DashboardAlerts>>("/admin/dashboard/alerts")).data,
    refetchInterval: 60_000,
  });

  if (isLoading || isError || !data || data.total === 0) return null;

  const activeAlerts = ALERT_DEFS.filter((a) => data[a.key] > 0);

  return (
    <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-amber-300/80 bg-linear-to-r from-amber-50 via-orange-50/60 to-amber-50 p-5 sm:p-6 shadow-premium-md">
      <div className="flex items-center gap-3 mb-4">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
        </span>
        <h3 className="text-sm font-black text-amber-950 tracking-tight">
          {data.total} alerte{data.total > 1 ? "s" : ""} nécessite{data.total > 1 ? "nt" : ""} votre attention immédiate
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {activeAlerts.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.key}
              href={a.href}
              className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-black transition-all duration-200 hover:-translate-y-1 hover:shadow-premium-lg cursor-pointer ${TONE_CLASSES[a.tone]}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon size={16} className="shrink-0" />
                <span className="truncate">{a.label}</span>
              </div>
              <span className="shrink-0 rounded-full bg-white/90 px-2.5 py-0.5 font-black shadow-xs text-xs">{data[a.key]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

