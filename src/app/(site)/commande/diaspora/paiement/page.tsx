"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

type MethodKey = "stripe" | "paypal" | "carte";

const METHODS: { key: MethodKey; label: string; hint: string }[] = [
  { key: "stripe", label: "Carte bancaire internationale", hint: "Visa, Mastercard via Stripe" },
  { key: "paypal", label: "PayPal", hint: "Payer avec votre compte PayPal" },
];

type Phase = "selecting" | "placing" | "awaiting_reference" | "confirming" | "error";

export default function DiasporaPaymentPage() {
  const router = useRouter();
  const { beneficiaire, slot } = useCheckout();
  const { items, totalAmount, clearCart } = useCart();

  const [method, setMethod] = useState<MethodKey>("stripe");
  const [phase, setPhase] = useState<Phase>("selecting");
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [pendingOrder, setPendingOrder] = useState<{ commande_id: string; numero_commande: string; montant_total: number } | null>(null);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [equivalents, setEquivalents] = useState<{ eur: number; usd: number } | null>(null);

  useEffect(() => {
    if (!beneficiaire || !slot) { router.replace("/commande/diaspora/beneficiaire"); return; }
    fetchZonesRaw().then(setZones).catch(() => setZones([]));
    fetchDeviseEquivalents(totalAmount).then(setEquivalents).catch(() => setEquivalents(null));
  }, [beneficiaire, slot, router, totalAmount]);

  const zone = useMemo(() => resolveZoneForQuartier(zones, beneficiaire?.quartier, beneficiaire?.ville || undefined), [zones, beneficiaire]);

  if (!beneficiaire || !slot) return null;

  const placeOrder = async () => {
    if (!zone) { setError("Livraison indisponible pour ce quartier pour le moment."); setPhase("error"); return; }
    if (items.length === 0) { router.replace("/"); return; }

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
      setPendingOrder(order);

      if (method === "paypal") await initierPayPal(order.commande_id);
      else await initierStripe(order.commande_id);
      setPhase("awaiting_reference");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de finaliser la commande.");
      setPhase("error");
    }
  };

  const confirmReference = async () => {
    if (!pendingOrder || !reference.trim()) return;
    setPhase("confirming");
    setError(null);
    try {
      if (method === "paypal") await confirmerPayPal(pendingOrder.commande_id, reference.trim());
      else await confirmerStripe(pendingOrder.commande_id, reference.trim());
      clearCart();
      router.push(`/commande/confirmee?numero=${encodeURIComponent(pendingOrder.numero_commande)}&montant=${pendingOrder.montant_total}&id=${pendingOrder.commande_id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Confirmation de paiement invalide.");
      setPhase("awaiting_reference");
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <CheckoutSteps current={3} firstLabel="Bénéficiaire" />
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-1">Paiement</h1>
      <p className="text-sm text-slate-500 text-center mb-1">
        Total : <span className="font-black text-[#0B2545]">{Math.round(totalAmount).toLocaleString('fr-FR')} FCFA</span>
      </p>
      {equivalents && (
        <p className="text-xs text-slate-400 text-center mb-8">
          ≈ {equivalents.eur.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} € · ≈ {equivalents.usd.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} $
        </p>
      )}

      {phase === "awaiting_reference" || phase === "confirming" ? (
        <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white text-center space-y-4">
          <CreditCard className="h-10 w-10 text-[#0B2545] mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            Finalisez votre paiement via {method === "paypal" ? "PayPal" : "Stripe"}, puis saisissez la référence de confirmation reçue.
          </p>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Référence de confirmation"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-center text-sm font-bold tracking-wider focus:outline-none focus:border-[#0B2545]"
          />
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <button
            onClick={confirmReference}
            disabled={!reference.trim() || phase === "confirming"}
            className="w-full h-12 rounded-xl bg-[#e01313] hover:bg-[#c00000] disabled:opacity-40 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2"
          >
            {phase === "confirming" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer le paiement"}
          </button>
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
            {phase === "placing" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmer la commande"}
          </button>
        </>
      )}
    </main>
  );
}
