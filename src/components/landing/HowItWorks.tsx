"use client";

import { Bike, ClipboardList, ShoppingBag, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function HowItWorks() {
  const { t } = useLanguage();
  const STEPS = [
    {
      number: 1,
      icon: ShoppingBag,
      title: t('client.howItWorks.step1Title', '1. Choisissez vos produits'),
      description: t('client.howItWorks.step1Desc', 'Parcourez nos catégories fraîches de Brazzaville et ajoutez vos articles au panier.'),
      gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      numberBg: 'bg-[#0B2545]',
    },
    {
      number: 2,
      icon: ClipboardList,
      title: t('client.howItWorks.step2Title', '2. Passez votre commande'),
      description: t('client.howItWorks.step2Desc', 'Validez votre panier, choisissez votre commune (Poto-Poto, Bacongo...) et votre mode de paiement.'),
      gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      numberBg: 'bg-[#0B2545]',
    },
    {
      number: 3,
      icon: Bike,
      title: t('client.howItWorks.step3Title', '3. Livraison express à domicile'),
      description: t('client.howItWorks.step3Desc', 'Votre marché frais est livré directement chez vous en 30 à 60 minutes chrono.'),
      gradient: 'from-blue-500/15 via-blue-500/5 to-transparent',
      iconBg: 'bg-blue-50 text-[#0B2545] border-blue-200/60',
      numberBg: 'bg-[#c00000]',
    },
  ];
  return (
    <section id="how-it-works" className="w-full h-full">
      <div className="flex flex-col justify-between h-full rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-xs">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500 animate-spin-slow" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900">{t('client.howItWorks.title', 'Comment ça marche ?')}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t('client.howItWorks.subtitle', 'Votre marché à domicile en 3 étapes simples.')}</p>
          </div>
        </div>

        {/* Vertical Stacked Step Cards Flow */}
        <div className="flex flex-col gap-4 sm:gap-5 my-auto">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group relative flex items-start gap-4 rounded-2xl border border-slate-100/90 bg-slate-50/60 p-4 sm:p-5 transition-all duration-300 card-3d-sm shine-effect hover:bg-white hover:border-slate-200 hover:shadow-xl cursor-pointer"
            >
              {/* 3D Icon Box with Step Number Badge */}
              <div className="relative shrink-0">
                <div className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border ${step.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 shadow-xs`}>
                  <step.icon className="h-7 w-7 sm:h-8 sm:w-8 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className={`absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full ${step.numberBg} text-[11px] font-black text-white ring-2 ring-white shadow-md transition-transform duration-300 group-hover:scale-125`}>
                  {step.number}
                </div>
              </div>

              {/* Step Text Content */}
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#0B2545] transition-colors leading-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
