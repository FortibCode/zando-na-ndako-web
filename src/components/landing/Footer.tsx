"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/lib/language-context';
import { CATEGORIES } from './data';

const SOCIALS = [
  {
    label: 'Facebook',
    href: '#',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    label: 'Instagram',
    href: '#',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    label: 'WhatsApp',
    href: '#',
    path: 'M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.14 4.162 4.226-1.107z',
  },
  {
    label: 'TikTok',
    href: '#',
    path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.96v7.36c0 2.29-.65 4.62-2.12 6.37-1.48 1.75-3.69 2.76-5.97 2.82-2.31.06-4.66-.75-6.28-2.39-1.63-1.65-2.45-3.99-2.32-6.3.13-2.31 1.16-4.52 2.88-6.06 1.72-1.54 4.04-2.32 6.35-2.2v4.06c-1.3-.06-2.61.42-3.52 1.34-.91.92-1.36 2.24-1.26 3.52.1 1.28.76 2.45 1.8 3.16 1.04.71 2.39.91 3.59.56 1.2-.35 2.19-1.27 2.64-2.42.22-.56.32-1.16.31-1.76V.02z',
  },
];

export function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();
  // #how-it-works et #partners n'existent que sur la page d'accueil (voir Header.tsx pour le
  // même correctif) — depuis toute autre route il faut d'abord naviguer vers "/".
  const anchorHref = (hash: string) => (pathname === "/" ? hash : `/${hash}`);
  return (
    <footer id="contact" className="border-t border-slate-100 bg-white text-slate-600 mt-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <Logo size="md" showSubtitle={true} />
          <p className="text-xs leading-relaxed text-slate-500 max-w-xs">
            {t('client.footer.tagline', 'Votre marché en ligne de confiance. Des produits frais, livrés chez vous en toute simplicité.')}
          </p>

          <div className="flex items-center gap-2.5 pt-1">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-[#0B2545] hover:text-white"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-black tracking-wider text-slate-900 uppercase">{t('client.footer.usefulLinks', 'Liens utiles')}</h4>
          <ul className="space-y-2 text-xs font-semibold text-slate-600">
            <li><Link href="/" className="hover:text-[#0B2545]">{t('client.footer.about', 'À propos')}</Link></li>
            <li><a href={anchorHref('#how-it-works')} className="hover:text-[#0B2545]">{t('client.footer.howItWorks', 'Comment ça marche')}</a></li>
            <li><a href={anchorHref('#partners')} className="hover:text-[#0B2545]">{t('client.footer.ourPartners', 'Nos partenaires')}</a></li>
            <li><Link href="/" className="hover:text-[#0B2545]">{t('client.footer.terms', 'Conditions générales')}</Link></li>
            <li><Link href="/" className="hover:text-[#0B2545]">{t('client.footer.privacy', 'Politique de confidentialité')}</Link></li>
            <li><Link href="/" className="hover:text-[#0B2545]">{t('client.footer.faq', 'FAQ')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-black tracking-wider text-slate-900 uppercase">{t('client.footer.categoriesTitle', 'Catégories')}</h4>
          <ul className="space-y-2 text-xs font-semibold text-slate-600">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/categorie/${encodeURIComponent(c.name)}`} className="hover:text-[#0B2545]">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-black tracking-wider text-slate-900 uppercase">{t('client.footer.contactTitle', 'Contact')}</h4>
          <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>+242 06 645 4321</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>contact@zandonandako.cg</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{t('client.footer.addressLine', "Avenue de l'Indépendance, Poto-Poto, Brazzaville, Congo")}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-[#0B2545] py-3.5 text-xs font-bold text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>{t('client.footer.rightsReserved', '© 2024 Zando na Ndako. Tous droits réservés.')}</p>
          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/" className="hover:text-white">{t('client.footer.cgu', 'CGU')}</Link>
            <Link href="/" className="hover:text-white">{t('client.footer.confidentiality', 'Confidentialité')}</Link>
            <a href="#contact" className="hover:text-white">{t('client.footer.contact', 'Contact')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
