import { ChevronLeft, ChevronRight } from "lucide-react";

function pageWindow(current: number, last: number): (number | "…")[] {
  const pages = new Set<number>([1, last, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

export function Pagination({
  currentPage,
  lastPage,
  total,
  from,
  to,
  onChange,
}: {
  currentPage: number;
  lastPage: number;
  total: number;
  from: number | null;
  to: number | null;
  onChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3">
      <p className="text-sm font-semibold text-slate-500">
        {from ?? 0}–{to ?? 0} sur <span className="font-black text-slate-700">{total}</span> résultats
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Page précédente"
          className="focus-premium flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-[#1A2E5A] hover:text-[#1A2E5A] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {pageWindow(currentPage, lastPage).map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm font-bold text-slate-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`focus-premium flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition-all ${
                p === currentPage
                  ? "bg-linear-to-b from-[#26407a] to-[#101c38] text-white shadow-[0_4px_12px_-2px_rgba(11,37,69,0.5)]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          aria-label="Page suivante"
          className="focus-premium flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-[#1A2E5A] hover:text-[#1A2E5A] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
