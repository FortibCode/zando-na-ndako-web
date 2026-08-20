"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LifeBuoy, Send, Lock, ExternalLink, Mail, Phone } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type {
  ApiEnvelope, TicketSupport, StatutTicket, PrioriteTicket, AdministrateurLite,
} from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Badge } from "@/components/Badge";
import { InfoRow } from "@/components/AdminTable";
import { formatDate, fullName } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import Link from "next/link";

const STATUT_TONE: Record<StatutTicket, "gold" | "green" | "red" | "gray" | "navy"> = {
  ouvert: "red", en_cours: "gold", en_attente: "navy", resolu: "green", ferme: "gray",
};
const STATUT_LABEL: Record<StatutTicket, string> = {
  ouvert: "Ouvert", en_cours: "En cours", en_attente: "En attente", resolu: "Résolu", ferme: "Fermé",
};
const PRIORITE_TONE: Record<PrioriteTicket, "gray" | "navy" | "gold" | "red"> = {
  basse: "gray", normale: "navy", haute: "gold", urgente: "red",
};
const PRIORITE_LABEL: Record<PrioriteTicket, string> = {
  basse: "Basse", normale: "Normale", haute: "Haute", urgente: "Urgente",
};
const CATEGORIE_LABEL: Record<string, string> = {
  commande: "Commande", paiement: "Paiement", livraison: "Livraison", vendeur: "Vendeur",
  livreur: "Livreur", produit: "Produit", remboursement: "Remboursement", compte: "Compte", autre: "Autre",
};

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canManage = usePermission("manage_tickets");

  const [message, setMessage] = useState("");
  const [noteInterne, setNoteInterne] = useState(false);

  const { data: ticket, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-ticket-detail", params.id],
    queryFn: async () => (await api.get<ApiEnvelope<TicketSupport>>(`/admin/tickets/${params.id}`)).data,
  });

  const { data: admins } = useQuery({
    queryKey: ["admin-administrateurs"],
    queryFn: async () => (await api.get<ApiEnvelope<AdministrateurLite[]>>("/admin/administrateurs")).data,
    enabled: canManage,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-ticket-detail", params.id] });
    queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
  }

  const replyMutation = useMutation({
    mutationFn: () => api.post(`/admin/tickets/${params.id}/repondre`, { message, est_note_interne: noteInterne }),
    onSuccess: () => {
      notify(noteInterne ? "Note interne ajoutée." : "Réponse envoyée.");
      setMessage(""); setNoteInterne(false);
      invalidate();
    },
    onError: (err) => notifyError(err, "Impossible d'envoyer cette réponse."),
  });

  const statutMutation = useMutation({
    mutationFn: (statut: StatutTicket) => api.put(`/admin/tickets/${params.id}/statut`, { statut }),
    onSuccess: () => { notify("Statut mis à jour."); invalidate(); },
    onError: (err) => notifyError(err, "Impossible de modifier le statut."),
  });

  const prioriteMutation = useMutation({
    mutationFn: (priorite: PrioriteTicket) => api.put(`/admin/tickets/${params.id}/priorite`, { priorite }),
    onSuccess: () => { notify("Priorité mise à jour."); invalidate(); },
    onError: (err) => notifyError(err, "Impossible de modifier la priorité."),
  });

  const assignMutation = useMutation({
    mutationFn: (adminId: string) => api.post(`/admin/tickets/${params.id}/assigner`, { admin_id: adminId }),
    onSuccess: () => { notify("Ticket assigné."); invalidate(); },
    onError: (err) => notifyError(err, "Impossible d'assigner ce ticket."),
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        onClick={() => router.push("/admin/tickets")}
        className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#1A2E5A] transition-colors"
      >
        <ArrowLeft size={14} /> Retour aux tickets
      </button>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger ce ticket."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && ticket && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-card rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#C00000]">
                    <LifeBuoy size={22} />
                  </span>
                  <div>
                    <h1 className="text-lg font-black text-slate-900">{ticket.sujet}</h1>
                    <p className="text-xs font-bold text-slate-400">{ticket.numero} · {CATEGORIE_LABEL[ticket.categorie]} · {formatDate(ticket.created_at, true)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge tone={STATUT_TONE[ticket.statut]}>{STATUT_LABEL[ticket.statut]}</Badge>
                  <Badge tone={PRIORITE_TONE[ticket.priorite]}>{PRIORITE_LABEL[ticket.priorite]}</Badge>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              {ticket.commande && (
                <Link href={`/admin/commandes/${ticket.commande.id}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1A2E5A] hover:underline">
                  Commande {ticket.commande.numero_commande} <ExternalLink size={11} />
                </Link>
              )}
            </div>

            <div className="surface-card rounded-2xl">
              <div className="px-6 py-4 border-b border-slate-50">
                <h2 className="text-sm font-black text-slate-800">Conversation</h2>
              </div>
              {(!ticket.reponses || ticket.reponses.length === 0) ? (
                <p className="py-10 text-center text-xs font-semibold text-slate-400">Aucune réponse pour le moment.</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {ticket.reponses.map((r) => (
                    <div key={r.id} className={`px-6 py-4 ${r.est_note_interne ? "bg-amber-50/50" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-black text-slate-800">
                          {r.auteur ? fullName(r.auteur.nom, r.auteur.prenom) : "—"}
                        </p>
                        {r.est_note_interne && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11.5px] font-black text-amber-700">
                            <Lock size={9} /> Note interne
                          </span>
                        )}
                        <span className="text-[12.5px] text-slate-400 ml-auto">{formatDate(r.created_at, true)}</span>
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {canManage && (
                <div className="p-6 border-t border-slate-100 space-y-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Écrire une réponse…"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={noteInterne} onChange={(e) => setNoteInterne(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1"><Lock size={11} /> Note interne (non visible par l&apos;utilisateur)</span>
                    </label>
                    <button
                      onClick={() => replyMutation.mutate()}
                      disabled={!message.trim() || replyMutation.isPending}
                      className="focus-premium flex items-center gap-1.5 rounded-xl bg-[#1A2E5A] px-4 py-2 text-xs font-black text-white hover:bg-[#0B1A35] disabled:opacity-50 transition-colors"
                    >
                      <Send size={13} /> Envoyer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6">
              <h2 className="mb-4 text-sm font-black text-slate-800">Gestion</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Statut</label>
                  <select
                    value={ticket.statut}
                    disabled={!canManage}
                    onChange={(e) => statutMutation.mutate(e.target.value as StatutTicket)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    {(Object.keys(STATUT_LABEL) as StatutTicket[]).map((s) => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Priorité</label>
                  <select
                    value={ticket.priorite}
                    disabled={!canManage}
                    onChange={(e) => prioriteMutation.mutate(e.target.value as PrioriteTicket)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    {(Object.keys(PRIORITE_LABEL) as PrioriteTicket[]).map((p) => <option key={p} value={p}>{PRIORITE_LABEL[p]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Assigné à</label>
                  <select
                    value={ticket.admin_assigne_id ?? ""}
                    disabled={!canManage}
                    onChange={(e) => e.target.value && assignMutation.mutate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="" disabled>Non assigné</option>
                    {(admins ?? []).map((a) => (
                      <option key={a.id} value={a.id}>{a.user ? fullName(a.user.nom, a.user.prenom) : a.id}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {ticket.user && (
              <div className="surface-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-black text-slate-800">Demandeur</h2>
                  <Link href={`/admin/utilisateurs/${ticket.user.id}`} className="flex items-center gap-1 text-xs font-bold text-[#1A2E5A] hover:underline">
                    Profil <ExternalLink size={11} />
                  </Link>
                </div>
                <p className="text-sm font-bold text-slate-700 mt-2">{fullName(ticket.user.nom, ticket.user.prenom)}</p>
                <div className="mt-2">
                  <InfoRow icon={Phone} label="Téléphone" value={ticket.user.telephone} />
                  {ticket.user.email && <InfoRow icon={Mail} label="Email" value={ticket.user.email} />}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
