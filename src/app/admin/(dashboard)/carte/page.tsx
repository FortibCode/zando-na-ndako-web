"use client";

import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { MapPinned, Bike, RefreshCw } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ApiEnvelope, LivraisonPosition } from "@/lib/types";
import { LoadingBlock, ErrorBlock, EmptyState } from "@/components/Spinner";
import { AdminPageHeader, HeaderStat } from "@/components/AdminTable";

const LiveMap = dynamic(() => import("@/components/livraisons/LiveMap").then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-400">Chargement de la carte…</div>,
});

export default function CartePage() {
  const { data, isLoading, isError, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["admin-livraisons-positions"],
    queryFn: async () => (await api.get<ApiEnvelope<LivraisonPosition[]>>("/admin/livraisons/positions")).data,
    refetchInterval: 15_000,
  });

  const livraisons = data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Carte temps réel"
        description="Livreurs actuellement en mission, avec leur dernière position GPS connue."
        icon={MapPinned}
        action={<HeaderStat icon={Bike} label={`${livraisons.length} livreur(s) en livraison`} tone="navy" />}
      />

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof Error ? error.message : "Impossible de charger les positions."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && livraisons.length === 0 && (
        <EmptyState message="Aucun livreur en mission avec une position GPS connue pour le moment." />
      )}

      {!isLoading && !isError && livraisons.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 surface-card rounded-2xl overflow-hidden" style={{ height: 560 }}>
            <LiveMap livraisons={livraisons} />
          </div>

          <div className="surface-card rounded-2xl overflow-hidden flex flex-col" style={{ height: 560 }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
              <h3 className="text-sm font-black text-slate-800">En livraison</h3>
              <span className="flex items-center gap-1 text-[11.5px] font-bold text-slate-400">
                <RefreshCw size={10} /> {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("fr-FR") : ""}
              </span>
            </div>
            <div className="flex-1 divide-y divide-slate-50 overflow-y-auto">
              {livraisons.map((l) => (
                <Link
                  key={l.livraison_id}
                  href={`/admin/livraisons/${l.livraison_id}`}
                  className="block px-5 py-3 hover:bg-slate-50/70 transition-colors"
                >
                  <p className="text-xs font-black text-slate-800">{l.numero_commande}</p>
                  <p className="text-[12.5px] text-slate-500">{l.livreur?.nom ?? "Livreur"}{l.client ? ` → ${l.client}` : ""}</p>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">
                    Position à {new Date(l.position.horodatage).toLocaleTimeString("fr-FR")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
