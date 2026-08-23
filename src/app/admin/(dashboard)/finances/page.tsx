"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Wallet, Truck, ClipboardList, Download, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { api, ApiError } from "@/lib/api";
import type { ApiEnvelope, FinancesData, StatistiquesData, PaginatedData, Commande } from "@/lib/types";
import { StatCard } from "@/components/StatCard";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { AdminPageHeader } from "@/components/AdminTable";
import { Button } from "@/components/Button";
import { formatMontant, formatDate } from "@/lib/format";
import { useToast } from "@/lib/toast-context";

const MOIS_LABEL = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

interface TooltipEntry { name: string; value: number; color?: string }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-xl text-xs animate-fade-in">
        <p className="font-black text-slate-800 mb-1.5">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="font-bold" style={{ color: p.color }}>
            {p.name === "revenus" ? "Revenus" : "Commissions"}: {formatMontant(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function FinancesPage() {
  const { notify, notifyError } = useToast();
  const now = new Date();
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [annee, setAnnee] = useState(now.getFullYear());
  const [finances, setFinances] = useState<FinancesData | null>(null);
  const [stats, setStats] = useState<StatistiquesData | null>(null);
  const [ventes, setVentes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [financesRes, statsRes, ventesRes] = await Promise.all([
        api.get<ApiEnvelope<FinancesData>>(`/admin/finances?mois=${mois}&annee=${annee}`),
        api.get<ApiEnvelope<StatistiquesData>>(`/admin/statistiques?mois=${mois}&annee=${annee}&livree_uniquement=1`),
        api.get<ApiEnvelope<PaginatedData<Commande>>>(`/admin/commandes?statut=livree&mois=${mois}&annee=${annee}`),
      ]);
      setFinances(financesRes.data);
      setStats(statsRes.data);
      setVentes(ventesRes.data.data.slice(0, 6));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les données financières.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [mois, annee]);

  function changeMonth(delta: number) {
    let m = mois + delta, a = annee;
    if (m < 1) { m = 12; a -= 1; }
    if (m > 12) { m = 1; a += 1; }
    setMois(m); setAnnee(a);
  }

  async function exportRapport() {
    if (!finances) return;
    setExporting(true);
    try {
      const debut = new Date(finances.annee, finances.mois - 1, 1).toISOString().slice(0, 10);
      const fin = new Date(finances.annee, finances.mois, 0).toISOString().slice(0, 10);
      await api.download(
        `/admin/rapports/export?type=finances&date_debut=${debut}&date_fin=${fin}`,
        `rapport-finances-${MOIS_LABEL[finances.mois]}-${finances.annee}.csv`
      );
      notify("Rapport téléchargé.");
    } catch (err) {
      notifyError(err, "Impossible de générer le rapport.");
    } finally {
      setExporting(false);
    }
  }

  // Ratio réel commissions/CA de la période (issu de /admin/finances, lui-même calculé à partir
  // du taux configurable) plutôt qu'un 10% recodé en dur ici.
  const commissionRatio = finances && Number(finances.chiffre_affaires) > 0
    ? Number(finances.commissions_percues) / Number(finances.chiffre_affaires)
    : 0.1;

  const revenusChart = (stats?.commandes_par_jour ?? []).map((d) => ({
    jour: new Date(d.jour).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    revenus: Number(d.revenus) || 0,
    commissions: Math.round((Number(d.revenus) || 0) * commissionRatio),
  }));

  const moisLabel = finances ? `${MOIS_LABEL[finances.mois]} ${finances.annee}` : "";

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Finances & commissions"
        description="Synthèse financière de la plateforme — revenus et commissions perçues sur les commandes livrées."
        icon={Wallet}
        action={
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-premium-sm">
              <button onClick={() => changeMonth(-1)} className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                <ChevronLeft size={15} />
              </button>
              <span className="px-2 text-xs font-black text-slate-700 min-w-[110px] text-center">{MOIS_LABEL[mois]} {annee}</span>
              <button onClick={() => changeMonth(1)} className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
            <Button variant="success" onClick={exportRapport} loading={exporting}>
              <Download size={14} />
              {exporting ? "Génération…" : "Exporter le rapport"}
            </Button>
          </div>
        }
      />

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}

      {!loading && !error && finances && (
        <>
          {/* KPI Cards — tous réels, issus de GET /admin/finances */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={`Chiffre d'affaires (${moisLabel})`}
              value={formatMontant(finances.chiffre_affaires)}
              accent="green"
              icon={<TrendingUp size={20} />}
              hint="Commandes livrées"
            />
            <StatCard
              label="Commissions perçues"
              value={formatMontant(finances.commissions_percues)}
              accent="navy"
              icon={<Wallet size={20} />}
              hint="10% sur chaque vente"
            />
            <StatCard
              label="Frais de livraison"
              value={formatMontant(finances.frais_livraison)}
              accent="gold"
              icon={<Truck size={20} />}
              hint="Cumulés ce mois-ci"
            />
            <StatCard
              label="Commandes livrées"
              value={finances.nb_commandes}
              accent="sky"
              icon={<ClipboardList size={20} />}
              hint={moisLabel}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue + Commission Area Chart */}
            <div className="lg:col-span-2 surface-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-slate-800 text-base">Revenus & Commissions</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Évolution journalière (FCFA)</p>
                </div>
                <span className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700">{moisLabel}</span>
              </div>
              {revenusChart.length === 0 ? (
                <div className="flex h-58 items-center justify-center text-xs font-semibold text-slate-400">
                  Pas encore de commandes livrées ce mois-ci.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={revenusChart} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradRevFin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradComm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A2E5A" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#1A2E5A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="jour" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenus" name="revenus" stroke="#2E7D32" strokeWidth={2.5} fill="url(#gradRevFin)" dot={false} />
                    <Area type="monotone" dataKey="commissions" name="commissions" stroke="#1A2E5A" strokeWidth={2} fill="url(#gradComm)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              <div className="mt-3 flex gap-5">
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#2E7D32]" /><span className="text-[12.5px] font-bold text-slate-500">Revenus</span></div>
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#1A2E5A]" /><span className="text-[12.5px] font-bold text-slate-500">Commissions ({finances?.taux_commission_vendeur ?? "—"}%)</span></div>
              </div>
            </div>

            {/* Top vendeurs du mois — réel, issu de GET /admin/statistiques */}
            <div className="surface-card rounded-2xl p-6">
              <h3 className="font-black text-slate-800 text-base mb-1">Top vendeurs</h3>
              <p className="text-sm text-slate-400 mb-4">Par nombre de commandes livrées — {moisLabel}</p>
              {!stats || stats.top_vendeurs.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">Aucune vente ce mois-ci.</p>
              ) : (
                <div className="space-y-3">
                  {stats.top_vendeurs.map((v, i) => (
                    <div key={v.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">{i + 1}</span>
                        <span className="text-sm font-bold text-slate-700 truncate">{v.nom_commerce}</span>
                      </div>
                      <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">{v.commandes_count} cmd.</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ventes récentes — réel, issu de GET /admin/commandes?statut=livree */}
          <div className="surface-card rounded-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <h3 className="font-black text-slate-800 text-sm">Ventes récentes (livrées)</h3>
              <span className="text-xs font-bold text-slate-400">{moisLabel}</span>
            </div>
            {ventes.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">Aucune commande livrée pour le moment.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {ventes.map((c) => (
                  <div key={c.id} className="row-accent flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                        <Wallet size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{c.numero_commande}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{c.vendeur?.nom_commerce ?? "—"} · {formatDate(c.date_commande, true)}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-emerald-600">{formatMontant(c.montant_total, c.devise_paiement)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accès rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/admin/transactions", label: "Transactions", color: "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100" },
              { href: "/admin/commissions", label: "Commissions", color: "bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100" },
              { href: "/admin/remboursements", label: "Remboursements", color: "bg-red-50 border-red-100 text-red-700 hover:bg-red-100" },
              { href: "/admin/retraits", label: "Retraits", color: "bg-[#1A2E5A]/8 border-[#1A2E5A]/12 text-[#1A2E5A] hover:bg-[#1A2E5A]/12" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center rounded-2xl border px-4 py-3 text-xs font-black shadow-premium-sm transition-all hover:-translate-y-0.5 ${item.color}`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
