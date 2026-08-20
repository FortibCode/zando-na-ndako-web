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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in" onClick={onClose} />
      <div className="animate-scale-in relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_25px_70px_-15px_rgba(11,37,69,0.35)] ring-1 ring-slate-900/10">
        <div className="flex items-center justify-between border-b border-slate-100 bg-linear-to-r from-slate-50 to-white px-6 py-4.5">
          <h2 className="text-base font-black text-slate-900 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5 scrollbar-dark">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

