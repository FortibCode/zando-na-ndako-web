"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, ChevronRight, Globe, Heart, Loader2, LogOut, MapPin, Package, Save, Settings, User } from "lucide-react";
import { useRequirePublicAuth } from "@/lib/use-require-public-auth";
import { usePublicAuth } from "@/lib/public-auth-context";
import { useFavorites } from "@/lib/favorites";
import { ApiError, fetchMe, updateUserProfile } from "@/lib/api";

interface ProfileFields {
  nom: string;
  prenom: string;
  email: string | null;
  ville: string | null;
  adresse: string | null;
}

export default function AccountPage() {
  const { user, isReady } = useRequirePublicAuth();
  const { logout } = usePublicAuth();
  const { favorites } = useFavorites();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileFields | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <div className="flex items-center gap-3.5 mb-8">
        <div className="h-14 w-14 rounded-full bg-[#0B2545] text-white flex items-center justify-center text-lg font-black">
          {user.nom_complet?.[0]?.toUpperCase() || <User className="h-6 w-6" />}
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">{user.nom_complet || "Mon compte"}</h1>
          <p className="text-xs text-slate-500">{user.telephone}{user.email ? ` · ${user.email}` : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/mes-commandes" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <Package className="h-4.5 w-4.5 text-[#0B2545]" />
            <span className="text-xs font-bold text-slate-800">Mes commandes</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
        <Link
          href={user.est_diaspora ? "/commande/diaspora/beneficiaire" : "/commande/adresse"}
          className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4.5 w-4.5 text-[#0B2545]" />
            <span className="text-xs font-bold text-slate-800">{user.est_diaspora ? "Mes bénéficiaires" : "Mes adresses"}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
        <Link href="/favoris" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <Heart className="h-4.5 w-4.5 text-[#0B2545]" />
            <span className="text-xs font-bold text-slate-800">Favoris{favorites.length > 0 ? ` (${favorites.length})` : ""}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
        <Link href="/notifications" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <Bell className="h-4.5 w-4.5 text-[#0B2545]" />
            <span className="text-xs font-bold text-slate-800">Notifications</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
        <Link href="/mes-litiges" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4.5 w-4.5 text-[#0B2545]" />
            <span className="text-xs font-bold text-slate-800">Mes litiges</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
        <Link href="/parametres" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <Settings className="h-4.5 w-4.5 text-[#0B2545]" />
            <span className="text-xs font-bold text-slate-800">Paramètres</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
      </div>

      {user.type_utilisateur === "client" && user.est_diaspora && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-blue-50/50 border border-blue-100 mb-6 text-xs font-bold text-[#0B2545]">
          <Globe className="h-4 w-4" /> Compte client diaspora
        </div>
      )}

      {profile && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 mb-6">
          <p className="text-sm font-black text-slate-900 mb-1">Mes informations</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nom</label>
              <input value={profile.nom} onChange={(e) => setProfile({ ...profile, nom: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Prénom</label>
              <input value={profile.prenom} onChange={(e) => setProfile({ ...profile, prenom: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Email</label>
            <input type="email" value={profile.email || ""} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Ville</label>
              <input value={profile.ville || ""} onChange={(e) => setProfile({ ...profile, ville: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Adresse</label>
              <input value={profile.adresse || ""} onChange={(e) => setProfile({ ...profile, adresse: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
            </div>
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full h-11 rounded-xl bg-[#0B2545] hover:bg-[#061830] disabled:opacity-50 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saved ? "Enregistré !" : "Enregistrer les modifications"}
          </button>
        </form>
      )}

      <button
        onClick={handleLogout}
        className="w-full h-11 rounded-xl border-2 border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="h-4 w-4" /> Se déconnecter
      </button>
    </main>
  );
}
