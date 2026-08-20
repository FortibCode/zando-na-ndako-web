import type { CSSProperties } from "react";

function Pulse({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} style={style} />;
}

export function KpiCardSkeleton() {
  return (
    <div className="surface-card rounded-2xl p-5">
      <Pulse className="h-11 w-11 rounded-2xl" />
      <Pulse className="h-3 w-24 mt-4" />
      <Pulse className="h-7 w-28 mt-2" />
      <Pulse className="h-5 w-32 mt-2.5 rounded-full" />
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="surface-card rounded-2xl p-5">
      <Pulse className="h-4 w-40 mb-1.5" />
      <Pulse className="h-3 w-56 mb-5" />
      <Pulse className="w-full" style={{ height }} />
    </div>
  );
}

export function ListSkeleton({ rows = 5, title = true }: { rows?: number; title?: boolean }) {
  return (
    <div className="surface-card rounded-2xl p-5">
      {title && <Pulse className="h-4 w-40 mb-4" />}
      <div className="space-y-3.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Pulse className="h-9 w-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Pulse className="h-3 w-3/4" />
              <Pulse className="h-2.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
