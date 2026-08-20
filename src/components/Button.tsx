import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "gold" | "success";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-linear-to-b from-[#d21212] to-[#8f0000] text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_20px_-4px_rgba(192,0,0,0.45)] hover:from-[#e01313] hover:to-[#a80000] hover:shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_12px_24px_-4px_rgba(192,0,0,0.55)] active:scale-[0.98] disabled:from-brand-red/40 disabled:to-brand-red/40 disabled:shadow-none disabled:active:scale-100",
  secondary:
    "bg-linear-to-b from-[#26407a] to-[#101c38] text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_20px_-4px_rgba(11,37,69,0.45)] hover:from-[#31519a] hover:to-[#172b54] hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_12px_24px_-4px_rgba(11,37,69,0.55)] active:scale-[0.98] disabled:from-brand-navy/40 disabled:to-brand-navy/40 disabled:shadow-none disabled:active:scale-100",
  gold:
    "bg-linear-to-b from-[#f7b83a] to-[#d4780a] text-slate-950 shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_-4px_rgba(241,161,5,0.45)] hover:from-[#fbc558] hover:to-[#e28412] active:scale-[0.98] disabled:opacity-40 disabled:shadow-none disabled:active:scale-100 font-extrabold",
  success:
    "bg-linear-to-b from-[#3d9a43] to-[#215c25] text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_8px_20px_-4px_rgba(46,125,50,0.45)] hover:from-[#46ab4d] hover:to-[#256a2a] hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_12px_24px_-4px_rgba(46,125,50,0.55)] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100",
  danger:
    "bg-white text-brand-red border border-brand-red/30 shadow-premium-sm hover:bg-brand-red-soft hover:border-brand-red/50 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100",
  ghost:
    "bg-white text-slate-700 border border-slate-200 shadow-premium-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100",
};

export function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`focus-premium inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

