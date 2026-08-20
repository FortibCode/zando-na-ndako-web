"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Lock, Store, Globe, MapPin, Eye, EyeOff, Calendar,
  CheckCircle2, ShieldCheck, Rocket, ArrowLeft, UploadCloud, Loader2, ImagePlus,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { GroceryBasketIllustration } from '@/components/GroceryBasketIllustration';
import { OtpInput } from '@/components/auth/OtpInput';
import { usePublicAuth } from '@/lib/public-auth-context';
import {
  ApiError,
  registerLocalClient,
  registerDiasporaClient,
  registerVendeurPublic,
  verifyPublicOtp,
  resendPublicOtp,
  uploadVendeurDocumentsPublic,
  fetchZonesRaw,
  type ZoneOption,
} from '@/lib/api';

type UserRole = 'client_local' | 'client_diaspora' | 'vendeur';
type Step = 'form' | 'otp' | 'documents' | 'success';
type Sexe = 'homme' | 'femme';

const CATEGORIES = [
  'Poissonnier & Produits de mer',
  'Boucher & Charcutier',
  'Maraîcher & Fruits / Légumes',
  'Épicier & Produits alimentaires',
  'Artisanat & Fait maison',
  'Mode & Habillement',
  'Autre commerce',
];

const PAYS_OPTIONS = [
  'France', 'Congo-Brazzaville', 'République Démocratique du Congo', 'Afrique du Sud',
  'Allemagne', 'Angleterre', 'Belgique', 'Cameroun', 'Canada', "Côte d'Ivoire",
  'Espagne', 'États-Unis', 'Gabon', 'Italie', 'Maroc', 'Pays-Bas', 'Portugal',
  'Royaume-Uni', 'Sénégal', 'Suisse',
];

const DEVISE_OPTIONS: { id: 'euro' | 'franc_cfa' | 'dollar'; label: string }[] = [
  { id: 'euro', label: 'Euro (€)' },
  { id: 'franc_cfa', label: 'Franc CFA (FCFA)' },
  { id: 'dollar', label: 'Dollar ($)' },
];

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const errors = err.data?.errors as Record<string, string[]> | undefined;
    if (errors) {
      const first = Object.values(errors)[0]?.[0];
      if (first) return first;
    }
    return err.message || fallback;
  }
  return fallback;
}

export default function RegisterPage() {
  const router = useRouter();
  const { setSession } = usePublicAuth();

  const [role, setRole] = useState<UserRole>('client_local');
  const [step, setStep] = useState<Step>('form');

  // Identité
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [sexe, setSexe] = useState<Sexe>('homme');

  // Coordonnées
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ville, setVille] = useState('');
  const [adresse, setAdresse] = useState('');
  const [paysResidence, setPaysResidence] = useState('France');
  const [devisePreferee, setDevisePreferee] = useState<'euro' | 'franc_cfa' | 'dollar'>('euro');

  // Vendeur
  const [nomCommerce, setNomCommerce] = useState('');
  const [categoriePrincipale, setCategoriePrincipale] = useState(CATEGORIES[0]);
  const [zoneId, setZoneId] = useState('');
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  // Sécurité
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP
  const [otpCredential, setOtpCredential] = useState('');
  const [otpCanal, setOtpCanal] = useState<'sms' | 'email'>('sms');
  const [otpDev, setOtpDev] = useState<string | undefined>(undefined);
  const [otpKey, setOtpKey] = useState(0);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Documents (vendeur)
  const [docPhotoBoutique, setDocPhotoBoutique] = useState<File | null>(null);
  const [docIdentite, setDocIdentite] = useState<File | null>(null);
  const [docRegistre, setDocRegistre] = useState<File | null>(null);
  const [docsUploading, setDocsUploading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'vendeur') return;
    setZonesLoading(true);
    fetchZonesRaw()
      .then((data) => {
        setZones(data);
        if (data[0]) setZoneId((current) => current || data[0].id);
      })
      .catch(() => setZones([]))
      .finally(() => setZonesLoading(false));
  }, [role]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const isFormValid = useMemo(() => {
    const identityOk = nom.trim() && prenom.trim() && dateNaissance.trim();
    const passwordOk = motDePasse.length >= 8 && motDePasse === confirmation && terms;
    if (!identityOk || !passwordOk) return false;

    if (role === 'client_local') {
      return Boolean(telephone.replace(/\D/g, '').length >= 7 && ville.trim() && adresse.trim());
    }
    if (role === 'client_diaspora') {
      return Boolean(
        email.includes('@') && telephone.replace(/\D/g, '').length >= 7 &&
        paysResidence.trim() && adresse.trim(),
      );
    }
    return Boolean(
      email.includes('@') && telephone.replace(/\D/g, '').length >= 7 && ville.trim() &&
      adresse.trim() && nomCommerce.trim() && categoriePrincipale.trim() && zoneId,
    );
  }, [role, nom, prenom, dateNaissance, motDePasse, confirmation, terms, telephone, ville, adresse, email, paysResidence, nomCommerce, categoriePrincipale, zoneId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    setLoading(true);
    setError(null);
    try {
      if (role === 'client_local') {
        const telephoneNormalise = `+242${telephone.replace(/\D/g, '')}`;
        const result = await registerLocalClient({
          nom: nom.trim(), prenom: prenom.trim(), date_naissance: dateNaissance, sexe,
          email: email.trim() || undefined, telephone: telephoneNormalise,
          mot_de_passe: motDePasse, ville: ville.trim(), adresse: adresse.trim(),
        });
        setOtpDev(result.otp_dev);
        setOtpCredential(telephoneNormalise);
        setOtpCanal('sms');
      } else if (role === 'client_diaspora') {
        const telephoneNormalise = telephone.trim().startsWith('+') ? telephone.trim() : `+${telephone.trim()}`;
        const devise = devisePreferee === 'euro' ? 'EUR' : devisePreferee === 'dollar' ? 'USD' : 'FCFA';
        const result = await registerDiasporaClient({
          nom: nom.trim(), prenom: prenom.trim(), date_naissance: dateNaissance, sexe,
          email: email.trim(), telephone: telephoneNormalise, mot_de_passe: motDePasse,
          pays_residence: paysResidence, adresse: adresse.trim(), devise_preferee: devise,
        });
        setOtpDev(result.otp_dev);
        setOtpCredential(email.trim());
        setOtpCanal('email');
      } else {
        const telephoneNormalise = `+242${telephone.replace(/\D/g, '')}`;
        const result = await registerVendeurPublic({
          nom: nom.trim(), prenom: prenom.trim(), date_naissance: dateNaissance, sexe,
          email: email.trim(), telephone: telephoneNormalise, mot_de_passe: motDePasse,
          ville: ville.trim(), adresse: adresse.trim(), nom_commerce: nomCommerce.trim(),
          categorie_principale: categoriePrincipale, zone_id: zoneId,
        });
        setOtpDev(result.otp_dev);
        setOtpCredential(telephoneNormalise);
        setOtpCanal('sms');
      }
      setResendTimer(165);
      setOtpKey((k) => k + 1);
      setStep('otp');
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de créer le compte. Vérifiez les informations saisies.'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpComplete = async (code: string) => {
    if (otpVerifying) return;
    setOtpVerifying(true);
    setOtpError(null);
    try {
      const result = await verifyPublicOtp(otpCredential, code);
      if (!result.token) throw new Error('Code invalide. Vérifiez le code reçu et réessayez.');
      setSession(result.token, result.user);
      if (role === 'vendeur') {
        setStep('documents');
      } else {
        setStep('success');
      }
    } catch (err) {
      // Un code refusé ne doit jamais être re-proposé tel quel au prochain essai.
      setOtpDev(undefined);
      setOtpKey((k) => k + 1);
      setOtpError(extractErrorMessage(err, 'Code incorrect. Vérifiez le code reçu et réessayez.'));
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      const code = await resendPublicOtp(otpCredential, otpCanal);
      setOtpDev(code || undefined);
      setOtpKey((k) => k + 1);
      setResendTimer(165);
      setOtpError(null);
    } catch (err) {
      setOtpError(extractErrorMessage(err, 'Impossible de renvoyer le code.'));
    }
  };

  const handleUploadDocuments = async () => {
    if (!docPhotoBoutique && !docIdentite && !docRegistre) {
      setStep('success');
      return;
    }
    setDocsUploading(true);
    setDocsError(null);
    try {
      await uploadVendeurDocumentsPublic({
        photo_boutique: docPhotoBoutique || undefined,
        document_identite: docIdentite || undefined,
        registre_commerce: docRegistre || undefined,
      });
      setStep('success');
    } catch (err) {
      setDocsError(extractErrorMessage(err, "Impossible d'envoyer les documents."));
    } finally {
      setDocsUploading(false);
    }
  };

  const formatTimer = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f6f9] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1080px] min-h-[660px] bg-white rounded-3xl shadow-2xl border border-slate-100/90 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Branding & Illustration */}
        <div className="hidden lg:flex flex-col justify-between p-8 xl:p-10 bg-gradient-to-b from-blue-50/40 via-white to-amber-50/30 border-r border-slate-100">
          <div className="relative z-10">
            <Logo size="md" showSubtitle={false} className="!items-start" />
            <div className="mt-8">
              <h2 className="text-2xl font-black text-[#1a2e5a] leading-tight">
                Rejoignez <br />
                <span className="text-[#1a2e5a]">Zando</span>{' '}
                <span className="text-[#f1a105]">na</span>{' '}
                <span className="text-[#e01313]">Ndako</span>
              </h2>
              <p className="text-sm font-semibold text-slate-500 mt-2">
                Créez votre compte en quelques secondes.
              </p>
            </div>
          </div>
          <GroceryBasketIllustration />
        </div>

        {/* Right Column */}
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto max-h-[90vh] lg:max-h-none">
          {step === 'form' && (
            <div>
              <div className="text-center sm:text-left mb-5">
                <h3 className="text-2xl font-black text-slate-900">Créer un compte</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Choisissez votre profil et renseignez vos informations.
                </p>
              </div>

              <div className="flex border-b border-slate-200 mb-6">
                <Link href="/auth/login" className="pb-3 px-4 font-bold text-sm text-slate-400 hover:text-slate-600 transition-colors">
                  Connexion
                </Link>
                <button className="pb-3 px-4 font-bold text-sm text-[#0D347C] border-b-2 border-[#0D347C] transition-colors">
                  Inscription
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  JE SOUHAITE M&apos;INSCRIRE EN TANT QUE :
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  {([
                    { id: 'client_local', label: 'Client Local', icon: MapPin },
                    { id: 'client_diaspora', label: 'Diaspora', icon: Globe },
                    { id: 'vendeur', label: 'Vendeur', icon: Store },
                  ] as const).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRole(tab.id)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 transition-all ${
                        role === tab.id ? 'bg-white text-[#0D347C] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nom de famille</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input type="text" required value={nom} onChange={(e) => setNom(e.target.value)}
                        placeholder="ex: OKOMBI"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0D347C] focus:ring-1 focus:ring-[#0D347C]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Prénom(s)</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input type="text" required value={prenom} onChange={(e) => setPrenom(e.target.value)}
                        placeholder="ex: Fortune Jean"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0D347C] focus:ring-1 focus:ring-[#0D347C]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date de naissance</label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input type="date" required value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)}
                        className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0D347C]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Genre / Sexe</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['homme', 'femme'] as const).map((g) => (
                        <button key={g} type="button" onClick={() => setSexe(g)}
                          className={`h-11 rounded-xl text-xs font-bold border transition-all ${
                            sexe === g ? 'bg-[#0D347C] text-white border-[#0D347C]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}>
                          {g === 'homme' ? 'Homme' : 'Femme'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {role === 'vendeur' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nom de votre boutique / commerce</label>
                    <div className="relative flex items-center">
                      <Store className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input type="text" required value={nomCommerce} onChange={(e) => setNomCommerce(e.target.value)}
                        placeholder="ex: Échoppe du Marché Total"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0D347C] focus:ring-1 focus:ring-[#0D347C]" />
                    </div>
                  </div>
                )}

                {role === 'vendeur' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie principale</label>
                      <select value={categoriePrincipale} onChange={(e) => setCategoriePrincipale(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0D347C]">
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Zone de livraison</label>
                      {zonesLoading ? (
                        <div className="h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                        </div>
                      ) : (
                        <select value={zoneId} onChange={(e) => setZoneId(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0D347C]">
                          {zones.length === 0 && <option value="">Aucune zone disponible</option>}
                          {zones.map((z) => <option key={z.id} value={z.id}>{z.nom_zone} — {z.ville}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email {role === 'client_local' && <span className="text-slate-400 font-medium">(optionnel)</span>}
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input type="email" required={role !== 'client_local'} value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemple@email.com"
                        className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0D347C]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone</label>
                    <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#0D347C] focus-within:ring-1 focus-within:ring-[#0D347C]">
                      {role !== 'client_diaspora' && (
                        <span className="h-11 px-3 flex items-center bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-700">+242</span>
                      )}
                      <div className="relative flex-1 flex items-center">
                        {role === 'client_diaspora' && <Phone className="absolute left-3.5 w-4 h-4 text-slate-400" />}
                        <input type="tel" required value={telephone}
                          onChange={(e) => setTelephone(role === 'client_diaspora' ? e.target.value.replace(/[^0-9 +]/g, '') : e.target.value.replace(/[^0-9 ]/g, ''))}
                          placeholder={role === 'client_diaspora' ? '+33 6 12 34 56 78' : '06 123 45 67'}
                          className={`w-full h-11 ${role === 'client_diaspora' ? 'pl-10' : 'pl-3'} pr-3 text-xs font-medium text-slate-800 focus:outline-none`} />
                      </div>
                    </div>
                  </div>
                </div>

                {role === 'client_diaspora' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pays de résidence</label>
                      <select value={paysResidence} onChange={(e) => setPaysResidence(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0D347C]">
                        {PAYS_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Devise préférée</label>
                      <select value={devisePreferee} onChange={(e) => setDevisePreferee(e.target.value as typeof devisePreferee)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0D347C]">
                        {DEVISE_OPTIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ville</label>
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input type="text" required value={ville} onChange={(e) => setVille(e.target.value)}
                        placeholder="ex: Brazzaville"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0D347C] focus:ring-1 focus:ring-[#0D347C]" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adresse</label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input type="text" required value={adresse} onChange={(e) => setAdresse(e.target.value)}
                      placeholder="ex: Avenue de la Paix, Poto-Poto"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0D347C] focus:ring-1 focus:ring-[#0D347C]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input type={showPassword ? 'text' : 'password'} required value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
                        placeholder="Min. 8 caractères"
                        className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0D347C]" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-slate-400 hover:text-slate-600 p-1">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirmation</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input type={showPassword ? 'text' : 'password'} required value={confirmation} onChange={(e) => setConfirmation(e.target.value)}
                        placeholder="Répétez le mot de passe"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0D347C]" />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium select-none pt-1">
                  <input type="checkbox" required checked={terms} onChange={(e) => setTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#e01313] focus:ring-[#e01313]" />
                  <span>J&apos;accepte les conditions générales et la politique de confidentialité.</span>
                </label>

                {error && (
                  <p className="text-xs font-semibold text-[#e01313] bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                )}

                <button type="submit" disabled={!isFormValid || loading}
                  className="w-full h-13 rounded-xl bg-[#e01313] hover:bg-[#c00000] active:bg-[#900000] disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-[#e01313]/25 transition-all flex items-center justify-center mt-3">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Créer mon compte'}
                </button>
              </form>

              <div className="text-center pt-6 text-xs text-slate-500 font-medium">
                Vous avez déjà un compte ?{' '}
                <Link href="/auth/login" className="font-extrabold text-[#0D347C] hover:underline">Se connecter</Link>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="flex flex-col h-full justify-center">
              <button onClick={() => setStep('form')} className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-700 hover:text-[#0D347C] transition-colors mb-8 self-start">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#0D347C] text-white flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Confirmez votre {otpCanal === 'email' ? 'adresse email' : 'numéro de téléphone'}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-2 max-w-xs mx-auto">
                  Nous avons envoyé un code de vérification à <span className="text-[#0D347C]">{otpCredential}</span>. Entrez-le ci-dessous pour continuer.
                </p>
              </div>

              <OtpInput key={otpKey} initialCode={otpDev} onComplete={handleOtpComplete} disabled={otpVerifying} resetKey={otpKey} />

              {otpError && <p className="text-xs font-semibold text-[#e01313] text-center mt-4">{otpError}</p>}
              {otpVerifying && <p className="text-xs font-semibold text-slate-500 text-center mt-4">Vérification…</p>}

              <div className="text-center mt-6 text-xs text-slate-500 font-medium">
                Vous n&apos;avez pas reçu le code ?{' '}
                {resendTimer > 0 ? (
                  <span className="text-slate-400">Renvoyer ({formatTimer(resendTimer)})</span>
                ) : (
                  <button onClick={handleResend} className="font-extrabold text-[#0D347C] hover:underline">Renvoyer le code</button>
                )}
              </div>
            </div>
          )}

          {step === 'documents' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#0D347C] text-white flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Documents du vendeur</h3>
                <p className="text-xs font-semibold text-slate-500 mt-2 max-w-sm mx-auto">
                  Ajoutez vos documents pour accélérer la validation de votre boutique.
                </p>
              </div>

              <div className="space-y-3">
                {([
                  { label: 'Photo de la boutique', hint: 'Façade ou intérieur visible', file: docPhotoBoutique, set: setDocPhotoBoutique },
                  { label: "Pièce d'identité nationale", hint: 'CNI, passeport ou permis', file: docIdentite, set: setDocIdentite },
                  { label: 'Registre de commerce (RCCM)', hint: 'Document officiel du commerce', file: docRegistre, set: setDocRegistre },
                ] as const).map((doc) => (
                  <label key={doc.label} className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:border-[#0D347C]/40 cursor-pointer transition-all">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 overflow-hidden">
                      {doc.file ? (
                        <img src={URL.createObjectURL(doc.file)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImagePlus className="w-5 h-5 text-[#0D347C]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">{doc.label}</p>
                      <p className="text-xs text-slate-400 truncate">{doc.file ? doc.file.name : doc.hint}</p>
                    </div>
                    {doc.file && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => doc.set(e.target.files?.[0] || null)} />
                  </label>
                ))}
              </div>

              {docsError && <p className="text-xs font-semibold text-[#e01313] text-center mt-4">{docsError}</p>}

              <button onClick={handleUploadDocuments} disabled={docsUploading}
                className="w-full h-13 rounded-xl bg-[#e01313] hover:bg-[#c00000] disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-[#e01313]/25 transition-all flex items-center justify-center mt-6">
                {docsUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enregistrer et terminer'}
              </button>
              <button onClick={() => setStep('success')} className="w-full text-center mt-3 text-xs font-bold text-[#0D347C] hover:underline">
                Compléter plus tard
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col h-full items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Compte créé avec succès !</h3>
              <p className="text-sm text-slate-500 font-medium mt-3 max-w-sm">
                Bienvenue sur <span className="font-extrabold text-[#0D347C]">Zando na Ndako</span>.
                {role === 'vendeur'
                  ? ' Votre boutique est activée et visible par les acheteurs dès maintenant.'
                  : ' Votre compte est maintenant activé et prêt à être utilisé.'}
              </p>
              <button onClick={() => router.push(role === 'vendeur' ? '/vendeur' : '/accueil')}
                className="mt-8 h-13 px-8 rounded-xl bg-[#0D347C] hover:bg-[#0a2a63] text-white font-extrabold text-sm shadow-lg shadow-[#0D347C]/25 transition-all flex items-center justify-center gap-2">
                <Rocket className="w-4 h-4" /> {role === 'vendeur' ? 'Aller à mon tableau de bord' : 'Découvrir le marché'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
