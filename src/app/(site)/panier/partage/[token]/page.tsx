"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, PackageX, ShoppingBag, User } from "lucide-react";
import { fetchSharedPanier, resolveMediaUrl, type SharedPanier } from "@/lib/api";

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';

export default function SharedPanierPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [panier, setPanier] = useState<SharedPanier | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "not_found">("loading");

  useEffect(() => {
    fetchSharedPanier(token)
      .then((data) => { setPanier(data); setStatus("ready"); })
      .catch(() => setStatus("not_found"));
  }, [token]);

  if (status === "loading") {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </main>
    );
  }

  if (status === "not_found" || !panier) {
    return (
      <main className="mx-auto w-full max-w-md px-4 sm:px-6 lg:px-8 my-16 flex-1 text-center">
        <PackageX className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-black text-slate-900">Ce lien de panier est invalide ou a expiré.</h1>
        <Link href="/" className="inline-flex items-center gap-2 mt-6 text-xs font-extrabold text-[#0B2545] hover:underline">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="h-10 w-10 rounded-xl bg-[#0B2545] flex items-center justify-center shrink-0">
          <ShoppingBag className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900">Panier partagé</h1>
          {panier.expediteur && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <User className="h-3 w-3" /> Envoyé par {panier.expediteur}
              {panier.beneficiaire ? ` pour ${panier.beneficiaire}` : ""}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4 mb-4">
        Voici les produits que {panier.expediteur || "un proche"} souhaite vous envoyer via Zando na Ndako.
        Ce panier est à titre indicatif — la commande sera finalisée directement par l&apos;expéditeur.
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden mb-4">
        {panier.lignes.map((ligne, i) => (
          <div key={i} className={`flex items-center gap-3 p-3.5 ${i > 0 ? "border-t border-slate-100" : ""}`}>
            <img src={resolveMediaUrl(ligne.photo) || FALLBACK_IMAGE} alt={ligne.nom_produit} className="h-12 w-12 rounded-xl object-cover bg-slate-50 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{ligne.nom_produit}</p>
              <p className="text-xs text-slate-400">{ligne.quantite} × {Number(ligne.prix_unitaire).toLocaleString('fr-FR')} FCFA / {ligne.unite}</p>
            </div>
            <span className="text-sm font-black text-[#0B2545] shrink-0">{Number(ligne.sous_total).toLocaleString('fr-FR')} FCFA</span>
          </div>
        ))}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border-t border-slate-100">
          <span className="text-sm font-black text-slate-900">Sous-total ({panier.nombre_articles} article{panier.nombre_articles > 1 ? "s" : ""})</span>
          <span className="text-sm font-black text-[#0B2545]">{Number(panier.sous_total).toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Vous n&apos;avez rien à faire ici — répondez simplement à {panier.expediteur || "l'expéditeur"} pour confirmer.
      </p>
    </main>
  );
}
