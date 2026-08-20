"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImagePlus, Loader2, LocateFixed } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { usePublicAuth } from "@/lib/public-auth-context";
import { ApiError, changePassword, updateVendeurProfil, uploadVendeurDocumentsPublic } from "@/lib/api";

const DOCS = [
  { key: "photo_boutique", label: "Photo de la boutique" },
  { key: "document_identite", label: "Pièce d'identité" },
  { key: "registre_commerce", label: "Registre de commerce (RCCM)" },
] as const;

export default function VendeurProfilPage() {
  const { user, logout } = usePublicAuth();
  const router = useRouter();

  const [nomCommerce, setNomCommerce] = useState("");
  const [numeroMobileMoney, setNumeroMobileMoney] = useState("");
  const [horairesOuverture, setHorairesOuverture] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [docs, setDocs] = useState<Record<string, File | null>>({});
  const [uploading, setUploading] = useState(false);
  const [docsSaved, setDocsSaved] = useState(false);

  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmMotDePasse, setConfirmMotDePasse] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateVendeurProfil({
        nom_commerce: nomCommerce.trim() || undefined,
        coordonnees_gps: coords || undefined,
        numero_mobile_money_reception: numeroMobileMoney.trim() || undefined,
        horaires_ouverture: horairesOuverture.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nouveauMotDePasse !== confirmMotDePasse) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }
    setChangingPassword(true);
    setPasswordError(null);
    try {
      await changePassword({ ancienMotDePasse, nouveauMotDePasse });
      setPasswordChanged(true);
      // Le backend révoque tous les tokens à la réussite — la session locale n'est plus valide.
      setTimeout(() => { logout(); router.push("/auth/login"); }, 1500);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Impossible de changer le mot de passe.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUploadDocs = async () => {
    const selected = Object.fromEntries(Object.entries(docs).filter(([, f]) => f)) as Record<string, File>;
    if (Object.keys(selected).length === 0) return;
    setUploading(true);
    try {
      await uploadVendeurDocumentsPublic(selected);
      setDocs({});
      setDocsSaved(true);
      setTimeout(() => setDocsSaved(false), 2000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <PageHeader title="Profil de la boutique" />

      <div className="p-5 rounded-2xl border border-slate-200 bg-white mb-6">
        <p className="text-xs font-bold text-slate-500 mb-1">Compte connecté</p>
        <p className="text-sm font-black text-slate-900">{user?.nom_complet}</p>
        <p className="text-xs text-slate-500">{user?.telephone}{user?.email ? ` · ${user.email}` : ""}</p>
      </div>

      <form onSubmit={handleSave} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 mb-6">
        <p className="text-sm font-black text-slate-900">Boutique</p>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nom commercial</label>
          <input value={nomCommerce} onChange={(e) => setNomCommerce(e.target.value)} placeholder="Nom de votre boutique"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Point de collecte (position GPS)</label>
          <p className="text-xs text-slate-400 mb-2">Utilisé pour calculer les frais de livraison à la distance réelle.</p>
          <button type="button" onClick={handleLocate} disabled={locating}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer">
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            {coords ? `Position : ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "Utiliser ma position actuelle"}
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Coordonnées de paiement</label>
          <p className="text-xs text-slate-400 mb-2">Numéro mobile money qui recevra vos retraits.</p>
          <input value={numeroMobileMoney} onChange={(e) => setNumeroMobileMoney(e.target.value)} placeholder="ex: 06 123 45 67"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Horaires d&apos;ouverture</label>
          <input value={horairesOuverture} onChange={(e) => setHorairesOuverture(e.target.value)} placeholder="ex: Lun-Sam 8h-19h"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
        </div>

        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        <Button type="submit" variant="primary" disabled={saving} className="w-full !py-3">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? "Enregistré !" : "Enregistrer"}
        </Button>
      </form>

      <div id="documents" className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 scroll-mt-24">
        <p className="text-sm font-black text-slate-900">Documents de la boutique</p>
        {DOCS.map((doc) => (
          <label key={doc.key} className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-[#0B2545]/40 cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 overflow-hidden">
              {docs[doc.key] ? (
                <img src={URL.createObjectURL(docs[doc.key]!)} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImagePlus className="w-4 h-4 text-[#0B2545]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800">{doc.label}</p>
              <p className="text-[11px] text-slate-400 truncate">{docs[doc.key]?.name || "Aucun fichier sélectionné"}</p>
            </div>
            {docs[doc.key] && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setDocs((prev) => ({ ...prev, [doc.key]: e.target.files?.[0] || null }))} />
          </label>
        ))}
        <Button type="button" variant="secondary" onClick={handleUploadDocs} disabled={uploading} className="w-full !py-2.5">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : docsSaved ? "Documents envoyés !" : "Envoyer les documents"}
        </Button>
      </div>

      <form onSubmit={handleChangePassword} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 mt-6">
        <p className="text-sm font-black text-slate-900">Changer le mot de passe</p>
        <input required type="password" value={ancienMotDePasse} onChange={(e) => setAncienMotDePasse(e.target.value)}
          placeholder="Mot de passe actuel"
          className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
        <input required type="password" value={nouveauMotDePasse} onChange={(e) => setNouveauMotDePasse(e.target.value)}
          placeholder="Nouveau mot de passe (min. 8 caractères)"
          className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
        <input required type="password" value={confirmMotDePasse} onChange={(e) => setConfirmMotDePasse(e.target.value)}
          placeholder="Confirmer le nouveau mot de passe"
          className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
        {passwordError && <p className="text-xs font-semibold text-red-600">{passwordError}</p>}
        <Button type="submit" variant="secondary" disabled={changingPassword || nouveauMotDePasse.length < 8} className="w-full !py-2.5">
          {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : passwordChanged ? "Mot de passe changé, reconnexion…" : "Changer le mot de passe"}
        </Button>
      </form>
    </div>
  );
}
