"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown, ChevronLeft, ChevronRight, Compass, CreditCard, Globe,
  Grid3X3, Heart, LogOut, Package, Receipt, ShoppingCart, Sparkles, User, Users, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useCart } from "@/components/landing/cart-context";
import { usePublicAuth } from "@/lib/public-auth-context";
import { useLanguage } from "@/lib/language-context";
import { fetchCategoriesFromApi } from "@/lib/api";
import type { Category } from "@/components/landing/data";

interface ClientSidebarProps {
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

export function ClientSidebar({ mobileOpen = false, onCloseMobile }: ClientSidebarProps) {
  const { count } = useCart();
  const { user, logout } = usePublicAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<"FCFA" | "EUR" | "USD" | "GBP">("FCFA");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    navigation: true,
    diaspora: true,
    rayons: false,
  });

  useEffect(() => {
    fetchCategoriesFromApi().then(setCategories);
  }, []);

  const isDiaspora = user?.type_utilisateur === "client" && user?.est_diaspora === true;

  const GROUPS: NavGroup[] = [
    {
      id: "navigation",
      label: "Espace Client",
      icon: Compass,
      items: [
        { href: "/accueil", label: t("tabs.discover", "Découvrir"), icon: Compass },
        { href: "/produits", label: t("client.nav.products", "Catalogue Produits"), icon: Package },
        { href: "/categories", label: t("tabs.categories", "Catégories"), icon: Grid3X3 },
        { href: "/panier", label: t("tabs.cart", "Mon Panier"), icon: ShoppingCart, badge: count },
        { href: "/mes-commandes", label: t("tabs.orders", "Mes Commandes"), icon: Receipt },
        { href: "/favoris", label: t("client.favoris.title", "Mes Favoris"), icon: Heart },
        { href: "/mon-compte", label: t("tabs.profile", "Mon Profil"), icon: User },
      ],
    },
    ...(isDiaspora
      ? [
          {
            id: "diaspora",
            label: "Services Diaspora",
            icon: Globe,
            items: [
              { href: "/diaspora/beneficiaires", label: t("diaspora.beneficiaries", "Commander pour un proche"), icon: Users },
              { href: "/diaspora/beneficiaires", label: t("diaspora.manageProches", "Mes Proches au Congo"), icon: Globe },
              { href: "/diaspora/paiements", label: t("diaspora.paymentMethods", "Cartes Internationales"), icon: CreditCard },
            ],
          },
        ]
      : []),
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
        <div className="absolute -top-16 -left-10 h-56 w-56 rounded-full bg-[#0B2545]/40 blur-[70px] animate-float-slow" />
        <div className="absolute bottom-16 -right-16 h-64 w-64 rounded-full bg-amber-500/15 blur-[80px] animate-float" />
      </div>

      {/* Header Logo */}
      <div className={`relative flex ${collapsed ? "flex-col items-center gap-3 px-3 py-5" : "items-center justify-between px-5 py-5"}`}>
        {!collapsed && (
          <div className="min-w-0">
            <Link href={user ? "/accueil" : "/"} className="flex items-center gap-2">
              <Logo size="md" showSubtitle={true} theme="dark" className="!gap-2.5" />
            </Link>
          </div>
        )}

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-amber-300 ring-1 ring-white/10 shadow-lg hover:bg-white/[0.12] transition-all cursor-pointer"
            title="Déplier le menu"
          >
            <Compass size={20} />
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

      {/* Mode Diaspora & Sélecteur de devises */}
      {!collapsed && isDiaspora && (
        <div className="mx-3.5 my-3 rounded-2xl bg-white/[0.06] p-3 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-300 uppercase tracking-wide">
              <Globe className="h-3.5 w-3.5" /> Diaspora 🌍
            </span>
            <span className="rounded-full bg-amber-400/20 text-amber-300 px-2 py-0.5 text-[9.5px] font-black">
              {selectedCurrency}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
            {(["FCFA", "EUR", "USD", "GBP"] as const).map((devise) => (
              <button
                key={devise}
                onClick={() => setSelectedCurrency(devise)}
                className={`flex-1 py-1 rounded-lg text-[9.5px] font-black transition-all ${
                  selectedCurrency === devise
                    ? "bg-[#0B2545] text-amber-300 shadow-xs border border-white/10"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {devise === "EUR" ? "€" : devise === "USD" ? "$" : devise === "GBP" ? "£" : "FCFA"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Navigation Accordions */}
      <nav className="flex-1 px-3 py-3 space-y-3 overflow-y-auto scrollbar-dark">
        {GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = !!openGroups[group.id];
          const hasActiveChild = group.items.some((item) => pathname === item.href);

          if (collapsed) {
            return (
              <div key={group.id} className="space-y-1">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl mx-auto transition-all duration-200 ${
                    hasActiveChild ? "bg-[#0B2545] text-amber-300 shadow-lg scale-105 border border-white/10" : "text-white/40 hover:bg-white/[0.08] hover:text-white"
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
                        key={item.href + item.label}
                        href={item.href}
                        onClick={onCloseMobile}
                        className={`group relative flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 ${
                          active
                            ? "bg-gradient-to-r from-[#0B2545] to-[#134074] text-white shadow-md shadow-slate-950/40 translate-x-0.5 border border-white/10"
                            : "text-white/60 hover:bg-white/[0.08] hover:text-white hover:translate-x-0.5"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3.5 bg-amber-400 rounded-r-full shadow-[0_0_6px_#f59e0b]" />
                        )}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ItemIcon size={15} strokeWidth={2.1} className={`shrink-0 transition-transform group-hover:scale-110 ${active ? "text-amber-400" : "text-white/40 group-hover:text-white/80"}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge != null && item.badge > 0 && (
                          <span className="shrink-0 rounded-full bg-[#D32F2F] text-white px-2 py-0.5 text-[10px] font-black">
                            {item.badge}
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

        {/* Accordéon Rayons Frais */}
        {!collapsed && categories.length > 0 && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleGroup("rayons")}
              className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-[11.5px] font-black uppercase tracking-wider text-white/40 hover:text-white/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={15} className="text-amber-400" />
                <span>Rayons Frais</span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${openGroups.rayons ? "rotate-180 text-white" : "text-white/30"}`} />
            </button>
            {openGroups.rayons && (
              <div className="px-2 pb-2 space-y-1 border-t border-white/[0.04] pt-1">
                {categories.slice(0, 5).map((c) => (
                  <Link
                    key={c.id}
                    href={`/categorie/${encodeURIComponent(c.name)}`}
                    onClick={onCloseMobile}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[11.5px] font-bold text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors"
                  >
                    <span className="h-4 w-4 shrink-0 overflow-hidden rounded-md bg-white/10">
                      <img src={c.image} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className="truncate">{c.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer Profil & Connexion / Déconnexion */}
      <div className="px-3.5 py-3 shrink-0 border-t border-white/10">
        {!collapsed ? (
          user ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 rounded-2xl bg-white/[0.06] p-2.5 border border-white/10">
                <div className="h-8 w-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-xs border border-amber-400/30">
                  {user.nom_complet?.[0]?.toUpperCase() || "C"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white truncate">{user.nom_complet}</p>
                  <p className="text-[10px] text-white/50 truncate font-bold">
                    {isDiaspora ? "Client Diaspora 🌍" : "Client Local"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-500/15 hover:bg-red-600 border border-red-500/20 px-3.5 py-2 text-xs font-black text-red-400 hover:text-white transition-all cursor-pointer"
              >
                <LogOut size={15} />
                <span>{t("common.logout", "Se déconnecter")}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/auth/login"
                onClick={onCloseMobile}
                className="w-full flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#0B2545] to-[#134074] border border-white/20 py-2.5 text-xs font-black text-white hover:scale-102 transition-all shadow-md"
              >
                {t("common.login", "Se connecter")}
              </Link>
              <Link
                href="/auth/register"
                onClick={onCloseMobile}
                className="w-full flex items-center justify-center rounded-2xl bg-white/10 py-2 text-xs font-bold text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                {t("common.createAccount", "Créer un compte")}
              </Link>
            </div>
          )
        ) : (
          <button
            onClick={user ? handleLogout : () => router.push("/auth/login")}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 mx-auto transition-all cursor-pointer"
            title={user ? "Déconnexion" : "Connexion"}
          >
            {user ? <LogOut size={18} /> : <User size={18} />}
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
