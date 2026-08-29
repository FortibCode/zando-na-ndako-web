"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/50 dark:bg-slate-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Carte modale — hauteur max réactive avec header/footer fixes et corps scrollable */}
      <div className="animate-scale-in relative z-10 flex max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-[0_25px_70px_-15px_rgba(11,37,69,0.35)] ring-1 ring-slate-900/10 dark:ring-white/10">
        {/* En-tête (Toujours fixe en haut du modal) */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-6 py-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corps du modal (Défilement fluide si le formulaire comporte de nombreux champs) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-slate-800 dark:text-slate-200 scrollbar-dark">{children}</div>

        {/* Pied (Toujours fixe en bas du modal avec les boutons d'action) */}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
