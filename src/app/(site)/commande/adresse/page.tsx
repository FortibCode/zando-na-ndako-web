"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, MapPin, Plus, Star, Trash2, X } from "lucide-react";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { useCheckout } from "@/lib/checkout-context";
import {
  ApiError,
  createAddress,
  deleteAddress,
  fetchAddresses,
  setDefaultAddress,
  type DeliveryAddress,
  type DeliveryAddressInput,
} from "@/lib/api";

const EMPTY_FORM: DeliveryAddressInput = { label: "", adresse: "", quartier: "", ville: "Brazzaville" };

export default function CheckoutAddressPage() {
  const router = useRouter();
  const { address, setAddress } = useCheckout();

  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DeliveryAddressInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer cette adresse.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (address?.id === id) setAddress(null);
    } catch {
      // best-effort
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, est_defaut: a.id === id })));
    } catch {
      // best-effort
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <CheckoutSteps current={1} />
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-1">Adresse de livraison</h1>
      <p className="text-sm text-slate-500 text-center mb-8">Choisissez où vous souhaitez être livré.</p>

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
                        <Star className="h-2.5 w-2.5 fill-current" /> Défaut
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
                    title="Définir par défaut"
                  >
                    <Star className="h-4 w-4" />
                  </span>
                )}
                <span
                  onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </span>
                {address?.id === a.id && <Check className="h-5 w-5 text-[#0B2545] ml-1" />}
              </div>
            </button>
          ))}

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-500 hover:border-[#0B2545] hover:text-[#0B2545] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Ajouter une adresse
            </button>
          ) : (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl border-2 border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-900">Nouvelle adresse</p>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <input required placeholder="Libellé (ex: Domicile, Bureau)" value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
              <input required placeholder="Adresse (rue, numéro…)" value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Quartier" value={form.quartier || ""}
                  onChange={(e) => setForm({ ...form, quartier: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
                <input required placeholder="Ville" value={form.ville}
                  onChange={(e) => setForm({ ...form, ville: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
              </div>
              {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
              <button type="submit" disabled={saving}
                className="w-full h-10 rounded-xl bg-[#0B2545] text-white text-sm font-bold hover:bg-[#061830] disabled:opacity-50 transition-colors">
                {saving ? "Enregistrement…" : "Enregistrer l'adresse"}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => router.push("/commande/creneau")}
        disabled={!address}
        className="w-full h-13 mt-8 rounded-xl bg-[#e01313] hover:bg-[#c00000] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-[#e01313]/25 transition-all"
      >
        Continuer
      </button>
    </main>
  );
}
