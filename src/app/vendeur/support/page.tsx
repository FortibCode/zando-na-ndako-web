"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Headset, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { LoadingBlock, EmptyState } from "@/components/Spinner";
import { ApiError, envoyerVendeurMessage, fetchVendeurMessages, type VendeurMessage } from "@/lib/api";

export default function VendeurSupportPage() {
  const [messages, setMessages] = useState<VendeurMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [objet, setObjet] = useState("");
  const [contenu, setContenu] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetchVendeurMessages().then(setMessages).catch(() => setMessages([])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSend = async () => {
    if (!objet.trim() || !contenu.trim()) return;
    setSending(true);
    setError(null);
    try {
      const created = await envoyerVendeurMessage(objet.trim(), contenu.trim());
      setMessages((prev) => [created, ...prev]);
      setObjet("");
      setContenu("");
      setShowNew(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer ce message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Support Zando na Ndako"
        description="Échangez directement avec l'équipe d'administration."
        actions={<Button variant="primary" onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> Nouveau message</Button>}
      />

      {loading ? (
        <LoadingBlock label="Chargement des conversations…" />
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <Headset className="h-12 w-12 text-slate-300 mb-3" />
          <EmptyState message="Aucune conversation avec l'administration pour le moment." />
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Link key={m.id} href={`/vendeur/support/${m.id}`}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B2545]/30 hover:shadow-sm transition-all">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{m.objet}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{m.contenu}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{new Date(m.created_at).toLocaleString('fr-FR')}</p>
              </div>
              {!m.statut_lecture && <Badge tone="navy" dot={false}>Non lu</Badge>}
            </Link>
          ))}
        </div>
      )}

      {showNew && (
        <Modal
          title="Nouveau message"
          onClose={() => setShowNew(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowNew(false)}>Annuler</Button>
              <Button variant="primary" onClick={handleSend} loading={sending} disabled={!objet.trim() || !contenu.trim()}>Envoyer</Button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Objet</label>
              <input value={objet} onChange={(e) => setObjet(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0B2545]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
              <textarea value={contenu} onChange={(e) => setContenu(e.target.value)} rows={4}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:border-[#0B2545]" />
            </div>
            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
