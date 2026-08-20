import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, PeriodValue } from "@/lib/types";

export interface PeriodSelection {
  period: PeriodValue;
  start: string;
  end: string;
}

interface SectionState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Charge une section du dashboard (GET /admin/dashboard/{endpoint}) pour la période sélectionnée.
 * Chaque section gère indépendamment ses propres états loading/error, sans bloquer les autres.
 */
export function useDashboardSection<T>(
  endpoint: string,
  period: PeriodSelection,
  limit?: number
): SectionState<T> & { reload: () => void } {
  const [state, setState] = useState<SectionState<T>>({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    const qs = buildQuery({
      period: period.period,
      start: period.period === "custom" ? period.start : undefined,
      end: period.period === "custom" ? period.end : undefined,
      limit,
    });

    api
      .get<ApiEnvelope<T>>(`/admin/dashboard/${endpoint}${qs}`)
      .then((res) => {
        if (!cancelled) setState({ data: res.data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof ApiError ? err.message : "Impossible de charger ces données.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, period.period, period.start, period.end, limit, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}
