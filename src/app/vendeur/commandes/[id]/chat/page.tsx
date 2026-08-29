"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { LoadingBlock } from "@/components/Spinner";
import {
  ApiError,
  envoyerMessageCommande,
  fetchMessagesCommande,
  fetchVendeurCommandeDetail,
  fullName,
  type CommandeMessage,
  type VendeurCommande,
} from "@/lib/api";
import { usePublicAuth } from "@/lib/public-auth-context";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/lib/toast-context";

// Fil de messagerie unique par commande, partagé entre client, vendeur et livreur — voir
// MessageCommandeController côté backend. Poll toutes les 15s, comme
// mobile/src/app/vendor/chat/[id].tsx (pas de websocket disponible côté backend).
const POLL_INTERVAL_MS = 15000;

export default function VendeurCommandeChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLanguage();
  const { notifyError } = useToast();
  const { user } = usePublicAuth();

  const SENDER_LABEL: Record<string, string> = {
    client: t("vendor.chat.clientLabel", "Client"),
    livreur: t("vendor.chat.driverLabel", "Livreur"),
    vendeur: t("vendor.chat.youLabel", "Vous"),
  };

  const [order, setOrder] = useState<VendeurCommande | null>(null);
  const [messages, setMessages] = useState<CommandeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVendeurCommandeDetail(id).then(setOrder).catch(() => setOrder(null));
  }, [id]);

  const loadMessages = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const data = await fetchMessagesCommande(id);
      setMessages(data);
    } catch {
      // Conserve les messages déjà chargés en cas d'échec réseau ponctuel.
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => loadMessages({ silent: true }), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const contenu = text.trim();
    setText("");
    setSending(true);
    setError(null);
    try {
      const sent = await envoyerMessageCommande(id, contenu);
      setMessages((prev) => [...prev, sent]);
    } catch (err) {
      setText(contenu);
      const message = err instanceof ApiError ? err.message : t("vendor.chat.sendError", "Impossible d'envoyer ce message.");
      setError(message);
      notifyError(err, message);
    } finally {
      setSending(false);
    }
  };

  if (loading && messages.length === 0) return <LoadingBlock label={t("vendor.chat.loading", "Chargement de la conversation…")} />;

  return (
    <div className="max-w-2xl">
      <Link href={`/vendeur/commandes/${id}`} className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0B2545] transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("vendor.chat.backToOrderLink", "Retour à la commande")}
      </Link>

      <div className="mb-4">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">{t("vendor.chat.title", "Conversation")}</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {order ? `${order.numero_commande} · ${fullName(order.client?.user) || t("vendor.common.clientFallback", "Client")}` : id}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col">
        <div className="space-y-3 max-h-[480px] min-h-[200px] overflow-y-auto p-1">
          {messages.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-10">{t("vendor.chat.noMessages", "Aucun message pour le moment.")}</p>
          )}
          {messages.map((m) => {
            const mine = !!user && m.expediteur_user_id === user.id;
            const senderType = m.expediteur?.type_utilisateur || "";
            const senderLabel = !mine ? (SENDER_LABEL[senderType] || m.expediteur?.prenom || "") : "";
            const heure = m.created_at
              ? new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
              : "";
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${mine ? "bg-[#0B2545] text-white" : "bg-slate-100 text-slate-800"}`}>
                  {senderLabel && (
                    <p className={`text-[10px] font-extrabold mb-0.5 ${mine ? "text-white/70" : "text-slate-400"}`}>{senderLabel}</p>
                  )}
                  <p className="text-sm">{m.contenu}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "text-white/50" : "text-slate-400"}`}>{heure}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {error && <p className="text-xs font-semibold text-red-600 mt-2">{error}</p>}

        <form onSubmit={handleSend} className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("vendor.chat.messagePlaceholder", "Écrire un message…")}
            className="flex-1 h-10 px-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
          />
          <button type="submit" disabled={!text.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-white hover:bg-[#061830] disabled:opacity-40 transition-colors cursor-pointer">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
