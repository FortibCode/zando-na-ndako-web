"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, ShoppingBag, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatutCommandeBadge } from "@/components/Badge";
import { LoadingBlock, EmptyState } from "@/components/Spinner";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { accepterVendeurCommande, fetchVendeurCommandes, fullName, refuserVendeurCommande, type VendeurCommande } from "@/lib/api";

type Tab = "tous" | "confirmee" | "en_cours" | "livree" | "annulee";

const TABS: [Tab, string][] = [
  ["tous", "Toutes"],
  ["confirmee", "Nouvelles"],
  ["en_cours", "En cours"],
  ["livree", "Livrées"],
  ["annulee", "Annulées"],
];

export default function VendeurCommandesPage() {
  const [orders, setOrders] = useState<VendeurCommande[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("tous");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refusing, setRefusing] = useState<VendeurCommande | null>(null);
  const [motif, setMotif] = useState("");

  const load = () => {
    setLoading(true);
    fetchVendeurCommandes().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = orders.filter((o) => {
    if (tab === "tous") return true;
    if (tab === "en_cours") return ["achat_marche", "preparation", "en_route", "en_route_client"].includes(o.statut_commande);
    return o.statut_commande === tab;
  });

  const handleAccept = async (id: string) => {
    setBusyId(id);
    try {
      await accepterVendeurCommande(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, statut_commande: "achat_marche" } : o)));
    } finally {
      setBusyId(null);
    }
  };

  const handleRefuse = async () => {
    if (!refusing || !motif.trim()) return;
    setBusyId(refusing.id);
    try {
      await refuserVendeurCommande(refusing.id, motif.trim());
      setOrders((prev) => prev.map((o) => (o.id === refusing.id ? { ...o, statut_commande: "annulee" } : o)));
      setRefusing(null);
      setMotif("");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Commandes" description="Gérez les commandes reçues par votre boutique." />

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`shrink-0 h-9 px-4 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              tab === key ? "bg-[#0B2545] text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingBlock label="Chargement des commandes…" />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <ShoppingBag className="h-12 w-12 text-slate-300 mb-3" />
          <EmptyState message="Aucune commande dans cette catégorie." />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="p-4 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3">
                <Link href={`/vendeur/commandes/${o.id}`} className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900">{o.numero_commande}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {fullName(o.client?.user) || "Client"} · {new Date(o.date_commande).toLocaleDateString('fr-FR')}
                  </p>
                </Link>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-black text-[#0B2545]">{Math.round(Number(o.montant_sous_total)).toLocaleString('fr-FR')} FCFA</span>
                  <StatutCommandeBadge value={o.statut_commande} />
                </div>
              </div>

              {o.statut_commande === "confirmee" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleAccept(o.id)}
                    disabled={busyId === o.id}
                    className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {busyId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Accepter
                  </button>
                  <button
                    onClick={() => setRefusing(o)}
                    disabled={busyId === o.id}
                    className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" /> Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {refusing && (
        <Modal
          title="Refuser cette commande"
          onClose={() => { setRefusing(null); setMotif(""); }}
          footer={
            <>
              <Button variant="ghost" onClick={() => { setRefusing(null); setMotif(""); }}>Annuler</Button>
              <Button variant="danger" onClick={handleRefuse} loading={busyId === refusing.id} disabled={!motif.trim()}>Refuser la commande</Button>
            </>
          }
        >
          <p className="text-sm text-slate-600 mb-3">
            Commande <span className="font-bold">{refusing.numero_commande}</span> — le stock sera automatiquement restitué.
          </p>
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            rows={3}
            placeholder="Motif du refus…"
            className="w-full p-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:border-[#0B2545]"
          />
        </Modal>
      )}
    </div>
  );
}
