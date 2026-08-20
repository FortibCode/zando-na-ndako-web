"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Grid } from "lucide-react";
import { fetchCategoriesFromApi, fetchProduits, type Produit } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import type { Category } from "@/components/landing/data";

export default function CategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCategoriesFromApi(), fetchProduits()])
      .then(([cats, prods]) => { setCategories(cats); setProduits(prods); })
      .finally(() => setLoading(false));
  }, []);

  const countFor = (name: string) => produits.filter((p) => p.categorie?.nom_categorie === name).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <div className="flex items-center gap-2.5 mb-6">
        <Grid className="h-6 w-6 text-[#0B2545]" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t('client.categoriesPage.title', 'Catégories')}</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              href={`/categorie/${encodeURIComponent(c.name)}`}
              className="relative flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 hover:shadow-sm transition-all"
            >
              <span className="absolute top-2 right-2.5 text-[10px] font-black text-slate-300">{String(i + 1).padStart(2, "0")}</span>
              <img src={c.image} alt={c.name} className="h-14 w-14 rounded-xl object-cover shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{c.name}</p>
                <p className="text-xs text-slate-400">{countFor(c.name)} {t('client.categoriesPage.productSuffix', 'produit')}{countFor(c.name) > 1 ? "s" : ""}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
