"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Package, PackageX, ShoppingBag, Star, Wallet } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LoadingBlock } from "@/components/Spinner";
import { fetchVendeurDashboard, type VendeurDashboard } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

function formatFcfa(value: number | string) {
  return `${Math.round(Number(value)).toLocaleString('fr-FR')} FCFA`;
}

export default function VendeurDashboardPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<VendeurDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendeurDashboard().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock label={t("vendor.dashboard.loading", "Chargement du tableau de bord…")} />;
  if (!data) return <p className="text-sm text-slate-500">{t("vendor.dashboard.loadError", "Impossible de charger votre tableau de bord.")}</p>;

  return (
    <div>
      <PageHeader title={`${t("vendor.dashboard.greeting", "Bonjour")}, ${data.nom_commerce}`} description={t("vendor.dashboard.subtitle", "Aperçu de votre boutique aujourd'hui.")} />

      {data.statut_validation !== "valide" && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6 text-sm font-bold text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {t("vendor.dashboard.notValidatedPrefix", "Votre boutique n'est pas encore validée (")}{data.statut_validation}{t("vendor.dashboard.notValidatedSuffix", "). Certaines fonctionnalités peuvent être limitées.")}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t("vendor.dashboard.statOrdersToday", "Commandes aujourd'hui")} value={data.commandes_aujourd_hui} accent="navy" icon={<ShoppingBag className="h-5 w-5" />} />
        <StatCard label={t("vendor.dashboard.statOrdersOngoing", "Commandes en cours")} value={data.commandes_en_cours} accent="gold" icon={<Clock className="h-5 w-5" />} />
        <StatCard label={t("vendor.dashboard.statOrdersDelivered", "Commandes livrées")} value={data.commandes_livrees} accent="green" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label={t("vendor.dashboard.statRevenueMonth", "Revenus du mois")} value={formatFcfa(data.revenus_mois)} accent="red" icon={<Wallet className="h-5 w-5" />} />
        <StatCard label={t("vendor.dashboard.statProductsOnline", "Produits en ligne")} value={data.produits_disponibles} hint={`${data.total_produits} ${t("vendor.dashboard.statTotalSuffix", "au total")}`} accent="navy" icon={<Package className="h-5 w-5" />} />
        <StatCard label={t("vendor.dashboard.statOutOfStock", "Ruptures de stock")} value={data.produits_rupture} accent={data.produits_rupture > 0 ? "red" : "green"} icon={<PackageX className="h-5 w-5" />} />
        <StatCard label={t("vendor.dashboard.statAvailableBalance", "Solde disponible")} value={formatFcfa(data.solde_disponible)} accent="gold" icon={<Wallet className="h-5 w-5" />} />
        <StatCard label={t("vendor.dashboard.statAvgRating", "Note moyenne")} value={data.note_moyenne ? Number(data.note_moyenne).toFixed(1) : "—"} accent="violet" icon={<Star className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/vendeur/produits/nouveau" className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 hover:shadow-sm transition-all">
          <Package className="h-6 w-6 text-[#0B2545] mb-2" />
          <p className="text-sm font-black text-slate-900">{t("vendor.dashboard.quickAddProductTitle", "Ajouter un produit")}</p>
          <p className="text-xs text-slate-500 mt-1">{t("vendor.dashboard.quickAddProductDesc", "Publiez un nouvel article dans votre boutique.")}</p>
        </Link>
        <Link href="/vendeur/commandes" className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 hover:shadow-sm transition-all">
          <ShoppingBag className="h-6 w-6 text-[#0B2545] mb-2" />
          <p className="text-sm font-black text-slate-900">{t("vendor.dashboard.quickOrdersTitle", "Gérer les commandes")}</p>
          <p className="text-xs text-slate-500 mt-1">{t("vendor.dashboard.quickOrdersDesc", "Acceptez ou refusez les commandes reçues.")}</p>
        </Link>
        <Link href="/vendeur/revenus" className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 hover:shadow-sm transition-all">
          <Wallet className="h-6 w-6 text-[#0B2545] mb-2" />
          <p className="text-sm font-black text-slate-900">{t("vendor.dashboard.quickWithdrawTitle", "Demander un retrait")}</p>
          <p className="text-xs text-slate-500 mt-1">{t("vendor.dashboard.quickWithdrawDesc", "Transférez votre solde disponible.")}</p>
        </Link>
      </div>
    </div>
  );
}
