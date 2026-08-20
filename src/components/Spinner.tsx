export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden
    />
  );
}

export function LoadingBlock({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-16 text-sm font-semibold text-slate-400">
      <Spinner className="text-[#1A2E5A]" />
      {label}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 py-10 text-center text-sm font-medium text-red-700 shadow-premium-sm">
      <p className="max-w-md px-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="focus-premium rounded-xl border border-red-200 bg-white px-3.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="py-16 text-center text-sm font-medium text-slate-400">{message}</div>;
}
