"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, MapPin, Phone, Star, Truck, User, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatutCommandeBadge } from "@/components/Badge";
import { LoadingBlock } from "@/components/Spinner";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import {
  ApiError, accepterVendeurCommande, fetchCommandeNotations, fetchVendeurCommandeDetail, fullName,
  refuserVendeurCommande, soumettreNotation, type ApiNotation, type VendeurCommande,
} from "@/lib/api";

function NoterClientCard({ commandeId, onDone }: { commandeId: string; onDone: () => void }) {
  const [note, setNote] = useState(0);
  const [hover, setHover] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (note < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      await soumettreNotation(commandeId, { note, commentaire: commentaire.trim() || undefined });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer cet avis.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl border-2 border-slate-200 bg-white space-y-3 mb-4">
      <p className="text-sm font-black text-slate-900">Noter ce client</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setNote(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} className="cursor-pointer" aria-label={`${n} étoiles`}>
            <Star className={`h-7 w-7 ${(hover || note) >= n ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
          </button>
        ))}
      </div>
      <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} rows={2} placeholder="Un commentaire (facultatif)…"
        className="w-full p-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:border-[#0B2545]" />
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <Button variant="primary" onClick={handleSubmit} loading={submitting} disabled={note < 1} className="w-full !py-2.5">
        Envoyer
      </Button>
    </div>
  );
}

export default function VendeurCommandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<VendeurCommande | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refusing, setRefusing] = useState(false);
  const [motif, setMotif] = useState("");
  const [notations, setNotations] = useState<ApiNotation[]>([]);
  const [showRating, setShowRating] = useState(false);

  const load = () => {
    fetchVendeurCommandeDetail(id).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  useEffect(() => {
    if (order?.statut_commande !== "livree") return;
    fetchCommandeNotations(id).then(setNotations).catch(() => undefined);
  }, [order?.statut_commande, id]);

  if (loading) return <LoadingBlock label="Chargement de la commande…" />;
  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-bold text-slate-700">Commande introuvable.</p>
        <Link href="/vendeur/commandes" className="inline-flex items-center gap-2 mt-4 text-xs font-extrabold text-[#0B2545] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Retour aux commandes
        </Link>
      </div>
    );
  }

  const handleAccept = async () => {
    setBusy(true);
    try {
      await accepterVendeurCommande(id);
      load();
    } finally {
      setBusy(false);
    }
  };

  const handleRefuse = async () => {
    if (!motif.trim()) return;
    setBusy(true);
    try {
      await refuserVendeurCommande(id, motif.trim());
      setRefusing(false);
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/vendeur/commandes" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0B2545] transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Mes commandes
      </Link>

      <PageHeader
        title={order.numero_commande}
        description={new Date(order.date_commande).toLocaleString('fr-FR')}
        actions={<StatutCommandeBadge value={order.statut_commande} />}
      />

      <div className="p-4 rounded-2xl border border-slate-200 bg-white mb-4 space-y-2.5">
        <div className="flex items-center gap-2.5 text-sm">
          <User className="h-4 w-4 text-slate-400" />
          <span className="font-bold text-slate-800">{fullName(order.client?.user) || "Client"}</span>
        </div>
        {order.client?.user?.telephone && (
          <a href={`tel:${order.client.user.telephone}`} className="flex items-center gap-2.5 text-sm text-[#0B2545] font-bold">
            <Phone className="h-4 w-4" /> {order.client.user.telephone}
          </a>
        )}
        <div className="flex items-start gap-2.5 text-sm">
          <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
          <span className="text-slate-600">{order.adresse_livraison}</span>
        </div>
        {order.livreur?.user && (
          <div className="flex items-center gap-2.5 text-sm pt-2 border-t border-slate-100">
            <Truck className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">Livreur : {fullName(order.livreur.user)}</span>
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl border border-slate-200 bg-white mb-4">
        <p className="text-sm font-black text-slate-900 mb-3">Articles</p>
        <div className="space-y-2">
          {(order.lignes || []).map((ligne) => (
            <div key={ligne.id} className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">{ligne.produit?.nom_produit || 'Produit'} × {ligne.quantite}</span>
              <span className="text-slate-500">{(Number(ligne.prix_unitaire) * ligne.quantite).toLocaleString('fr-FR')} FCFA</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-sm font-black">
          <span>Sous-total (part vendeur)</span>
          <span className="text-[#0B2545]">{Math.round(Number(order.montant_sous_total)).toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      {order.statut_commande === "livree" && (() => {
        const already = notations.find((n) => n.type_notateur === "vendeur" && n.type_cible === "client");
        if (already) {
          return (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700 mb-4">
              <Star className="h-4 w-4 fill-emerald-600 text-emerald-600" /> Client noté · {already.note}/5
            </div>
          );
        }
        if (showRating) {
          return <NoterClientCard commandeId={order.id} onDone={() => { setShowRating(false); fetchCommandeNotations(id).then(setNotations); }} />;
        }
        return (
          <button
            onClick={() => setShowRating(true)}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-amber-200 text-amber-700 font-bold text-sm hover:bg-amber-50 transition-colors cursor-pointer mb-4"
          >
            <Star className="h-4 w-4" /> Noter ce client
          </button>
        );
      })()}

      {order.motif_annulation && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 mb-4 text-sm text-red-700">
          <span className="font-bold">Motif d&apos;annulation :</span> {order.motif_annulation}
        </div>
      )}

      {order.statut_commande === "confirmee" && (
        <div className="flex gap-3">
          <Button variant="success" onClick={handleAccept} loading={busy} className="flex-1 !py-3">
            <Check className="h-4 w-4" /> Accepter la commande
          </Button>
          <Button variant="danger" onClick={() => setRefusing(true)} disabled={busy} className="flex-1 !py-3">
            <X className="h-4 w-4" /> Refuser
          </Button>
        </div>
      )}

      {refusing && (
        <Modal
          title="Refuser cette commande"
          onClose={() => setRefusing(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setRefusing(false)}>Annuler</Button>
              <Button variant="danger" onClick={handleRefuse} loading={busy} disabled={!motif.trim()}>Refuser la commande</Button>
            </>
          }
        >
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
