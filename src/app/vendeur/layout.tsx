"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle, Bell, ChevronDown, ClipboardList, FileCheck, Gem,
  Headset, Home, LogOut, Menu, Settings, Star, Tag, User,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Spinner } from "@/components/Spinner";
import { usePublicAuth } from "@/lib/public-auth-context";
import { useLanguage } from "@/lib/language-context";

// Les 5 onglets principaux — mêmes libellés, icônes et ordre exacts que
// mobile/src/app/vendor/(tabs)/_layout.tsx (via VendorBottomNav).
const TABS = [
  { href: "/vendeur", key: "vendorNav.home", fallback: "Accueil", icon: Home },
  { href: "/vendeur/commandes", key: "vendorNav.orders", fallback: "Commandes", icon: ClipboardList },
  { href: "/vendeur/produits", key: "vendorNav.products", fallback: "Produits", icon: Tag },
  { href: "/vendeur/revenus", key: "vendorNav.revenue", fallback: "Revenus", icon: Gem },
  { href: "/vendeur/profil", key: "vendorNav.profile", fallback: "Profil", icon: User },
];

// Destinations secondaires — mêmes libellés que le menu hamburger de
// mobile/src/components/vendor-ui.tsx (VendorMenu). "Avis clients" est maintenant réel (backend
// GET /vendeur/avis) ; "Mes promotions" reste exclu, toujours sans endpoint backend côté vendeur.
const MORE_MENU = [
  { href: "/vendeur/avis", key: "vendorNav.reviews", fallback: "Avis clients", icon: Star },
  { href: "/vendeur/profil#documents", key: "vendorNav.documents", fallback: "Documents", icon: FileCheck },
  { href: "/vendeur/support", key: "vendorNav.support", fallback: "Support Zando na Ndako", icon: Headset },
  { href: "/vendeur/litiges", key: "vendorNav.disputes", fallback: "Litiges", icon: AlertTriangle },
  { href: "/vendeur/notifications", key: "vendorNav.notifications", fallback: "Notifications", icon: Bell },
  { href: "/vendeur/parametres", key: "settings.title", fallback: "Paramètres", icon: Settings },
];

export default function VendeurLayout({ children }: { children: React.ReactNode }) {
  const { user, isReady, logout } = usePublicAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!user) router.replace("/auth/login?redirect=/vendeur");
    else if (user.type_utilisateur !== "vendeur") router.replace("/accueil");
  }, [isReady, user, router]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!isReady || !user || user.type_utilisateur !== "vendeur") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <Spinner />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/vendeur">
              <Logo size="sm" showSubtitle={false} />
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {TABS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                      active ? "bg-[#0B2545] text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4" /> {t(item.key, item.fallback)}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div ref={moreRef} className="relative">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Menu className="h-4 w-4" /> <span className="hidden sm:inline">{t('vendorNav.more', 'Plus')}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50">
                  {MORE_MENU.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700"
                    >
                      <item.icon className="h-4 w-4 text-slate-400" /> {t(item.key, item.fallback)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <span className="hidden sm:block text-xs font-bold text-slate-500">{user.nom_complet}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">{t('vendorNav.logout', 'Déconnexion')}</span>
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="flex md:hidden items-center gap-1 overflow-x-auto px-4 pb-3">
          {TABS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-colors ${
                  active ? "bg-[#0B2545] text-white" : "text-slate-600 bg-slate-100"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" /> {t(item.key, item.fallback)}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
