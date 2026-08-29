"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { LoadingBlock } from "@/components/Spinner";
import {
  ApiError,
  fetchVendeurMessageDetail,
  marquerVendeurMessageLu,
  repondreVendeurMessage,
  type VendeurMessage,
} from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/lib/toast-context";

export default function VendeurSupportThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLanguage();
  const { notifyError } = useToast();
  const { id } = use(params);
  const [thread, setThread] = useState<VendeurMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetchVendeurMessageDetail(id)
      .then((data) => {
        setThread(data);
        if (!data.statut_lecture) marquerVendeurMessageLu(id).catch(() => undefined);
      })
      .catch(() => setThread(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <LoadingBlock label={t("vendor.supportThread.loading", "Chargement de la conversation…")} />;
  if (!thread) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-bold text-slate-700">{t("vendor.supportThread.notFound", "Conversation introuvable.")}</p>
        <Link href="/vendeur/support" className="inline-flex items-center gap-2 mt-4 text-xs font-extrabold text-[#0B2545] hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("vendor.supportThread.backToSupportNotFound", "Retour au support")}
        </Link>
      </div>
    );
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    setError(null);
    try {
      const created = await repondreVendeurMessage(id, reply.trim());
      setThread((prev) => (prev ? { ...prev, reponses: [...(prev.reponses || []), created] } : prev));
      setReply("");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("vendor.supportThread.replyError", "Impossible d'envoyer la réponse.");
      setError(message);
      notifyError(err, message);
    } finally {
      setSending(false);
    }
  };

  const allMessages = [thread, ...(thread.reponses || [])];

  return (
    <div className="max-w-2xl">
      <Link href="/vendeur/support" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0B2545] transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("vendor.supportThread.backToSupportLink", "Support")}
      </Link>

      <PageHeader title={thread.objet} />

      <div className="space-y-3 max-h-[440px] overflow-y-auto p-1 mb-4">
        {allMessages.map((m) => {
          const mine = m.expediteur === "vendeur";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${mine ? "bg-[#0B2545] text-white" : "bg-slate-100 text-slate-800"}`}>
                <p className={`text-[10px] font-extrabold mb-0.5 ${mine ? "text-white/70" : "text-slate-400"}`}>
                  {mine ? t("vendor.supportThread.youLabel", "Vous") : t("vendor.supportThread.teamLabel", "Zando na Ndako")}
                </p>
                <p className="text-sm">{m.contenu}</p>
                <p className={`text-[10px] mt-1 ${mine ? "text-white/50" : "text-slate-400"}`}>
                  {new Date(m.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs font-semibold text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleReply} className="flex items-center gap-2">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={t("vendor.supportThread.replyPlaceholder", "Répondre…")}
          className="flex-1 h-11 px-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0B2545]"
        />
        <button type="submit" disabled={!reply.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-white hover:bg-[#061830] disabled:opacity-40 transition-colors cursor-pointer">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
