"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Store, Phone, Mail, MapPin, Star, Wallet, Timer, IdCard,
  Package, PackageX, ClipboardList, TrendingUp, Landmark, Check, Ban, ExternalLink,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ApiEnvelope, VendeurDetailData } from "@/lib/types";
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

export default function VendeurDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canValidate = usePermission("validate_vendeurs");
  const canSuspend = usePermission("suspendre_vendeurs");

  const [validateOpen, setValidateOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-vendeur-detail", params.id],
    queryFn: async () => (await api.get<ApiEnvelope<VendeurDetailData>>(`/admin/vendeurs/${params.id}`)).data,
  });

  const validateMutation = useMutation({
    mutationFn: () => api.post(`/admin/vendeurs/${params.id}/valider`),
    onSuccess: () => {
      notify("Vendeur validé.");
      setValidateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-vendeur-detail", params.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-vendeurs"] });
    },
    onError: (err) => notifyError(err, "Impossible de valider ce vendeur."),
  });

  const suspendMutation = useMutation({
    mutationFn: () => api.post(`/admin/vendeurs/${params.id}/suspendre`),
    onSuccess: () => {
      notify("Vendeur suspendu.");
      setSuspendOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-vendeur-detail", params.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-vendeurs"] });
    },
    onError: (err) => notifyError(err, "Impossible de suspendre ce vendeur."),
  });

  const v = data?.vendeur;
  const stats = data?.stats;

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        onClick={() => router.push("/admin/vendeurs")}
        className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#1A2E5A] transition-colors"
      >
        <ArrowLeft size={14} /> Retour aux vendeurs
      </button>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger ce vendeur."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && v && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Identity */}
            <div className="surface-card rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xl font-black text-white shadow-premium-md ring-4 ring-white">
                  <Store size={26} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-black text-slate-900">{v.nom_commerce}</h1>
                    <StatutValidationBadge value={v.statut_validation} />
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-400 capitalize">
                    {v.categorie_principale}
                    {v.zone && ` · ${v.zone.nom_zone}`}
                  </p>
                </div>
              </div>
            </div>

            {/* KPI stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MiniStat icon={Package} label="Produits" value={stats.produits_total} tone="navy" />
              <MiniStat icon={PackageX} label="En rupture" value={stats.produits_rupture} tone="red" />
              <MiniStat icon={ClipboardList} label="Commandes livrées" value={stats.commandes_livrees} tone="sky" />
              <MiniStat icon={TrendingUp} label="Chiffre d'affaires" value={formatMontant(stats.chiffre_affaires)} tone="green" />
              <MiniStat icon={Landmark} label="Commissions dues" value={formatMontant(stats.commissions_en_attente)} tone="gold" />
              <MiniStat icon={Star} label="Note moyenne" value={`${v.note_moyenne} / 5`} tone="gold" />
            </div>

            {/* Responsable */}
            {v.user && (
              <div className="surface-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-black text-slate-800">Responsable du commerce</h2>
                  <Link href={`/admin/utilisateurs/${v.user.id}`} className="flex items-center gap-1 text-xs font-bold text-[#1A2E5A] hover:underline">
                    Voir le profil <ExternalLink size={11} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                  <InfoRow icon={Store} label="Nom" value={fullName(v.user.nom, v.user.prenom)} />
                  <InfoRow icon={Mail} label="Email" value={v.user.email ?? "—"} />
                  <InfoRow icon={Phone} label="Téléphone" value={v.user.telephone} />
                </div>
              </div>
            )}

            {/* Commerce info */}
            <div className="surface-card rounded-2xl p-6">
              <h2 className="mb-1 text-sm font-black text-slate-800">Informations commerce</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                <InfoRow icon={IdCard} label="Catégorie" value={v.categorie_principale} />
                <InfoRow icon={Timer} label="Délai de préparation" value={`${v.delai_moyen_preparation} min`} />
                <InfoRow icon={Wallet} label="Solde disponible" value={formatMontant(v.solde_disponible)} />
                {v.zone && <InfoRow icon={MapPin} label="Zone" value={`${v.zone.nom_zone} · ${v.zone.ville}`} />}
                {v.numero_mobile_money_reception && (
                  <InfoRow icon={Phone} label="Mobile Money" value={v.numero_mobile_money_reception} />
                )}
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
                {canValidate && v.statut_validation !== "valide" && (
                  <Button variant="secondary" className="w-full" onClick={() => setValidateOpen(true)}>
                    <Check size={15} /> Valider ce vendeur
                  </Button>
                )}
                {canSuspend && v.statut_validation !== "suspendu" && (
                  <Button variant="danger" className="w-full" onClick={() => setSuspendOpen(true)}>
                    <Ban size={15} /> Suspendre ce vendeur
                  </Button>
                )}
                {v.user && (
                  <Button variant="ghost" className="w-full" onClick={() => router.push(`/admin/utilisateurs/${v.user!.id}`)}>
                    Voir le compte utilisateur
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {validateOpen && v && (
        <ConfirmDialog
          title="Valider ce vendeur"
          message={`Confirmez-vous la validation du vendeur « ${v.nom_commerce} » ?`}
          confirmLabel="Valider"
          loading={validateMutation.isPending}
          onConfirm={() => validateMutation.mutate()}
          onClose={() => setValidateOpen(false)}
        />
      )}
      {suspendOpen && v && (
        <ConfirmDialog
          title="Suspendre ce vendeur"
          message={`Confirmez-vous la suspension du vendeur « ${v.nom_commerce} » ?`}
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
