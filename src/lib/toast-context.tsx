"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastKind = "success" | "error" | "info";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  notify: (message: string, kind?: ToastKind) => void;
  notifyError: (error: unknown, fallback?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function messageFromError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, kind: ToastKind = "success") => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  const notifyError = useCallback(
    (error: unknown, fallback = "Une erreur est survenue.") => {
      notify(messageFromError(error, fallback), "error");
    },
    [notify],
  );

  const value = useMemo(() => ({ notify, notifyError }), [notify, notifyError]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto w-full rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-sm ${
              t.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : t.kind === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans un <ToastProvider>.");
  return ctx;
}
