"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Send, Ban, Users, Store, Bike, Globe2, Plus, Smartphone, MessageSquare } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, PaginatedData, CampagneNotification, CibleNotification } from "@/lib/types";
import { LoadingBlock, ErrorBlock, EmptyState } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatDate, fromDatetimeLocal } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminPageHeader, FilterBar, FilterSelect, IconAction, HeaderStat } from "@/components/AdminTable";

const CIBLE_LABEL: Record<CibleNotification, string> = {
  tous: "Tous les utilisateurs", clients: "Clients", vendeurs: "Vendeurs", livreurs: "Livreurs", diaspora: "Diaspora",
};
const CIBLE_ICON: Record<CibleNotification, typeof Users> = {
  tous: Users, clients: Users, vendeurs: Store, livreurs: Bike, diaspora: Globe2,
};
const STATUT_TONE: Record<string, "gold" | "green" | "red"> = { programmee: "gold", envoyee: "green", echouee: "red" };
const STATUT_LABEL: Record<string, string> = { programmee: "Programmée", envoyee: "Envoyée", echouee: "Échouée" };

const STATUTS = [
  { value: "", label: "Tous les statuts" },
  { value: "programmee", label: "Programmée" },
  { value: "envoyee", label: "Envoyée" },
  { value: "echouee", label: "Échouée" },
];

type Form = {
  titre: string; message: string; cible_type: CibleNotification;
  envoyer_push: boolean; envoyer_sms: boolean; lien_action: string; date_envoi: string;
};

const EMPTY_FORM: Form = {
  titre: "", message: "", cible_type: "tous", envoyer_push: true, envoyer_sms: false, lien_action: "", date_envoi: "",
};

export default function NotificationsPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canSend = usePermission("send_notifications");

  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [cancelTarget, setCancelTarget] = useState<CampagneNotification | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-notifications", page, statut],
    queryFn: async () => {
      const qs = buildQuery({ page, statut });
      return (await api.get<ApiEnvelope<PaginatedData<CampagneNotification>>>(`/admin/notifications${qs}`)).data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => api.post("/admin/notifications", {
      titre: form.titre,
      message: form.message,
      cible_type: form.cible_type,
      envoyer_push: form.envoyer_push,
      envoyer_sms: form.envoyer_sms,
      lien_action: form.lien_action || null,
      date_envoi: fromDatetimeLocal(form.date_envoi),
    }),
    onSuccess: () => {
      notify(form.date_envoi ? "Notification programmée." : "Notification envoyée.");
      setFormOpen(false);
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (err) => notifyError(err, "Impossible d'envoyer cette notification."),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/notifications/${id}`),
    onSuccess: () => {
      notify("Campagne annulée.");
      setCancelTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (err) => notifyError(err, "Impossible d'annuler cette campagne."),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Notifications"
        description="Diffusion de messages push et SMS vers les utilisateurs de la plateforme."
        icon={Bell}
        action={
          <div className="flex items-center gap-3">
            <HeaderStat icon={Bell} label={`${data?.total ?? "—"} campagnes`} tone="navy" />
            {canSend && (
              <Button variant="secondary" onClick={() => { setForm(EMPTY_FORM); setFormOpen(true); }}>
                <Plus size={14} /> Nouvelle notification
              </Button>
            )}
          </div>
        }
      />

      <FilterBar>
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les notifications."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && items.length === 0 && <EmptyState message="Aucune notification envoyée pour le moment." />}

      {!isLoading && !isError && items.length > 0 && (
        <div className="space-y-3">
          {items.map((c) => {
            const Icon = CIBLE_ICON[c.cible_type];
            return (
              <div key={c.id} className="surface-card rounded-2xl p-5 flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1A2E5A]/8 text-[#1A2E5A]">
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-900">{c.titre}</h3>
                    <Badge tone={STATUT_TONE[c.statut]}>{STATUT_LABEL[c.statut]}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.message}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[12.5px] font-bold text-slate-400">
                    <span>{CIBLE_LABEL[c.cible_type]}</span>
                    {c.envoyer_push && <span className="flex items-center gap-1"><Smartphone size={11} /> Push</span>}
                    {c.envoyer_sms && <span className="flex items-center gap-1"><MessageSquare size={11} /> SMS</span>}
                    {c.statut === "envoyee" && <span>{c.nombre_envois_reussis} / {c.nombre_destinataires} réussis</span>}
                    <span>{c.statut === "programmee" && c.date_envoi ? `Programmée pour le ${formatDate(c.date_envoi, true)}` : formatDate(c.created_at, true)}</span>
                  </div>
                </div>
                {canSend && c.statut === "programmee" && (
                  <IconAction icon={Ban} label="Annuler" onClick={() => setCancelTarget(c)} variant="danger" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {formOpen && (
        <Modal
          title="Nouvelle notification"
          onClose={() => setFormOpen(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={sendMutation.isPending}>Annuler</Button>
            <Button variant="secondary" onClick={() => sendMutation.mutate()} loading={sendMutation.isPending}
              disabled={!form.titre.trim() || !form.message.trim() || (!form.envoyer_push && !form.envoyer_sms)}>
              <Send size={14} /> {form.date_envoi ? "Programmer" : "Envoyer"}
            </Button>
          </>}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Titre</label>
              <input value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Message</label>
              <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={3} maxLength={1000}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Cible</label>
              <select value={form.cible_type} onChange={(e) => setForm((f) => ({ ...f, cible_type: e.target.value as CibleNotification }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none">
                {(Object.keys(CIBLE_LABEL) as CibleNotification[]).map((k) => <option key={k} value={k}>{CIBLE_LABEL[k]}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.envoyer_push} onChange={(e) => setForm((f) => ({ ...f, envoyer_push: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-[#1A2E5A] focus:ring-[#1A2E5A]" />
                <span className="text-xs font-bold text-slate-700">Push</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.envoyer_sms} onChange={(e) => setForm((f) => ({ ...f, envoyer_sms: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-[#1A2E5A] focus:ring-[#1A2E5A]" />
                <span className="text-xs font-bold text-slate-700">SMS</span>
              </label>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Lien (optionnel)</label>
              <input value={form.lien_action} onChange={(e) => setForm((f) => ({ ...f, lien_action: e.target.value }))} placeholder="ex: /commandes/123"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Programmer l&apos;envoi (optionnel)</label>
              <input type="datetime-local" value={form.date_envoi} onChange={(e) => setForm((f) => ({ ...f, date_envoi: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              <p className="mt-1.5 text-[12.5px] text-slate-400">Laisser vide pour un envoi immédiat.</p>
            </div>
          </div>
        </Modal>
      )}

      {cancelTarget && (
        <ConfirmDialog
          title="Annuler cette campagne"
          message={`Confirmez-vous l'annulation de « ${cancelTarget.titre} » ? Elle ne sera pas envoyée.`}
          confirmLabel="Annuler la campagne" danger
          loading={cancelMutation.isPending}
          onConfirm={() => cancelMutation.mutate(cancelTarget.id)}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
