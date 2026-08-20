"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis.").email("Adresse email invalide."),
  motDePasse: z.string().min(1, "Le mot de passe est requis."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const fieldClass =
  "focus-visible:ring-0 h-12 px-4 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus-visible:border-[#1A2E5A] transition-colors";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@zando.cg", motDePasse: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await login(values.email.trim(), values.motDePasse);
      router.push("/admin");
    } catch (err) {
      setServerError(err instanceof ApiError || err instanceof Error ? err.message : "Identifiants administrateur incorrects.");
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f6f9] p-4 sm:p-8">
      <div className="w-full max-w-xl sm:max-w-2xl bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100/80 flex flex-col items-center">
        <Logo size="xl" showSubtitle theme="light" layout="stack" className="mb-8" />

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5" noValidate>
          {/* Email field */}
          <div>
            <Label htmlFor="email" className="text-sm font-bold text-slate-700 mb-1.5">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@zando.cg"
              className={fieldClass}
              {...register("email")}
            />
            {errors.email && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.email.message}</p>}
          </div>

          {/* Password field */}
          <div>
            <Label htmlFor="motDePasse" className="text-sm font-bold text-slate-700 mb-1.5">
              Mot de passe
            </Label>
            <div className="relative flex items-center">
              <Input
                id="motDePasse"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className={`${fieldClass} pr-11`}
                {...register("motDePasse")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Masquer ou afficher le mot de passe"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {errors.motDePasse && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.motDePasse.message}</p>}
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between pt-0.5 text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
              <input
                type="checkbox"
                defaultChecked={false}
                className="w-4 h-4 rounded border-slate-300 text-[#1A2E5A] focus:ring-[#1A2E5A]"
              />
              <span>Se souvenir de moi</span>
            </label>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Veuillez contacter le support technique Zando pour réinitialiser le mot de passe administrateur.");
              }}
              className="font-bold text-[#1A2E5A] hover:underline transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Server error display */}
          {serverError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 text-center">
              {serverError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-premium w-full h-12 rounded-xl bg-[#0B2545] hover:bg-[#0d2d54] text-white font-bold text-sm shadow-sm active:translate-y-px transition-all flex items-center justify-center disabled:opacity-60"
          >
            {isSubmitting ? (
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
