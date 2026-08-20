"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatutLitigeBadge } from "@/components/Badge";
import { LoadingBlock } from "@/components/Spinner";
import { LitigeConversation } from "@/components/litige/LitigeConversation";
import { LITIGE_MOTIFS, fetchVendeurLitigeDetail, fullName, type Litige } from "@/lib/api";

const CLOS = ["resolu", "rejete", "annule"];

export default function VendeurLitigeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [litige, setLitige] = useState<Litige | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendeurLitigeDetail(id).then(setLitige).catch(() => setLitige(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingBlock label="Chargement du litige…" />;
  if (!litige) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-bold text-slate-700">Litige introuvable.</p>
        <Link href="/vendeur/litiges" className="inline-flex items-center gap-2 mt-4 text-xs font-extrabold text-[#0B2545] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Retour aux litiges
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href="/vendeur/litiges" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0B2545] transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Mes litiges
      </Link>

      <PageHeader
        title={litige.numero}
        description={`Commande ${litige.commande?.numero_commande} · ${fullName(litige.plaignant) || "Client"}`}
        actions={<StatutLitigeBadge value={litige.statut} />}
      />

      <div className="p-4 rounded-2xl border border-slate-200 bg-white mb-4">
        <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wide mb-1">
          {LITIGE_MOTIFS.find((m) => m.id === litige.motif)?.label || litige.motif}
        </p>
        <p className="text-sm text-slate-700">{litige.description}</p>
      </div>

      {(litige.decisions || []).length > 0 && (
        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 mb-4 space-y-2">
          <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">Décision de l&apos;administration</p>
          {litige.decisions!.map((d) => (
            <div key={d.id} className="text-sm text-slate-700">
              <p className="font-bold capitalize">{d.decision_type.replace(/_/g, ' ')}</p>
              <p className="text-xs text-slate-600 mt-0.5">{d.reason}</p>
              {d.amount != null && (
                <p className="text-xs font-bold text-emerald-700 mt-1">{Number(d.amount).toLocaleString('fr-FR')} {d.currency || 'FCFA'}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-4 rounded-2xl border border-slate-200 bg-white">
        <p className="text-sm font-black text-slate-900 mb-3">Conversation</p>
        <LitigeConversation litigeId={litige.id} estResolu={CLOS.includes(litige.statut)} viewerType="vendeur" />
      </div>
    </div>
  );
}
