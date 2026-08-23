"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRequirePublicAuth } from "@/lib/use-require-public-auth";
import { StatutLitigeBadge } from "@/components/Badge";
import { fetchClientLitiges, fetchLitigeMotifs, type Litige, type LitigeMotifOption } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

export default function MesLitigesPage() {
  const { t } = useLanguage();
  const { user, isReady } = useRequirePublicAuth();
  const [litiges, setLitiges] = useState<Litige[]>([]);
  const [loading, setLoading] = useState(true);
  const [motifs, setMotifs] = useState<LitigeMotifOption[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchClientLitiges().then(setLitiges).catch(() => setLitiges([])).finally(() => setLoading(false));
    fetchLitigeMotifs().then(setMotifs).catch(() => setMotifs([]));
  }, [user]);

  if (!isReady || !user) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">{t('client.mesLitiges.title', 'Mes litiges')}</h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : litiges.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <AlertTriangle className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">{t('client.mesLitiges.emptyTitle', 'Aucun litige ouvert')}</p>
          <p className="text-xs text-slate-400 mt-1">{t('client.mesLitiges.emptyDesc', 'Un problème avec une commande ? Signalez-le depuis son détail.')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {litiges.map((l) => (
            <Link key={l.id} href={`/mes-litiges/${l.id}`}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 hover:shadow-sm transition-all">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900">{l.numero}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {motifs.find((m) => m.id === l.motif)?.label || l.motif} · Commande {l.commande?.numero_commande}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{new Date(l.date_ouverture).toLocaleDateString('fr-FR')}</p>
              </div>
              <StatutLitigeBadge value={l.statut} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
