"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Globe2, Heart, Loader2, Search, Truck } from "lucide-react";
import { useRequirePublicAuth } from "@/lib/use-require-public-auth";
import { useFavorites } from "@/lib/favorites";
import { Categories } from "@/components/landing/Categories";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { PromoBanner } from "@/components/landing/PromoBanner";
import { fetchZonesRaw, type ZoneOption } from "@/lib/api";

export default function AccueilPage() {
  const router = useRouter();
  const { user, isReady } = useRequirePublicAuth();
  const { favorites } = useFavorites();

  const [query, setQuery] = useState("");
  const [zones, setZones] = useState<ZoneOption[]>([]);

  useEffect(() => {
    if (isReady && user && user.type_utilisateur === "vendeur") {
      router.replace("/vendeur");
    }
  }, [isReady, user, router]);

  useEffect(() => {
    fetchZonesRaw().then(setZones).catch(() => setZones([]));
  }, []);

  if (!isReady || !user || user.type_utilisateur === "vendeur") {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </main>
    );
  }

  const firstName = user.nom_complet?.split(" ")[0] || "";
  const fee = zones[0] ? Math.round(Number(zones[0].frais_livraison_base)) : 800;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/produits?q=${encodeURIComponent(query.trim())}` : "/produits");
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 my-8 sm:my-10 flex-1">
      <div>
        <p className="text-sm font-bold text-slate-500">
          Bonjour {firstName} <span className="text-slate-300">·</span> <span className="text-emerald-600">Ouvert</span>
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">Le marché frais, livré chez vous</h1>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un produit, un marché…"
          className="w-full h-13 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white shadow-xs text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0B2545] focus:ring-1 focus:ring-[#0B2545]"
        />
      </form>

      <PromoBanner />

      <Categories />

      <FeaturedProducts />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Truck className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Livraison express à Brazzaville</p>
            <p className="text-xs text-slate-500 mt-0.5">En 30–60 min · dès {fee.toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>

        <button
          onClick={() => router.push("/favoris")}
          className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-[#0B2545]/30 transition-colors text-left cursor-pointer"
        >
          <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Heart className="h-6 w-6 text-[#c00000]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-slate-900">Mes favoris</p>
            <p className="text-xs text-slate-500 mt-0.5">{favorites.length > 0 ? `${favorites.length} produit${favorites.length > 1 ? "s" : ""} enregistré${favorites.length > 1 ? "s" : ""}` : "Aucun favori pour le moment"}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
        </button>
      </div>

      {user.est_diaspora && (
        <button
          onClick={() => router.push("/commande/diaspora/activer")}
          className="w-full flex items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-[#0B2545]/30 transition-colors text-left cursor-pointer"
        >
          <div className="h-12 w-12 rounded-xl bg-[#0B2545] flex items-center justify-center shrink-0">
            <Globe2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-slate-900">Commander pour quelqu&apos;un au Congo</p>
            <p className="text-xs font-bold text-[#0B2545] mt-0.5">Mode Diaspora</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
        </button>
      )}
    </main>
  );
}
