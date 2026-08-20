"use client";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Phone, Mail, ArrowLeft, Eye, EyeOff, ChevronRight, Lock, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { GroceryBasketIllustration } from '@/components/GroceryBasketIllustration';
import { OtpInput } from '@/components/auth/OtpInput';
import { usePublicAuth } from '@/lib/public-auth-context';
import { ApiError, resendPublicOtp, sendPublicOtp, verifyPublicOtp } from '@/lib/api';

type AuthViewMode = 'choice' | 'phone' | 'phone_otp' | 'email';

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  return fallback;
}

// Chaque rôle a sa propre interface (comme sur mobile : /vendor, /client, /delivery) — la page
// d'accueil publique '/' est réservée aux visiteurs non connectés, jamais une destination de
// connexion réelle.
function defaultDestinationFor(typeUtilisateur?: string): string {
  return typeUtilisateur === "vendeur" ? "/vendeur" : "/accueil";
}

export default function PublicLoginPage() {
  return (
    <Suspense>
      <PublicLoginPageInner />
    </Suspense>
  );
}

function PublicLoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get('redirect');
  const { user, isReady, login, setSession } = usePublicAuth();
  const [viewMode, setViewMode] = useState<AuthViewMode>('choice');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérification OTP (connexion par téléphone, ou email non vérifié après inscription)
  const [otpCredential, setOtpCredential] = useState('');
  const [otpCanal, setOtpCanal] = useState<'sms' | 'email'>('sms');
  const [otpDev, setOtpDev] = useState<string | undefined>(undefined);
  const [otpKey, setOtpKey] = useState(0);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (isReady && user) router.replace(explicitRedirect || defaultDestinationFor(user.type_utilisateur));
  }, [isReady, user, router, explicitRedirect]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const goToPhoneOtp = async () => {
    const telephoneNormalise = `+242${phone.replace(/\D/g, '')}`;
    setLoading(true);
    setError(null);
    try {
      const code = await sendPublicOtp(telephoneNormalise, 'sms');
      setOtpDev(code || undefined);
      setOtpCredential(telephoneNormalise);
      setOtpCanal('sms');
      setResendTimer(165);
      setOtpKey((k) => k + 1);
      setViewMode('phone_otp');
    } catch (err) {
      setError(extractErrorMessage(err, "Impossible d'envoyer le code OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToPhoneOtp();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await login(email.trim(), password);
      redirectAfterLogin(loggedUser.type_utilisateur);
    } catch (err) {
      if (err instanceof ApiError && err.data?.error_code === 'ACCOUNT_NOT_VERIFIED') {
        // AuthController::login() envoie toujours ce code par SMS (genererOTP($user, 'sms')),
        // quel que soit l'identifiant utilisé pour se connecter — le canal affiché/renvoyé doit
        // donc toujours être 'sms' ici, jamais déduit du champ "email ou téléphone" saisi.
        setOtpDev(err.data?.otp_dev);
        setOtpCredential(email.trim());
        setOtpCanal('sms');
        setResendTimer(165);
        setOtpKey((k) => k + 1);
        setViewMode('phone_otp');
        return;
      }
      setError(extractErrorMessage(err, 'Identifiants incorrects.'));
    } finally {
      setLoading(false);
    }
  };

  const redirectAfterLogin = (typeUtilisateur?: string) => {
    router.replace(explicitRedirect || defaultDestinationFor(typeUtilisateur));
  };

  const handleOtpComplete = async (code: string) => {
    if (otpVerifying) return;
    setOtpVerifying(true);
    setOtpError(null);
    try {
      const result = await verifyPublicOtp(otpCredential, code);
      if (!result.token) throw new Error('Code invalide. Vérifiez le code reçu et réessayez.');
      setSession(result.token, result.user);
      redirectAfterLogin(result.user?.type_utilisateur);
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

  const formatTimer = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f6f9] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1080px] min-h-[620px] bg-white rounded-3xl shadow-2xl border border-slate-100/90 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-8 xl:p-10 bg-gradient-to-b from-blue-50/40 via-white to-amber-50/30 border-r border-slate-100">
          <div className="relative z-10">
            <Logo size="md" showSubtitle={false} className="!items-start" />
            <div className="mt-8">
              <h2 className="text-2xl font-black text-[#1a2e5a] leading-tight">
                Bienvenue sur <br />
                <span className="text-[#1a2e5a]">Zando</span>{' '}
                <span className="text-[#f1a105]">na</span>{' '}
                <span className="text-[#e01313]">Ndako</span>
              </h2>
              <p className="text-sm font-semibold text-slate-500 mt-2">
                Votre marché, livré chez vous en toute simplicité.
              </p>
            </div>
          </div>
          <GroceryBasketIllustration />
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
          {viewMode === 'choice' && (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="text-center sm:text-left mb-6">
                  <h3 className="text-2xl font-black text-slate-900">Se connecter</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Accédez à votre compte pour continuer.
                  </p>
                </div>

                <div className="flex border-b border-slate-200 mb-8">
                  <button className="pb-3 px-4 font-bold text-sm text-[#0D347C] border-b-2 border-[#0D347C] transition-colors">
                    Connexion
                  </button>
                  <Link href="/auth/register" className="pb-3 px-4 font-bold text-sm text-slate-400 hover:text-slate-600 transition-colors">
                    Inscription
                  </Link>
                </div>

                <p className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase text-center mb-4">
                  SE CONNECTER AVEC
                </p>

                <div className="space-y-3.5">
                  <button onClick={() => { setError(null); setViewMode('phone'); }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-1.5 border-slate-200/90 hover:border-[#0D347C] bg-white hover:bg-blue-50/30 transition-all group text-left shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0D347C] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">Par numéro de téléphone</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Nous vous enverrons un code OTP</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0D347C] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button onClick={() => { setError(null); setViewMode('email'); }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-1.5 border-slate-200/90 hover:border-[#0D347C] bg-white hover:bg-blue-50/30 transition-all group text-left shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0D347C] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">Par email</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Connectez-vous avec votre email</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0D347C] group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>

                <div className="text-center mt-6">
                  <Link href="#" onClick={(e) => { e.preventDefault(); alert("Veuillez réinitialiser votre mot de passe depuis l'application mobile."); }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D347C] hover:underline">
                    <Lock size={12} /> Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              <div className="text-center pt-6 text-xs text-slate-500 font-medium">
                Vous n&apos;avez pas de compte ?{' '}
                <Link href="/auth/register" className="font-extrabold text-[#0D347C] hover:underline">Inscrivez-vous</Link>
              </div>
            </div>
          )}

          {viewMode === 'phone' && (
            <div className="flex flex-col h-full justify-between">
              <div>
                <button onClick={() => { setError(null); setViewMode('choice'); }}
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-700 hover:text-[#0D347C] transition-colors mb-6">
                  <ArrowLeft className="w-4 h-4" /> <span>Retour</span>
                </button>

                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900">Connexion par numéro de téléphone</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Entrez votre numéro de téléphone pour recevoir un code de vérification (OTP).
                  </p>
                </div>

                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Numéro de téléphone</label>
                    <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#0D347C] focus-within:ring-1 focus-within:ring-[#0D347C] transition-all">
                      <span className="h-12 px-3 flex items-center bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-700">+242</span>
                      <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9 ]/g, ''))}
                        placeholder="06 123 45 67"
                        className="flex-1 h-12 px-4 text-sm font-semibold text-slate-800 focus:outline-none" />
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 mt-1.5">
                      Vous recevrez un code OTP pour continuer.
                    </p>
                  </div>

                  {error && (
                    <p className="text-xs font-semibold text-[#e01313] bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <button type="submit" disabled={loading || phone.replace(/\D/g, '').length < 7}
                    className="w-full h-13 rounded-xl bg-[#e01313] hover:bg-[#c00000] active:bg-[#900000] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#e01313]/25 transition-all flex items-center justify-center">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'RECEVOIR LE CODE OTP'}
                  </button>
                </form>
              </div>

              <div className="text-center pt-6 text-xs text-slate-500 font-medium">
                Vous n&apos;avez pas de compte ?{' '}
                <Link href="/auth/register" className="font-extrabold text-[#0D347C] hover:underline">Inscrivez-vous</Link>
              </div>
            </div>
          )}

          {viewMode === 'phone_otp' && (
            <div className="flex flex-col h-full justify-center">
              <button onClick={() => { setOtpError(null); setViewMode(otpCanal === 'sms' ? 'phone' : 'email'); }}
                className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-700 hover:text-[#0D347C] transition-colors mb-8 self-start">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#0D347C] text-white flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Vérification {otpCanal === 'email' ? 'par email' : 'par SMS'}
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

          {viewMode === 'email' && (
            <div className="flex flex-col h-full justify-between">
              <div>
                <button onClick={() => { setError(null); setViewMode('choice'); }}
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-700 hover:text-[#0D347C] transition-colors mb-6">
                  <ArrowLeft className="w-4 h-4" /> <span>Retour</span>
                </button>

                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900">Connexion par email</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Entrez votre email et votre mot de passe pour accéder à votre compte.
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Adresse email ou téléphone</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemple@email.com"
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0D347C] focus:ring-1 focus:ring-[#0D347C] transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Mot de passe</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Entrez votre mot de passe"
                        className="w-full h-12 pl-10 pr-12 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0D347C] focus:ring-1 focus:ring-[#0D347C] transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1 text-xs">
                    <Link href="#" onClick={(e) => { e.preventDefault(); alert("Veuillez réinitialiser votre mot de passe depuis l'application mobile."); }}
                      className="font-bold text-[#0D347C] hover:underline">
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  {error && (
                    <p className="text-xs font-semibold text-[#e01313] bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <button type="submit" disabled={loading || !email || !password}
                    className="w-full h-13 rounded-xl bg-[#e01313] hover:bg-[#c00000] active:bg-[#900000] disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-[#e01313]/25 transition-all flex items-center justify-center mt-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
                  </button>
                </form>
              </div>

              <div className="text-center pt-6 text-xs text-slate-500 font-medium">
                Vous n&apos;avez pas de compte ?{' '}
                <Link href="/auth/register" className="font-extrabold text-[#0D347C] hover:underline">Inscrivez-vous</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
