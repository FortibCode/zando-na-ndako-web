"use client";

import { useState } from "react";
import { TrendingUp, ShoppingBag, UserPlus, Bike, BarChart3 } from "lucide-react";
import { AdminPageHeader } from "@/components/AdminTable";
import { ErrorBlock } from "@/components/Spinner";
import { formatMontant } from "@/lib/format";
import { useDashboardSection, type PeriodSelection } from "@/lib/useDashboardSection";
import type {
  DashboardOverview,
  DashboardSales,
  DashboardOrders,
  DashboardProducts,
  DashboardPayments,
  DashboardCustomers,
  DashboardVendors,
  DashboardDeliveries,
  DashboardSegments,
  ActivityItem,
} from "@/lib/types";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KpiCardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { OrdersStatusChart } from "@/components/dashboard/OrdersStatusChart";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { PaymentMethodsChart } from "@/components/dashboard/PaymentMethodsChart";
import { CustomerStats } from "@/components/dashboard/CustomerStats";
import { VendorStats } from "@/components/dashboard/VendorStats";
import { DeliveryStats } from "@/components/dashboard/DeliveryStats";
import { SegmentsPanel } from "@/components/dashboard/SegmentsPanel";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

function defaultPeriod(): PeriodSelection {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return { period: "7d", start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export default function StatistiquesPage() {
  const [period, setPeriod] = useState<PeriodSelection>(defaultPeriod);

  const overview = useDashboardSection<DashboardOverview>("overview", period);
  const sales = useDashboardSection<DashboardSales>("sales", period);
  const orders = useDashboardSection<DashboardOrders>("orders", period);
  const products = useDashboardSection<DashboardProducts>("products", period, 10);
  const payments = useDashboardSection<DashboardPayments>("payments", period);
  const customers = useDashboardSection<DashboardCustomers>("customers", period);
  const vendors = useDashboardSection<DashboardVendors>("vendors", period, 8);
  const deliveries = useDashboardSection<DashboardDeliveries>("deliveries", period);
  const segments = useDashboardSection<DashboardSegments>("segments", period);
  // L'activité récente n'est pas filtrée par période (c'est un flux "temps réel") — période fixe
  // pour ne pas la re-charger inutilement à chaque changement de filtre.
  const activity = useDashboardSection<ActivityItem[]>("activity", { period: "7d", start: "", end: "" }, 12);

  return (
    <div className="space-y-7 animate-fade-in">
      <AdminPageHeader
        title="Statistiques & analytics"
        description="Vue d'ensemble des performances de la plateforme — ventes, commandes, clients, vendeurs et livraisons."
        icon={BarChart3}
        action={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      {/* KPI row */}
      {overview.error ? (
        <ErrorBlock message={overview.error} onRetry={overview.reload} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {overview.loading || !overview.data ? (
            <>
              <KpiCardSkeleton />
              <KpiCardSkeleton />
              <KpiCardSkeleton />
              <KpiCardSkeleton />
            </>
          ) : (
            <>
              <KpiCard
                icon={TrendingUp}
                accent="green"
                label="Chiffre d'affaires"
                value={formatMontant(overview.data.chiffre_affaires.valeur)}
                evolutionPct={overview.data.chiffre_affaires.evolution_pct}
              />
              <KpiCard
                icon={ShoppingBag}
                accent="navy"
                label="Commandes"
                value={overview.data.commandes.valeur}
                evolutionPct={overview.data.commandes.evolution_pct}
              />
              <KpiCard
                icon={UserPlus}
                accent="red"
                label="Nouveaux clients"
                value={overview.data.nouveaux_clients.valeur}
                evolutionPct={overview.data.nouveaux_clients.evolution_pct}
              />
              <KpiCard
                icon={Bike}
                accent="gold"
                label="Livraisons"
                value={overview.data.livraisons.valeur}
                evolutionPct={overview.data.livraisons.evolution_pct}
              />
            </>
          )}
        </div>
      )}

      {/* Évolution des ventes + commandes par statut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={sales.data} loading={sales.loading} error={sales.error} onRetry={sales.reload} />
        </div>
        <OrdersStatusChart data={orders.data} loading={orders.loading} error={orders.error} onRetry={orders.reload} />
      </div>

      {/* Produits les plus vendus + modes de paiement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopProducts data={products.data} loading={products.loading} error={products.error} onRetry={products.reload} />
        </div>
        <PaymentMethodsChart data={payments.data} loading={payments.loading} error={payments.error} onRetry={payments.reload} />
      </div>

      {/* Clients + Vendeurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerStats data={customers.data} loading={customers.loading} error={customers.error} onRetry={customers.reload} />
        <VendorStats data={vendors.data} loading={vendors.loading} error={vendors.error} onRetry={vendors.reload} />
      </div>

      {/* Diaspora vs locale + zones */}
      <SegmentsPanel data={segments.data} loading={segments.loading} error={segments.error} onRetry={segments.reload} />

      {/* Livraisons + Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeliveryStats data={deliveries.data} loading={deliveries.loading} error={deliveries.error} onRetry={deliveries.reload} />
        <RecentActivity data={activity.data} loading={activity.loading} error={activity.error} onRetry={activity.reload} />
      </div>
    </div>
  );
}
