"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Compass, Globe, Grid3X3, LogOut, Menu, Moon, Receipt, Settings, ShoppingCart, Sparkles, Store, Sun, User, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { fetchVendeurTypes, resolveMediaUrl } from '@/lib/api';
import { useCart } from './cart-context';
import { usePublicAuth } from '@/lib/public-auth-context';
import { useLanguage } from '@/lib/language-context';
import { useTheme } from '@/lib/theme-context';
import { ConfirmDialog } from '@/components/ConfirmDialog';

// #how-it-works et #partners n'existent que dans HowItWorks.tsx/Partners.tsx, rendus
// uniquement sur la page d'accueil (/) — un <a href="#how-it-works"> depuis une autre route
// (/produits, /panier, ...) ne fait donc rien. On calcule le href complet au rendu (voir
// anchorHref ci-dessous) pour toujours renvoyer vers "/#ancre" hors de la page d'accueil.
const NAV_LINKS = [
  { hash: '#how-it-works', key: 'client.footer.howItWorks', fallback: 'Comment ça marche' },
  { hash: '#partners', key: 'client.footer.ourPartners', fallback: 'Nos partenaires' },
  { hash: '#contact', key: 'client.footer.contact', fallback: 'Contact' },
];

// Mêmes 5 onglets, mêmes icônes, même ordre que mobile/src/app/client/(tabs)/_layout.tsx —
// identiques pour le client local et le client diaspora (le mobile n'a qu'une seule barre
// d'onglets client, le mode diaspora n'ajoutant que des éléments à l'intérieur de ces onglets).
const CLIENT_TABS = [
  { href: '/accueil', key: 'tabs.discover', fallback: 'Découvrir', icon: Compass },
  { href: '/categories', key: 'tabs.categories', fallback: 'Catégories', icon: Grid3X3 },
  { href: '/panier', key: 'tabs.cart', fallback: 'Panier', icon: ShoppingCart },
  { href: '/mes-commandes', key: 'tabs.orders', fallback: 'Commandes', icon: Receipt },
  { href: '/mon-compte', key: 'tabs.profile', fallback: 'Profil', icon: User },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [boutiqueTypes, setBoutiqueTypes] = useState<string[]>([]);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const { count, openCart } = useCart();
  const { user, isReady, logout } = usePublicAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  // Un client connecté a sa propre interface (/accueil), distincte de la vitrine visiteur — même
  // logique que le tableau de bord vendeur, mais gardée ici plutôt qu'une redirection forcée
  // puisque client/diaspora partagent réellement le catalogue public avec les visiteurs.
  const homeHref = user ? "/accueil" : "/";
  // #contact fonctionne déjà partout (le <footer id="contact"> est global), mais
  // #how-it-works/#partners n'existent que sur "/" — sur toute autre route on doit d'abord
  // naviguer vers la page d'accueil avant l'ancre.
  const anchorHref = (hash: string) => (pathname === "/" ? hash : `/${hash}`);

  useEffect(() => {
    fetchVendeurTypes().then(setBoutiqueTypes).catch(() => setBoutiqueTypes([]));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(e.target as Node)) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setConfirmLogoutOpen(false);
    logout();
    router.push('/');
  };

  const firstName = user?.nom_complet?.split(' ')[0] || 'Mon compte';
  const userPhotoUrl = resolveMediaUrl(user?.photo_profil);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={homeHref} className="flex min-w-0 items-center gap-2 shrink-0 hover:scale-102 transition-transform">
          <Logo size="md" showSubtitle={true} />
        </Link>

        {/* Clean Center Navigation Menu (Desktop) */}
        {isReady && user ? (
          <nav className="hidden items-center gap-1 md:flex">
            {CLIENT_TABS.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`relative flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                    active ? 'bg-[#0B2545]/8 text-[#0B2545]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#0B2545]'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {t(tab.key, tab.fallback)}
                  {tab.href === '/panier' && count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D32F2F] text-[9px] font-black text-white">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
            <Link href={homeHref} className="relative py-1 font-extrabold text-[#0B2545] transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[2.5px] after:w-full after:rounded-full after:bg-[#0B2545]">
              {t('client.categoryDetail.home', 'Accueil')}
            </Link>

            {/* Dynamic Interactive Categories Dropdown */}
            <div ref={categoriesDropdownRef} className="relative">
              <button
                onClick={() => setCategoriesOpen((v) => !v)}
                className="flex items-center gap-1.5 py-1 transition-colors hover:text-[#0B2545] cursor-pointer font-bold"
                aria-expanded={categoriesOpen}
              >
                <span>{t('tabs.categories', 'Catégories')}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${categoriesOpen ? 'rotate-180 text-[#0B2545]' : ''}`} />
              </button>

              {/* Dynamic Boutique Types Dropdown Menu */}
              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-3 w-64 rounded-3xl border border-slate-200/90 bg-white p-3 shadow-2xl z-50 animate-scale-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2 mb-1.5">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" /> {t('header.freshCategories', 'Types de boutique')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {boutiqueTypes.map((type) => (
                      <Link
                        key={type}
                        href={`/boutiques/${encodeURIComponent(type)}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                            <Store className="h-4 w-4 text-slate-400" />
                          </span>
                          <span className="text-xs font-bold text-slate-800 capitalize group-hover:text-[#0B2545] transition-colors">
                            {type}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {NAV_LINKS.map((link) => (
              <a key={link.hash} href={anchorHref(link.hash)} className="py-1 transition-colors hover:text-[#0B2545]">
                {t(link.key, link.fallback)}
              </a>
            ))}
          </nav>
        )}

        {/* Right Actions : Thème, Langue, Panier, Profil */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
          <div ref={languageDropdownRef} className="relative">
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

          {/* Panier */}
          <button
            onClick={openCart}
            className="relative p-2 text-slate-700 dark:text-slate-200 transition-colors hover:text-[#0B2545] cursor-pointer"
            aria-label="Mon panier"
          >
            <ShoppingCart className="h-6 w-6 text-[#0B2545] dark:text-amber-400" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#D32F2F] text-[11px] font-black text-white shadow-xs animate-scale-in">
                {count}
              </span>
            )}
          </button>

          {isReady && user ? (
            <div ref={accountDropdownRef} className="relative hidden sm:block">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full bg-[#0B2545] pl-3 pr-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-sm transition-all hover:bg-[#061830] cursor-pointer"
              >
                <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white/15">
                  {userPhotoUrl ? (
                    <img src={userPhotoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </span>
                {firstName}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`} />
              </button>

              {accountOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl z-50 animate-scale-in">
                  <Link
                    href="/mon-compte"
                    onClick={() => setAccountOpen(false)}
                    className="flex w-full items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700"
                  >
                    <Settings className="h-4 w-4 text-slate-400" /> {t('common.editProfile', 'Modifier mon profil')}
                  </Link>
                  <button
                    onClick={() => { setAccountOpen(false); setConfirmLogoutOpen(true); }}
                    className="flex w-full items-center gap-2.5 p-2.5 rounded-xl hover:bg-red-50 transition-colors text-xs font-bold text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> {t('common.logout', 'Se déconnecter')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden rounded-full bg-[#0B2545] px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm transition-all hover:bg-[#061830] hover:shadow-md sm:inline-block active:scale-95"
            >
              {t('common.login', 'Se connecter')}
            </Link>
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-[#0B2545] transition-colors hover:bg-slate-100 md:hidden"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      <div
        className={`grid overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 ease-out md:hidden ${
          menuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden p-4 space-y-4">
          {isReady && user ? (
            <>
              <nav className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
                {CLIENT_TABS.map((tab) => {
                  const active = pathname === tab.href;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      onClick={() => setMenuOpen(false)}
                      className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors ${
                        active ? 'bg-[#0B2545]/8 font-extrabold text-[#0B2545]' : 'hover:bg-slate-50 hover:text-[#0B2545]'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" /> {t(tab.key, tab.fallback)}
                      {tab.href === '/panier' && count > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#D32F2F] text-[10px] font-black text-white">
                          {count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-slate-100 pt-3">
                <button
                  onClick={() => { setMenuOpen(false); setConfirmLogoutOpen(true); }}
                  className="flex items-center justify-center gap-2 w-full rounded-full bg-red-50 px-6 py-2.5 text-center text-xs font-extrabold text-red-600 transition-colors hover:bg-red-100 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> {t('common.logout', 'Se déconnecter')}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Mobile Boutique Types Grid */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2">{t('tabs.categories', 'Types de boutique')}</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {boutiqueTypes.map((type) => (
                    <Link
                      key={type}
                      href={`/boutiques/${encodeURIComponent(type)}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 text-xs font-bold text-slate-800 border border-slate-100"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        <Store className="h-3.5 w-3.5 text-slate-400" />
                      </span>
                      <span className="truncate capitalize">{type}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <nav className="flex flex-col gap-1 border-t border-slate-100 pt-3 text-sm font-semibold text-slate-700">
                <Link
                  href={homeHref}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-slate-50 px-3 py-2.5 font-extrabold text-[#0B2545]"
                >
                  {t('client.categoryDetail.home', 'Accueil')}
                </Link>
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.hash}
                    href={anchorHref(link.hash)}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 hover:text-[#0B2545]"
                  >
                    {t(link.key, link.fallback)}
                  </a>
                ))}
              </nav>

              <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-3">
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-full border-2 border-[#0B2545] px-6 py-2.5 text-center text-xs font-extrabold text-[#0B2545] transition-colors hover:bg-slate-50"
                >
                  {t('common.createAccount', 'Créer un compte')}
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-full bg-[#0B2545] px-6 py-2.5 text-center text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#061830]"
                >
                  {t('common.login', 'Se connecter')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {confirmLogoutOpen && (
        <ConfirmDialog
          title="Confirmer la déconnexion"
          message="Voulez-vous vraiment vous déconnecter de votre compte Zando na Ndako ?"
          confirmLabel="Se déconnecter"
          danger
          onConfirm={handleLogout}
          onClose={() => setConfirmLogoutOpen(false)}
        />
      )}
    </header>
  );
}
