"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, RefreshCw, Code2, Pencil, Percent, Truck, Bell, ShieldCheck, Sliders } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ApiEnvelope, ParametrePlateforme } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { formatDate } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminPageHeader } from "@/components/AdminTable";

const CATEGORIES: { label: string; icon: typeof Settings; match: (cle: string) => boolean }[] = [
  { label: "Finances & Commissions", icon: Percent, match: (c) => c.startsWith("taux_commission") || c.startsWith("retrait_") || c.startsWith("remuneration_") },
  { label: "Livraison & Attribution", icon: Truck, match: (c) => c.startsWith("frais_livraison") || c.startsWith("attribution_") },
  { label: "Notifications", icon: Bell, match: (c) => c.startsWith("notifications_") },
  { label: "Sécurité", icon: ShieldCheck, match: (c) => c.startsWith("otp_") },
  { label: "Général", icon: Sliders, match: () => true },
];

function categoryFor(cle: string) {
  return CATEGORIES.find((c) => c.match(cle)) ?? CATEGORIES[CATEGORIES.length - 1];
}

export default function ParametresPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canEdit = usePermission("edit_parametres");
  const [editing, setEditing] = useState<ParametrePlateforme | null>(null);
  const [valeur, setValeur] = useState("");
  const [clearing, setClearing] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-parametres"],
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<Record<string, ParametrePlateforme>>>("/admin/parametres");
      return Object.values(res.data);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      await api.put(`/admin/parametres/${editing.id}`, { valeur });
    },
    onSuccess: () => {
      notify("Paramètre mis à jour avec succès.");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin-parametres"] });
    },
    onError: (err) => notifyError(err, "Impossible de mettre à jour ce paramètre."),
  });

  function openEdit(p: ParametrePlateforme) { setEditing(p); setValeur(p.valeur); }

  async function clearCache() {
    setClearing(true);
    try {
      await api.post("/admin/cache/clear");
      notify("Cache de la plateforme vidé avec succès.");
    } catch (err) {
      notifyError(err, "Impossible de vider le cache.");
    } finally {
      setClearing(false);
    }
  }

  const items = data ?? [];
  const groups = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((p) => categoryFor(p.cle).label === cat.label),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Paramètres de la plateforme"
        description="Configuration globale de Zando na Ndako — commissions, limites, délais."
        icon={Settings}
        action={
          canEdit && (
            <button
              onClick={clearCache}
              disabled={clearing}
              className="focus-premium flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 shadow-premium-sm hover:border-[#1A2E5A] hover:bg-[#1A2E5A] hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={clearing ? "animate-spin" : ""} />
              {clearing ? "Vidage…" : "Vider le cache"}
            </button>
          )
        }
      />

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les paramètres."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-slate-400">
          <Settings size={32} className="mb-3 opacity-40" />
          <p className="text-sm font-bold">Aucun paramètre configuré.</p>
        </div>
      )}

      {!isLoading && !isError && groups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <div key={group.label} className="space-y-3">
            <div className="flex items-center gap-2">
              <GroupIcon size={15} className="text-[#1A2E5A]" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">{group.label}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((p) => (
                <div
                  key={p.id}
                  className="group relative overflow-hidden surface-card surface-card-interactive rounded-2xl p-5"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#1A2E5A] to-[#C00000]" />

                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1A2E5A]/8">
                        <Code2 size={16} className="text-[#1A2E5A]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-black uppercase tracking-widest text-slate-400 truncate">{p.cle}</p>
                      </div>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => openEdit(p)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-400 opacity-0 group-hover:opacity-100 hover:border-[#1A2E5A] hover:text-[#1A2E5A] transition-all"
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>

                  <p className="mb-2 rounded-xl bg-slate-50 px-3 py-2 font-mono text-sm font-black text-slate-800 truncate">
                    {p.valeur}
                  </p>

                  {p.description && (
                    <p className="text-[12.5px] text-slate-400 leading-relaxed">{p.description}</p>
                  )}

                  <p className="mt-3 text-[11.5px] text-slate-300 font-medium">
                    Mis à jour : {formatDate(p.date_maj, true)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {editing && (
        <Modal
          title={`Modifier le paramètre`}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)} disabled={saveMutation.isPending}>
                Annuler
              </Button>
              <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending} disabled={!valeur.trim()}>
                Enregistrer
              </Button>
            </>
          }
        >
          <div className="mb-4 rounded-xl bg-[#1A2E5A]/5 px-4 py-3 border border-[#1A2E5A]/10">
            <p className="text-[11.5px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Clé du paramètre</p>
            <p className="font-mono font-black text-sm text-[#1A2E5A]">{editing.cle}</p>
          </div>

          {editing.description && (
            <p className="mb-4 text-xs text-slate-500 leading-relaxed">{editing.description}</p>
          )}

          <label className="mb-1.5 block text-xs font-black text-slate-700">Nouvelle valeur</label>
          <textarea
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium focus:border-[#1A2E5A] focus:ring-1 focus:ring-[#1A2E5A] focus:outline-none"
          />
        </Modal>
      )}
    </div>
  );
}
