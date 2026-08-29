"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle, Bell, ChevronDown, ClipboardList, FileCheck, Gem, Globe,
  Headset, Home, LogOut, Menu, Moon, Settings, Star, Sun, Tag, User,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Spinner } from "@/components/Spinner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { usePublicAuth } from "@/lib/public-auth-context";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-context";

const TABS = [
  { href: "/vendeur", key: "vendorNav.home", fallback: "Accueil", icon: Home },
  { href: "/vendeur/commandes", key: "vendorNav.orders", fallback: "Commandes", icon: ClipboardList },
  { href: "/vendeur/produits", key: "vendorNav.products", fallback: "Produits", icon: Tag },
  { href: "/vendeur/revenus", key: "vendorNav.revenue", fallback: "Revenus", icon: Gem },
  { href: "/vendeur/profil", key: "vendorNav.profile", fallback: "Profil", icon: User },
];

const MORE_MENU = [
  { href: "/vendeur/avis", key: "vendorNav.reviews", fallback: "Avis clients", icon: Star },
  { href: "/vendeur/profil#documents", key: "vendorNav.documents", fallback: "Documents", icon: FileCheck },
  { href: "/vendeur/support", key: "vendorNav.support", fallback: "Support Zando na Ndako", icon: Headset },
  { href: "/vendeur/litiges", key: "vendorNav.disputes", fallback: "Litiges", icon: AlertTriangle },
  { href: "/vendeur/notifications", key: "vendorNav.notifications", fallback: "Notifications", icon: Bell },
  { href: "/vendeur/parametres", key: "settings.title", fallback: "Paramètres", icon: Settings },
];

export default function VendeurLayout({ children }: { children: React.ReactNode }) {
  const { user, isReady, logout, isLoggingOut } = usePublicAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!user) { if (!isLoggingOut.current) router.replace("/auth/login?redirect=/vendeur"); }
    else if (user.type_utilisateur !== "vendeur") router.replace("/accueil");
  }, [isReady, user, router, isLoggingOut]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (languageRef.current && !languageRef.current.contains(e.target as Node)) setLanguageOpen(false);
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bouton Mode Clair / Sombre */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={theme === "dark" ? t("settings.themeLight", "Mode clair") : t("settings.themeDark", "Mode sombre")}
              aria-label="Changer le thème"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Sélecteur de Langue (FR, LN, KG, EN) */}
            <div ref={languageRef} className="relative">
              <button
                onClick={() => setLanguageOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Changer de langue"
              >
                <Globe className="h-3.5 w-3.5 text-[#0B2545] dark:text-amber-400" />
                <span className="uppercase">{language === "lingala" ? "LN" : language === "kituba" ? "KG" : language.slice(0, 2)}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${languageOpen ? "rotate-180" : ""}`} />
              </button>

              {languageOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-2xl z-50 animate-scale-in">
                  {[
                    { code: "fr", label: "Français", flag: "🇫🇷" },
                    { code: "lingala", label: "Lingála", flag: "🇨🇬" },
                    { code: "kituba", label: "Kituba", flag: "🇨🇬" },
                    { code: "en", label: "English", flag: "🇬🇧" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code as any); setLanguageOpen(false); }}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                        language === lang.code
                          ? "bg-[#0B2545] text-white"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {language === lang.code && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={moreRef} className="relative">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
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
              onClick={() => setConfirmLogoutOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
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

      {confirmLogoutOpen && (
        <ConfirmDialog
          title="Confirmer la déconnexion"
          message="Voulez-vous vraiment vous déconnecter de votre espace vendeur ?"
          confirmLabel="Se déconnecter"
          danger
          onConfirm={() => { setConfirmLogoutOpen(false); handleLogout(); }}
          onClose={() => setConfirmLogoutOpen(false)}
        />
      )}
    </div>
  );
}
