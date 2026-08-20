"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRequirePublicAuth } from "@/lib/use-require-public-auth";
import { StatutLitigeBadge } from "@/components/Badge";
import { LitigeConversation } from "@/components/litige/LitigeConversation";
import { LITIGE_MOTIFS, fetchClientLitigeDetail, type Litige } from "@/lib/api";

const CLOS = ["resolu", "rejete", "annule"];

export default function ClientLitigeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isReady } = useRequirePublicAuth();
  const [litige, setLitige] = useState<Litige | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchClientLitigeDetail(id).then(setLitige).catch(() => setLitige(null)).finally(() => setLoading(false));
  }, [user, id]);

  if (!isReady || !user || loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </main>
    );
  }

  if (!litige) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-16 flex-1 text-center">
        <p className="text-sm font-bold text-slate-700">Litige introuvable.</p>
        <Link href="/mes-litiges" className="inline-flex items-center gap-2 mt-4 text-xs font-extrabold text-[#0B2545] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Retour à mes litiges
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <Link href="/mes-litiges" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0B2545] transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Mes litiges
      </Link>

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-black text-slate-900">{litige.numero}</h1>
        <StatutLitigeBadge value={litige.statut} />
      </div>
      <p className="text-xs text-slate-400 mb-6">Commande {litige.commande?.numero_commande} · {new Date(litige.date_ouverture).toLocaleDateString('fr-FR')}</p>

      <div className="p-4 rounded-2xl border border-slate-200 bg-white mb-4">
        <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wide mb-1">
          {LITIGE_MOTIFS.find((m) => m.id === litige.motif)?.label || litige.motif}
        </p>
        <p className="text-sm text-slate-700">{litige.description}</p>
      </div>

      {(litige.decisions || []).length > 0 && (
        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 mb-4 space-y-2">
          <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">Décision</p>
          {litige.decisions!.map((d) => (
            <div key={d.id} className="text-sm text-slate-700">
              <p className="font-bold capitalize">{d.decision_type.replace(/_/g, ' ')}</p>
              <p className="text-xs text-slate-600 mt-0.5">{d.reason}</p>
              {d.amount != null && (
                <p className="text-xs font-bold text-emerald-700 mt-1">
                  {Number(d.amount).toLocaleString('fr-FR')} {d.currency || 'FCFA'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-4 rounded-2xl border border-slate-200 bg-white">
        <p className="text-sm font-black text-slate-900 mb-3">Conversation</p>
        <LitigeConversation litigeId={litige.id} estResolu={CLOS.includes(litige.statut)} viewerType="client" />
      </div>
    </main>
  );
}
