"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Package, Store, Bike, CreditCard, MapPin, Phone, Mail,
  PenLine, RotateCcw, ImageOff, ShieldAlert, ExternalLink,
} from "lucide-react";
import { api, ApiError, resolveMediaUrl } from "@/lib/api";
import type { ApiEnvelope, CommandeDetailData, StatutCommande, Vendeur, Livreur, PaginatedData } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { StatutCommandeBadge, statutLabel, Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { InfoRow } from "@/components/AdminTable";
import { formatDate, formatMontant, fullName } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { PAIEMENT_METHODE_LABEL, PAIEMENT_STATUT_TONE, PAIEMENT_STATUT_LABEL } from "@/lib/paiement-labels";

const STATUTS: StatutCommande[] = ["confirmee", "achat_marche", "preparation", "en_route", "livree", "annulee"];

export default function CommandeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canAssign = usePermission("assign_commandes");
  const canEditStatus = usePermission("edit_commande_status");
  const canRefund = usePermission("refund_commandes");

  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StatutCommande>("confirmee");
  const [assignLivreurOpen, setAssignLivreurOpen] = useState(false);
  const [selectedLivreur, setSelectedLivreur] = useState("");
  const [assignVendeurOpen, setAssignVendeurOpen] = useState(false);
  const [selectedVendeur, setSelectedVendeur] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundMotif, setRefundMotif] = useState("");

  const { data: commande, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-commande-detail", params.id],
    queryFn: async () => (await api.get<ApiEnvelope<CommandeDetailData>>(`/admin/commandes/${params.id}`)).data,
  });

  const { data: livreurs } = useQuery({
    queryKey: ["admin-livreurs-valides"],
    queryFn: async () => (await api.get<ApiEnvelope<PaginatedData<Livreur>>>("/admin/livreurs?statut=valide&disponible=1&per_page=200")).data.data,
    enabled: assignLivreurOpen,
  });

  const { data: vendeurs } = useQuery({
    queryKey: ["admin-vendeurs-valides"],
    queryFn: async () => (await api.get<ApiEnvelope<PaginatedData<Vendeur>>>("/admin/vendeurs?statut=valide")).data.data,
    enabled: assignVendeurOpen,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-commande-detail", params.id] });
    queryClient.invalidateQueries({ queryKey: ["admin-commandes"] });
  }

  const statusMutation = useMutation({
    mutationFn: () => api.put(`/admin/commandes/${params.id}/statut`, { statut: selectedStatus }),
    onSuccess: () => { notify("Statut mis à jour."); setStatusOpen(false); invalidate(); },
    onError: (err) => notifyError(err, "Impossible de modifier le statut."),
  });

  const assignLivreurMutation = useMutation({
    mutationFn: () => api.post(`/admin/commandes/${params.id}/attribuer`, { livreur_id: selectedLivreur }),
    onSuccess: () => { notify("Livreur attribué."); setAssignLivreurOpen(false); invalidate(); },
    onError: (err) => notifyError(err, "Impossible d'attribuer ce livreur."),
  });

  const assignVendeurMutation = useMutation({
    mutationFn: () => api.post(`/admin/commandes/${params.id}/attribuer-vendeur`, { vendeur_id: selectedVendeur }),
    onSuccess: () => { notify("Vendeur réattribué."); setAssignVendeurOpen(false); invalidate(); },
    onError: (err) => notifyError(err, "Impossible de réattribuer ce vendeur."),
  });

  const refundMutation = useMutation({
    mutationFn: () => api.post(`/admin/commandes/${params.id}/rembourser`, { motif: refundMotif }),
    onSuccess: () => { notify("Paiement remboursé."); setRefundOpen(false); setRefundMotif(""); invalidate(); },
    onError: (err) => notifyError(err, "Impossible de rembourser ce paiement."),
  });

  const proofUrl = resolveMediaUrl(commande?.livraison?.photo_preuve);

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        onClick={() => router.push("/admin/commandes")}
        className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#1A2E5A] transition-colors"
      >
        <ArrowLeft size={14} /> Retour aux commandes
      </button>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger cette commande."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && commande && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="surface-card rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1A2E5A]/8 text-[#1A2E5A]">
                    <Package size={22} />
                  </span>
                  <div>
                    <h1 className="text-lg font-black text-slate-900">{commande.numero_commande}</h1>
                    <p className="text-xs font-bold text-slate-400">{formatDate(commande.date_commande, true)} · {commande.type_commande === "diaspora" ? "Diaspora" : "Local"}</p>
                  </div>
                </div>
                <StatutCommandeBadge value={commande.statut_commande} />
              </div>
              {commande.motif_annulation && (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Motif d&apos;annulation : {commande.motif_annulation}</p>
              )}
            </div>

            {/* Lignes de commande */}
            <div className="surface-card rounded-2xl">
              <div className="px-6 py-4 border-b border-slate-50">
                <h2 className="text-sm font-black text-slate-800">Produits commandés</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {commande.lignes.map((l) => {
                  const img = resolveMediaUrl(l.produit?.photo_produit);
                  return (
                    <div key={l.id} className="flex items-center gap-3 px-6 py-3.5">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-100" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-300 ring-1 ring-slate-100"><ImageOff size={15} /></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-800 truncate">{l.produit?.nom_produit ?? "Produit"}</p>
                        <p className="text-[12.5px] text-slate-400">{l.quantite} × {formatMontant(l.prix_unitaire)}</p>
                      </div>
                      <p className="text-sm font-black text-slate-800">{formatMontant(l.sous_total)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="px-6 py-3.5 border-t border-slate-100 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Sous-total</span><span>{formatMontant(commande.montant_sous_total)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Frais de livraison</span><span>{formatMontant(commande.frais_livraison)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900">
                  <span>Total</span><span>{formatMontant(commande.montant_total, commande.devise_paiement)}</span>
                </div>
              </div>
            </div>

            {/* Vendeur & Livreur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="surface-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="flex items-center gap-2 text-sm font-black text-slate-800"><Store size={15} className="text-emerald-600" /> Vendeur</h2>
                  {commande.vendeur && <a href={`/admin/vendeurs/${commande.vendeur.id}`} className="flex items-center gap-1 text-xs font-bold text-[#1A2E5A] hover:underline"><ExternalLink size={11} /></a>}
                </div>
                {commande.vendeur ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-bold text-slate-700">{commande.vendeur.nom_commerce}</p>
                    {commande.vendeur.user && <p className="text-xs text-slate-400">{commande.vendeur.user.telephone}</p>}
                  </div>
                ) : <p className="text-xs text-slate-400 mt-2">Aucun vendeur attribué.</p>}
              </div>
              <div className="surface-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="flex items-center gap-2 text-sm font-black text-slate-800"><Bike size={15} className="text-violet-600" /> Livreur</h2>
                  {commande.livreur && <a href={`/admin/livreurs/${commande.livreur.id}`} className="flex items-center gap-1 text-xs font-bold text-[#1A2E5A] hover:underline"><ExternalLink size={11} /></a>}
                </div>
                {commande.livreur?.user ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-bold text-slate-700">{fullName(commande.livreur.user.nom, commande.livreur.user.prenom)}</p>
                    <p className="text-xs text-slate-400">{commande.livreur.user.telephone}</p>
                  </div>
                ) : <p className="text-xs text-slate-400 mt-2">Aucun livreur attribué.</p>}
              </div>
            </div>

            {/* Adresse & preuve de livraison */}
            <div className="surface-card rounded-2xl p-6">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-black text-slate-800"><MapPin size={15} className="text-[#1A2E5A]" /> Livraison</h2>
              <div className="mt-2">
                <InfoRow icon={MapPin} label="Adresse de livraison" value={commande.adresse_livraison} />
                {commande.livraison && <InfoRow icon={Bike} label="Statut de la livraison" value={statutLabel(commande.livraison.statut_livraison)} />}
                {commande.livraison?.motif_incident && <InfoRow icon={ShieldAlert} label="Incident signalé" value={commande.livraison.motif_incident} />}
              </div>
              {proofUrl ? (
                <div className="mt-4">
                  <p className="mb-2 text-[12.5px] font-bold uppercase tracking-wide text-slate-400">Preuve de livraison</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proofUrl} alt="Preuve de livraison" className="max-h-64 rounded-xl ring-1 ring-slate-100 object-cover" />
                </div>
              ) : commande.statut_commande === "livree" ? (
                <p className="mt-4 text-xs font-semibold text-slate-400">Aucune preuve de livraison fournie.</p>
              ) : null}
            </div>

            {/* Paiement */}
            <div className="surface-card rounded-2xl p-6">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-black text-slate-800"><CreditCard size={15} className="text-[#F1A105]" /> Paiement</h2>
              {commande.paiement ? (
                <>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <InfoRow icon={CreditCard} label="Méthode" value={PAIEMENT_METHODE_LABEL[commande.paiement.methode] ?? commande.paiement.methode} />
                    <InfoRow icon={CreditCard} label="Montant" value={formatMontant(commande.paiement.montant, commande.paiement.devise)} />
                    <InfoRow icon={CreditCard} label="Date" value={commande.paiement.date_paiement ? formatDate(commande.paiement.date_paiement, true) : "—"} />
                  </div>
                  <div className="mt-3"><Badge tone={PAIEMENT_STATUT_TONE[commande.paiement.statut]}>{PAIEMENT_STATUT_LABEL[commande.paiement.statut]}</Badge></div>
                </>
              ) : <p className="mt-2 text-xs font-semibold text-slate-400">Aucun paiement enregistré pour cette commande.</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6">
              <h2 className="mb-4 text-sm font-black text-slate-800">Actions</h2>
              <div className="space-y-2.5">
                {canEditStatus && (
                  <Button variant="ghost" className="w-full" onClick={() => { setSelectedStatus(commande.statut_commande); setStatusOpen(true); }}>
                    <PenLine size={15} /> Modifier le statut
                  </Button>
                )}
                {canAssign && (
                  <Button variant="ghost" className="w-full" onClick={() => { setSelectedLivreur(commande.livreur_id ?? ""); setAssignLivreurOpen(true); }}>
                    <Bike size={15} /> {commande.livreur ? "Réattribuer" : "Attribuer"} un livreur
                  </Button>
                )}
                {canAssign && (
                  <Button variant="ghost" className="w-full" onClick={() => { setSelectedVendeur(commande.vendeur_id ?? ""); setAssignVendeurOpen(true); }}>
                    <Store size={15} /> Réattribuer le vendeur
                  </Button>
                )}
                {canRefund && commande.paiement?.statut === "valide" && (
                  <Button variant="danger" className="w-full" onClick={() => setRefundOpen(true)}>
                    <RotateCcw size={15} /> Rembourser
                  </Button>
                )}
                {!canEditStatus && !canAssign && !(canRefund && commande.paiement?.statut === "valide") && (
                  <p className="text-xs font-semibold text-slate-400">Votre rôle ne permet pas de modifier cette commande.</p>
                )}
              </div>
            </div>

            {commande.client?.user && (
              <div className="surface-card rounded-2xl p-6">
                <h2 className="mb-3 text-sm font-black text-slate-800">Contacter le client</h2>
                <p className="text-sm font-bold text-slate-700 mb-2">{fullName(commande.client.user.nom, commande.client.user.prenom)}</p>
                <div className="space-y-2">
                  <a href={`tel:${commande.client.user.telephone}`} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-[#1A2E5A] hover:text-[#1A2E5A] transition-colors">
                    <Phone size={13} /> {commande.client.user.telephone}
                  </a>
                  {commande.client.user.email && (
                    <a href={`mailto:${commande.client.user.email}`} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-[#1A2E5A] hover:text-[#1A2E5A] transition-colors">
                      <Mail size={13} /> {commande.client.user.email}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {statusOpen && commande && (
        <Modal
          title={`Statut de la commande ${commande.numero_commande}`}
          onClose={() => setStatusOpen(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setStatusOpen(false)} disabled={statusMutation.isPending}>Annuler</Button>
            <Button onClick={() => statusMutation.mutate()} loading={statusMutation.isPending}>Mettre à jour</Button>
          </>}
        >
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as StatutCommande)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none">
            {STATUTS.map((s) => <option key={s} value={s}>{statutLabel(s)}</option>)}
          </select>
        </Modal>
      )}

      {assignLivreurOpen && commande && (
        <Modal
          title={`Attribuer un livreur — ${commande.numero_commande}`}
          onClose={() => setAssignLivreurOpen(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setAssignLivreurOpen(false)} disabled={assignLivreurMutation.isPending}>Annuler</Button>
            <Button onClick={() => assignLivreurMutation.mutate()} loading={assignLivreurMutation.isPending} disabled={!selectedLivreur}>Attribuer</Button>
          </>}
        >
          {!livreurs ? <LoadingBlock label="Chargement des livreurs…" /> : livreurs.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun livreur validé disponible.</p>
          ) : (
            <select value={selectedLivreur} onChange={(e) => setSelectedLivreur(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none">
              <option value="" disabled>Sélectionner un livreur…</option>
              {livreurs.map((l) => <option key={l.id} value={l.id}>{l.user ? fullName(l.user.nom, l.user.prenom) : l.id} — {l.type_vehicule}</option>)}
            </select>
          )}
        </Modal>
      )}

      {assignVendeurOpen && commande && (
        <Modal
          title={`Réattribuer le vendeur — ${commande.numero_commande}`}
          onClose={() => setAssignVendeurOpen(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setAssignVendeurOpen(false)} disabled={assignVendeurMutation.isPending}>Annuler</Button>
            <Button onClick={() => assignVendeurMutation.mutate()} loading={assignVendeurMutation.isPending} disabled={!selectedVendeur}>Réattribuer</Button>
          </>}
        >
          {!vendeurs ? <LoadingBlock label="Chargement des vendeurs…" /> : vendeurs.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun vendeur validé disponible.</p>
          ) : (
            <select value={selectedVendeur} onChange={(e) => setSelectedVendeur(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none">
              <option value="" disabled>Sélectionner un vendeur…</option>
              {vendeurs.map((v) => <option key={v.id} value={v.id}>{v.nom_commerce}</option>)}
            </select>
          )}
        </Modal>
      )}

      {refundOpen && commande && (
        <Modal
          title="Rembourser cette commande"
          onClose={() => { setRefundOpen(false); setRefundMotif(""); }}
          footer={<>
            <Button variant="ghost" onClick={() => { setRefundOpen(false); setRefundMotif(""); }} disabled={refundMutation.isPending}>Annuler</Button>
            <Button variant="danger" onClick={() => refundMutation.mutate()} loading={refundMutation.isPending} disabled={!refundMotif.trim()}>Rembourser</Button>
          </>}
        >
          <p className="mb-4 text-sm text-slate-600">
            Le paiement de <strong>{formatMontant(commande.paiement?.montant)}</strong> sera marqué comme remboursé.
          </p>
          <label className="mb-1.5 block text-xs font-black text-slate-700">Motif du remboursement (obligatoire)</label>
          <textarea value={refundMotif} onChange={(e) => setRefundMotif(e.target.value)} rows={3} maxLength={500}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000] focus:outline-none"
            placeholder="Ex : produit endommagé, commande non livrée…" />
        </Modal>
      )}
    </div>
  );
}
