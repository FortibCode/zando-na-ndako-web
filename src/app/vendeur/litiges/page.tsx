"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatutLitigeBadge } from "@/components/Badge";
import { LoadingBlock, EmptyState } from "@/components/Spinner";
import { fetchVendeurLitiges, fullName, LITIGE_MOTIFS, type Litige } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

export default function VendeurLitigesPage() {
  const { t } = useLanguage();
  const [litiges, setLitiges] = useState<Litige[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendeurLitiges().then(setLitiges).catch(() => setLitiges([])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={t("vendor.litiges.title", "Litiges")} description={t("vendor.litiges.subtitle", "Litiges ouverts sur vos commandes.")} />

      {loading ? (
        <LoadingBlock label={t("vendor.litiges.loading", "Chargement des litiges…")} />
      ) : litiges.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <AlertTriangle className="h-12 w-12 text-slate-300 mb-3" />
          <EmptyState message={t("vendor.litiges.emptyState", "Aucun litige pour le moment.")} />
        </div>
      ) : (
        <div className="space-y-3">
          {litiges.map((l) => (
            <Link key={l.id} href={`/vendeur/litiges/${l.id}`}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 hover:shadow-sm transition-all">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900">{l.numero}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {LITIGE_MOTIFS.find((m) => m.id === l.motif)?.label || l.motif} · {fullName(l.plaignant) || t("vendor.common.clientFallback", "Client")} · {t("vendor.litiges.orderPrefix", "Commande")} {l.commande?.numero_commande}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{new Date(l.date_ouverture).toLocaleDateString('fr-FR')}</p>
              </div>
              <StatutLitigeBadge value={l.statut} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
