"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Banknote, Check, CreditCard, Loader2, Smartphone } from "lucide-react";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { useCheckout } from "@/lib/checkout-context";
import { useCart } from "@/components/landing/cart-context";
import {
  ApiError,
  ajouterAuPanier,
  confirmerAirtelMoney,
  confirmerMtnMoMo,
  confirmerPaiementLivraison,
  confirmerStripe,
  fetchZonesRaw,
  initierAirtelMoney,
  initierMtnMoMo,
  initierStripe,
  resolveZoneForQuartier,
  validerCommande,
  viderPanier,
  type ApiPaiement,
  type ZoneOption,
} from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/lib/toast-context";

type MethodKey = "cod" | "carte" | "mtn" | "airtel";

type Phase = "selecting" | "placing" | "redirecting" | "confirming" | "mobile_money_polling" | "error";

export default function CheckoutPaymentPage() {
  return (
    <Suspense>
      <CheckoutPaymentInner />
    </Suspense>
  );
}

function CheckoutPaymentInner() {
  const { t } = useLanguage();
  const { notifyError } = useToast();
  const METHODS: { key: MethodKey; label: string; hint: string; icon: typeof Banknote }[] = [
    { key: "cod", label: t('client.checkoutPayment.methodCod', 'Paiement à la livraison'), hint: t('client.checkoutPayment.methodCodHint', 'Payez en espèces à la réception'), icon: Banknote },
    { key: "carte", label: t('client.checkoutPayment.methodCard', 'Carte bancaire'), hint: t('client.checkoutPayment.methodCardHint', 'Visa, Mastercard'), icon: CreditCard },
    { key: "mtn", label: t('client.checkoutPayment.methodMtn', 'MTN Mobile Money'), hint: t('client.checkoutPayment.methodMobileHint', 'Confirmez via USSD sur votre téléphone'), icon: Smartphone },
    { key: "airtel", label: t('client.checkoutPayment.methodAirtel', 'Airtel Money'), hint: t('client.checkoutPayment.methodMobileHint', 'Confirmez via USSD sur votre téléphone'), icon: Smartphone },
  ];
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, slot } = useCheckout();
  const { items, totalAmount, clearCart } = useCart();

  const [method, setMethod] = useState<MethodKey>("cod");
  const [phase, setPhase] = useState<Phase>("selecting");
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [pendingPaiement, setPendingPaiement] = useState<ApiPaiement | null>(null);
  const [pendingOrder, setPendingOrder] = useState<{ commande_id: string; numero_commande: string; montant_total: number } | null>(null);
  const [zones, setZones] = useState<ZoneOption[]>([]);

  // Déclaré avant tout useEffect qui le référence : sur le rendu "retour de paiement", le
  // composant retourne tôt (voir plus bas) avant d'atteindre une déclaration plus tardive — une
  // fonction const définie après ce retour anticipé ne serait jamais initialisée pour la closure
  // de cet effet sur ce rendu précis (erreur "Cannot access before initialization").
  const finish = (numero: string, montant: number, id: string) => {
    clearCart();
    router.push(`/commande/confirmee?numero=${encodeURIComponent(numero)}&montant=${montant}&id=${id}`);
  };

  // Retour d'une redirection pleine page vers Stripe Checkout — à ce stade le contexte React
  // (adresse/créneau) a été perdu par le rechargement de page, donc tout ce dont on a besoin
  // (commande_id, numero, montant) voyage dans l'URL de retour elle-même (voir placeOrder).
  const returnCommandeId = searchParams.get("commande_id");
  const returnSessionId = searchParams.get("session_id");
  const returnCancelled = searchParams.get("cancelled");
  const isPaymentReturn = Boolean(returnCommandeId && (returnSessionId || returnCancelled));

  useEffect(() => {
    if (isPaymentReturn) return;
    if (!address || !slot) { router.replace("/commande/adresse"); return; }
    fetchZonesRaw().then(setZones).catch(() => setZones([]));
  }, [address, slot, router, isPaymentReturn]);

  useEffect(() => {
    if (!isPaymentReturn || !returnCommandeId) return;
    const numeroCommande = searchParams.get("numero_commande") || "";
    const montantTotal = searchParams.get("montant_total") || "0";

    if (returnCancelled) {
      setError(t('client.checkoutPayment.paymentCancelled', 'Paiement annulé.'));
      setPhase("error");
      return;
    }

    (async () => {
      setPhase("confirming");
      setError(null);
      try {
        if (!returnSessionId) { router.replace("/commande/paiement"); return; }
        await confirmerStripe(returnCommandeId, returnSessionId);
        finish(numeroCommande, Number(montantTotal), returnCommandeId);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t('client.checkoutPayment.invalidReferenceError', 'Confirmation de paiement invalide.');
        setError(message);
        setPhase("error");
        notifyError(err, message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaymentReturn, returnCommandeId, returnSessionId, returnCancelled]);

  const zone = useMemo(() => resolveZoneForQuartier(zones, address?.quartier || undefined, address?.ville), [zones, address]);

  // MTN et Airtel Money : vraie demande de paiement déjà envoyée (voir placeOrder) — on interroge
  // périodiquement le vrai statut de l'opérateur plutôt que de faire saisir un code de
  // confirmation qui n'existe pas dans le flux réel (le client valide via son téléphone).
  useEffect(() => {
    if (phase !== "mobile_money_polling" || !pendingPaiement || !pendingOrder) return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 40; // ~160s de polling, cohérent avec le timer USSD de l'app mobile
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const confirmer = method === "mtn" ? confirmerMtnMoMo : confirmerAirtelMoney;

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const result = await confirmer(pendingPaiement.id);
        if (cancelled) return;
        if (result.status === "valide") {
          finish(pendingOrder.numero_commande, pendingOrder.montant_total, pendingOrder.commande_id);
          return;
        }
        if (result.status === "echoue") {
          setError(result.message || t('client.checkoutPayment.mtnFailed', 'Le paiement a échoué.'));
          setPhase("error");
          return;
        }
      } catch {
        // Erreur réseau ponctuelle pendant le polling : on retente au prochain intervalle.
      }
      if (cancelled) return;
      if (attempts >= maxAttempts) {
        setError(t('client.checkoutPayment.mtnTimeout', "Délai dépassé. Vous n'avez pas validé le paiement à temps."));
        setPhase("error");
        return;
      }
      timeout = setTimeout(poll, 4000);
    };

    timeout = setTimeout(poll, 3000);
    return () => { cancelled = true; if (timeout) clearTimeout(timeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, method, pendingPaiement, pendingOrder]);

  if (!isPaymentReturn && (!address || !slot)) return null;

  if (isPaymentReturn) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
        <div className="p-10 rounded-2xl border-2 border-slate-200 bg-white text-center space-y-4">
          {phase === "error" ? (
            <>
              <p className="text-sm font-bold text-red-600">{error}</p>
              <button
                onClick={() => router.replace("/commande/paiement")}
                className="mt-2 h-11 px-6 rounded-xl bg-[#0B2545] text-white font-extrabold text-sm"
              >
                {t('client.checkoutPayment.backToPayment', 'Retour au paiement')}
              </button>
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-[#0B2545] mx-auto" />
              <p className="text-sm font-bold text-slate-800">{t('client.checkoutPayment.confirmingPayment', 'Confirmation de votre paiement…')}</p>
            </>
          )}
        </div>
      </main>
    );
  }

  const syncCartAndPlaceOrder = async () => {
    if (!zone) throw new Error(t('client.checkoutPayment.deliveryUnavailableError', 'Livraison indisponible pour ce quartier pour le moment.'));
    await viderPanier().catch(() => undefined);
    for (const item of items) {
      await ajouterAuPanier(item.id, item.quantity);
    }
    return validerCommande({
      adresse_livraison: `${address!.adresse}${address!.ville ? `, ${address!.ville}` : ""}`,
      adresse_livraison_id: address!.id,
      zone_id: zone.id,
      creneau_livraison_debut: slot!.debut,
      creneau_livraison_fin: slot!.fin,
      coordonnees_gps: address!.coordonnees_gps || undefined,
    });
  };

  const placeOrder = async () => {
    if (items.length === 0) { router.replace("/accueil"); return; }

    setPhase("placing");
    setError(null);
    try {
      const order = await syncCartAndPlaceOrder();
      setPendingOrder(order);

      if (method === "cod") {
        await confirmerPaiementLivraison(order.commande_id);
        finish(order.numero_commande, order.montant_total, order.commande_id);
        return;
      }

      if (method === "carte") {
        setPhase("redirecting");
        const base = `${window.location.origin}/commande/paiement`;
        const params = `commande_id=${order.commande_id}&numero_commande=${encodeURIComponent(order.numero_commande)}&montant_total=${order.montant_total}`;
        const cancelUrl = `${base}?${params}&cancelled=1`;
        const { url, session_id } = await initierStripe(order.commande_id, `${base}?${params}`, cancelUrl);
        if (!session_id) {
          // Mode simulation (clé Stripe absente côté serveur) : confirmer directement sans redirection.
          await confirmerStripe(order.commande_id, "simulated");
          finish(order.numero_commande, order.montant_total, order.commande_id);
          return;
        }
        window.location.href = url;
        return;
      }

      const initier = method === "mtn" ? initierMtnMoMo : initierAirtelMoney;
      const paiement = await initier(order.commande_id, phone.trim() || undefined);
      setPendingPaiement(paiement);
      setPhase("mobile_money_polling");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('client.checkoutPayment.finalizeOrderError', 'Impossible de finaliser la commande.');
      setError(message);
      setPhase("error");
      notifyError(err, message);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <CheckoutSteps current={3} />
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-1">{t('client.checkoutPayment.title', 'Paiement')}</h1>
      <p className="text-sm text-slate-500 text-center mb-8">
        {t('client.checkoutPayment.totalToPayPrefix', 'Total à payer :')} <span className="font-black text-[#0B2545]">{Math.round(totalAmount).toLocaleString('fr-FR')} FCFA</span>
      </p>

      {phase === "redirecting" ? (
        <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white text-center space-y-4">
          <CreditCard className="h-10 w-10 text-[#0B2545] mx-auto" />
          <p className="text-sm font-bold text-slate-800">{t('client.checkoutPayment.redirectingToStripe', 'Redirection vers le paiement sécurisé…')}</p>
          <p className="text-xs text-slate-500">{t('client.checkoutPayment.stripeNote', 'Aucune donnée de carte ne transite jamais par ce site.')}</p>
          <Loader2 className="h-6 w-6 animate-spin text-[#0B2545] mx-auto" />
        </div>
      ) : phase === "mobile_money_polling" ? (
        <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white text-center space-y-4">
          <Smartphone className="h-10 w-10 text-[#0B2545] mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            {t('client.checkoutPayment.mtnRequestSent', 'Une notification a été envoyée à')} +242 {phone.trim()}.
          </p>
          <p className="text-xs text-slate-500">
            {t('client.checkoutPayment.mtnEnterPin', 'Entrez votre code PIN sur votre téléphone pour valider le paiement de')} {Math.round(totalAmount).toLocaleString('fr-FR')} FCFA.
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-[#0B2545] mx-auto" />
          <p className="text-xs text-slate-400">{t('client.checkoutPayment.mtnWaiting', 'En attente de votre validation…')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {METHODS.map((m) => (
              <div key={m.key} className="space-y-2">
                <button
                  onClick={() => setMethod(m.key)}
                  className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    method === m.key ? "border-[#0B2545] bg-blue-50/40" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${method === m.key ? "bg-[#0B2545] text-white" : "bg-slate-100 text-slate-500"}`}>
                    <m.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900">{m.label}</p>
                    <p className="text-xs text-slate-500">{m.hint}</p>
                  </div>
                  {method === m.key && <Check className="h-5 w-5 text-[#0B2545]" />}
                </button>
                {method === m.key && (m.key === "mtn" || m.key === "airtel") && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Numéro de téléphone {m.label} (ex: 06 123 45 67)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 text-xs font-black bg-slate-200 text-slate-700 rounded-lg">+242</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="06 123 45 67"
                        className="flex-1 h-10 px-3.5 rounded-lg border border-slate-200 text-sm font-bold focus:outline-none focus:border-[#0B2545] bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-xs font-semibold text-red-600 text-center mt-4">{error}</p>}

          <button
            onClick={placeOrder}
            disabled={phase === "placing"}
            className="w-full h-13 mt-8 rounded-xl bg-[#e01313] hover:bg-[#c00000] disabled:opacity-40 text-white font-extrabold text-sm shadow-lg shadow-[#e01313]/25 transition-all flex items-center justify-center gap-2"
          >
            {phase === "placing" ? <Loader2 className="h-5 w-5 animate-spin" /> : t('client.checkoutPayment.confirmOrder', 'Confirmer la commande')}
          </button>
        </>
      )}
    </main>
  );
}
