"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, Loader2, MapPin, Phone, RotateCcw, Star, XCircle } from "lucide-react";
import { useRequirePublicAuth } from "@/lib/use-require-public-auth";
import { useCart } from "@/components/landing/cart-context";
import {
  ApiError,
  fetchLitigeMotifs,
  annulerClientCommande,
  fetchClientCommandeDetail,
  fetchClientCommandeSuivi,
  fetchCommandeNotations,
  ouvrirLitige,
  resolveMediaUrl,
  soumettreNotation,
  type ApiCommande,
  type ApiCommandeSuivi,
  type ApiNotation,
  type LitigeMotifOption,
} from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/lib/toast-context";
import { clientTranslations } from "@/i18n/client-translations";
import type { Language } from "@/i18n/translations";

function RatingForm({ commandeId, cible, label, onDone }: { commandeId: string; cible: "vendeur" | "livreur"; label: string; onDone: (n: ApiNotation) => void }) {
  const { t } = useLanguage();
  const { notify, notifyError } = useToast();
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
      await soumettreNotation(commandeId, { note, commentaire: commentaire.trim() || undefined, cible });
      onDone({ id: `local-${cible}`, commande_id: commandeId, type_notateur: "client", type_cible: cible, note, commentaire: commentaire.trim() || null });
      notify(t('client.commandeDetail.ratingSuccess', 'Avis envoyé, merci !'));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Impossible d'envoyer votre avis.";
      setError(message);
      notifyError(err, message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl border-2 border-slate-200 bg-white space-y-3">
      <p className="text-sm font-black text-slate-900">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNote(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="cursor-pointer"
            aria-label={`${n} ${t('client.commandeDetail.starAriaSuffix', 'étoile(s)')}`}
          >
            <Star className={`h-7 w-7 ${(hover || note) >= n ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
          </button>
        ))}
      </div>
      <textarea
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        rows={2}
        placeholder={t('client.commandeDetail.ratingCommentPlaceholder', 'Un commentaire (facultatif)…')}
        className="w-full p-3 rounded-xl border border-slate-300 text-sm resize-none focus:outline-none focus:border-[#0B2545]"
      />
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={note < 1 || submitting}
        className="w-full h-10 rounded-xl bg-[#0B2545] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
      >
        {submitting ? t('client.commandeDetail.ratingSending', 'Envoi…') : t('client.commandeDetail.ratingSend', 'Envoyer mon avis')}
      </button>
    </div>
  );
}

const CANCELLABLE = ["confirmee", "achat_marche"];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

function statusLabel(statut: string, language: Language): string {
  const c = clientTranslations[language].commandeDetail;
  const map: Record<string, string> = {
    confirmee: c.statusConfirmed,
    achat_marche: c.statusShopping,
    preparation: c.statusPreparing,
    en_route: c.statusEnRoute,
    en_route_client: c.statusArriving,
    livree: c.statusDelivered,
    annulee: c.statusCancelled,
  };
  return map[statut] || statut;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, language } = useLanguage();
  const { notify, notifyError } = useToast();
  const { id } = use(params);
  const { user, isReady } = useRequirePublicAuth();
  const { addItem } = useCart();
  const router = useRouter();

  const [order, setOrder] = useState<ApiCommande | null>(null);
  const [suivi, setSuivi] = useState<ApiCommandeSuivi | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [motif, setMotif] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showLitigeForm, setShowLitigeForm] = useState(false);
  const [litigeMotifs, setLitigeMotifs] = useState<LitigeMotifOption[]>([]);
  const [litigeMotif, setLitigeMotif] = useState("");
  const [litigeDescription, setLitigeDescription] = useState("");
  const [openingLitige, setOpeningLitige] = useState(false);
  const [litigeError, setLitigeError] = useState<string | null>(null);

  const [notations, setNotations] = useState<ApiNotation[]>([]);
  const [ratingOpen, setRatingOpen] = useState<"vendeur" | "livreur" | null>(null);

  const load = () => {
    fetchClientCommandeDetail(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  useEffect(() => {
    fetchLitigeMotifs()
      .then((list) => {
        setLitigeMotifs(list);
        setLitigeMotif((current) => current || list[0]?.id || "");
      })
      .catch(() => setLitigeMotifs([]));
  }, []);

  useEffect(() => {
    if (!order || order.statut_commande === "livree" || order.statut_commande === "annulee") return;
    const poll = () => fetchClientCommandeSuivi(id).then(setSuivi).catch(() => undefined);
    poll();
    const interval = setInterval(poll, 15_000);
    return () => clearInterval(interval);
  }, [order, id]);

  useEffect(() => {
    if (!order || order.statut_commande !== "livree") return;
    fetchCommandeNotations(id).then(setNotations).catch(() => undefined);
  }, [order, id]);

  if (!isReady || !user || loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-16 flex-1 text-center">
        <h1 className="text-xl font-black text-slate-900">{t('client.commandeDetail.notFoundTitle', 'Commande introuvable')}</h1>
        <Link href="/mes-commandes" className="inline-flex items-center gap-2 mt-6 text-xs font-extrabold text-[#0B2545] hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t('client.commandeDetail.back', 'Mes commandes')}
        </Link>
      </main>
    );
  }

  const handleCancel = async () => {
    if (!motif.trim()) return;
    setCancelling(true);
    setError(null);
    try {
      await annulerClientCommande(order.id, motif.trim());
      load();
      setShowCancelForm(false);
      notify(t('client.commandeDetail.cancelSuccess', 'Commande annulée.'));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('client.commandeDetail.cancelError', "Impossible d'annuler cette commande.");
      setError(message);
      notifyError(err, message);
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = () => {
    for (const ligne of order.lignes || []) {
      if (!ligne.produit) continue;
      addItem(
        {
          id: ligne.produit.id,
          name: ligne.produit.nom_produit,
          price: `${Number(ligne.prix_unitaire).toLocaleString('fr-FR')} FCFA`,
          priceValue: Number(ligne.prix_unitaire),
          unit: ligne.produit.unite_mesure,
          image: resolveMediaUrl(ligne.produit.photo_produit) || FALLBACK_IMAGE,
        },
        ligne.quantite,
      );
    }
    notify(t('client.commandeDetail.reorderSuccess', 'Produits ajoutés au panier.'));
  };

  const handleOpenLitige = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!litigeDescription.trim()) return;
    setOpeningLitige(true);
    setLitigeError(null);
    try {
      const litige = await ouvrirLitige(order.id, litigeMotif, litigeDescription.trim());
      router.push(`/mes-litiges/${litige.id}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('client.commandeDetail.openLitigeError', "Impossible d'ouvrir ce litige.");
      setLitigeError(message);
      notifyError(err, message);
    } finally {
      setOpeningLitige(false);
    }
  };

  const canCancel = CANCELLABLE.includes(order.statut_commande);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <Link href="/mes-commandes" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0B2545] transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> {t('client.commandeDetail.back', 'Mes commandes')}
      </Link>

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-black text-slate-900">{order.numero_commande}</h1>
        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-[#0B2545]">{statusLabel(order.statut_commande, language)}</span>
      </div>
      <p className="text-xs text-slate-400 mb-6">{new Date(order.created_at).toLocaleString('fr-FR')}</p>

      {suivi && suivi.etapes?.length > 0 && (
        <div className="p-4 rounded-2xl border border-slate-200 bg-white mb-4 space-y-3">
          {suivi.etapes.map((etape) => (
            <div key={etape.code} className="flex items-center gap-3">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${etape.fait ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                {etape.fait && <Check className="h-3.5 w-3.5" />}
              </span>
              <span className={`text-xs font-bold ${etape.fait ? "text-slate-800" : "text-slate-400"}`}>{etape.label}</span>
            </div>
          ))}
          {suivi.livreur && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-700">{suivi.livreur.nom}</p>
              <a href={`tel:${suivi.livreur.telephone}`} className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B2545]">
                <Phone className="h-3.5 w-3.5" /> {t('client.commandeDetail.call', 'Appeler')}
              </a>
            </div>
          )}
        </div>
      )}

      <div className="p-4 rounded-2xl border border-slate-200 bg-white mb-4">
        <div className="flex items-start gap-2.5 mb-3">
          <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600">{order.adresse_livraison}</p>
        </div>
        <div className="space-y-2">
          {(order.lignes || []).map((ligne) => (
            <div key={ligne.id} className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">{ligne.produit?.nom_produit || 'Produit'} × {ligne.quantite}</span>
              <span className="text-slate-500">{(Number(ligne.prix_unitaire) * ligne.quantite).toLocaleString('fr-FR')} FCFA</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-sm font-black">
          <span>{t('client.commandeDetail.total', 'Total')}</span>
          <span className="text-[#0B2545]">{Math.round(Number(order.montant_total)).toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      {order.statut_commande === "livree" && (
        <div className="space-y-3 mb-4">
          {(["vendeur", "livreur"] as const)
            .filter((cible) => cible === "vendeur" || !!order.livreur_id)
            .map((cible) => {
              const already = notations.find((n) => n.type_notateur === "client" && n.type_cible === cible);
              const label = cible === "vendeur" ? t('client.commandeDetail.noteVendor', 'Noter le vendeur') : t('client.commandeDetail.noteDriver', 'Noter le livreur');
              if (already) {
                return (
                  <div key={cible} className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700">
                    <Star className="h-4 w-4 fill-emerald-600 text-emerald-600" /> {label} · {already.note}/5 — {t('client.commandeDetail.thanksForReview', 'Merci pour votre avis !')}
                  </div>
                );
              }
              if (ratingOpen === cible) {
                return (
                  <RatingForm
                    key={cible}
                    commandeId={order.id}
                    cible={cible}
                    label={label}
                    onDone={(n) => { setNotations((prev) => [...prev, n]); setRatingOpen(null); }}
                  />
                );
              }
              return (
                <button
                  key={cible}
                  onClick={() => setRatingOpen(cible)}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-amber-200 text-amber-700 font-bold text-sm hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  <Star className="h-4 w-4" /> {label}
                </button>
              );
            })}
        </div>
      )}

      {canCancel && !showCancelForm && (
        <button
          onClick={() => setShowCancelForm(true)}
          className="w-full h-11 rounded-xl border-2 border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <XCircle className="h-4 w-4" /> {t('client.commandeDetail.cancelOrder', 'Annuler la commande')}
        </button>
      )}

      {showCancelForm && (
        <div className="p-4 rounded-2xl border-2 border-red-200 bg-red-50/40 space-y-3">
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder={t('client.commandeDetail.cancelReasonPlaceholder', "Motif de l'annulation…")}
            className="w-full h-20 p-3 rounded-xl border border-slate-300 text-sm resize-none focus:outline-none focus:border-red-400"
          />
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setShowCancelForm(false)} className="flex-1 h-10 rounded-xl border border-slate-300 text-xs font-bold text-slate-600">
              {t('client.common.back', 'Retour')}
            </button>
            <button
              onClick={handleCancel}
              disabled={!motif.trim() || cancelling}
              className="flex-1 h-10 rounded-xl bg-red-600 text-white text-xs font-bold disabled:opacity-50"
            >
              {cancelling ? t('client.commandeDetail.cancelling', 'Annulation…') : t('client.commandeDetail.confirmCancel', "Confirmer l'annulation")}
            </button>
          </div>
        </div>
      )}

      {!canCancel && order.statut_commande !== "annulee" && (
        <Link
          href="/accueil"
          onClick={handleReorder}
          className="w-full h-11 rounded-xl border-2 border-[#0B2545] text-[#0B2545] font-bold text-sm hover:bg-blue-50/40 transition-colors flex items-center justify-center gap-2 mb-3"
        >
          <RotateCcw className="h-4 w-4" /> {t('client.commandeDetail.reorder', 'Commander à nouveau')}
        </Link>
      )}

      {order.litige ? (
        <Link
          href={`/mes-litiges/${order.litige.id}`}
          className="w-full h-11 rounded-xl border-2 border-amber-200 text-amber-700 font-bold text-sm hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" /> {t('client.commandeDetail.viewDispute', 'Voir le litige ouvert')}
        </Link>
      ) : !showLitigeForm ? (
        <button
          onClick={() => setShowLitigeForm(true)}
          className="w-full h-11 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <AlertTriangle className="h-4 w-4" /> {t('client.commandeDetail.reportProblem', 'Signaler un problème')}
        </button>
      ) : (
        <form onSubmit={handleOpenLitige} className="p-4 rounded-2xl border-2 border-slate-200 bg-white space-y-3">
          <p className="text-sm font-black text-slate-900">{t('client.commandeDetail.reportProblem', 'Signaler un problème')}</p>
          <select value={litigeMotif} onChange={(e) => setLitigeMotif(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:border-[#0B2545]">
            {litigeMotifs.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <textarea
            value={litigeDescription}
            onChange={(e) => setLitigeDescription(e.target.value)}
            rows={3}
            placeholder={t('client.commandeDetail.disputeDescPlaceholder', 'Décrivez le problème rencontré…')}
            className="w-full p-3 rounded-xl border border-slate-300 text-sm resize-none focus:outline-none focus:border-[#0B2545]"
          />
          {litigeError && <p className="text-xs font-semibold text-red-600">{litigeError}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowLitigeForm(false)} className="flex-1 h-10 rounded-xl border border-slate-300 text-xs font-bold text-slate-600">
              {t('client.common.cancel', 'Annuler')}
            </button>
            <button type="submit" disabled={!litigeDescription.trim() || openingLitige}
              className="flex-1 h-10 rounded-xl bg-[#0B2545] text-white text-xs font-bold disabled:opacity-50">
              {openingLitige ? t('client.commandeDetail.disputeSending', 'Envoi…') : t('client.commandeDetail.disputeSend', 'Envoyer')}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
