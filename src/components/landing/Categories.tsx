"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Grid } from 'lucide-react';
import { fetchVendeurTypesLogos } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { CategoryCard } from './CategoryCard';

export function Categories() {
  const { t } = useLanguage();
  const [types, setTypes] = useState<{ type: string; logo: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setIsLoading(true);
      fetchVendeurTypesLogos()
        .then((data) => setTypes(data))
        .finally(() => setIsLoading(false));
    };
    load();
    // Un type de boutique modifié/ajoutée/supprimée côté admin doit apparaître sans que le
    // visiteur ait besoin de recharger la page — pas de cache serveur ici, donc un polling léger
    // suffit à garder un onglet déjà ouvert à jour.
    const interval = setInterval(() => load({ silent: true }), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!isLoading && types.length === 0) return null;

  return (
    <section className="w-full">
      <div className="rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-xs">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid className="h-5 w-5 text-[#0B2545]" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">{t('client.categoriesSection.titleBoutiques', 'Nos types de boutique')}</h2>
          </div>
          <Link href="/categories" className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B2545] hover:underline">
            <span>{t('client.categoriesSection.viewAllBoutiques', 'Voir tous les types')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {types.map(({ type, logo }, index) => (
              <CategoryCard key={type} type={type} logo={logo} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
