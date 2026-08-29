import { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Inbox, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ─── Info row (fiches détail) ─── */
export function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0 border-b border-slate-50 last:border-none">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#1A2E5A]">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ─── KPI mini-stat (fiches détail) ─── */
export function MiniStat({ icon: Icon, label, value, tone = "navy" }: { icon: LucideIcon; label: string; value: ReactNode; tone?: "navy" | "green" | "gold" | "red" | "sky" }) {
  const TONE_ICON: Record<string, string> = {
    navy: "text-[#1A2E5A]", green: "text-emerald-600", gold: "text-[#F1A105]", red: "text-[#C00000]", sky: "text-sky-500",
  };
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-100 transition-all hover:shadow-premium-sm">
      <Icon size={18} className={`mx-auto mb-2 ${TONE_ICON[tone]}`} />
      <p className="font-tnum text-xl font-black text-slate-900 truncate">{value}</p>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide truncate mt-0.5">{label}</p>
    </div>
  );
}

/* ─── Shared Admin Table Shell ─── */
export function AdminTable({
  headers,
  children,
  empty = false,
  emptyMessage = "Aucun élément trouvé.",
}: {
  headers: string[];
  children: ReactNode;
  empty?: boolean;
  emptyMessage?: string;
}) {
  return (
    <div className="surface-card overflow-hidden rounded-3xl border border-slate-200/80 shadow-premium-sm transition-all hover:shadow-premium-md">
      <div className="overflow-x-auto scrollbar-dark">
        {/* [&_td]:align-top : sans ça, un <td> se centre verticalement sur la ligne la plus haute
            de sa <tr> (comportement HTML par défaut) — dès qu'une cellule fait 2-3 lignes (ex:
            motif + description + décision d'un litige) pendant que ses voisines n'en font qu'une,
            ces voisines "flottent" au milieu de la ligne au lieu de s'aligner en haut comme sur les
            lignes courtes, donnant une impression de colonnes mal alignées d'une ligne à l'autre. */}
        <table className="min-w-full divide-y divide-slate-100 text-sm [&_td]:align-top">
          <thead className="bg-slate-50/90 backdrop-blur-xs">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-5 py-4 text-xs font-black tracking-wider text-slate-500 uppercase border-b border-slate-200/70 ${
                    i === headers.length - 1 ? "text-right" : "text-left"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/70 bg-white">
            {empty ? (
              <tr>
                <td colSpan={headers.length} className="px-5 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400 animate-fade-in">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 ring-1 ring-slate-200/70 shadow-inner">
                      <Inbox size={22} strokeWidth={1.75} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Filter Bar ─── */
export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="surface-card mb-5 flex flex-wrap items-center gap-3 rounded-2xl p-3 border border-slate-200/80 shadow-premium-sm">
      {children}
    </div>
  );
}

export function TableSearch({ value, onChange, placeholder = "Rechercher..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-premium rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:border-[#1A2E5A] focus:outline-none transition-all min-w-[220px]"
      />
    </div>
  );
}

/* ─── Styled Select ─── */
export function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-premium appearance-none rounded-xl border border-slate-300/90 bg-white py-2.5 pl-4 pr-9 text-sm font-bold text-slate-700 hover:border-slate-300 focus:border-[#1A2E5A] focus:outline-none transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

/* ─── Action Button (table row) ─── */
export function RowAction({
  label,
  onClick,
  variant = "ghost",
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  variant?: "ghost" | "danger" | "success";
  disabled?: boolean;
}) {
  const styles = {
    ghost: "border-slate-200 text-slate-600 hover:border-[#1A2E5A] hover:bg-[#1A2E5A] hover:text-white",
    danger: "border-red-200 text-red-600 hover:bg-[#C00000] hover:border-[#C00000] hover:text-white",
    success: "border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`focus-premium rounded-xl border px-3.5 py-2 text-xs font-bold transition-all active:scale-[0.97] cursor-pointer disabled:opacity-40 ${styles[variant]}`}
    >
      {label}
    </button>
  );
}

/* ─── Circular Icon Action (table row buttons) ─── */
export function IconAction({
  icon: Icon,
  label,
  onClick,
  href,
  variant = "ghost",
  disabled = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "ghost" | "danger" | "success" | "info";
  disabled?: boolean;
}) {
  const styles = {
    ghost: "border-slate-200 text-slate-500 hover:border-[#1A2E5A] hover:bg-[#1A2E5A] hover:text-white hover:shadow-[0_4px_14px_-2px_rgba(26,46,90,0.45)]",
    info: "border-sky-200 text-sky-600 hover:border-sky-500 hover:bg-sky-500 hover:text-white hover:shadow-[0_4px_14px_-2px_rgba(2,132,199,0.45)]",
    danger: "border-red-200 text-red-600 hover:border-[#C00000] hover:bg-[#C00000] hover:text-white hover:shadow-[0_4px_14px_-2px_rgba(192,0,0,0.45)]",
    success: "border-emerald-200 text-emerald-700 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-[0_4px_14px_-2px_rgba(5,150,105,0.45)]",
  };
  const classes = `focus-premium flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-white transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${styles[variant]}`;

  if (href) {
    return (
      <Link href={href} title={label} aria-label={label} className={classes}>
        <Icon size={16} strokeWidth={2.3} />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} className={classes}>
      <Icon size={16} strokeWidth={2.3} />
    </button>
  );
}

/* ─── User Avatar ─── */
export function UserAvatar({
  name,
  subtitle,
  color = "bg-[#1A2E5A]",
  initials: ini,
}: {
  name: string;
  subtitle?: string;
  color?: string;
  initials: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-sm ring-2 ring-white ${color}`}
      >
        {ini}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-black text-slate-800 truncate tracking-tight">{name}</p>
        {subtitle && <p className="text-xs font-semibold text-slate-400 truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─── Page Title ─── */
export function AdminPageHeader({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#1A2E5A] to-[#0B1A35] text-white shadow-[0_6px_18px_-4px_rgba(11,37,69,0.45)]">
            <Icon size={22} strokeWidth={2} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500 font-semibold max-w-2xl">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ─── Header stat pill (count / summary chip used in page header actions) ─── */
const HEADER_STAT_TONE: Record<string, string> = {
  navy: "bg-[#1A2E5A]/8 border-[#1A2E5A]/15 text-[#1A2E5A]",
  red: "bg-red-50 border-red-100 text-red-700",
  green: "bg-emerald-50 border-emerald-100 text-emerald-700",
  gold: "bg-amber-50 border-amber-100 text-amber-700",
  violet: "bg-violet-50 border-violet-100 text-violet-700",
  sky: "bg-sky-50 border-sky-100 text-sky-700",
  slate: "bg-slate-50 border-slate-100 text-slate-600",
};

export function HeaderStat({
  icon: Icon,
  label,
  tone = "navy",
}: {
  icon: LucideIcon;
  label: ReactNode;
  tone?: keyof typeof HEADER_STAT_TONE;
}) {
  return (
    <div className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-premium-sm transition-all hover:shadow-premium-md ${HEADER_STAT_TONE[tone]}`}>
      <Icon size={16} />
      <span className="text-sm font-black whitespace-nowrap">{label}</span>
    </div>
  );
}

/* ─── Manual refresh button (pages sans polling automatique) ─── */
export function RefreshButton({ onClick, loading = false }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title="Actualiser"
      aria-label="Actualiser"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-premium-sm transition-all hover:border-[#1A2E5A] hover:text-[#1A2E5A] hover:shadow-premium-md disabled:opacity-50 cursor-pointer"
    >
      <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
    </button>
  );
}

