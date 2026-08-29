"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, Search, Star, Store, X } from "lucide-react";
import { fetchVendeurs, resolveMediaUrl, searchProduits, type ApiVendeur, type Produit } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}

// Recherche boutique-prioritaire (voir le parcours "boutique d'abord") : les boutiques sont le
// résultat principal, les correspondances produit restent secondaires et renvoient toujours vers
// la fiche boutique du produit trouvé — jamais d'ajout au panier direct depuis un résultat.
function SearchPageInner() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [vendeurs, setVendeurs] = useState<ApiVendeur[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const term = query.trim();
    router.replace(term ? `/recherche?q=${encodeURIComponent(term)}` : "/recherche");
    if (!term) { setVendeurs([]); setProduits([]); setSearched(false); return; }

    setLoading(true);
    const timer = setTimeout(() => {
      Promise.all([
        fetchVendeurs({ search: term }).catch(() => []),
        searchProduits(term).catch(() => []),
      ]).then(([v, p]) => {
        setVendeurs(v);
        setProduits(p);
        setSearched(true);
      }).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">{t("client.search.title", "Rechercher")}</h1>

      <div className="relative mb-8 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("client.search.placeholder", "Nom d'une boutique ou d'un produit…")}
          autoFocus
          className="w-full h-11 rounded-full border border-slate-200 bg-white pl-11 pr-10 text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#0B2545]"
        />
        {query.length > 0 && (
          <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!query.trim() ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Search className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">{t("client.search.prompt", "Que recherchez-vous aujourd'hui ?")}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-3xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : !searched || (vendeurs.length === 0 && produits.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Store className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">{t("client.search.noResults", "Aucun résultat pour cette recherche.")}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {vendeurs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Store className="h-4.5 w-4.5 text-[#0B2545]" />
                <h2 className="text-sm font-black text-slate-900">{t("client.search.boutiquesSection", "Boutiques")}</h2>
              </div>
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
            </section>
          )}

          {produits.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-4.5 w-4.5 text-[#0B2545]" />
                <h2 className="text-sm font-black text-slate-900">{t("client.search.productsSection", "Produits")}</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {produits.map((p) => {
                  const image = resolveMediaUrl(p.photo_produit);
                  return (
                    <Link
                      key={p.id}
                      href={p.vendeur_id ? `/boutique/${p.vendeur_id}` : "#"}
                      className="group rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden transition-all duration-300 hover:bg-white hover:border-slate-200 hover:shadow-xl cursor-pointer"
                    >
                      <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image} alt={p.nom_produit} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <Package className="h-7 w-7" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-xs font-black text-slate-900 group-hover:text-[#0B2545] transition-colors truncate">{p.nom_produit}</h3>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.vendeur?.nom_commerce || ""}</p>
                        <p className="text-xs font-extrabold text-[#0B2545] mt-1.5">{Math.round(Number(p.prix_unitaire)).toLocaleString("fr-FR")} FCFA</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
