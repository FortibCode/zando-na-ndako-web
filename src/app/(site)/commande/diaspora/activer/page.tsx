"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Globe2, Radar, ShieldCheck, Truck } from "lucide-react";

const FEATURES = [
  { icon: ShieldCheck, text: "Paiement sécurisé en € ou $" },
  { icon: Truck, text: "Livraison rapide à Brazzaville" },
  { icon: Radar, text: "Suivi en temps réel" },
];

export default function DiasporaActivationPage() {
  const router = useRouter();

  return (
    <main className="mx-auto w-full max-w-lg px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0B2545] transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="w-32 h-32 rounded-full bg-[#0B2545] flex items-center justify-center mb-8 shadow-lg shadow-[#0B2545]/25">
          <Globe2 className="w-16 h-16 text-white" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#0B2545] leading-tight">
          Envoyez des courses<br />à vos proches au Congo
        </h1>

        <div className="w-full space-y-3.5 mt-8 mb-10">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-slate-700">{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/commande/diaspora/beneficiaire")}
          className="w-full h-14 rounded-2xl bg-[#e01313] hover:bg-[#c00000] text-white font-black text-base shadow-lg shadow-[#e01313]/25 transition-all cursor-pointer"
        >
          Activer le Mode Diaspora
        </button>
        <button onClick={() => router.back()} className="mt-3 text-sm font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
          Plus tard
        </button>
      </div>
    </main>
  );
}
