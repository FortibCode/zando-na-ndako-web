"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Globe2,
  Store,
  Bike,
  ClipboardList,
  Tags,
  Images,
  Flag,
  Package,
  Boxes,
  Truck,
  MapPinned,
  MapPin,
  Route,
  ShieldAlert,
  ShieldCheck,
  Settings,
  KeyRound,
  ScrollText,
  TrendingUp,
  BarChart3,
  Receipt,
  Landmark,
  RotateCcw,
  Wallet,
  Megaphone,
  Ticket,
  Bell,
  LifeBuoy,
  FileDown,
  ArrowLeftRight,
  MessageSquareWarning,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useHasRole } from "@/lib/usePermission";
import { useAuth } from "@/lib/auth-context";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { api } from "@/lib/api";
import type { ApiEnvelope, DashboardAlerts } from "@/lib/types";


const TOP_ITEM = { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard };

export interface NavSubItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: keyof Omit<DashboardAlerts, "total">;
  requirePermission?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  requireRole?: string;
  items: NavSubItem[];
}

const GROUPS: NavGroup[] = [
  {
    id: "acteurs",
    label: "Gestion des Acteurs",
    icon: Users,
    items: [
      { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, requirePermission: "view_users" },
      { href: "/admin/clients", label: "Clients locaux", icon: UserCircle, requirePermission: "view_users" },
      { href: "/admin/diaspora", label: "Clientèle Diaspora", icon: Globe2, requirePermission: "view_users" },
      { href: "/admin/vendeurs", label: "Vendeurs partenaires", icon: Store, badgeKey: "vendeurs_en_attente", requirePermission: "view_vendeurs" },
      { href: "/admin/livreurs", label: "Flotte de Livreurs", icon: Bike, badgeKey: "livreurs_en_attente", requirePermission: "view_livreurs" },
    ],
  },
  {
    id: "catalogue",
    label: "Ventes & Catalogue",
    icon: Package,
    items: [
      { href: "/admin/produits", label: "Produits", icon: Package, requirePermission: "view_all_produits" },
      { href: "/admin/stock", label: "Stock & Ruptures", icon: Boxes, badgeKey: "produits_rupture", requirePermission: "view_all_produits" },
      { href: "/admin/categories", label: "Catégories", icon: Tags },
      { href: "/admin/types-boutique", label: "Types de boutique", icon: Images, requirePermission: "view_types_boutique" },
      { href: "/admin/zones", label: "Zones de livraison", icon: MapPin, requirePermission: "view_zones" },
    ],
  },
  {
    id: "logistique",
    label: "Commandes & Logistique",
    icon: Truck,
    items: [
      { href: "/admin/commandes", label: "Commandes", icon: ClipboardList, badgeKey: "commandes_en_retard", requirePermission: "view_all_commandes" },
      { href: "/admin/livraisons", label: "Livraisons & Expeditions", icon: Truck, requirePermission: "view_livraisons" },
      { href: "/admin/attribution", label: "Dispatch & Attribution", icon: Route, requirePermission: "assign_commandes" },
      { href: "/admin/carte", label: "Carte GPS Temps Réel", icon: MapPinned, requirePermission: "view_livraisons" },
    ],
  },
  {
    id: "tresorerie",
    label: "Finances & Trésorerie",
    icon: TrendingUp,
    items: [
      { href: "/admin/finances", label: "Finances", icon: TrendingUp, badgeKey: "paiements_en_attente", requirePermission: "view_finances" },
      { href: "/admin/statistiques", label: "Statistiques & Analytics", icon: BarChart3 },
      { href: "/admin/transactions", label: "Transactions", icon: Receipt, requirePermission: "view_finances" },
      { href: "/admin/commissions", label: "Commissions", icon: Landmark, requirePermission: "view_finances" },
      { href: "/admin/retraits", label: "Demandes de Retrait", icon: Wallet, requirePermission: "manage_retraits" },
      { href: "/admin/remboursements", label: "Remboursements", icon: RotateCcw, requirePermission: "view_finances" },
      { href: "/admin/rapports", label: "Rapports & Exports", icon: FileDown, requirePermission: "generate_reports" },
      { href: "/admin/taux-change", label: "Taux de change", icon: ArrowLeftRight, requirePermission: "view_taux_change" },
    ],
  },
  {
    id: "support",
    label: "Support & Litiges",
    icon: LifeBuoy,
    items: [
      { href: "/admin/tickets", label: "Tickets d'assistance", icon: LifeBuoy, requirePermission: "view_tickets" },
      { href: "/admin/litiges", label: "Arbitrage des Litiges", icon: ShieldAlert, badgeKey: "litiges_ouverts", requirePermission: "view_litiges" },
      { href: "/admin/avis", label: "Modération des avis", icon: MessageSquareWarning, requirePermission: "view_avis" },
      { href: "/admin/litige-motifs", label: "Motifs de litige", icon: Flag, requirePermission: "view_litige_motifs" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing & Offres",
    icon: Megaphone,
    items: [
      { href: "/admin/promotions", label: "Promotions", icon: Megaphone, requirePermission: "view_promotions" },
      { href: "/admin/coupons", label: "Coupons de réduction", icon: Ticket, requirePermission: "view_coupons" },
      { href: "/admin/notifications", label: "Notifications Push/SMS", icon: Bell, requirePermission: "view_notifications" },
    ],
  },
  {
    id: "systeme",
    label: "Système & Audit",
    icon: ShieldCheck,
    requireRole: "super_admin",
    items: [
      { href: "/admin/parametres", label: "Paramètres plateforme", icon: Settings },
      { href: "/admin/administrateurs", label: "Équipe Administrateurs", icon: ShieldCheck },
      { href: "/admin/roles", label: "Rôles & Permissions", icon: KeyRound },
      { href: "/admin/logs", label: "Journaux d'Audit", icon: ScrollText },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const isSuperAdmin = useHasRole("super_admin");
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  // Query live alerts to populate notification badges inside navigation items
  const { data: alerts } = useQuery({
    queryKey: ["admin-dashboard-alerts"],
    queryFn: async () => (await api.get<ApiEnvelope<DashboardAlerts>>("/admin/dashboard/alerts")).data,
    refetchInterval: 60_000,
  });

  // Un item sans requirePermission (ex. Catégories, Statistiques) est visible par tout admin —
  // les autres ne s'affichent que si le compte connecté a la permission backend correspondante,
  // pour ne pas exposer un lien menant systématiquement à un 403.
  const permissions = user?.administrateur?.permissions ?? [];
  const hasPermission = (p?: string) => !p || permissions.includes("*") || permissions.includes(p);

  const visibleGroups = GROUPS.filter(
    (g) => !g.requireRole || (g.requireRole === "super_admin" && isSuperAdmin)
  )
    .map((g) => ({ ...g, items: g.items.filter((item) => hasPermission(item.requirePermission)) }))
    .filter((g) => g.items.length > 0);

  // Auto-expand group containing active route on location change
  useEffect(() => {
    visibleGroups.forEach((g) => {
      const containsActive = g.items.some((item) => pathname.startsWith(item.href));
      if (containsActive) {
        setOpenGroups((prev) => ({ ...prev, [g.id]: true }));
      }
    });
  }, [pathname, isSuperAdmin]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isTopActive = pathname === "/admin";

  return (
    <aside
      className={`admin-sidebar-bg relative hidden md:flex shrink-0 flex-col m-3 h-[calc(100vh-1.5rem)] sticky top-3 rounded-3xl overflow-hidden ring-1 ring-white/[0.08] scrollbar-dark shadow-[0_30px_60px_-20px_rgba(6,12,26,0.7),0_10px_24px_-8px_rgba(6,12,26,0.35)] transition-all duration-300 z-30 ${
        collapsed ? "w-[76px]" : "w-[295px]"
      }`}
    >
      {/* Ambient decorative glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-10 h-56 w-56 rounded-full bg-[#C00000]/25 blur-[70px] animate-float-slow" />
        <div className="absolute bottom-16 -right-16 h-64 w-64 rounded-full bg-[#26407a]/40 blur-[80px] animate-float" />
      </div>

      {/* Header Logo */}
      <div className={`relative flex ${collapsed ? "flex-col items-center gap-3 px-3 py-5" : "items-center justify-between px-5 py-5.5"}`}>
        {!collapsed && (
          <div className="min-w-0 animate-fade-in">
            <Logo size="md" showSubtitle={false} theme="dark" className="!gap-2.5" />
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F1A105] shadow-[0_0_6px_#F1A105]" />
              <p className="text-[11.5px] text-white/40 font-black tracking-widest uppercase">Espace Admin</p>
            </div>
          </div>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="shine-effect flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/10 shadow-lg transition-all hover:bg-white/[0.12] hover:scale-105 cursor-pointer"
            title="Déplier la sidebar"
          >
            <img
              src="/logo-icon.png"
              alt="Zando na Ndako"
              className="h-full w-full rounded-full object-cover"
            />
          </button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-white/60 hover:bg-white/[0.14] hover:text-white hover:shadow-[0_0_0_4px_rgba(255,255,255,0.07)] active:scale-90 transition-all cursor-pointer"
          title={collapsed ? "Déplier la sidebar" : "Réduire la sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="h-px mx-5 bg-linear-to-r from-white/15 via-white/10 to-transparent" />

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto scrollbar-dark">
        {/* Top Item: Dashboard */}
        <div>
          <Link
            href={TOP_ITEM.href}
            className={`shine-effect group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-black transition-all duration-200 ${
              isTopActive
                ? "text-white scale-[1.02]"
                : "text-white/55 hover:bg-white/[0.08] hover:text-white"
            }`}
            title={collapsed ? TOP_ITEM.label : undefined}
          >
            {isTopActive && (
              <span
                className="absolute inset-0 rounded-2xl bg-linear-to-r from-[#C00000] via-[#aa0000] to-[#8f0000] animate-[gradient-shift_4s_ease_infinite] shadow-[0_4px_20px_-2px_rgba(192,0,0,0.55)]"
                style={{ backgroundSize: "200% 100%" }}
                aria-hidden
              />
            )}
            {isTopActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] h-5 bg-[#F1A105] rounded-r-full shadow-[0_0_8px_rgba(241,161,5,0.8)]" />}
            <LayoutDashboard size={18} strokeWidth={2.2} className={`relative shrink-0 transition-transform duration-200 group-hover:scale-110 ${isTopActive ? "text-white" : "text-white/40 group-hover:text-white/80"}`} />
            {!collapsed && <span className="relative flex-1 truncate">{TOP_ITEM.label}</span>}
          </Link>
        </div>

        {/* Group Accordions */}
        {visibleGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = !!openGroups[group.id];
          const hasActiveChild = group.items.some((item) => pathname.startsWith(item.href));

          // Calculate total alerts for group title badge
          const groupAlertCount = group.items.reduce((sum, item) => {
            if (item.badgeKey && alerts && typeof alerts[item.badgeKey] === "number") {
              return sum + (alerts[item.badgeKey] as number);
            }
            return sum;
          }, 0);

          if (collapsed) {
            return (
              <div key={group.id} className="space-y-1">
                <div
                  className={`shine-effect flex h-10 w-10 items-center justify-center rounded-2xl mx-auto transition-all duration-200 ${
                    hasActiveChild ? "bg-[#C00000] text-white shadow-lg shadow-red-950/50 scale-105" : "text-white/40 hover:bg-white/[0.08] hover:text-white/80 hover:scale-105"
                  }`}
                  title={group.label}
                >
                  <GroupIcon size={18} />
                </div>
              </div>
            );
          }

          return (
            <div key={group.id} className="rounded-2xl bg-white/[0.02] border border-white/[0.04] overflow-hidden transition-all duration-200">
              {/* Accordion Group Header Button */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`shine-effect w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-[12.5px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                  hasActiveChild ? "text-white bg-white/[0.06]" : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GroupIcon size={15} strokeWidth={2.2} className={hasActiveChild ? "text-[#F1A105]" : "text-white/40"} />
                  <span className="truncate">{group.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {groupAlertCount > 0 && (
                    <span className="rounded-full bg-[#C00000] text-white px-1.5 py-0.5 text-[11px] font-black leading-none">
                      {groupAlertCount}
                    </span>
                  )}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-white" : "text-white/30"}`}
                  />
                </div>
              </button>

              {/* Accordion Sub-items */}
              {isOpen && (
                <div className="px-2 pb-2 space-y-0.5 animate-fade-in border-t border-white/[0.04] pt-1">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = pathname.startsWith(item.href);
                    const alertVal = item.badgeKey && alerts ? (alerts[item.badgeKey] as number) : 0;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`shine-effect group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 ${
                          active
                            ? "bg-linear-to-r from-[#C00000] to-[#8f0000] text-white shadow-md shadow-red-950/40 translate-x-0.5"
                            : "text-white/55 hover:bg-white/[0.08] hover:text-white hover:translate-x-0.5"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3.5 bg-[#F1A105] rounded-r-full shadow-[0_0_6px_#F1A105]" />
                        )}
                        <ItemIcon size={15} strokeWidth={2.1} className={`shrink-0 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-white/40 group-hover:text-white/80"}`} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {alertVal > 0 && (
                          <span className="shrink-0 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 px-1.5 py-0.2 font-black text-[11.5px]">
                            {alertVal}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Footer Status & Logout */}
      <div className="px-3.5 py-3 animate-fade-in shrink-0">
        <div className="h-px mb-3 bg-linear-to-r from-white/15 via-white/10 to-transparent" />
        
        {!collapsed ? (
          <div className="space-y-2">
            <div className="glass-dark flex items-center gap-2.5 rounded-2xl px-3 py-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              </span>
              <p className="text-[12px] text-white/60 font-extrabold truncate">Système opérationnel · Brazzaville</p>
            </div>

            <button
              onClick={() => setConfirmLogoutOpen(true)}
              className="shine-effect w-full flex items-center justify-between gap-2.5 rounded-2xl bg-red-500/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 px-3.5 py-2 text-xs font-black text-red-400 hover:text-white transition-all duration-200 cursor-pointer group shadow-sm active:scale-98"
            >
              <div className="flex items-center gap-2">
                <LogOut size={15} className="group-hover:rotate-12 transition-transform" />
                <span>Déconnexion</span>
              </div>
              <span className="text-[11.5px] bg-red-950/60 text-red-300 group-hover:bg-white/20 group-hover:text-white px-1.5 py-0.5 rounded-md font-bold">Quitter</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLogoutOpen(true)}
            className="shine-effect flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/15 text-red-400 hover:bg-red-600 hover:text-white hover:scale-105 mx-auto transition-all cursor-pointer shadow-sm"
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      {confirmLogoutOpen && (
        <ConfirmDialog
          title="Confirmer la déconnexion"
          message="Êtes-vous sûr de vouloir vous déconnecter de l'espace d’administration Zando na Ndako ?"
          confirmLabel="Se déconnecter"
          danger
          onConfirm={() => { setConfirmLogoutOpen(false); logout(); }}
          onClose={() => setConfirmLogoutOpen(false)}
        />
      )}
    </aside>
  );
}
