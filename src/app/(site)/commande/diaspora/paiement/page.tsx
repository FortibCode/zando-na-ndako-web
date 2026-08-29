"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { useCheckout } from "@/lib/checkout-context";
import { useCart } from "@/components/landing/cart-context";
import {
  ApiError,
  ajouterAuPanier,
  commanderPourProche,
  confirmerPayPal,
  confirmerStripe,
  fetchDeviseEquivalents,
  fetchZonesRaw,
  initierPayPal,
  initierStripe,
  resolveZoneForQuartier,
  viderPanier,
  type ZoneOption,
} from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/lib/toast-context";

type MethodKey = "stripe" | "paypal" | "carte";

type Phase = "selecting" | "placing" | "redirecting" | "confirming" | "error";

export default function DiasporaPaymentPage() {
  return (
    <Suspense>
      <DiasporaPaymentInner />
    </Suspense>
  );
}

function DiasporaPaymentInner() {
  const { t } = useLanguage();
  const { notifyError } = useToast();
  const METHODS: { key: MethodKey; label: string; hint: string }[] = [
    { key: "stripe", label: t('client.diasporaPayment.methodCard', 'Carte bancaire internationale'), hint: t('client.diasporaPayment.methodCardHint', 'Visa, Mastercard via Stripe') },
    { key: "paypal", label: t('client.diasporaPayment.methodPaypal', 'PayPal'), hint: t('client.diasporaPayment.methodPaypalHint', 'Payer avec votre compte PayPal') },
  ];
  const router = useRouter();
  const searchParams = useSearchParams();
  const { beneficiaire, slot } = useCheckout();
  const { items, totalAmount, clearCart } = useCart();

  const [method, setMethod] = useState<MethodKey>("stripe");
  const [phase, setPhase] = useState<Phase>("selecting");
  const [error, setError] = useState<string | null>(null);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [equivalents, setEquivalents] = useState<{ eur: number; usd: number } | null>(null);

  // Retour d'une redirection pleine page vers Stripe Checkout / l'approbation PayPal — à ce stade
  // le contexte React (bénéficiaire/créneau) a été perdu par le rechargement de page, donc tout ce
  // dont on a besoin (commande_id, numero, montant) voyage dans l'URL de retour elle-même.
  const returnCommandeId = searchParams.get("commande_id");
  const returnSessionId = searchParams.get("session_id");
  const returnToken = searchParams.get("token");
  const returnPayerId = searchParams.get("PayerID");
  const returnCancelled = searchParams.get("cancelled");
  const isPaymentReturn = Boolean(returnCommandeId && (returnSessionId || returnToken || returnCancelled));

  useEffect(() => {
    if (isPaymentReturn) return;
    if (!beneficiaire || !slot) { router.replace("/commande/diaspora/beneficiaire"); return; }
    fetchZonesRaw().then(setZones).catch(() => setZones([]));
    fetchDeviseEquivalents(totalAmount).then(setEquivalents).catch(() => setEquivalents(null));
  }, [beneficiaire, slot, router, totalAmount, isPaymentReturn]);

  useEffect(() => {
    if (!isPaymentReturn || !returnCommandeId) return;
    const numeroCommande = searchParams.get("numero_commande") || "";
    const montantTotal = searchParams.get("montant_total") || "0";

    if (returnCancelled) {
      setError(t('client.diasporaPayment.paymentCancelled', 'Paiement annulé.'));
      router.replace("/commande/diaspora/paiement");
      return;
    }

    (async () => {
      setPhase("confirming");
      setError(null);
      try {
        if (returnSessionId) {
          await confirmerStripe(returnCommandeId, returnSessionId);
        } else if (returnToken && returnPayerId) {
          await confirmerPayPal(returnCommandeId, returnToken);
        } else {
          router.replace("/commande/diaspora/paiement");
          return;
        }
        clearCart();
        router.replace(`/commande/confirmee?numero=${encodeURIComponent(numeroCommande)}&montant=${montantTotal}&id=${returnCommandeId}`);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t('client.diasporaPayment.invalidReferenceError', 'Confirmation de paiement invalide.');
        setError(message);
        setPhase("error");
        notifyError(err, message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaymentReturn, returnCommandeId, returnSessionId, returnToken, returnPayerId, returnCancelled]);

  const zone = useMemo(() => resolveZoneForQuartier(zones, beneficiaire?.quartier, beneficiaire?.ville || undefined), [zones, beneficiaire]);

  if (isPaymentReturn) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
        <div className="p-10 rounded-2xl border-2 border-slate-200 bg-white text-center space-y-4">
          {phase === "error" ? (
            <>
              <p className="text-sm font-bold text-red-600">{error}</p>
              <button
                onClick={() => router.replace("/commande/diaspora/paiement")}
                className="mt-2 h-11 px-6 rounded-xl bg-[#0B2545] text-white font-extrabold text-sm"
              >
                {t('client.diasporaPayment.backToPayment', 'Retour au paiement')}
              </button>
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-[#0B2545] mx-auto" />
              <p className="text-sm font-bold text-slate-800">{t('client.diasporaPayment.confirmingPayment', 'Confirmation de votre paiement…')}</p>
            </>
          )}
        </div>
      </main>
    );
  }

  if (!beneficiaire || !slot) return null;

  const placeOrder = async () => {
    if (!zone) { setError(t('client.diasporaPayment.deliveryUnavailableError', 'Livraison indisponible pour ce quartier pour le moment.')); setPhase("error"); return; }
    if (items.length === 0) { router.replace("/accueil"); return; }

    setPhase("placing");
    setError(null);
    try {
      await viderPanier().catch(() => undefined);
      for (const item of items) {
        await ajouterAuPanier(item.id, item.quantity);
      }
      const order = await commanderPourProche({
        adresse_livraison: `${beneficiaire.adresse}, ${beneficiaire.quartier}${beneficiaire.ville ? `, ${beneficiaire.ville}` : ""}`,
        zone_id: zone.id,
        creneau_livraison_debut: slot.debut,
        creneau_livraison_fin: slot.fin,
        beneficiaire_id: beneficiaire.id,
        coordonnees_gps: beneficiaire.coordonnees_gps || undefined,
      });

      const base = `${window.location.origin}/commande/diaspora/paiement`;
      const params = `commande_id=${order.commande_id}&numero_commande=${encodeURIComponent(order.numero_commande)}&montant_total=${order.montant_total}`;
      const cancelUrl = `${base}?${params}&cancelled=1`;

      setPhase("redirecting");
      if (method === "paypal") {
        const { url } = await initierPayPal(order.commande_id, `${base}?${params}`, cancelUrl);
        window.location.href = url;
      } else {
        const { url } = await initierStripe(order.commande_id, `${base}?${params}`, cancelUrl);
        window.location.href = url;
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('client.diasporaPayment.finalizeOrderError', 'Impossible de finaliser la commande.');
      setError(message);
      setPhase("error");
      notifyError(err, message);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <CheckoutSteps current={3} firstLabel={t('client.checkoutSteps.beneficiaryLabel', 'Bénéficiaire')} />
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-1">{t('client.diasporaPayment.title', 'Paiement')}</h1>
      <p className="text-sm text-slate-500 text-center mb-1">
        {t('client.diasporaPayment.totalPrefix', 'Total :')} <span className="font-black text-[#0B2545]">{Math.round(totalAmount).toLocaleString('fr-FR')} FCFA</span>
      </p>
      {equivalents && (
        <p className="text-xs text-slate-400 text-center mb-8">
          ≈ {equivalents.eur.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} € · ≈ {equivalents.usd.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} $
        </p>
      )}

      {phase === "redirecting" ? (
        <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B2545] mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            {t('client.diasporaPayment.redirectingTo', 'Redirection vers')} {method === "paypal" ? "PayPal" : "Stripe"}…
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mt-6">
            {METHODS.map((m) => (
              <button key={m.key} onClick={() => setMethod(m.key)}
                className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  method === m.key ? "border-[#0B2545] bg-blue-50/40" : "border-slate-200 bg-white hover:border-slate-300"
                }`}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${method === m.key ? "bg-[#0B2545] text-white" : "bg-slate-100 text-slate-500"}`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900">{m.label}</p>
                  <p className="text-xs text-slate-500">{m.hint}</p>
                </div>
                {method === m.key && <Check className="h-5 w-5 text-[#0B2545]" />}
              </button>
            ))}
          </div>

          {error && <p className="text-xs font-semibold text-red-600 text-center mt-4">{error}</p>}

          <button
            onClick={placeOrder}
            disabled={phase === "placing"}
            className="w-full h-13 mt-8 rounded-xl bg-[#e01313] hover:bg-[#c00000] disabled:opacity-40 text-white font-extrabold text-sm shadow-lg shadow-[#e01313]/25 transition-all flex items-center justify-center gap-2"
          >
            {phase === "placing" ? <Loader2 className="h-5 w-5 animate-spin" /> : t('client.diasporaPayment.confirmOrder', 'Confirmer la commande')}
          </button>
        </>
      )}
    </main>
  );
}
