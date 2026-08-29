"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Info, UserPlus } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { AdminPageHeader } from "@/components/AdminTable";
import { Button } from "@/components/Button";
import { useToast } from "@/lib/toast-context";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-slate-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-[#1A2E5A] focus:ring-1 focus:ring-[#1A2E5A] focus:outline-none transition-colors";

export default function NouvelUtilisateurPage() {
  const router = useRouter();
  const { notify, notifyError } = useToast();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [statut, setStatut] = useState<"actif" | "en_attente_validation">("actif");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (motDePasse !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (motDePasse.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/admin/utilisateurs", {
        prenom, nom, email: email || null, telephone,
        mot_de_passe: motDePasse, statut_compte: statut,
      });
      notify("Utilisateur créé avec succès.");
      router.push("/admin/utilisateurs");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else notifyError(err, "Impossible de créer cet utilisateur.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-3xl animate-fade-in">
      <button
        onClick={() => router.push("/admin/utilisateurs")}
        className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#1A2E5A] transition-colors"
      >
        <ArrowLeft size={14} /> Retour aux utilisateurs
      </button>

      <AdminPageHeader title="Ajouter un utilisateur" description="Créez un compte client directement depuis le back-office." icon={UserPlus} />

      <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3.5">
        <Info size={16} className="mt-0.5 shrink-0 text-sky-500" />
        <p className="text-xs font-semibold text-sky-800">
          Ce formulaire crée uniquement des comptes <strong>Client</strong>. Les comptes vendeur et livreur
          nécessitent une fiche complète (commerce, véhicule…) et doivent s&apos;inscrire depuis l&apos;application
          mobile ; les comptes administrateur se gèrent depuis la page Rôles.
        </p>
      </div>

      <form onSubmit={onSubmit} className="surface-card rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Prénom">
            <input required value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Ex : Jean" className={inputClass} />
          </Field>
          <Field label="Nom">
            <input required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Dupont" className={inputClass} />
          </Field>

          <Field label="Email (optionnel)">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean.dupont@email.com" className={inputClass} />
          </Field>
          <Field label="Téléphone">
            <input required value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Ex : 06 123 45 67" className={inputClass} />
          </Field>

          <Field label="Mot de passe">
            <div className="relative flex items-center">
              <input
                required type={showPassword ? "text" : "password"} value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)} placeholder="8 caractères minimum"
                className={`${inputClass} pr-11`}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <Field label="Confirmer le mot de passe">
            <input
              required type={showPassword ? "text" : "password"} value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)} placeholder="Ressaisir le mot de passe"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Statut">
          <select value={statut} onChange={(e) => setStatut(e.target.value as typeof statut)} className={inputClass}>
            <option value="actif">Actif</option>
            <option value="en_attente_validation">En attente de validation</option>
          </select>
        </Field>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
          <Button type="button" variant="ghost" onClick={() => router.push("/admin/utilisateurs")} disabled={saving}>Annuler</Button>
          <Button type="submit" variant="secondary" loading={saving}>Enregistrer</Button>
        </div>
      </form>
    </div>
  );
}
