"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, Star, Trash2, User, X } from "lucide-react";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { useCheckout } from "@/lib/checkout-context";
import { useCart } from "@/components/landing/cart-context";
import {
  ApiError,
  createBeneficiaire,
  deleteBeneficiaire,
  fetchBeneficiaires,
  updateBeneficiaire,
  type Beneficiaire,
  type BeneficiaireInput,
} from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

const EMPTY_FORM: BeneficiaireInput = { nom: "", telephone: "", adresse: "", quartier: "", ville: "Brazzaville", relation: "" };

export default function DiasporaBeneficiaryPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { beneficiaire, setBeneficiaire } = useCheckout();
  const { items, hydrated } = useCart();

  const [list, setList] = useState<Beneficiaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BeneficiaireInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchBeneficiaires()
      .then((data) => {
        setList(data);
        const preselect = data.find((b) => b.est_defaut) || data[0];
        if (preselect && !beneficiaire) setBeneficiaire(preselect);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Un panier vide n'a rien à livrer — on renvoie vers l'accueil client (pas la vitrine "/",
  // réservée aux visiteurs anonymes) plutôt que de laisser choisir un bénéficiaire pour rien.
  useEffect(() => {
    if (hydrated && items.length === 0) router.replace("/accueil");
  }, [hydrated, items, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await createBeneficiaire(form);
      setList((prev) => [...prev, created]);
      setBeneficiaire(created);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('client.diasporaBeneficiary.saveError', "Impossible d'enregistrer ce bénéficiaire."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteBeneficiaire(id);
      setList((prev) => prev.filter((b) => b.id !== id));
      if (beneficiaire?.id === id) setBeneficiaire(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('client.diasporaBeneficiary.deleteError', "Impossible de supprimer ce bénéficiaire."));
    }
  };

  const handleSetDefault = async (id: string) => {
    setError(null);
    try {
      await updateBeneficiaire(id, { est_defaut: true });
      setList((prev) => prev.map((b) => ({ ...b, est_defaut: b.id === id })));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('client.diasporaBeneficiary.setDefaultError', "Impossible de changer le bénéficiaire par défaut."));
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <CheckoutSteps current={1} firstLabel={t('client.checkoutSteps.beneficiaryLabel', 'Bénéficiaire')} />
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-1">{t('client.diasporaBeneficiary.title', 'Bénéficiaire')}</h1>
      <p className="text-sm text-slate-500 text-center mb-8">{t('client.diasporaBeneficiary.subtitle', 'Pour qui souhaitez-vous passer cette commande ?')}</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((b) => (
            <button
              key={b.id}
              onClick={() => setBeneficiaire(b)}
              className={`w-full flex items-start justify-between gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                beneficiaire?.id === b.id ? "border-[#0B2545] bg-blue-50/40" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <User className={`h-5 w-5 mt-0.5 shrink-0 ${beneficiaire?.id === b.id ? "text-[#0B2545]" : "text-slate-400"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900">{b.nom}</p>
                    {b.est_defaut && (
                      <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-current" /> {t('client.diasporaBeneficiary.defaultBadge', 'Défaut')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{b.telephone} · {b.relation || t('client.diasporaBeneficiary.relationDefault', 'Bénéficiaire')}</p>
                  <p className="text-xs text-slate-400">{b.adresse}, {b.quartier}{b.ville ? `, ${b.ville}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!b.est_defaut && (
                  <span onClick={(e) => { e.stopPropagation(); handleSetDefault(b.id); }}
                    className="p-1.5 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer" title={t('client.diasporaBeneficiary.setDefaultTitle', 'Définir par défaut')}>
                    <Star className="h-4 w-4" />
                  </span>
                )}
                <span onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer" title={t('client.diasporaBeneficiary.deleteTitle', 'Supprimer')}>
                  <Trash2 className="h-4 w-4" />
                </span>
                {beneficiaire?.id === b.id && <Check className="h-5 w-5 text-[#0B2545] ml-1" />}
              </div>
            </button>
          ))}

          {error && !showForm && <p className="text-xs font-semibold text-red-600 px-1">{error}</p>}

          {!showForm ? (
            <button onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-500 hover:border-[#0B2545] hover:text-[#0B2545] transition-colors cursor-pointer">
              <Plus className="h-4 w-4" /> {t('client.diasporaBeneficiary.addBeneficiary', 'Ajouter un bénéficiaire')}
            </button>
          ) : (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl border-2 border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-900">{t('client.diasporaBeneficiary.newBeneficiaryTitle', 'Nouveau bénéficiaire')}</p>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
              </div>
              <input required placeholder={t('client.diasporaBeneficiary.namePlaceholder', 'Nom complet')} value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder={t('client.diasporaBeneficiary.phonePlaceholder', 'Téléphone')} value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
                <input placeholder={t('client.diasporaBeneficiary.relationPlaceholder', 'Relation (ex: Mère)')} value={form.relation || ""}
                  onChange={(e) => setForm({ ...form, relation: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
              </div>
              <input required placeholder={t('client.diasporaBeneficiary.addressPlaceholder', 'Adresse')} value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder={t('client.diasporaBeneficiary.neighborhoodPlaceholder', 'Quartier')} value={form.quartier}
                  onChange={(e) => setForm({ ...form, quartier: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
                <input placeholder={t('client.diasporaBeneficiary.cityPlaceholder', 'Ville')} value={form.ville || ""}
                  onChange={(e) => setForm({ ...form, ville: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
              </div>
              {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
              <button type="submit" disabled={saving}
                className="w-full h-10 rounded-xl bg-[#0B2545] text-white text-sm font-bold hover:bg-[#061830] disabled:opacity-50 transition-colors">
                {saving ? t('client.diasporaBeneficiary.saving', 'Enregistrement…') : t('client.diasporaBeneficiary.saveBeneficiary', 'Enregistrer le bénéficiaire')}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => router.push("/commande/diaspora/creneau")}
        disabled={!beneficiaire}
        className="w-full h-13 mt-8 rounded-xl bg-[#e01313] hover:bg-[#c00000] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-[#e01313]/25 transition-all"
      >
        {t('client.diasporaBeneficiary.continueBtn', 'Continuer')}
      </button>
    </main>
  );
}
