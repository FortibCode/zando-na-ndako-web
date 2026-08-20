"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Bike, Car, Phone, Mail, Star, Wallet, Route, CheckCircle2,
  Check, Ban, ExternalLink,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ApiEnvelope, LivreurDetailData } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Badge, StatutValidationBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { InfoRow, MiniStat } from "@/components/AdminTable";
import { formatDate, formatMontant, fullName } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { useState } from "react";
import Link from "next/link";

const RETRAIT_TONE: Record<string, "gold" | "green" | "red"> = {
  en_attente: "gold", valide: "green", rejete: "red",
};
const RETRAIT_LABEL: Record<string, string> = {
  en_attente: "En attente", valide: "Validé", rejete: "Rejeté",
  mtn_momo: "MTN Mobile Money", airtel_money: "Airtel Money", virement: "Virement",
};

function VehiculeIcon({ type, size = 13 }: { type: string; size?: number }) {
  const Icon = type === "voiture" ? Car : Bike;
  return <Icon size={size} className="inline" />;
}

export default function LivreurDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canValidate = usePermission("validate_livreurs");
  const canSuspend = usePermission("suspendre_livreurs");

  const [validateOpen, setValidateOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-livreur-detail", params.id],
    queryFn: async () => (await api.get<ApiEnvelope<LivreurDetailData>>(`/admin/livreurs/${params.id}`)).data,
  });

  const validateMutation = useMutation({
    mutationFn: () => api.post(`/admin/livreurs/${params.id}/valider`),
    onSuccess: () => {
      notify("Livreur validé.");
      setValidateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-livreur-detail", params.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-livreurs"] });
    },
    onError: (err) => notifyError(err, "Impossible de valider ce livreur."),
  });

  const suspendMutation = useMutation({
    mutationFn: () => api.post(`/admin/livreurs/${params.id}/suspendre`),
    onSuccess: () => {
      notify("Livreur suspendu.");
      setSuspendOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-livreur-detail", params.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-livreurs"] });
    },
    onError: (err) => notifyError(err, "Impossible de suspendre ce livreur."),
  });

  const l = data?.livreur;
  const stats = data?.stats;

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        onClick={() => router.push("/admin/livreurs")}
        className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#1A2E5A] transition-colors"
      >
        <ArrowLeft size={14} /> Retour aux livreurs
      </button>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger ce livreur."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && l && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Identity */}
            <div className="surface-card rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xl font-black text-white shadow-premium-md ring-4 ring-white">
                  <Bike size={26} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-black text-slate-900">{l.user ? fullName(l.user.nom, l.user.prenom) : "Livreur"}</h1>
                    <StatutValidationBadge value={l.statut_validation} />
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-400 capitalize">
                    <VehiculeIcon type={l.type_vehicule} /> {l.type_vehicule} · {l.immatriculation_vehicule}
                  </p>
                </div>
              </div>
            </div>

            {/* KPI stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MiniStat icon={CheckCircle2} label="Livraisons totales" value={stats.livraisons_total} tone="navy" />
              <MiniStat icon={CheckCircle2} label="Terminées" value={stats.livraisons_terminees} tone="green" />
              <MiniStat icon={Route} label="Distance parcourue" value={`${stats.distance_totale_km} km`} tone="sky" />
              <MiniStat icon={Wallet} label="Revenus générés" value={formatMontant(stats.revenus_total)} tone="gold" />
              <MiniStat icon={Star} label="Note moyenne" value={`${l.note_moyenne} / 5`} tone="gold" />
              <MiniStat icon={Bike} label="Disponibilité" value={l.statut_disponibilite === "disponible" ? "Disponible" : "Indisponible"} tone={l.statut_disponibilite === "disponible" ? "green" : "red"} />
            </div>

            {/* Responsable */}
            {l.user && (
              <div className="surface-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-black text-slate-800">Coordonnées</h2>
                  <Link href={`/admin/utilisateurs/${l.user.id}`} className="flex items-center gap-1 text-xs font-bold text-[#1A2E5A] hover:underline">
                    Voir le profil <ExternalLink size={11} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                  <InfoRow icon={Mail} label="Email" value={l.user.email ?? "—"} />
                  <InfoRow icon={Phone} label="Téléphone" value={l.user.telephone} />
                  {l.numero_mobile_money_reception && (
                    <InfoRow icon={Phone} label="Mobile Money" value={l.numero_mobile_money_reception} />
                  )}
                </div>
              </div>
            )}

            {/* Vehicule & solde */}
            <div className="surface-card rounded-2xl p-6">
              <h2 className="mb-1 text-sm font-black text-slate-800">Véhicule & solde</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                <InfoRow icon={Bike} label="Type de véhicule" value={l.type_vehicule} />
                <InfoRow icon={Bike} label="Immatriculation" value={l.immatriculation_vehicule} />
                <InfoRow icon={Wallet} label="Solde disponible" value={formatMontant(l.solde_disponible)} />
              </div>
            </div>

            {/* Retraits récents */}
            <div className="surface-card rounded-2xl">
              <div className="px-6 py-4 border-b border-slate-50">
                <h2 className="text-sm font-black text-slate-800">Retraits récents</h2>
              </div>
              {data.retraits_recents.length === 0 ? (
                <p className="py-10 text-center text-xs font-semibold text-slate-400">Aucune demande de retrait.</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {data.retraits_recents.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-4 px-6 py-3.5">
                      <div>
                        <p className="text-xs font-black text-slate-800">{formatMontant(r.montant)}</p>
                        <p className="text-[12.5px] text-slate-400">
                          {RETRAIT_LABEL[r.methode_retrait]}{r.numero_reception ? ` (${r.numero_reception})` : ""} · {formatDate(r.date_demande, true)}
                        </p>
                      </div>
                      <Badge tone={RETRAIT_TONE[r.statut]}>{RETRAIT_LABEL[r.statut]}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6">
              <h2 className="mb-4 text-sm font-black text-slate-800">Actions</h2>
              <div className="space-y-2.5">
                {canValidate && l.statut_validation !== "valide" && (
                  <Button variant="secondary" className="w-full" onClick={() => setValidateOpen(true)}>
                    <Check size={15} /> Valider ce livreur
                  </Button>
                )}
                {canSuspend && l.statut_validation !== "suspendu" && (
                  <Button variant="danger" className="w-full" onClick={() => setSuspendOpen(true)}>
                    <Ban size={15} /> Suspendre ce livreur
                  </Button>
                )}
                {l.user && (
                  <Button variant="ghost" className="w-full" onClick={() => router.push(`/admin/utilisateurs/${l.user!.id}`)}>
                    Voir le compte utilisateur
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {validateOpen && l && (
        <ConfirmDialog
          title="Valider ce livreur"
          message="Confirmez-vous la validation de ce livreur ? Il pourra recevoir des missions de livraison."
          confirmLabel="Valider"
          loading={validateMutation.isPending}
          onConfirm={() => validateMutation.mutate()}
          onClose={() => setValidateOpen(false)}
        />
      )}
      {suspendOpen && l && (
        <ConfirmDialog
          title="Suspendre ce livreur"
          message="Confirmez-vous la suspension de ce livreur ? Il ne recevra plus de nouvelles missions."
          confirmLabel="Suspendre"
          danger
          loading={suspendMutation.isPending}
          onConfirm={() => suspendMutation.mutate()}
          onClose={() => setSuspendOpen(false)}
        />
      )}
    </div>
  );
}
