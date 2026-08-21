"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle, Bell, ChevronDown, ChevronLeft, ChevronRight,
  ClipboardList, FileCheck, Gem, Headset, Home, LogOut,
  Settings, Star, Store, Tag, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { usePublicAuth } from "@/lib/public-auth-context";
import { useLanguage } from "@/lib/language-context";

interface VendorSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavSubItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavSubItem[];
}

export function VendorSidebar({ mobileOpen = false, onCloseMobile }: VendorSidebarProps) {
  const { user, logout } = usePublicAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    catalogue: true,
    activite: true,
  });

  const GROUPS: NavGroup[] = [
    {
      id: "catalogue",
      label: "Produits & Ventes",
      icon: Store,
      items: [
        { href: "/vendeur", label: t("vendorNav.home", "Tableau de bord"), icon: Home },
        { href: "/vendeur/produits", label: t("vendorNav.products", "Mes Produits"), icon: Tag },
        { href: "/vendeur/commandes", label: t("vendorNav.orders", "Commandes reçues"), icon: ClipboardList },
        { href: "/vendeur/revenus", label: t("vendorNav.revenue", "Revenus & Retraits"), icon: Gem },
      ],
    },
    {
      id: "activite",
      label: "Gestion & Support",
      icon: Star,
      items: [
        { href: "/vendeur/notifications", label: t("vendorNav.notifications", "Notifications"), icon: Bell },
        { href: "/vendeur/avis", label: t("vendorNav.reviews", "Avis clients"), icon: Star },
        { href: "/vendeur/documents", label: t("vendorNav.documents", "Mes Documents KYC"), icon: FileCheck },
        { href: "/vendeur/litiges", label: t("vendorNav.disputes", "Litiges"), icon: AlertTriangle },
        { href: "/vendeur/support", label: t("vendorNav.support", "Support Zando"), icon: Headset },
        { href: "/vendeur/parametres", label: t("settings.title", "Réglages boutique"), icon: Settings },
      ],
    },
  ];

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const sidebarContent = (
    <div
      className={`admin-sidebar-bg relative flex flex-col h-full overflow-hidden ring-1 ring-white/[0.08] scrollbar-dark shadow-[0_30px_60px_-20px_rgba(6,12,26,0.7)] transition-all duration-300 ${
        collapsed ? "w-[76px]" : "w-[285px]"
      }`}
    >
      {/* Luminescences décoratives néon */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-10 h-56 w-56 rounded-full bg-[#e01313]/20 blur-[70px] animate-float-slow" />
        <div className="absolute bottom-16 -right-16 h-64 w-64 rounded-full bg-amber-500/15 blur-[80px] animate-float" />
      </div>

      {/* Header Logo & Collapsible button */}
      <div className={`relative flex ${collapsed ? "flex-col items-center gap-3 px-3 py-5" : "items-center justify-between px-5 py-5"}`}>
        {!collapsed && (
          <div className="min-w-0">
            <Link href="/vendeur" className="flex items-center gap-2">
              <Logo size="md" showSubtitle={false} theme="dark" className="!gap-2.5" />
            </Link>

            <div className="flex items-center gap-2 mt-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <p className="text-[11px] text-white/50 font-black tracking-widest uppercase">Espace Vendeur</p>
            </div>
          </div>
        )}

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-amber-300 ring-1 ring-white/10 shadow-lg hover:bg-white/[0.12] transition-all cursor-pointer"
            title="Déplier le menu"
          >
            <Store size={20} />
          </button>
        )}

        <button
          onClick={() => (onCloseMobile ? onCloseMobile() : setCollapsed(!collapsed))}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-white/60 hover:bg-white/[0.14] hover:text-white transition-all cursor-pointer"
          title={collapsed ? "Déplier le menu" : "Réduire le menu"}
        >
          {onCloseMobile ? <X size={18} /> : collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="h-px mx-5 bg-gradient-to-r from-white/15 via-white/10 to-transparent" />

      {/* Main Navigation Accordions */}
      <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto scrollbar-dark">
        {GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = !!openGroups[group.id];
          const hasActiveChild = group.items.some((item) => pathname === item.href);

          if (collapsed) {
            return (
              <div key={group.id} className="space-y-1">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl mx-auto transition-all duration-200 ${
                    hasActiveChild ? "bg-[#e01313] text-white shadow-lg scale-105" : "text-white/40 hover:bg-white/[0.08] hover:text-white"
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
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-[11.5px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                  hasActiveChild ? "text-white bg-white/[0.06]" : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GroupIcon size={15} strokeWidth={2.2} className={hasActiveChild ? "text-amber-400" : "text-white/40"} />
                  <span className="truncate">{group.label}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-white" : "text-white/30"}`}
                />
              </button>

              {isOpen && (
                <div className="px-2 pb-2 space-y-0.5 border-t border-white/[0.04] pt-1">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onCloseMobile}
                        className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 ${
                          active
                            ? "bg-gradient-to-r from-[#e01313] to-[#b00f0f] text-white shadow-md shadow-red-950/40 translate-x-0.5"
                            : "text-white/60 hover:bg-white/[0.08] hover:text-white hover:translate-x-0.5"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3.5 bg-amber-400 rounded-r-full shadow-[0_0_6px_#f59e0b]" />
                        )}
                        <ItemIcon size={15} strokeWidth={2.1} className={`shrink-0 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-white/40 group-hover:text-white/80"}`} />
                        <span className="flex-1 truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Profil & Déconnexion */}
      <div className="px-3.5 py-3 shrink-0 border-t border-white/10">
        {!collapsed ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/[0.06] p-2.5 border border-white/10">
              <div className="h-8 w-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-xs border border-amber-400/30">
                {user?.nom_complet?.[0]?.toUpperCase() || "V"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">{user?.nom_complet}</p>
                <p className="text-[10px] text-white/50 truncate font-bold">{user?.email || "Boutique Partenaire"}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-500/15 hover:bg-red-600 border border-red-500/20 px-3.5 py-2 text-xs font-black text-red-400 hover:text-white transition-all cursor-pointer"
            >
              <LogOut size={15} />
              <span>{t("vendorNav.logout", "Déconnexion")}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/15 text-red-400 hover:bg-red-600 hover:text-white mx-auto transition-all cursor-pointer"
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop Fixe */}
      <aside className={`hidden lg:flex fixed top-3 left-3 z-40 h-[calc(100vh-1.5rem)] rounded-3xl overflow-hidden transition-all duration-300 ${collapsed ? "w-[76px]" : "w-[285px]"}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col z-50 p-2">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
