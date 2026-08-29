"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Paperclip, Send } from "lucide-react";
import {
  ApiError,
  fetchLitigeMessages,
  fullName,
  resolveMediaUrl,
  sendLitigeMessage,
  uploadLitigePreuve,
  type LitigeMessage,
} from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

export function LitigeConversation({ litigeId, estResolu, viewerType }: { litigeId: string; estResolu: boolean; viewerType: "client" | "vendeur" }) {
  const { t } = useLanguage();
  const SENDER_LABEL: Record<string, string> = { client: t('client.litigeConversation.clientLabel', 'Client'), vendeur: t('client.litigeConversation.vendorLabel', 'Vendeur'), admin: "Zando na Ndako" };
  const [messages, setMessages] = useState<LitigeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = (opts?: { silent?: boolean }) => {
    fetchLitigeMessages(litigeId)
      .then(setMessages)
      .catch(() => { if (!opts?.silent) setMessages([]); })
      .finally(() => { if (!opts?.silent) setLoading(false); });
  };

  useEffect(() => {
    load();
    if (estResolu) return;
    // Fil de messagerie sans websocket disponible côté backend — même convention de polling que
    // les autres conversations de l'app (support, chat de commande) : 15s, en silence (pas de
    // spinner de chargement) pour ne pas gêner un client déjà en train de lire.
    const interval = setInterval(() => load({ silent: true }), 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [litigeId, estResolu]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const created = await sendLitigeMessage(litigeId, text.trim());
      setMessages((prev) => [...prev, created]);
      setText("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('client.litigeConversation.sendError', "Impossible d'envoyer ce message."));
    } finally {
      setSending(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      await uploadLitigePreuve(litigeId, file);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('client.litigeConversation.uploadError', "Impossible d'envoyer cette preuve."));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 text-slate-400 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-3 max-h-[420px] overflow-y-auto p-1">
        {messages.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">{t('client.litigeConversation.noMessages', 'Aucun message pour le moment.')}</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_type === viewerType;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${mine ? "bg-[#0B2545] text-white" : "bg-slate-100 text-slate-800"}`}>
                <p className={`text-[10px] font-extrabold mb-0.5 ${mine ? "text-white/70" : "text-slate-400"}`}>
                  {m.sender_type === "admin" ? SENDER_LABEL.admin : fullName(m.user) || SENDER_LABEL[m.sender_type]}
                </p>
                <p className="text-sm">{m.message}</p>
                {(m.piecesJointes || []).map((p) => (
                  <a key={p.id} href={resolveMediaUrl(p.file_path) || "#"} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 mt-2 text-xs font-bold underline ${mine ? "text-white/90" : "text-[#0B2545]"}`}>
                    <FileText className="h-3.5 w-3.5" /> {p.file_name}
                  </a>
                ))}
                <p className={`text-[10px] mt-1 ${mine ? "text-white/50" : "text-slate-400"}`}>
                  {new Date(m.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-xs font-semibold text-red-600 mt-2">{error}</p>}

      {estResolu ? (
        <p className="text-xs font-semibold text-slate-400 text-center mt-4 py-2 border-t border-slate-100">
          {t('client.litigeConversation.closedNotice', 'Ce litige est clôturé — la conversation est en lecture seule.')}
        </p>
      ) : (
        <form onSubmit={handleSend} className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <label className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            <input type="file" accept="image/*,video/*,.pdf" className="hidden" disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
          </label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('client.litigeConversation.messagePlaceholder', 'Écrire un message…')}
            className="flex-1 h-10 px-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
          />
          <button type="submit" disabled={!text.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-white hover:bg-[#061830] disabled:opacity-40 transition-colors cursor-pointer">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      )}
    </div>
  );
}
