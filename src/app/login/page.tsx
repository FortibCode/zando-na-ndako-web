"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const { user, isReady, login } = useAuth();
  const router = useRouter();
  const [credential, setCredential] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && user) router.replace("/admin");
  }, [isReady, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(credential.trim(), motDePasse);
      router.replace("/admin");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Connexion impossible.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f6f9] p-4 sm:p-8">
      <div className="w-full max-w-xl sm:max-w-2xl bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100/80 flex flex-col items-center">
        <Logo size="xl" showSubtitle theme="light" layout="stack" className="mb-8" />

        <form onSubmit={onSubmit} className="w-full space-y-5">
          <div>
            <label htmlFor="credential" className="block text-sm font-bold text-slate-700 mb-1.5">
              Email ou téléphone
            </label>
            <input
              id="credential"
              type="text"
              required
              autoComplete="username"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              className="focus-premium w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#1A2E5A] transition-colors"
              placeholder="admin@zando.cg"
            />
          </div>

          <div>
            <label htmlFor="mot_de_passe" className="block text-sm font-bold text-slate-700 mb-1.5">
              Mot de passe
            </label>
            <div className="relative flex items-center">
              <input
                id="mot_de_passe"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="focus-premium w-full h-12 pl-4 pr-11 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1A2E5A] transition-colors"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Masquer ou afficher le mot de passe"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="focus-premium w-full h-12 rounded-xl bg-[#0B2545] hover:bg-[#0d2d54] text-white font-bold text-sm shadow-sm active:translate-y-px transition-all flex items-center justify-center disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>

        <p className="mt-8 text-xs font-medium text-slate-400 text-center">
          © 2026 Zando na Ndako. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
