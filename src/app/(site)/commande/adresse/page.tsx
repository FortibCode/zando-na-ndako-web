"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, MapPin, Plus, Star, Trash2, X } from "lucide-react";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { useCheckout } from "@/lib/checkout-context";
import { useCart } from "@/components/landing/cart-context";
import {
  ApiError,
  createAddress,
  deleteAddress,
  fetchAddresses,
  fetchZonesRaw,
  setDefaultAddress,
  type DeliveryAddress,
  type DeliveryAddressInput,
  type ZoneOption,
} from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/lib/toast-context";

const EMPTY_FORM: DeliveryAddressInput = { label: "", adresse: "", quartier: "", ville: "Brazzaville" };

export default function CheckoutAddressPage() {
  return (
    <Suspense>
      <CheckoutAddressPageInner />
    </Suspense>
  );
}

function CheckoutAddressPageInner() {
  const { t } = useLanguage();
  const { notify, notifyError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Accessible aussi hors checkout, depuis "Mon compte" (gestion des adresses enregistrées) — dans
  // ce cas le panier peut être vide, ce n'est pas une raison de renvoyer le client à l'accueil.
  const standalone = searchParams.get("standalone") === "1";
  const { address, setAddress } = useCheckout();
  const { items, hydrated } = useCart();

  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DeliveryAddressInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zones, setZones] = useState<ZoneOption[]>([]);

  // "Quartier" doit correspondre à une vraie valeur de zones_livraison.quartiers_couverts pour que
  // resolveZoneForQuartier() trouve la bonne zone — un texte libre pouvait ne matcher aucune zone
  // réelle et retombait silencieusement sur zones[0] (mauvais tarif de livraison affiché plus loin
  // dans le tunnel). Dérivé des vraies zones actives plutôt qu'une liste codée en dur.
  const quartierOptions = zones
    .flatMap((z) => (z.quartiers_couverts || []).map((quartier) => ({ quartier, ville: z.ville })))
    .sort((a, b) => a.quartier.localeCompare(b.quartier));

  const load = () => {
    setLoading(true);
    fetchAddresses()
      .then((data) => {
        setAddresses(data);
        const preselect = data.find((a) => a.est_defaut) || data[0];
        if (preselect && !address) setAddress(preselect);
      })
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetchZonesRaw().then(setZones).catch(() => setZones([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Un panier vide n'a rien à livrer — on renvoie vers l'accueil client (pas la vitrine "/",
  // réservée aux visiteurs anonymes) plutôt que de laisser choisir une adresse pour rien. Ne
  // s'applique pas en mode standalone (gestion d'adresses depuis "Mon compte").
  useEffect(() => {
    if (!standalone && hydrated && items.length === 0) router.replace("/accueil");
  }, [standalone, hydrated, items, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await createAddress(form);
      setAddresses((prev) => [...prev, created]);
      setAddress(created);
      setForm(EMPTY_FORM);
      setShowForm(false);
      notify(t('client.checkoutAddress.saveSuccess', 'Adresse enregistrée.'));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('client.checkoutAddress.saveError', "Impossible d'enregistrer cette adresse.");
      setError(message);
      notifyError(err, message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (address?.id === id) setAddress(null);
      notify(t('client.checkoutAddress.deleteSuccess', 'Adresse supprimée.'));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('client.checkoutAddress.deleteError', "Impossible de supprimer cette adresse.");
      setError(message);
      notifyError(err, message);
    }
  };

  const handleSetDefault = async (id: string) => {
    setError(null);
    try {
      await setDefaultAddress(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, est_defaut: a.id === id })));
      notify(t('client.checkoutAddress.setDefaultSuccess', 'Adresse par défaut mise à jour.'));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('client.checkoutAddress.setDefaultError', "Impossible de changer l'adresse par défaut.");
      setError(message);
      notifyError(err, message);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      {!standalone && <CheckoutSteps current={1} />}
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-1">{t('client.checkoutAddress.title', 'Adresse de livraison')}</h1>
      <p className="text-sm text-slate-500 text-center mb-8">
        {standalone
          ? t('client.checkoutAddress.subtitleStandalone', 'Gérez vos adresses de livraison enregistrées.')
          : t('client.checkoutAddress.subtitle', 'Choisissez où vous souhaitez être livré.')}
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <button
              key={a.id}
              onClick={() => setAddress(a)}
              className={`w-full flex items-start justify-between gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                address?.id === a.id ? "border-[#0B2545] bg-blue-50/40" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin className={`h-5 w-5 mt-0.5 shrink-0 ${address?.id === a.id ? "text-[#0B2545]" : "text-slate-400"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900">{a.label}</p>
                    {a.est_defaut && (
                      <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-current" /> {t('client.checkoutAddress.defaultBadge', 'Défaut')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{a.adresse}{a.quartier ? `, ${a.quartier}` : ""}, {a.ville}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!a.est_defaut && (
                  <span
                    onClick={(e) => { e.stopPropagation(); handleSetDefault(a.id); }}
                    className="p-1.5 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                    title={t('client.checkoutAddress.setDefaultTitle', 'Définir par défaut')}
                  >
                    <Star className="h-4 w-4" />
                  </span>
                )}
                <span
                  onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                  title={t('client.checkoutAddress.deleteTitle', 'Supprimer')}
                >
                  <Trash2 className="h-4 w-4" />
                </span>
                {address?.id === a.id && <Check className="h-5 w-5 text-[#0B2545] ml-1" />}
              </div>
            </button>
          ))}

          {error && !showForm && <p className="text-xs font-semibold text-red-600 px-1">{error}</p>}

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-500 hover:border-[#0B2545] hover:text-[#0B2545] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" /> {t('client.checkoutAddress.addAddress', 'Ajouter une adresse')}
            </button>
          ) : (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl border-2 border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-900">{t('client.checkoutAddress.newAddressTitle', 'Nouvelle adresse')}</p>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <input required placeholder={t('client.checkoutAddress.labelPlaceholder', 'Libellé (ex: Domicile, Bureau)')} value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]" />
              <input required placeholder={t('client.checkoutAddress.addressPlaceholder', 'Adresse (rue, numéro…)')} value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.quartier || ""}
                  onChange={(e) => {
                    const match = quartierOptions.find((o) => o.quartier === e.target.value);
                    setForm({ ...form, quartier: e.target.value, ville: match?.ville || form.ville });
                  }}
                  className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:border-[#0B2545]">
                  <option value="">{t('client.checkoutAddress.neighborhoodPlaceholder', 'Quartier')}</option>
                  {quartierOptions.map((o) => <option key={o.quartier} value={o.quartier}>{o.quartier}</option>)}
                </select>
                <input required placeholder={t('client.checkoutAddress.cityPlaceholder', 'Ville')} value={form.ville}
                  onChange={(e) => setForm({ ...form, ville: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]" />
              </div>
              {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
              <button type="submit" disabled={saving}
                className="w-full h-10 rounded-xl bg-[#0B2545] text-white text-sm font-bold hover:bg-[#061830] disabled:opacity-50 transition-colors">
                {saving ? t('client.checkoutAddress.saving', 'Enregistrement…') : t('client.checkoutAddress.saveAddress', "Enregistrer l'adresse")}
              </button>
            </form>
          )}
        </div>
      )}

      {!standalone && (
        <button
          onClick={() => router.push("/commande/creneau")}
          disabled={!address}
          className="w-full h-13 mt-8 rounded-xl bg-[#e01313] hover:bg-[#c00000] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-[#e01313]/25 transition-all"
        >
          {t('client.checkoutAddress.continueBtn', 'Continuer')}
        </button>
      )}
    </main>
  );
}
