"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Check, Loader2, Truck } from "lucide-react";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { computeSlotDates, useCheckout } from "@/lib/checkout-context";
import { fetchZonesRaw, resolveZoneForQuartier, type ZoneOption } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

const TIME_BANDS = ["08h - 10h", "10h - 12h", "12h - 14h", "14h - 16h", "16h - 18h", "18h - 20h"];
const FALLBACK_FEE = 2000;

export default function DiasporaSlotPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { beneficiaire, slot, setSlot } = useCheckout();

  const [day, setDay] = useState<"today" | "tomorrow">("today");
  const [label, setLabel] = useState<string | null>(slot?.label || null);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  useEffect(() => {
    if (!beneficiaire) { router.replace("/commande/diaspora/beneficiaire"); return; }
    fetchZonesRaw().then(setZones).catch(() => setZones([])).finally(() => setLoadingZones(false));
  }, [beneficiaire, router]);

  if (!beneficiaire) return null;

  const zone = resolveZoneForQuartier(zones, beneficiaire.quartier, beneficiaire.ville || undefined);
  const fee = zone ? Number(zone.frais_livraison_base) : FALLBACK_FEE;

  const handleContinue = () => {
    if (!label) return;
    const { debut, fin } = computeSlotDates(day, label);
    setSlot({ day, label, debut, fin });
    router.push("/commande/diaspora/paiement");
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <CheckoutSteps current={2} firstLabel={t('client.checkoutSteps.beneficiaryLabel', 'Bénéficiaire')} />
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-1">{t('client.diasporaSlot.title', 'Créneau de livraison')}</h1>
      <p className="text-sm text-slate-500 text-center mb-8">{t('client.diasporaSlot.subtitlePrefix', 'Quand souhaitez-vous que')} {beneficiaire.nom} {t('client.diasporaSlot.subtitleSuffix', 'soit livré(e) ?')}</p>

      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50/60 border border-blue-100 mb-6">
        <Truck className="h-5 w-5 text-[#0B2545] shrink-0" />
        <div className="text-xs">
          <p className="font-bold text-slate-800">{beneficiaire.nom} — {beneficiaire.adresse}</p>
          <p className="text-slate-500">
            {loadingZones ? t('client.diasporaSlot.computingFees', 'Calcul des frais…') : `${t('client.diasporaSlot.estimatedFeesPrefix', 'Frais de livraison estimés :')} ${fee.toLocaleString('fr-FR')} FCFA`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {(["today", "tomorrow"] as const).map((d) => (
          <button key={d} onClick={() => setDay(d)}
            className={`h-11 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
              day === d ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}>
            {d === "today" ? t('client.checkoutSlot.today', "Aujourd'hui") : t('client.checkoutSlot.tomorrow', 'Demain')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TIME_BANDS.map((band) => (
          <button key={band} onClick={() => setLabel(band)}
            className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${
              label === band ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}>
            {label === band ? <Check className="h-4 w-4" /> : <CalendarClock className="h-4 w-4 text-slate-400" />}
            {band}
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!label || loadingZones}
        className="w-full h-13 mt-8 rounded-xl bg-[#e01313] hover:bg-[#c00000] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-[#e01313]/25 transition-all flex items-center justify-center"
      >
        {loadingZones ? <Loader2 className="h-5 w-5 animate-spin" /> : t('client.diasporaSlot.continueToPayment', 'Continuer vers le paiement')}
      </button>
    </main>
  );
}
