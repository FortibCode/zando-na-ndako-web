"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Package, Search } from "lucide-react";
import { useRequirePublicAuth } from "@/lib/use-require-public-auth";
import { fetchClientCommandes, type ApiCommande } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { clientTranslations } from "@/i18n/client-translations";
import type { Language } from "@/i18n/translations";

type Tab = "tous" | "termines" | "en_cours" | "annules";

function statusLabel(statut: string, language: Language): { label: string; className: string } {
  const c = clientTranslations[language].mesCommandes;
  if (statut === "livree") return { label: c.statusDelivered, className: "bg-emerald-50 text-emerald-700" };
  if (statut === "annulee") return { label: c.statusCancelled, className: "bg-red-50 text-red-600" };
  return { label: c.statusOngoing, className: "bg-blue-50 text-[#0B2545]" };
}

export default function OrdersPage() {
  const { t, language } = useLanguage();
  const { user, isReady } = useRequirePublicAuth();
  const [orders, setOrders] = useState<ApiCommande[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("tous");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchClientCommandes()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    let list = orders;
    if (tab === "termines") list = list.filter((o) => o.statut_commande === "livree");
    if (tab === "annules") list = list.filter((o) => o.statut_commande === "annulee");
    if (tab === "en_cours") list = list.filter((o) => !["livree", "annulee"].includes(o.statut_commande));
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((o) => o.numero_commande.toLowerCase().includes(q));
    return list;
  }, [orders, tab, query]);

  if (!isReady || !user) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">{t('client.mesCommandes.title', 'Mes commandes')}</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('client.mesCommandes.searchPlaceholder', 'Rechercher par numéro de commande…')}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0B2545]"
        />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {([
          ["tous", t('client.mesCommandes.tabAll', 'Toutes')],
          ["en_cours", t('client.mesCommandes.tabOngoing', 'En cours')],
          ["termines", t('client.mesCommandes.tabDone', 'Terminées')],
          ["annules", t('client.mesCommandes.tabCancelled', 'Annulées')],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`shrink-0 h-9 px-4 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              tab === key ? "bg-[#0B2545] text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">{t('client.mesCommandes.emptyTitle', 'Aucune commande pour le moment')}</p>
          <Link href="/" className="mt-4 text-xs font-extrabold text-[#0B2545] hover:underline">{t('client.mesCommandes.discoverMarket', 'Découvrir le marché')}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const status = statusLabel(o.statut_commande, language);
            return (
              <Link
                key={o.id}
                href={`/mes-commandes/${o.id}`}
                className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="text-sm font-black text-slate-900">{o.numero_commande}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(o.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-[#0B2545]">{Math.round(Number(o.montant_total)).toLocaleString('fr-FR')} FCFA</span>
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${status.className}`}>{status.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
