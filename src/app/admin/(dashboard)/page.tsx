"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList, Wallet, UserPlus, TrendingUp, ArrowRight,
  ArrowUpRight, ArrowDownRight, CalendarDays,
  MoreVertical, Store, Bike, Plus,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { api, ApiError } from "@/lib/api";
import type { ApiEnvelope, DashboardData, StatistiquesData, Commande, PaginatedData } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { formatMontant, fullName } from "@/lib/format";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { StatutCommandeBadge } from "@/components/Badge";

interface TooltipEntry { name: string; value: number; color?: string }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-md p-3.5 shadow-2xl text-xs space-y-1 animate-fade-in">
        <p className="font-black text-slate-900 border-b border-slate-100 pb-1">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-4 font-bold text-xs" style={{ color: p.color }}>
            <span>{p.name === "revenus" ? "Chiffre d'Affaires" : "Commandes"}:</span>
            <span className="font-black">{p.name === "revenus" ? formatMontant(p.value) : p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatistiquesData | null>(null);
  const [recentCommandes, setRecentCommandes] = useState<Commande[]>([]);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 13);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiEnvelope<DashboardData>>("/admin/dashboard");
      setData(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger le tableau de bord.");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await api.get<ApiEnvelope<StatistiquesData>>("/admin/statistiques");
      setStats(res.data);
    } catch {
      setStats(null);
    }
  }

  async function loadRecent() {
    try {
      const res = await api.get<ApiEnvelope<PaginatedData<Commande>>>(
        `/admin/commandes?per_page=5&sort_by=date&sort_dir=desc`
      );
      setRecentCommandes(res.data.data);
    } catch {
      setRecentCommandes([]);
    }
  }

  useEffect(() => { load(); loadStats(); loadRecent(); }, []);

  // Sparkline & change calculations
  const ventesAll = stats?.commandes_par_jour ?? [];
  const sparkCommandes = ventesAll.slice(-14).map((d) => Number(d.total) || 0);
  const sparkRevenus = ventesAll.slice(-14).map((d) => Number(d.revenus) || 0);

  function pctChangeFromArray(arr: number[]) {
    if (arr.length < 2) return 0;
    const last = arr.slice(-7).reduce((s, v) => s + v, 0);
    const prev = arr.slice(-14, -7).reduce((s, v) => s + v, 0) || 0;
    if (prev === 0) return last === 0 ? 0 : Math.round((last / Math.max(1, prev)) * 100);
    return Math.round(((last - prev) / prev) * 100);
  }

  const revenusChange = pctChangeFromArray(sparkRevenus);
  const commandesChange = pctChangeFromArray(sparkCommandes);

  // Commandes & revenus sur la période sélectionnée
  const ventesPeriod = (stats?.commandes_par_jour ?? [])
    .filter((d) => {
      const dt = new Date(d.jour).toISOString().slice(0, 10);
      return dt >= startDate && dt <= endDate;
    })
    .map((d) => ({
      jour: new Date(d.jour).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      commandes: d.total,
      revenus: Number(d.revenus) || 0,
    }));

  const ventesTotalesPeriode = ventesPeriod.reduce((s, d) => s + d.revenus, 0);
  const commandesTotalPeriode = ventesPeriod.reduce((s, d) => s + d.commandes, 0);
  const panierMoyen = commandesTotalPeriode > 0 ? ventesTotalesPeriode / commandesTotalPeriode : 0;

  const statutsData = data
    ? [
        { name: "Livrées", value: data.commandes.livrees || 1, fill: "#2E7D32" },
        { name: "En cours", value: data.commandes.en_cours || 1, fill: "#1A2E5A" },
        { name: "Annulées", value: data.commandes.annulees || 1, fill: "#C00000" },
      ]
    : [
        { name: "Livrées", value: 65, fill: "#2E7D32" },
        { name: "En cours", value: 25, fill: "#1A2E5A" },
        { name: "Annulées", value: 10, fill: "#C00000" },
      ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = now.toLocaleDateString("fr-CG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Top Bar Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{greeting}, Administrateur</h1>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5 capitalize">{dateStr} · Plateforme Zando na Ndako</p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-premium-sm">
          <CalendarDays size={15} className="text-[#1A2E5A] shrink-0 ml-1" />
          <span className="text-xs font-black text-slate-500">Période :</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border-none bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
          />
          <span className="text-slate-300 font-bold">–</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border-none bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}

      {!loading && !error && data && (
        <>
          {/* Alertes d'actions requises */}
          <AlertsPanel />

          {/* ── TOP KPI GRID (INSPIRED BY MOCKUP: 1 FEATURED RED CARD + 3 SLEEK WHITE CARDS) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Featured Hero Card (Red Zando Brand Color) */}
            <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-[#C00000] via-[#aa0000] to-[#8f0000] p-6 text-white shadow-[0_15px_30px_-5px_rgba(192,0,0,0.35)] transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md shadow-inner">
                  <Wallet size={22} strokeWidth={2.4} />
                </div>
                <span className="h-2 w-2 rounded-full bg-[#F1A105] shadow-[0_0_8px_#F1A105]" />
              </div>

              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-wider text-white/70">Volume des Ventes</p>
                <h3 className="font-tnum text-3xl font-black tracking-tight text-white mt-1">
                  {formatMontant(ventesTotalesPeriode)}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-black bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {revenusChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {revenusChange >= 0 ? "+" : ""}{revenusChange}%
                  </span>
                  <span className="text-[12.5px] font-bold text-white/60">Période active</span>
                </div>
              </div>
            </div>

            {/* KPI Card 2: Commandes */}
            <div className="surface-card group relative overflow-hidden rounded-2xl p-6 border border-slate-200/80 shadow-premium-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1A2E5A] transition-transform group-hover:scale-110">
                  <ClipboardList size={22} strokeWidth={2.4} />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Total Commandes</p>
                <h3 className="font-tnum text-3xl font-black tracking-tight text-slate-900 mt-1">
                  {commandesTotalPeriode || data.commandes.total}
                </h3>
                <div className={`mt-3 flex items-center gap-2 text-xs font-black ${commandesChange >= 0 ? "text-emerald-600" : "text-[#C00000]"}`}>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${commandesChange >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                    {commandesChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {commandesChange >= 0 ? "+" : ""}{commandesChange}%
                  </span>
                  <span className="text-slate-400 font-bold">vs période précédente</span>
                </div>
              </div>
            </div>

            {/* KPI Card 3: Nouveaux Clients */}
            <div className="surface-card group relative overflow-hidden rounded-2xl p-6 border border-slate-200/80 shadow-premium-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 transition-transform group-hover:scale-110">
                  <UserPlus size={22} strokeWidth={2.4} />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Clients Inscrits</p>
                <h3 className="font-tnum text-3xl font-black tracking-tight text-slate-900 mt-1">
                  {data.utilisateurs.nouveaux_ce_mois}
                </h3>
                <p className="mt-3 text-xs font-bold text-slate-400">Nouveaux comptes ce mois</p>
              </div>
            </div>

            {/* KPI Card 4: Panier Moyen */}
            <div className="surface-card group relative overflow-hidden rounded-2xl p-6 border border-slate-200/80 shadow-premium-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition-transform group-hover:scale-110">
                  <TrendingUp size={22} strokeWidth={2.4} />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Panier Moyen</p>
                <h3 className="font-tnum text-3xl font-black tracking-tight text-slate-900 mt-1">
                  {formatMontant(Math.round(panierMoyen))}
                </h3>
                <p className="mt-3 text-xs font-bold text-slate-400">Moyenne par commande</p>
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT GRID (LEFT ANALYTICS + RIGHT WIDGETS SIDEBAR) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT 8 COLUMNS: CHARTS & RECENT TRANSACTIONS */}
            <div className="lg:col-span-8 space-y-6">
              {/* Dual Area Chart (Ventes vs Commissions) */}
              <div className="surface-card rounded-2xl p-6 border border-slate-200/80 shadow-premium-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Évolution des Ventes</h3>
                    <p className="text-xs font-bold text-slate-400">Comparatif quotidien Chiffre d&apos;Affaires vs Commandes</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-extrabold">
                    <div className="flex items-center gap-1.5 text-[#C00000]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#C00000]" />
                      <span>Revenus (FCFA)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#1A2E5A]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#1A2E5A]" />
                      <span>Volume Commandes</span>
                    </div>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ventesPeriod}>
                      <defs>
                        <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C00000" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#C00000" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="gradNavy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1A2E5A" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#1A2E5A" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="jour" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenus" stroke="#C00000" strokeWidth={3} fillOpacity={1} fill="url(#gradRed)" />
                      <Area type="monotone" dataKey="commandes" stroke="#1A2E5A" strokeWidth={2.5} fillOpacity={1} fill="url(#gradNavy)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Transactions & Commandes Récentes Table */}
              <div className="surface-card rounded-2xl p-6 border border-slate-200/80 shadow-premium-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Dernières Commandes</h3>
                    <p className="text-xs font-bold text-slate-400">Transactions en temps réel sur la plateforme</p>
                  </div>
                  <Link href="/admin/commandes" className="text-xs font-black text-[#C00000] hover:underline flex items-center gap-1">
                    Voir toutes les commandes <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="overflow-x-auto scrollbar-dark">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-2">Référence</th>
                        <th className="py-3 px-2">Client</th>
                        <th className="py-3 px-2">Mode Paiement</th>
                        <th className="py-3 px-2">Montant</th>
                        <th className="py-3 px-2 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80 text-xs font-bold text-slate-700">
                      {recentCommandes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                            Aucune commande récente.
                          </td>
                        </tr>
                      ) : (
                        recentCommandes.map((cmd) => {
                          const clientName = cmd.client?.user ? fullName(cmd.client.user.nom, cmd.client.user.prenom) : "Client";
                          return (
                            <tr key={cmd.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-2 font-mono font-black text-slate-900">
                                #{cmd.numero_commande || cmd.id}
                              </td>
                              <td className="py-3.5 px-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-[#1A2E5A]/10 text-[#1A2E5A] flex items-center justify-center font-black text-[11.5px]">
                                    {clientName[0] || "C"}
                                  </div>
                                  <span className="truncate max-w-[130px]">{clientName}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-2 text-slate-500 font-extrabold uppercase text-[12.5px]">
                                {cmd.devise_paiement || "MoMo / Airtel"}
                              </td>
                              <td className="py-3.5 px-2 font-black text-slate-900">
                                {formatMontant(cmd.montant_total)}
                              </td>
                              <td className="py-3.5 px-2 text-right">
                                <StatutCommandeBadge value={cmd.statut_commande} />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT 4 COLUMNS: WIDGETS SIDEBAR (ZANDO PAY CARD & RAPID APPROVALS) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Widget 1: Trésorerie du mois */}
              <div className="surface-card rounded-2xl p-6 border border-slate-200/80 shadow-premium-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Trésorerie</h3>
                  <MoreVertical size={16} className="text-slate-400" />
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#1A2E5A] via-[#101c38] to-[#060c1a] p-5 text-white shadow-xl">
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/5 blur-lg pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#F1A105]">ZANDO NA NDAKO</span>
                  </div>

                  <div className="mt-6 space-y-1">
                    <p className="text-[11.5px] font-bold text-white/50 uppercase tracking-widest">Chiffre d&apos;affaires du mois</p>
                    <p className="font-mono text-2xl font-black text-white">
                      {formatMontant(data.revenus.ce_mois)}
                    </p>
                  </div>

                  <p className="mt-5 text-[12.5px] text-white/60 font-bold">Commandes livrées, mois en cours</p>
                </div>

                {/* Lien vers les retraits vendeurs / livreurs */}
                <Link
                  href="/admin/retraits"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1A2E5A] hover:bg-[#26407a] text-white py-3 text-xs font-black transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Gérer les retraits vendeurs / livreurs</span>
                </Link>
              </div>

              {/* Widget 2: Donut Chart - Répartition des Commandes */}
              <div className="surface-card rounded-2xl p-6 border border-slate-200/80 shadow-premium-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Répartition des Commandes</h3>
                  <span className="text-[11.5px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Statuts</span>
                </div>

                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statutsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statutsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  {statutsData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-slate-700">{item.name}</span>
                      </div>
                      <span className="font-black text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget 3: Quick Action Approvals */}
              <div className="surface-card rounded-2xl p-6 border border-slate-200/80 shadow-premium-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Validations Rapides</h3>
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {(data.vendeurs_en_attente || 0) + (data.livreurs_en_attente || 0)} en attente
                  </span>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/admin/vendeurs?statut=en_attente"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 transition-colors border border-slate-100 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <Store size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Vendeurs Partenaires</p>
                        <p className="text-[12.5px] font-bold text-slate-400">{data.vendeurs_en_attente} dossiers KYC à valider</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-[#1A2E5A] transition-colors" />
                  </Link>

                  <Link
                    href="/admin/livreurs?statut=en_attente"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-violet-50/60 transition-colors border border-slate-100 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                        <Bike size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Flotte de Livreurs</p>
                        <p className="text-[12.5px] font-bold text-slate-400">{data.livreurs_en_attente} candidats en attente</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-[#1A2E5A] transition-colors" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
