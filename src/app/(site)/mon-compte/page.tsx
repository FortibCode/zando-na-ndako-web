"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, Camera, ChevronRight, Globe, Heart, Loader2, LogOut, MapPin, Package, Save, Settings, User } from "lucide-react";
import { useRequirePublicAuth } from "@/lib/use-require-public-auth";
import { usePublicAuth } from "@/lib/public-auth-context";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useFavorites } from "@/lib/favorites";
import { ApiError, changePassword, fetchMe, getPublicToken, resolveMediaUrl, updateUserProfile, uploadUserPhotoPublic } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/lib/toast-context";

interface ProfileFields {
  nom: string;
  prenom: string;
  email: string | null;
  ville: string | null;
  adresse: string | null;
  date_naissance: string | null;
}

export default function AccountPage() {
  const { t } = useLanguage();
  const { notify, notifyError } = useToast();
  const { user, isReady } = useRequirePublicAuth();
  const { logout, setSession } = usePublicAuth();
  const { favorites } = useFavorites();
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileFields | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [localPhotoPreview, setLocalPhotoPreview] = useState<string | null>(null);

  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmMotDePasse, setConfirmMotDePasse] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchMe<ProfileFields>().then(setProfile).catch(() => setProfile(null));
  }, [user]);

  if (!isReady || !user) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </main>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateUserProfile<ProfileFields>(profile);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      notify(t('client.monCompte.saveSuccess', 'Informations mises à jour.'));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('client.monCompte.saveError', "Impossible d'enregistrer les modifications.");
      setError(message);
      notifyError(err, message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setConfirmLogoutOpen(false);
    logout();
    router.push("/");
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    // Aperçu local immédiat — auparavant rien ne s'affichait avant la fin de l'envoi (et l'unique
    // indicateur de progression était masqué par défaut, visible seulement au survol de la souris).
    const objectUrl = URL.createObjectURL(file);
    setLocalPhotoPreview(objectUrl);
    setUploadingPhoto(true);
    try {
      const photoUrl = await uploadUserPhotoPublic(file);
      const token = getPublicToken();
      if (token) setSession(token, { ...user, photo_profil: photoUrl });
      notify(t('client.monCompte.photoSuccess', 'Photo de profil mise à jour.'));
    } catch (err) {
      notifyError(err, t('client.monCompte.photoError', "Impossible d'envoyer cette photo."));
    } finally {
      setUploadingPhoto(false);
      setLocalPhotoPreview(null);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nouveauMotDePasse !== confirmMotDePasse) {
      setPasswordError(t('client.monCompte.passwordMismatch', 'Les mots de passe ne correspondent pas.'));
      return;
    }
    setChangingPassword(true);
    setPasswordError(null);
    try {
      await changePassword({ ancienMotDePasse, nouveauMotDePasse });
      setPasswordChanged(true);
      notify(t('client.monCompte.passwordChangedSuccess', 'Mot de passe changé.'));
      // Le backend révoque tous les tokens à la réussite — la session locale n'est plus valide.
      setTimeout(() => { logout(); router.push("/auth/login"); }, 1500);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('client.monCompte.passwordError', 'Impossible de changer le mot de passe.');
      setPasswordError(message);
      notifyError(err, message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <div className="flex items-center gap-3.5 mb-8">
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          disabled={uploadingPhoto}
          className="relative h-14 w-14 shrink-0 rounded-full bg-[#0B2545] text-white flex items-center justify-center text-lg font-black overflow-hidden cursor-pointer group"
          title={t('client.monCompte.changePhoto', 'Changer la photo')}
        >
          {localPhotoPreview || resolveMediaUrl(user.photo_profil) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={localPhotoPreview || resolveMediaUrl(user.photo_profil)!} alt="" className="h-full w-full object-cover" />
          ) : (
            user.nom_complet?.[0]?.toUpperCase() || <User className="h-6 w-6" />
          )}
          {uploadingPhoto ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </span>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-4 w-4 text-white" />
            </span>
          )}
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">{user.nom_complet || t('client.monCompte.defaultTitle', 'Mon compte')}</h1>
          <p className="text-xs text-slate-500">{user.telephone}{user.email ? ` · ${user.email}` : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/mes-commandes" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <Package className="h-4.5 w-4.5 text-[#0B2545]" />
            <span className="text-xs font-bold text-slate-800">{t('client.monCompte.myOrders', 'Mes commandes')}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
        <Link
          href={user.est_diaspora ? "/commande/diaspora/beneficiaire?standalone=1" : "/commande/adresse?standalone=1"}
          className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4.5 w-4.5 text-[#0B2545]" />
            <span className="text-xs font-bold text-slate-800">{user.est_diaspora ? t('client.monCompte.myBeneficiaries', 'Mes bénéficiaires') : t('client.monCompte.myAddresses', 'Mes adresses')}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
        <Link href="/favoris" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <Heart className="h-4.5 w-4.5 text-[#0B2545]" />
            <span className="text-xs font-bold text-slate-800">{t('client.monCompte.favoritesLabel', 'Favoris')}{favorites.length > 0 ? ` (${favorites.length})` : ""}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
        <Link href="/notifications" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <Bell className="h-4.5 w-4.5 text-[#0B2545]" />
            <span className="text-xs font-bold text-slate-800">{t('client.monCompte.notificationsLabel', 'Notifications')}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
        <Link href="/mes-litiges" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4.5 w-4.5 text-[#0B2545]" />
            <span className="text-xs font-bold text-slate-800">{t('client.monCompte.myDisputes', 'Mes litiges')}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
        <Link href="/parametres" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <Settings className="h-4.5 w-4.5 text-[#0B2545]" />
            <span className="text-xs font-bold text-slate-800">{t('client.monCompte.settingsLabel', 'Paramètres')}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
      </div>

      {user.type_utilisateur === "client" && user.est_diaspora && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-blue-50/50 border border-blue-100 mb-6 text-xs font-bold text-[#0B2545]">
          <Globe className="h-4 w-4" /> {t('client.monCompte.diasporaBadge', 'Compte client diaspora')}
        </div>
      )}

      {profile && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 mb-6">
          <p className="text-sm font-black text-slate-900 mb-1">{t('client.monCompte.myInfoTitle', 'Mes informations')}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('client.monCompte.nom', 'Nom')}</label>
              <input value={profile.nom} onChange={(e) => setProfile({ ...profile, nom: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('client.monCompte.prenom', 'Prénom')}</label>
              <input value={profile.prenom} onChange={(e) => setProfile({ ...profile, prenom: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('client.monCompte.email', 'Email')}</label>
            <input type="email" value={profile.email || ""} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('client.monCompte.ville', 'Ville')}</label>
              <input value={profile.ville || ""} onChange={(e) => setProfile({ ...profile, ville: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('client.monCompte.adresse', 'Adresse')}</label>
              <input value={profile.adresse || ""} onChange={(e) => setProfile({ ...profile, adresse: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('client.monCompte.dateNaissance', 'Date de naissance')}</label>
            <input type="date" value={profile.date_naissance || ""} onChange={(e) => setProfile({ ...profile, date_naissance: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]" />
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full h-11 rounded-xl bg-[#0B2545] hover:bg-[#061830] disabled:opacity-50 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saved ? t('client.monCompte.saved', 'Enregistré !') : t('client.monCompte.saveChanges', 'Enregistrer les modifications')}
          </button>
        </form>
      )}

      <form onSubmit={handleChangePassword} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 mb-6">
        <p className="text-sm font-black text-slate-900">{t('client.monCompte.changePasswordTitle', 'Changer le mot de passe')}</p>
        <input required type="password" value={ancienMotDePasse} onChange={(e) => setAncienMotDePasse(e.target.value)}
          placeholder={t('client.monCompte.currentPasswordPlaceholder', 'Mot de passe actuel')}
          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]" />
        <input required type="password" value={nouveauMotDePasse} onChange={(e) => setNouveauMotDePasse(e.target.value)}
          placeholder={t('client.monCompte.newPasswordPlaceholder', 'Nouveau mot de passe (min. 8 caractères)')}
          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]" />
        <input required type="password" value={confirmMotDePasse} onChange={(e) => setConfirmMotDePasse(e.target.value)}
          placeholder={t('client.monCompte.confirmPasswordPlaceholder', 'Confirmer le nouveau mot de passe')}
          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]" />
        {passwordError && <p className="text-xs font-semibold text-red-600">{passwordError}</p>}
        <button type="submit" disabled={changingPassword || nouveauMotDePasse.length < 8}
          className="w-full h-11 rounded-xl border-2 border-[#0B2545] text-[#0B2545] text-sm font-bold hover:bg-blue-50/40 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : passwordChanged ? t('client.monCompte.passwordChangedBtn', 'Mot de passe changé, reconnexion…') : t('client.monCompte.changePasswordBtn', 'Changer le mot de passe')}
        </button>
      </form>

      <button
        onClick={() => setConfirmLogoutOpen(true)}
        className="w-full h-11 rounded-xl border-2 border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="h-4 w-4" /> {t('client.monCompte.logout', 'Se déconnecter')}
      </button>

      {confirmLogoutOpen && (
        <ConfirmDialog
          title="Confirmer la déconnexion"
          message="Voulez-vous vraiment vous déconnecter de votre compte Zando na Ndako ?"
          confirmLabel="Se déconnecter"
          danger
          onConfirm={handleLogout}
          onClose={() => setConfirmLogoutOpen(false)}
        />
      )}
    </main>
  );
}
