"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Search, Star, Store } from "lucide-react";
import { fetchVendeurs, resolveMediaUrl, type ApiVendeur } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

export default function BoutiquesByTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type: rawType } = use(params);
  const type = decodeURIComponent(rawType);
  const { t } = useLanguage();

  const [search, setSearch] = useState("");
  const [vendeurs, setVendeurs] = useState<ApiVendeur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      fetchVendeurs({ type, search: search || undefined })
        .then(setVendeurs)
        .catch(() => setVendeurs([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [type, search]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <div className="mb-6 flex items-center gap-2.5">
        <Store className="h-6 w-6 text-[#0B2545]" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 capitalize">{type}</h1>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("boutiques.searchPlaceholder", "Rechercher une boutique")}
          className="w-full h-11 rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#0B2545]"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-3xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : vendeurs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Store className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">{t("boutiques.emptyTitle", "Aucune boutique trouvée")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vendeurs.map((v) => {
            const image = resolveMediaUrl(v.photo_boutique);
            return (
              <Link
                key={v.id}
                href={`/boutique/${v.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-300 hover:bg-white hover:border-slate-200 hover:shadow-xl cursor-pointer"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={v.nom_commerce} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <Store className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-[#0B2545] transition-colors truncate">{v.nom_commerce}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-600">{v.note_moyenne > 0 ? v.note_moyenne.toFixed(1) : t("boutique.noRating", "Pas encore noté")}</span>
                    {v.ville && <span className="text-xs text-slate-400 truncate">· {v.ville}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
