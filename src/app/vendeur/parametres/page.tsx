"use client";

import { Globe, Monitor, Moon, Sun } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useTheme } from "@/lib/theme-context";
import { useLanguage } from "@/lib/language-context";
import type { Language } from "@/i18n/translations";

type ThemeMode = "light" | "dark" | "system";

function OptionChip({ selected, onClick, icon, label }: { selected: boolean; onClick: () => void; icon?: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 py-3 text-xs font-bold transition-colors cursor-pointer ${
        selected ? "border-[#0B2545] bg-[#0B2545]/8 text-[#0B2545]" : "border-slate-200 text-slate-500 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function VendeurParametresPage() {
  const { mode, setMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: "light", label: t("settings.light", "Clair"), icon: <Sun className="h-4 w-4" /> },
    { id: "dark", label: t("settings.dark", "Sombre"), icon: <Moon className="h-4 w-4" /> },
    { id: "system", label: t("settings.system", "Système"), icon: <Monitor className="h-4 w-4" /> },
  ];

  const languageOptions: { id: Language; label: string }[] = [
    { id: "fr", label: "Français" },
    { id: "lingala", label: "Lingala" },
    { id: "kituba", label: "Kituba" },
    { id: "en", label: "English" },
  ];

  return (
    <div className="max-w-xl">
      <PageHeader title={t("settings.title", "Paramètres")} description={t("settings.subtitle", "Préférences de l'application")} />

      <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B2545]/8 text-[#0B2545]">
            {mode === "dark" ? <Moon className="h-4 w-4" /> : mode === "system" ? <Monitor className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </div>
          <p className="text-sm font-black text-slate-900">{t("settings.theme", "Thème")}</p>
        </div>
        <div className="flex gap-2">
          {themeOptions.map((opt) => (
            <OptionChip key={opt.id} selected={mode === opt.id} onClick={() => setMode(opt.id)} icon={opt.icon} label={opt.label} />
          ))}
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B2545]/8 text-[#0B2545]">
            <Globe className="h-4 w-4" />
          </div>
          <p className="text-sm font-black text-slate-900">{t("settings.language", "Langue")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {languageOptions.map((opt) => (
            <OptionChip key={opt.id} selected={language === opt.id} onClick={() => setLanguage(opt.id)} label={opt.label} />
          ))}
        </div>
      </div>
    </div>
  );
}
