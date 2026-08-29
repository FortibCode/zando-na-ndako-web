"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, AlertTriangle, Store, User as UserIcon, Send, Paperclip, MessageCircleQuestion,
  Check, Ban, Wallet, Repeat, PackageX, TriangleAlert, History, ShieldAlert, FileText, Image as ImageIcon,
  Film, ExternalLink, Lock,
} from "lucide-react";
import { api, ApiError, resolveMediaUrl } from "@/lib/api";
import type {
  ApiEnvelope, Litige, LitigeMessage, LogActivite, DecisionTypeLitige, SenderTypeLitige,
} from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { StatutLitigeBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { InfoRow } from "@/components/AdminTable";
import { formatDate, formatMontant, fullName } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";

const MOTIF_LABEL: Record<string, string> = {
  produit_non_recu: "Produit non reçu",
  produit_incorrect: "Mauvais produit",
  produit_endommage: "Produit endommagé",
  produit_non_conforme: "Non conforme à la description",
  article_manquant: "Article manquant",
  probleme_livraison: "Problème de livraison",
  probleme_paiement: "Problème de paiement",
  probleme_remboursement: "Problème de remboursement",
  autre: "Autre",
};

const DECISION_LABEL: Record<DecisionTypeLitige, string> = {
  acceptee: "Réclamation acceptée",
  rejetee: "Réclamation rejetée",
  remboursement_total: "Remboursement total",
  remboursement_partiel: "Remboursement partiel",
  remplacement_produit: "Remplacement du produit",
  retour_produit: "Retour du produit demandé",
  dedommagement_vendeur: "Dédommagement au vendeur",
  dedommagement_client: "Dédommagement au client",
  aucune_action: "Aucune action",
};

const SENDER_LABEL: Record<SenderTypeLitige, string> = {
  client: "Client", vendeur: "Vendeur", admin: "Administrateur", system: "Système",
};

const SENDER_STYLE: Record<SenderTypeLitige, string> = {
  client: "bg-white border border-slate-200 text-slate-800",
  vendeur: "bg-sky-50 border border-sky-200 text-sky-900",
  admin: "bg-[#1A2E5A] text-white border border-[#1A2E5A]",
  system: "bg-slate-100 border border-slate-200 text-slate-500 italic",
};

const REMB_TONE: Record<string, "gold" | "green" | "red" | "gray"> = {
  en_attente: "gold", en_traitement: "gold", termine: "green", echoue: "red", annule: "gray",
};
const REMB_LABEL: Record<string, string> = {
  en_attente: "En attente", en_traitement: "En traitement", termine: "Terminé", echoue: "Échoué", annule: "Annulé",
};

function AttachmentChip({ p }: { p: LitigeMessage["pieces_jointes"] extends (infer T)[] | undefined ? T : never }) {
  const url = resolveMediaUrl(p.file_path);
  const Icon = p.file_type === "image" ? ImageIcon : p.file_type === "video" ? Film : FileText;
  return (
    <a
      href={url ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-black/5 px-2.5 py-1.5 text-xs font-bold hover:bg-black/10 transition-colors"
    >
      <Icon size={13} /> {p.file_name} <ExternalLink size={11} />
    </a>
  );
}

export default function LitigeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canTraiter = usePermission("traiter_litiges");

  const [messageText, setMessageText] = useState("");
  const [noteInterne, setNoteInterne] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [infoTarget, setInfoTarget] = useState<"client" | "vendeur" | null>(null);
  const [infoMessage, setInfoMessage] = useState("");

  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<DecisionTypeLitige>("acceptee");
  const [decisionReason, setDecisionReason] = useState("");
  const [decisionAmount, setDecisionAmount] = useState("");

  const [escaladeOpen, setEscaladeOpen] = useState(false);
  const [escaladeNote, setEscaladeNote] = useState("");

  const litigeQuery = useQuery({
    queryKey: ["admin-litige-detail", params.id],
    queryFn: async () => (await api.get<ApiEnvelope<Litige>>(`/admin/litiges/${params.id}`)).data,
  });

  const historiqueQuery = useQuery({
    queryKey: ["admin-litige-historique", params.id],
    queryFn: async () => (await api.get<ApiEnvelope<LogActivite[]>>(`/admin/litiges/${params.id}/historique`)).data,
    enabled: !!litigeQuery.data,
  });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["admin-litige-detail", params.id] });
    queryClient.invalidateQueries({ queryKey: ["admin-litige-historique", params.id] });
    queryClient.invalidateQueries({ queryKey: ["admin-litiges"] });
  }

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiEnvelope<LitigeMessage>>(`/litiges/${params.id}/messages`, {
        message: messageText.trim(),
        ...(noteInterne ? { est_note_interne: true } : {}),
      });
      if (file) {
        const form = new FormData();
        form.append("fichier", file);
        form.append("message_id", res.data.id);
        await api.post(`/litiges/${params.id}/pieces-jointes`, form);
      }
      return res;
    },
    onSuccess: () => {
      setMessageText(""); setNoteInterne(false); setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      invalidateAll();
    },
    onError: (err) => notifyError(err, "Impossible d'envoyer ce message."),
  });

  const demanderInfoMutation = useMutation({
    mutationFn: () => api.post(`/admin/litiges/${params.id}/demander-informations`, { cible: infoTarget, message: infoMessage.trim() }),
    onSuccess: () => {
      notify(infoTarget === "client" ? "Informations demandées au client." : "Informations demandées au vendeur.");
      setInfoTarget(null); setInfoMessage("");
      invalidateAll();
    },
    onError: (err) => notifyError(err, "Impossible d'envoyer cette demande."),
  });

  const decisionMutation = useMutation({
    mutationFn: () => api.post(`/admin/litiges/${params.id}/decision`, {
      decision_type: decisionType,
      reason: decisionReason.trim(),
      ...(estRemboursement(decisionType) ? { amount: Number(decisionAmount) } : {}),
    }),
    onSuccess: () => {
      notify("Décision enregistrée.");
      setDecisionOpen(false); setDecisionReason(""); setDecisionAmount("");
      invalidateAll();
    },
    onError: (err) => notifyError(err, "Impossible d'enregistrer cette décision."),
  });

  const escaladerMutation = useMutation({
    mutationFn: () => api.post(`/admin/litiges/${params.id}/escalader`, { note: escaladeNote.trim() || undefined }),
    onSuccess: () => {
      notify("Litige escaladé.");
      setEscaladeOpen(false); setEscaladeNote("");
      invalidateAll();
    },
    onError: (err) => notifyError(err, "Impossible d'escalader ce litige."),
  });

  function estRemboursement(t: DecisionTypeLitige) {
    return t === "remboursement_total" || t === "remboursement_partiel";
  }

  const litige = litigeQuery.data;
  const montantCommande = litige?.commande ? Number(litige.commande.montant_total) : 0;
  const dejaRembourse = (litige?.remboursements ?? [])
    .filter((r) => r.statut !== "echoue" && r.statut !== "annule")
    .reduce((s, r) => s + Number(r.montant), 0);
  const closed = litige ? ["resolu", "rejete", "annule"].includes(litige.statut) : false;

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        onClick={() => router.push("/admin/litiges")}
        className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#1A2E5A] transition-colors"
      >
        <ArrowLeft size={14} /> Retour aux litiges
      </button>

      {litigeQuery.isLoading && <LoadingBlock />}
      {!litigeQuery.isLoading && litigeQuery.isError && (
        <ErrorBlock
          message={litigeQuery.error instanceof ApiError || litigeQuery.error instanceof Error ? litigeQuery.error.message : "Impossible de charger ce litige."}
          onRetry={() => litigeQuery.refetch()}
        />
      )}

      {!litigeQuery.isLoading && !litigeQuery.isError && litige && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="surface-card rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-black text-slate-900">Litige {litige.numero ?? `#${litige.id.slice(0, 8)}`}</h1>
                    <StatutLitigeBadge value={litige.statut} />
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Commande {litige.commande?.numero_commande ?? litige.commande_id} · Ouvert le {formatDate(litige.date_ouverture, true)}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-red-100 bg-red-50/60 p-4">
                <p className="font-black text-red-900 flex items-center gap-1.5 mb-1 text-sm">
                  <AlertTriangle size={15} className="text-[#C00000]" />
                  {MOTIF_LABEL[litige.motif] ?? litige.motif}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">{litige.description}</p>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={UserIcon} label="Client" value={litige.plaignant ? fullName(litige.plaignant.nom, litige.plaignant.prenom) : "—"} />
                <InfoRow icon={Store} label="Vendeur" value={litige.commande?.vendeur?.nom_commerce ?? "—"} />
              </div>
            </div>

            {/* Conversation */}
            <div className="surface-card rounded-2xl">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-800">Conversation</h2>
                <span className="text-xs font-bold text-slate-400">{litige.messages?.length ?? 0} message(s)</span>
              </div>

              <div className="max-h-[420px] overflow-y-auto scrollbar-dark px-6 py-4 space-y-3">
                {(litige.messages ?? []).length === 0 && (
                  <p className="py-8 text-center text-xs font-semibold text-slate-400">Aucun message pour l&apos;instant.</p>
                )}
                {(litige.messages ?? []).map((m) => (
                  <div key={m.id} className={m.sender_type === "system" ? "flex justify-center" : "flex flex-col items-start"}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${SENDER_STYLE[m.sender_type]}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-[11px] font-black uppercase tracking-wide opacity-70">
                          {m.user ? fullName(m.user.nom, m.user.prenom) : SENDER_LABEL[m.sender_type]}
                        </p>
                        {m.est_note_interne && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600">
                            <Lock size={10} /> Note interne
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
                      {(m.pieces_jointes ?? []).map((p) => <AttachmentChip key={p.id} p={p} />)}
                      <p className="mt-1 text-[10.5px] opacity-60">{formatDate(m.created_at, true)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!closed ? (
                <div className="border-t border-slate-100 p-4 space-y-2.5">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={2}
                    maxLength={2000}
                    placeholder="Écrire un message…"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none"
                  />
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.mp4,.mov" className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1A2E5A] transition-colors cursor-pointer"
                      >
                        <Paperclip size={14} /> {file ? file.name : "Joindre une preuve"}
                      </button>
                      {canTraiter && (
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 cursor-pointer">
                          <input type="checkbox" checked={noteInterne} onChange={(e) => setNoteInterne(e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-[#1A2E5A]" />
                          Note interne (non visible par le client/vendeur)
                        </label>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => sendMessageMutation.mutate()}
                      loading={sendMessageMutation.isPending}
                      disabled={!messageText.trim()}
                    >
                      <Send size={14} /> Envoyer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-100 px-6 py-4 text-center text-xs font-semibold text-slate-400">
                  Ce litige est clôturé — la conversation est en lecture seule.
                </div>
              )}
            </div>

            {/* Historique */}
            <div className="surface-card rounded-2xl">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
                <History size={15} className="text-[#1A2E5A]" />
                <h2 className="text-sm font-black text-slate-800">Historique</h2>
              </div>
              <div className="px-6 py-4">
                {historiqueQuery.isLoading && <p className="text-xs text-slate-400 font-semibold">Chargement…</p>}
                {!historiqueQuery.isLoading && (historiqueQuery.data ?? []).length === 0 && (
                  <p className="text-xs text-slate-400 font-semibold">Aucun évènement enregistré.</p>
                )}
                <div className="space-y-3">
                  {(historiqueQuery.data ?? []).map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1A2E5A]" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700">
                          {formatDate(log.date_action, true)} — {log.user ? fullName(log.user.nom, log.user.prenom) : "Système"} : {log.action.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions & décisions */}
          <div className="space-y-6">
            {canTraiter && (
              <div className="surface-card rounded-2xl p-6">
                <h2 className="mb-4 text-sm font-black text-slate-800">Action administrateur</h2>
                {closed ? (
                  <p className="text-xs font-semibold text-slate-400">Ce litige est clôturé, aucune action supplémentaire n&apos;est possible.</p>
                ) : (
                  <div className="space-y-2.5">
                    <Button variant="ghost" className="w-full" onClick={() => { setInfoTarget("client"); setInfoMessage(""); }}>
                      <MessageCircleQuestion size={15} /> Demander des infos au client
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => { setInfoTarget("vendeur"); setInfoMessage(""); }}>
                      <MessageCircleQuestion size={15} /> Demander des infos au vendeur
                    </Button>
                    <div className="h-px bg-slate-100 my-2" />
                    <Button variant="secondary" className="w-full" onClick={() => { setDecisionType("acceptee"); setDecisionReason(""); setDecisionAmount(""); setDecisionOpen(true); }}>
                      <Check size={15} /> Accepter la réclamation
                    </Button>
                    <Button variant="danger" className="w-full" onClick={() => { setDecisionType("rejetee"); setDecisionReason(""); setDecisionAmount(""); setDecisionOpen(true); }}>
                      <Ban size={15} /> Rejeter la réclamation
                    </Button>
                    <Button variant="gold" className="w-full" onClick={() => { setDecisionType("remboursement_total"); setDecisionReason(""); setDecisionAmount(String(montantCommande - dejaRembourse)); setDecisionOpen(true); }}>
                      <Wallet size={15} /> Remboursement
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => { setDecisionType("remplacement_produit"); setDecisionReason(""); setDecisionAmount(""); setDecisionOpen(true); }}>
                      <Repeat size={15} /> Remplacement produit
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => { setDecisionType("retour_produit"); setDecisionReason(""); setDecisionAmount(""); setDecisionOpen(true); }}>
                      <PackageX size={15} /> Retour produit
                    </Button>
                    <div className="h-px bg-slate-100 my-2" />
                    <Button variant="ghost" className="w-full text-amber-700!" onClick={() => setEscaladeOpen(true)}>
                      <TriangleAlert size={15} /> Escalader
                    </Button>
                  </div>
                )}
              </div>
            )}

            {(litige.decisions ?? []).length > 0 && (
              <div className="surface-card rounded-2xl p-6">
                <h2 className="mb-3 text-sm font-black text-slate-800 flex items-center gap-2">
                  <ShieldAlert size={15} className="text-[#1A2E5A]" /> Décisions
                </h2>
                <div className="space-y-3">
                  {litige.decisions!.map((d) => (
                    <div key={d.id} className="rounded-xl bg-slate-50 p-3.5">
                      <p className="text-xs font-black text-slate-800">{DECISION_LABEL[d.decision_type] ?? d.decision_type}</p>
                      <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{d.reason}</p>
                      {d.amount != null && <p className="mt-1 text-xs font-black text-[#1A2E5A]">{formatMontant(d.amount, d.currency ?? "FCFA")}</p>}
                      <p className="mt-1 text-[10.5px] text-slate-400">{formatDate(d.created_at, true)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(litige.remboursements ?? []).length > 0 && (
              <div className="surface-card rounded-2xl p-6">
                <h2 className="mb-3 text-sm font-black text-slate-800 flex items-center gap-2">
                  <Wallet size={15} className="text-[#1A2E5A]" /> Remboursements
                </h2>
                <div className="space-y-2.5">
                  {litige.remboursements!.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-black text-slate-800">{formatMontant(r.montant, r.devise)}</p>
                        <p className="text-[11px] text-slate-400">{formatDate(r.created_at, true)}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                        REMB_TONE[r.statut] === "green" ? "bg-emerald-50 text-emerald-700"
                        : REMB_TONE[r.statut] === "red" ? "bg-red-50 text-red-700"
                        : REMB_TONE[r.statut] === "gold" ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                      }`}>
                        {REMB_LABEL[r.statut]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Demander des informations */}
      {infoTarget && (
        <Modal
          title={`Demander des informations au ${infoTarget === "client" ? "client" : "vendeur"}`}
          onClose={() => setInfoTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setInfoTarget(null)} disabled={demanderInfoMutation.isPending}>Annuler</Button>
              <Button variant="secondary" onClick={() => demanderInfoMutation.mutate()} loading={demanderInfoMutation.isPending} disabled={!infoMessage.trim()}>
                Envoyer la demande
              </Button>
            </>
          }
        >
          <label className="mb-1.5 block text-xs font-black text-slate-700">Message</label>
          <textarea
            value={infoMessage}
            onChange={(e) => setInfoMessage(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Précisez les informations dont vous avez besoin…"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none"
          />
          <p className="mt-2 text-[12.5px] text-slate-400">
            Le litige passera au statut « En attente du {infoTarget === "client" ? "client" : "vendeur"} » jusqu&apos;à sa réponse.
          </p>
        </Modal>
      )}

      {/* Décision */}
      {decisionOpen && litige && (
        <Modal
          title="Décision administrative"
          onClose={() => setDecisionOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDecisionOpen(false)} disabled={decisionMutation.isPending}>Annuler</Button>
              <Button
                variant={decisionType === "rejetee" ? "danger" : "secondary"}
                onClick={() => decisionMutation.mutate()}
                loading={decisionMutation.isPending}
                disabled={!decisionReason.trim() || (estRemboursement(decisionType) && !(Number(decisionAmount) > 0))}
              >
                Confirmer — {DECISION_LABEL[decisionType]}
                {estRemboursement(decisionType) && decisionAmount ? ` (${formatMontant(decisionAmount)})` : ""}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Type de décision</label>
              <select
                value={decisionType}
                onChange={(e) => setDecisionType(e.target.value as DecisionTypeLitige)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none"
              >
                {(Object.keys(DECISION_LABEL) as DecisionTypeLitige[]).map((k) => (
                  <option key={k} value={k}>{DECISION_LABEL[k]}</option>
                ))}
              </select>
            </div>

            {estRemboursement(decisionType) && (
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">
                  Montant à rembourser (max {formatMontant(montantCommande - dejaRembourse)})
                </label>
                <input
                  type="number"
                  min={0}
                  max={montantCommande - dejaRembourse}
                  value={decisionAmount}
                  onChange={(e) => setDecisionAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Justification (obligatoire)</label>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Expliquez la décision prise, elle sera visible par le client et le vendeur…"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000] focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Escalade */}
      {escaladeOpen && (
        <Modal
          title="Escalader ce litige"
          onClose={() => setEscaladeOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEscaladeOpen(false)} disabled={escaladerMutation.isPending}>Annuler</Button>
              <Button variant="danger" onClick={() => escaladerMutation.mutate()} loading={escaladerMutation.isPending}>
                Escalader
              </Button>
            </>
          }
        >
          <p className="mb-4 text-sm text-slate-600">
            Ce litige sera signalé à tous les super-administrateurs pour un arbitrage prioritaire.
          </p>
          <label className="mb-1.5 block text-xs font-black text-slate-700">Note pour les super-administrateurs (optionnel)</label>
          <textarea
            value={escaladeNote}
            onChange={(e) => setEscaladeNote(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Ex : cas complexe nécessitant une décision au-delà de mes permissions…"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000] focus:outline-none"
          />
        </Modal>
      )}
    </div>
  );
}
