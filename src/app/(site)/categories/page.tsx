"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Grid, Store } from "lucide-react";
import { fetchVendeurTypesLogos, resolveMediaUrl } from "@/lib/api";
import { deriveTypeBoutiqueIcon } from "@/lib/typeBoutiqueIcon";
import { useLanguage } from "@/lib/language-context";

// Parcours "boutique d'abord" : cette page listait les catégories de PRODUITS ; elle liste
// maintenant les TYPES DE BOUTIQUE réellement présents en base (categorie_principale est un champ
// texte libre, pas un enum — jamais de liste codée en dur qui pourrait ne correspondre à rien de
// réel). La catégorie produit reste utile, mais devient un filtre à l'intérieur d'une boutique
// (voir /boutique/[id]) plutôt qu'un axe de navigation global.
export default function CategoriesPage() {
  const { t } = useLanguage();
  const [types, setTypes] = useState<{ type: string; logo: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendeurTypesLogos().then(setTypes).catch(() => setTypes([])).finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <div className="flex items-center gap-2.5 mb-6">
        <Grid className="h-6 w-6 text-[#0B2545]" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t('client.categoriesPage.titleBoutiques', 'Types de boutique')}</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : types.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Store className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">{t('categories.emptyBoutiques', 'Aucune boutique disponible pour le moment.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {types.map(({ type, logo }, i) => (
            <CategoryItem
              key={type}
              type={type}
              logo={logo}
              index={i}
              seeBoutiquesText={t('categories.seeBoutiques', 'Voir les boutiques')}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function CategoryItem({ type, logo, index, seeBoutiquesText }: { type: string; logo: string | null; index: number; seeBoutiquesText: string }) {
  const logoUrl = resolveMediaUrl(logo);
  const Icon = deriveTypeBoutiqueIcon(type);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link
      href={`/boutiques/${encodeURIComponent(type)}`}
      className="relative flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 hover:shadow-sm transition-all"
    >
      <span className="absolute top-2 right-2.5 text-[10px] font-black text-slate-300">{String(index + 1).padStart(2, "0")}</span>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
        {logoUrl && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-full w-full object-cover" onError={() => setImgFailed(true)} />
        ) : (
          <Icon className="h-6 w-6 text-[#0B2545]" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-slate-900 truncate capitalize">{type}</p>
        <p className="text-xs text-slate-400">{seeBoutiquesText}</p>
      </div>
    </Link>
  );
}

