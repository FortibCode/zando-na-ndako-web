"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Check, CreditCard, Loader2, Smartphone } from "lucide-react";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { useCheckout } from "@/lib/checkout-context";
import { useCart } from "@/components/landing/cart-context";
import {
  ApiError,
  ajouterAuPanier,
  confirmerAirtelMoney,
  confirmerCarteLocale,
  confirmerMtnMoMo,
  confirmerPaiementLivraison,
  fetchZonesRaw,
  initierAirtelMoney,
  initierCarteLocale,
  initierMtnMoMo,
  resolveZoneForQuartier,
  validerCommande,
  viderPanier,
  type ApiPaiement,
  type ZoneOption,
} from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

type MethodKey = "cod" | "carte" | "mtn" | "airtel";

type Phase = "selecting" | "placing" | "awaiting_reference" | "confirming" | "mtn_polling" | "error";

export default function CheckoutPaymentPage() {
  const { t } = useLanguage();
  const METHODS: { key: MethodKey; label: string; hint: string; icon: typeof Banknote }[] = [
    { key: "cod", label: t('client.checkoutPayment.methodCod', 'Paiement à la livraison'), hint: t('client.checkoutPayment.methodCodHint', 'Payez en espèces à la réception'), icon: Banknote },
    { key: "carte", label: t('client.checkoutPayment.methodCard', 'Carte bancaire'), hint: t('client.checkoutPayment.methodCardHint', 'Visa, Mastercard'), icon: CreditCard },
    { key: "mtn", label: t('client.checkoutPayment.methodMtn', 'MTN Mobile Money'), hint: t('client.checkoutPayment.methodMobileHint', 'Confirmez via USSD sur votre téléphone'), icon: Smartphone },
    { key: "airtel", label: t('client.checkoutPayment.methodAirtel', 'Airtel Money'), hint: t('client.checkoutPayment.methodMobileHint', 'Confirmez via USSD sur votre téléphone'), icon: Smartphone },
  ];
  const router = useRouter();
  const { address, slot } = useCheckout();
  const { items, totalAmount, clearCart } = useCart();

  const [method, setMethod] = useState<MethodKey>("cod");
  const [phase, setPhase] = useState<Phase>("selecting");
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [pendingPaiement, setPendingPaiement] = useState<ApiPaiement | null>(null);
  const [pendingOrder, setPendingOrder] = useState<{ commande_id: string; numero_commande: string; montant_total: number } | null>(null);
  const [zones, setZones] = useState<ZoneOption[]>([]);

  useEffect(() => {
    if (!address || !slot) { router.replace("/commande/adresse"); return; }
    fetchZonesRaw().then(setZones).catch(() => setZones([]));
  }, [address, slot, router]);

  const zone = useMemo(() => resolveZoneForQuartier(zones, address?.quartier || undefined, address?.ville), [zones, address]);

  // MTN Mobile Money : vraie demande de paiement déjà envoyée (voir placeOrder) — on interroge
  // périodiquement le vrai statut MTN plutôt que de faire saisir un code de confirmation qui
  // n'existe pas dans le flux réel MTN (le client valide via son téléphone, pas via un code).
  useEffect(() => {
    if (phase !== "mtn_polling" || !pendingPaiement || !pendingOrder) return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 40; // ~160s de polling, cohérent avec le timer USSD de l'app mobile
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const result = await confirmerMtnMoMo(pendingPaiement.id);
        if (cancelled) return;
        if (result.status === "valide") {
          clearCart();
          router.push(`/commande/confirmee?numero=${encodeURIComponent(pendingOrder.numero_commande)}&montant=${pendingOrder.montant_total}&id=${pendingOrder.commande_id}`);
          return;
        }
        if (result.status === "echoue") {
          setError(result.message || t('client.checkoutPayment.mtnFailed', 'Le paiement MTN MoMo a échoué.'));
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
  }, [phase, pendingPaiement, pendingOrder, clearCart, router, t]);

  if (!address || !slot) return null;

  const placeOrder = async () => {
    if (!zone) { setError(t('client.checkoutPayment.deliveryUnavailableError', 'Livraison indisponible pour ce quartier pour le moment.')); setPhase("error"); return; }
    if (items.length === 0) { router.replace("/accueil"); return; }

    setPhase("placing");
    setError(null);
    try {
      await viderPanier().catch(() => undefined);
      for (const item of items) {
        await ajouterAuPanier(item.id, item.quantity);
      }
      const order = await validerCommande({
        adresse_livraison: `${address.adresse}${address.ville ? `, ${address.ville}` : ""}`,
        adresse_livraison_id: address.id,
        zone_id: zone.id,
        creneau_livraison_debut: slot.debut,
        creneau_livraison_fin: slot.fin,
        coordonnees_gps: address.coordonnees_gps || undefined,
      });
      setPendingOrder(order);

      if (method === "cod") {
        await confirmerPaiementLivraison(order.commande_id);
        finish(order.numero_commande, order.montant_total, order.commande_id);
        return;
      }

      if (method === "mtn") {
        const paiement = await initierMtnMoMo(order.commande_id, phone.trim() || undefined);
        setPendingPaiement(paiement);
        setPhase("mtn_polling");
        return;
      }

      let paiement: ApiPaiement;
      if (method === "airtel") {
        paiement = await initierAirtelMoney(order.commande_id);
      } else {
        paiement = await initierCarteLocale(order.commande_id);
      }
      setPendingPaiement(paiement);
      setPhase("awaiting_reference");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('client.checkoutPayment.finalizeOrderError', 'Impossible de finaliser la commande.'));
      setPhase("error");
    }
  };

  const confirmReference = async () => {
    if (!pendingPaiement || !pendingOrder || !reference.trim()) return;
    setPhase("confirming");
    setError(null);
    try {
      // MTN Mobile Money ne passe jamais par ici : il est confirmé via le polling automatique
      // de statut réel (voir le useEffect sur phase === "mtn_polling").
      const confirmer = method === "carte" ? confirmerCarteLocale : confirmerAirtelMoney;
      await confirmer(pendingPaiement.id, reference.trim());
      finish(pendingOrder.numero_commande, pendingOrder.montant_total, pendingOrder.commande_id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('client.checkoutPayment.invalidCodeError', 'Code de confirmation invalide.'));
      setPhase("awaiting_reference");
    }
  };

  const finish = (numero: string, montant: number, id: string) => {
    clearCart();
    router.push(`/commande/confirmee?numero=${encodeURIComponent(numero)}&montant=${montant}&id=${id}`);
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <CheckoutSteps current={3} />
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-1">{t('client.checkoutPayment.title', 'Paiement')}</h1>
      <p className="text-sm text-slate-500 text-center mb-8">
        {t('client.checkoutPayment.totalToPayPrefix', 'Total à payer :')} <span className="font-black text-[#0B2545]">{Math.round(totalAmount).toLocaleString('fr-FR')} FCFA</span>
      </p>

      {phase === "mtn_polling" ? (
        <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white text-center space-y-4">
          <Smartphone className="h-10 w-10 text-[#0B2545] mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            {t('client.checkoutPayment.mtnRequestSent', 'Une notification MTN Mobile Money a été envoyée à')} +242 {phone.trim()}.
          </p>
          <p className="text-xs text-slate-500">
            {t('client.checkoutPayment.mtnEnterPin', 'Entrez votre code PIN sur votre téléphone pour valider le paiement de')} {Math.round(totalAmount).toLocaleString('fr-FR')} FCFA.
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-[#0B2545] mx-auto" />
          <p className="text-xs text-slate-400">{t('client.checkoutPayment.mtnWaiting', 'En attente de votre validation…')}</p>
        </div>
      ) : phase === "awaiting_reference" || phase === "confirming" ? (
        <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white text-center space-y-4">
          <Smartphone className="h-10 w-10 text-[#0B2545] mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            {t('client.checkoutPayment.requestSentPrefix', 'Une demande de paiement de')} {Math.round(totalAmount).toLocaleString('fr-FR')} {t('client.checkoutPayment.requestSentSuffix', 'FCFA a été envoyée.')}
            {method !== "carte" && ` ${t('client.checkoutPayment.approveUssd', 'Approuvez-la via le message USSD reçu sur votre téléphone,')}`} {t('client.checkoutPayment.thenEnterCode', 'puis saisissez le code de confirmation reçu.')}
          </p>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={t('client.checkoutPayment.codePlaceholder', 'Code de confirmation')}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-center text-sm font-bold tracking-wider focus:outline-none focus:border-[#0B2545]"
          />
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <button
            onClick={confirmReference}
            disabled={!reference.trim() || phase === "confirming"}
            className="w-full h-12 rounded-xl bg-[#e01313] hover:bg-[#c00000] disabled:opacity-40 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2"
          >
            {phase === "confirming" ? <Loader2 className="h-4 w-4 animate-spin" /> : t('client.checkoutPayment.confirmPayment', 'Confirmer le paiement')}
          </button>
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
