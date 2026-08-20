"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Home, Truck } from "lucide-react";

export default function CheckoutConfirmedPage() {
  return (
    <Suspense>
      <CheckoutConfirmedInner />
    </Suspense>
  );
}

function CheckoutConfirmedInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const numero = searchParams.get("numero") || "";
  const montant = Number(searchParams.get("montant") || 0);
  const id = searchParams.get("id") || "";

  return (
    <main className="mx-auto w-full max-w-lg px-4 sm:px-6 lg:px-8 my-14 sm:my-20 flex-1 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
      </div>
      <h1 className="text-2xl font-black text-slate-900">Commande confirmée !</h1>
      <p className="text-sm text-slate-500 mt-3">
        Votre commande <span className="font-black text-[#0B2545]">{numero}</span> d&apos;un montant de{" "}
        <span className="font-black text-[#0B2545]">{montant.toLocaleString('fr-FR')} FCFA</span> a bien été enregistrée.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button
          onClick={() => router.push(id ? `/mes-commandes/${id}` : "/mes-commandes")}
          className="flex-1 h-12 rounded-xl bg-[#0B2545] hover:bg-[#061830] text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2"
        >
          <Truck className="h-4 w-4" /> Suivre ma commande
        </button>
        <Link
          href="/"
          className="flex-1 h-12 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-sm transition-all flex items-center justify-center gap-2"
        >
          <Home className="h-4 w-4" /> Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
