"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  LogOut,
  ChevronRight,
  Home,
  Menu,
  X,
  Search,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  Store,
  Bike,
  ShieldAlert,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useHasRole } from "@/lib/usePermission";
import { useTheme } from "@/lib/theme-context";
import { initials } from "@/lib/format";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiEnvelope, DashboardAlerts } from "@/lib/types";

const BREADCRUMB_LABELS: Record<string, string> = {
  "/admin": "Tableau de bord",
  "/admin/utilisateurs": "Utilisateurs",
  "/admin/clients": "Clients",
  "/admin/diaspora": "Diaspora",
  "/admin/vendeurs": "Vendeurs",
  "/admin/livreurs": "Livreurs",
  "/admin/commandes": "Commandes",
  "/admin/livraisons": "Livraisons",
  "/admin/attribution": "Attribution",
  "/admin/carte": "Carte temps réel",
  "/admin/categories": "Catégories",
  "/admin/produits": "Produits",
  "/admin/stock": "Gestion du stock",
  "/admin/zones": "Zones de livraison",
  "/admin/statistiques": "Statistiques & analytics",
  "/admin/litiges": "Litiges",
  "/admin/parametres": "Paramètres",
  "/admin/finances": "Finances & Commissions",
  "/admin/transactions": "Transactions",
  "/admin/commissions": "Commissions",
  "/admin/remboursements": "Remboursements",
  "/admin/retraits": "Retraits",
  "/admin/promotions": "Promotions",
  "/admin/coupons": "Coupons",
  "/admin/notifications": "Notifications",
  "/admin/tickets": "Tickets support",
  "/admin/rapports": "Rapports",
  "/admin/administrateurs": "Administrateurs",
  "/admin/roles": "Rôles",
  "/admin/logs": "Journaux d'audit",
};

const SUPER_ADMIN_ROUTES = new Set(["/admin/administrateurs", "/admin/roles", "/admin/logs"]);

export function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const isSuperAdmin = useHasRole("super_admin");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Live alerts query for notification popover
  const { data: alerts } = useQuery({
    queryKey: ["admin-dashboard-alerts"],
    queryFn: async () => (await api.get<ApiEnvelope<DashboardAlerts>>("/admin/dashboard/alerts")).data,
    refetchInterval: 60_000,
  });

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mobileRoutes = Object.entries(BREADCRUMB_LABELS).filter(
    ([href]) => !SUPER_ADMIN_ROUTES.has(href) || isSuperAdmin
  );

  const pageLabel = BREADCRUMB_LABELS[pathname] ?? "Administration";
  const userInitials = initials(
    user?.nom_complet?.split(" ").slice(-1)[0] ?? "",
    user?.nom_complet?.split(" ")[0] ?? ""
  );
  const accentColor = (user?.nom_complet?.charCodeAt(0) ?? 0) % 2 === 0
    ? "bg-[#C00000]"
    : "bg-[#1A2E5A]";

  const totalAlerts = alerts?.total ?? 0;

  return (
    <>
      <header className="sticky top-0 md:top-3 z-30 mt-0 md:mt-3 mr-0 md:mr-3 mb-0 md:mb-3 flex items-center justify-between gap-4 rounded-none md:rounded-3xl border-b md:border border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 py-3 md:px-6 lg:px-8 shadow-premium-sm md:shadow-premium-md transition-all">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex md:hidden items-center justify-center h-9 w-9 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors mr-1 cursor-pointer"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb (desktop) */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-extrabold">
            <Link href="/admin" className="flex items-center gap-1.5 text-slate-400 hover:text-[#1A2E5A] transition-colors">
              <Home size={14} />
              <span>Accueil</span>
            </Link>
            {pathname !== "/admin" && (
              <>
                <ChevronRight size={13} className="text-slate-300" />
                <span className="font-black text-slate-900 truncate tracking-tight text-sm">{pageLabel}</span>
              </>
            )}
            {pathname === "/admin" && (
              <>
                <ChevronRight size={13} className="text-slate-300" />
                <span className="font-black text-slate-900 tracking-tight text-sm">Tableau de bord</span>
              </>
            )}
          </nav>

          {/* Page title (mobile) */}
          <span className="md:hidden font-black text-slate-900 text-sm truncate">{pageLabel}</span>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une commande, un vendeur, un client..."
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 pl-10 pr-12 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:bg-white focus:border-[#1A2E5A] focus:outline-none focus:ring-2 focus:ring-[#1A2E5A]/10 transition-all shadow-inner"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[11.5px] font-black text-slate-400 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200/90 bg-white text-slate-500 hover:border-[#1A2E5A]/30 hover:bg-slate-50 hover:text-[#1A2E5A] transition-all duration-200 focus-premium cursor-pointer shadow-premium-sm"
            title={theme === "dark" ? "Passer au mode clair" : "Passer au mode sombre"}
          >
            {theme === "dark" ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200/90 bg-white text-slate-500 hover:border-[#1A2E5A]/30 hover:bg-slate-50 hover:text-[#1A2E5A] transition-all duration-200 focus-premium cursor-pointer shadow-premium-sm"
              aria-label="Notifications"
            >
              <Bell size={16.5} />
              {totalAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C00000] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C00000] ring-2 ring-white" />
                </span>
              )}
            </button>

            {/* Notification Popover Menu */}
            {notifOpen && (
              <div className="animate-scale-in absolute right-0 top-12 z-50 w-80 sm:w-96 overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-10px_rgba(11,37,69,0.3)] ring-1 ring-slate-900/10">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-[#1A2E5A]" />
                    <h3 className="text-xs font-black text-slate-900 tracking-tight">Centre de notifications</h3>
                  </div>
                  {totalAlerts > 0 && (
                    <span className="rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-[11.5px] font-black">
                      {totalAlerts} alerte{totalAlerts > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2 scrollbar-dark">
                  {totalAlerts === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <CheckCircle2 size={24} className="mx-auto mb-1.5 text-emerald-500" />
                      <p className="text-xs font-bold text-slate-600">Aucune alerte en attente</p>
                      <p className="text-[12.5px] text-slate-400 mt-0.5">Tout le système fonctionne normalement.</p>
                    </div>
                  ) : (
                    <>
                      {alerts?.vendeurs_en_attente ? (
                        <Link href="/admin/vendeurs?statut=en_attente" onClick={() => setNotifOpen(false)} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Store size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-800">{alerts.vendeurs_en_attente} vendeur(s) en attente de validation</p>
                            <p className="text-[12.5px] font-medium text-slate-400 mt-0.5">Dossiers KYC à traiter</p>
                          </div>
                        </Link>
                      ) : null}

                      {alerts?.livreurs_en_attente ? (
                        <Link href="/admin/livreurs?statut=en_attente" onClick={() => setNotifOpen(false)} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <Bike size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-800">{alerts.livreurs_en_attente} livreur(s) en attente de validation</p>
                            <p className="text-[12.5px] font-medium text-slate-400 mt-0.5">Vérification immatriculation & permis</p>
                          </div>
                        </Link>
                      ) : null}

                      {alerts?.litiges_ouverts ? (
                        <Link href="/admin/litiges" onClick={() => setNotifOpen(false)} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <ShieldAlert size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-800">{alerts.litiges_ouverts} litige(s) ouvert(s)</p>
                            <p className="text-[12.5px] font-medium text-slate-400 mt-0.5">Requièrent une médiation admin</p>
                          </div>
                        </Link>
                      ) : null}

                      {alerts?.commandes_en_retard ? (
                        <Link href="/admin/commandes" onClick={() => setNotifOpen(false)} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <AlertTriangle size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-800">{alerts.commandes_en_retard} commande(s) en retard</p>
                            <p className="text-[12.5px] font-medium text-slate-400 mt-0.5">Livraison dépassée</p>
                          </div>
                        </Link>
                      ) : null}

                      {alerts?.produits_rupture ? (
                        <Link href="/admin/categories" onClick={() => setNotifOpen(false)} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <PackageX size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-800">{alerts.produits_rupture} produit(s) en rupture</p>
                            <p className="text-[12.5px] font-medium text-slate-400 mt-0.5">Stock à zéro</p>
                          </div>
                        </Link>
                      ) : null}
                    </>
                  )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50/60 p-2.5 text-center">
                  <Link href="/admin/notifications" onClick={() => setNotifOpen(false)} className="text-xs font-black text-[#1A2E5A] hover:underline">
                    Voir toutes les notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 pl-3 border-l border-slate-200/80 cursor-pointer group focus-premium rounded-xl p-1 transition-all"
            >
              <div className={`flex h-8.5 w-8.5 items-center justify-center rounded-full ${accentColor} text-[12.5px] font-black text-white shadow-md shrink-0 ring-2 ring-white ring-offset-2 ring-offset-slate-100 group-hover:scale-105 transition-transform`}>
                {userInitials}
              </div>
              <div className="hidden sm:block leading-tight text-left">
                <p className="text-xs font-black text-slate-900 truncate max-w-[130px]">
                  {user?.nom_complet ?? "Administrateur"}
                </p>
                <p className="text-[11.5px] font-bold text-slate-400 truncate max-w-[130px]">
                  {user?.email ?? user?.telephone ?? "super_admin"}
                </p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {userMenuOpen && (
              <div className="animate-scale-in absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-10px_rgba(11,37,69,0.3)] ring-1 ring-slate-900/10">
                <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${accentColor} text-xs font-black text-white shadow-md shrink-0`}>
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 truncate">{user?.nom_complet ?? "Administrateur"}</p>
                      <p className="text-[11.5px] font-medium text-slate-400 truncate">{user?.email ?? "admin@zandondako.cg"}</p>
                      <span className="inline-block mt-1 rounded-full bg-[#1A2E5A]/10 text-[#1A2E5A] px-2 py-0.2 text-[11px] font-black capitalize">
                        {user?.administrateur?.role_admin ?? "Super Admin"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1 text-xs font-bold text-slate-700">
                  <div className="flex items-center justify-between px-3 py-2 text-[#2E7D32]">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[12.5px] font-black">Statut: En ligne</span>
                    </div>
                  </div>

                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-400" />}
                      <span>{theme === "dark" ? "Mode Clair" : "Mode Sombre"}</span>
                    </div>
                    <span className="text-[11.5px] uppercase font-extrabold text-slate-400">{theme}</span>
                  </button>

                  <Link href="/admin/parametres" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors">
                    <Settings size={15} className="text-slate-400" />
                    <span>Paramètres du compte</span>
                  </Link>

                  {isSuperAdmin && (
                    <Link href="/admin/administrateurs" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors">
                      <ShieldCheck size={15} className="text-slate-400" />
                      <span>Équipe Administrateurs</span>
                    </Link>
                  )}
                </div>

                <div className="border-t border-slate-100 p-2">
                  <button
                    onClick={() => { setUserMenuOpen(false); setConfirmLogoutOpen(true); }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

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


      {/* Mobile slide-over nav */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Panel */}
          <div className="admin-sidebar-bg absolute left-0 top-0 bottom-0 w-72 flex flex-col shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#C00000] to-[#8f0000] shadow-lg shadow-red-950/40">
                  <span className="text-white font-black text-sm">ZN</span>
                </div>
                <div>
                  <p className="text-sm font-black text-white">Zando na Ndako</p>
                  <p className="text-[11.5px] text-white/40">Administration</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div className="h-px mx-5 bg-linear-to-r from-white/12 to-transparent" />
            <nav className="flex-1 overflow-y-auto scrollbar-dark px-3 py-4 space-y-0.5">
              {mobileRoutes.map(([href, label]) => {
                const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-semibold transition-all ${
                      active
                        ? "bg-linear-to-r from-[#C00000] to-[#8f0000] text-white shadow-[0_4px_16px_-2px_rgba(192,0,0,0.5)]"
                        : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-5 py-4 text-[11.5px] text-white/25">
              © 2026 Zando na Ndako
            </div>
          </div>
        </div>
      )}
    </>
  );
}

