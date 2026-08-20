"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { LoadingBlock, EmptyState } from "@/components/Spinner";
import { fetchVendeurAvis, resolveMediaUrl, type VendeurAvis } from "@/lib/api";

function Stars({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-3.5 w-3.5 ${note >= n ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
      ))}
    </div>
  );
}

export default function VendeurAvisPage() {
  const [data, setData] = useState<VendeurAvis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendeurAvis().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock label="Chargement des avis…" />;
  if (!data) return <EmptyState message="Impossible de charger vos avis." />;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Avis clients" description={`${data.nombre_avis} avis reçu${data.nombre_avis > 1 ? "s" : ""}`} />

      <div className="p-5 rounded-2xl border border-slate-200 bg-white mb-6 flex items-center gap-4">
        <p className="text-4xl font-black text-[#0B2545]">{data.note_moyenne.toFixed(1)}</p>
        <div>
          <Stars note={Math.round(data.note_moyenne)} />
          <p className="text-xs text-slate-400 mt-1">Note moyenne sur {data.nombre_avis} avis</p>
        </div>
      </div>

      {data.avis.length === 0 ? (
        <EmptyState message="Aucun avis pour le moment." />
      ) : (
        <div className="space-y-3">
          {data.avis.map((a) => (
            <div key={a.id} className="p-4 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="h-8 w-8 rounded-full bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-black text-slate-500">
                  {a.client?.photo ? (
                    <img src={resolveMediaUrl(a.client.photo) || undefined} alt="" className="h-full w-full object-cover" />
                  ) : (
                    a.client?.nom?.charAt(0) || "?"
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate">{a.client?.nom || "Client"}</p>
                  <p className="text-[10px] text-slate-400">{new Date(a.date_notation).toLocaleDateString('fr-FR')}{a.numero_commande ? ` · ${a.numero_commande}` : ""}</p>
                </div>
                <Stars note={a.note} />
              </div>
              {a.commentaire && <p className="text-xs text-slate-600">{a.commentaire}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
