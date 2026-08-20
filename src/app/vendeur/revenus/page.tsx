"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, Send, TrendingUp, Wallet } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/Button";
import { LoadingBlock } from "@/components/Spinner";
import { Badge } from "@/components/Badge";
import {
  ApiError,
  demanderVendeurRetrait,
  fetchVendeurRetraits,
  fetchVendeurRevenus,
  type RetraitVendeur,
  type VendeurRevenus,
} from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

function formatFcfa(value: number | string) {
  return `${Math.round(Number(value)).toLocaleString('fr-FR')} FCFA`;
}

const RETRAIT_STATUT_TONE: Record<string, "gold" | "green" | "red"> = { en_attente: "gold", valide: "green", rejete: "red" };

export default function VendeurRevenusPage() {
  const { t } = useLanguage();
  const METHODE_OPTIONS = [
    { id: "mtn_momo" as const, label: t("vendor.revenus.methodMtn", "MTN Mobile Money") },
    { id: "airtel_money" as const, label: t("vendor.revenus.methodAirtel", "Airtel Money") },
    { id: "virement" as const, label: t("vendor.revenus.methodBank", "Virement bancaire") },
  ];
  const RETRAIT_STATUT_LABEL: Record<string, string> = {
    en_attente: t("vendor.revenus.statusPending", "En attente"),
    valide: t("vendor.revenus.statusValidated", "Validé"),
    rejete: t("vendor.revenus.statusRejected", "Rejeté"),
  };
  const [data, setData] = useState<VendeurRevenus | null>(null);
  const [retraits, setRetraits] = useState<RetraitVendeur[]>([]);
  const [loading, setLoading] = useState(true);

  const [montant, setMontant] = useState("");
  const [methode, setMethode] = useState<typeof METHODE_OPTIONS[number]["id"]>("mtn_momo");
  const [numero, setNumero] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = () => {
    Promise.all([fetchVendeurRevenus(), fetchVendeurRetraits()])
      .then(([revenus, list]) => { setData(revenus); setRetraits(list); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingBlock label={t("vendor.revenus.loading", "Chargement de vos revenus…")} />;
  if (!data) return <p className="text-sm text-slate-500">{t("vendor.revenus.loadError", "Impossible de charger vos revenus.")}</p>;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!montant || !numero.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const created = await demanderVendeurRetrait({ montant: Number(montant), methode_retrait: methode, numero_reception: numero.trim() });
      setRetraits((prev) => [created, ...prev]);
      setMontant("");
      setNumero("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("vendor.revenus.submitError", "Impossible de soumettre la demande."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title={t("vendor.revenus.title", "Revenus")} description={t("vendor.revenus.subtitle", "Suivez vos ventes et gérez vos retraits.")} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t("vendor.revenus.statAvailableBalance", "Solde disponible")} value={formatFcfa(data.solde_disponible)} accent="gold" icon={<Wallet className="h-5 w-5" />} />
        <StatCard label={t("vendor.revenus.statGrossRevenue", "Revenus bruts (mois)")} value={formatFcfa(data.revenus_bruts)} accent="navy" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label={t("vendor.revenus.statCommissions", "Commissions")} value={formatFcfa(data.commissions)} accent="red" />
        <StatCard label={t("vendor.revenus.statNetRevenue", "Revenus nets (mois)")} value={formatFcfa(data.revenus_nets)} accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white">
          <p className="text-sm font-black text-slate-900 mb-4">{t("vendor.revenus.salesChartTitle", "Ventes des 7 derniers jours")}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.ventes_semaine}>
              <XAxis dataKey="jour" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v) => formatFcfa(Number(v))} />
              <Bar dataKey="montant" fill="#0B2545" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white">
          <p className="text-sm font-black text-slate-900 mb-4">{t("vendor.revenus.topProductsTitle", "Produits les plus vendus")}</p>
          {data.produits_plus_vendus.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">{t("vendor.revenus.noSales", "Aucune vente livrée pour le moment.")}</p>
          ) : (
            <div className="space-y-2.5">
              {data.produits_plus_vendus.map((p, i) => (
                <div key={p.nom} className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-700">{i + 1}. {p.nom}</span>
                  <span className="text-slate-500 font-semibold">{p.ventes} {t("vendor.revenus.soldSuffix", "vendus")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleWithdraw} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 h-fit">
          <p className="text-sm font-black text-slate-900">{t("vendor.revenus.withdrawFormTitle", "Demander un retrait")}</p>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t("vendor.revenus.amountLabel", "Montant (FCFA)")}</label>
            <input required type="number" min="1" value={montant} onChange={(e) => setMontant(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t("vendor.revenus.methodLabel", "Méthode")}</label>
            <select value={methode} onChange={(e) => setMethode(e.target.value as typeof methode)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0B2545]">
              {METHODE_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t("vendor.revenus.receptionNumberLabel", "Numéro de réception")}</label>
            <input required value={numero} onChange={(e) => setNumero(e.target.value)} placeholder={t("vendor.revenus.receptionNumberPlaceholder", "Numéro mobile money ou RIB")}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <Button type="submit" variant="primary" disabled={submitting} className="w-full !py-2.5">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {success ? t("vendor.revenus.submittedBtn", "Demande envoyée !") : t("vendor.revenus.submitBtn", "Soumettre la demande")}
          </Button>
        </form>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white">
          <p className="text-sm font-black text-slate-900 mb-4">{t("vendor.revenus.withdrawHistoryTitle", "Historique des retraits")}</p>
          {retraits.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">{t("vendor.revenus.noWithdrawals", "Aucune demande de retrait.")}</p>
          ) : (
            <div className="space-y-2.5">
              {retraits.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold text-slate-800">{formatFcfa(r.montant)}</p>
                    <p className="text-xs text-slate-400">{new Date(r.date_demande).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <Badge tone={RETRAIT_STATUT_TONE[r.statut] || "gray"}>{RETRAIT_STATUT_LABEL[r.statut] || r.statut}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
