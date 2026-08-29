"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Truck, Bike, MapPin, Clock, Ruler, ShieldAlert, RefreshCw, ExternalLink } from "lucide-react";
import { api, ApiError, resolveMediaUrl } from "@/lib/api";
import type { ApiEnvelope, Livraison, PaginatedData, Livreur } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Badge, statutLabel } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { InfoRow, MiniStat } from "@/components/AdminTable";
import { formatDate, fullName } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import Link from "next/link";

const STATUT_TONE: Record<string, "navy" | "gold" | "green" | "red"> = {
  assigne: "navy", en_cours: "gold", en_route_client: "gold", livree: "green", echouee: "red",
};

export default function LivraisonDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canReassign = usePermission("reassign_livraisons");

  const [reassignOpen, setReassignOpen] = useState(false);
  const [selectedLivreur, setSelectedLivreur] = useState("");

  const { data: livraison, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-livraison-detail", params.id],
    queryFn: async () => (await api.get<ApiEnvelope<Livraison>>(`/admin/livraisons/${params.id}`)).data,
  });

  const { data: livreurs, isLoading: livreursLoading } = useQuery({
    queryKey: ["admin-livreurs-valides"],
    queryFn: async () => (await api.get<ApiEnvelope<PaginatedData<Livreur>>>("/admin/livreurs?statut=valide&disponible=1&per_page=200")).data.data,
    enabled: reassignOpen,
  });

  const reassignMutation = useMutation({
    mutationFn: () => api.post(`/admin/livraisons/${params.id}/reattribuer`, { livreur_id: selectedLivreur }),
    onSuccess: () => {
      notify("Livraison réattribuée.");
      setReassignOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-livraison-detail", params.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-livraisons"] });
    },
    onError: (err) => notifyError(err, "Impossible de réattribuer cette livraison."),
  });

  const proofUrl = resolveMediaUrl(livraison?.photo_preuve);
  const incidentPhotoUrl = resolveMediaUrl(livraison?.photo_incident);
  const positions = livraison?.suivi_positions ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        onClick={() => router.push("/admin/livraisons")}
        className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#1A2E5A] transition-colors"
      >
        <ArrowLeft size={14} /> Retour aux livraisons
      </button>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger cette livraison."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && livraison && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-card rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Truck size={22} />
                  </span>
                  <div>
                    <h1 className="text-lg font-black text-slate-900">{livraison.commande?.numero_commande ?? "Livraison"}</h1>
                    {livraison.commande && (
                      <Link href={`/admin/commandes/${livraison.commande.id}`} className="flex items-center gap-1 text-xs font-bold text-[#1A2E5A] hover:underline">
                        Voir la commande <ExternalLink size={11} />
                      </Link>
                    )}
                  </div>
                </div>
                <Badge tone={STATUT_TONE[livraison.statut_livraison]}>{statutLabel(livraison.statut_livraison)}</Badge>
              </div>
              {livraison.motif_incident && (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  <ShieldAlert size={14} /> {livraison.motif_incident}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MiniStat icon={Clock} label="Collecte" value={livraison.date_collecte ? formatDate(livraison.date_collecte, true) : "—"} tone="navy" />
              <MiniStat icon={Clock} label="Livraison" value={livraison.date_livraison ? formatDate(livraison.date_livraison, true) : "—"} tone="green" />
              <MiniStat icon={Ruler} label="Distance" value={livraison.distance_parcourue ? `${livraison.distance_parcourue} km` : "—"} tone="sky" />
            </div>

            {livraison.commande && (
              <div className="surface-card rounded-2xl p-6">
                <h2 className="mb-1 flex items-center gap-2 text-sm font-black text-slate-800"><MapPin size={15} className="text-[#1A2E5A]" /> Livraison</h2>
                <div className="mt-2">
                  <InfoRow icon={MapPin} label="Adresse de livraison" value={livraison.commande.adresse_livraison} />
                  {livraison.commande.client?.user && (
                    <InfoRow icon={Bike} label="Client" value={fullName(livraison.commande.client.user.nom, livraison.commande.client.user.prenom)} />
                  )}
                </div>
              </div>
            )}

            {proofUrl && (
              <div className="surface-card rounded-2xl p-6">
                <p className="mb-2 text-[12.5px] font-bold uppercase tracking-wide text-slate-400">Preuve de livraison</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proofUrl} alt="Preuve de livraison" className="max-h-64 rounded-xl ring-1 ring-slate-100 object-cover" />
              </div>
            )}

            {incidentPhotoUrl && (
              <div className="surface-card rounded-2xl p-6">
                <p className="mb-2 text-[12.5px] font-bold uppercase tracking-wide text-slate-400">Photo du signalement</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={incidentPhotoUrl} alt="Photo du signalement" className="max-h-64 rounded-xl ring-1 ring-slate-100 object-cover" />
              </div>
            )}

            <div className="surface-card rounded-2xl">
              <div className="px-6 py-4 border-b border-slate-50">
                <h2 className="text-sm font-black text-slate-800">Trajet GPS ({positions.length} points)</h2>
              </div>
              {positions.length === 0 ? (
                <p className="py-10 text-center text-xs font-semibold text-slate-400">Aucune position GPS reçue pour cette livraison.</p>
              ) : (
                <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                  {positions.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-4 px-6 py-2.5">
                      <span className="text-xs font-mono text-slate-600">{Number(p.latitude).toFixed(5)}, {Number(p.longitude).toFixed(5)}</span>
                      <span className="text-[12.5px] text-slate-400 font-medium">{formatDate(p.horodatage, true)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6">
              <h2 className="mb-4 text-sm font-black text-slate-800">Actions</h2>
              <div className="space-y-2.5">
                {canReassign && livraison.statut_livraison !== "livree" && (
                  <Button variant="ghost" className="w-full" onClick={() => { setSelectedLivreur(livraison.livreur_id); setReassignOpen(true); }}>
                    <RefreshCw size={15} /> Réattribuer le livreur
                  </Button>
                )}
                {livraison.livreur && (
                  <Button variant="ghost" className="w-full" onClick={() => router.push(`/admin/livreurs/${livraison.livreur!.id}`)}>
                    Voir la fiche livreur
                  </Button>
                )}
              </div>
            </div>

            {livraison.livreur?.user && (
              <div className="surface-card rounded-2xl p-6">
                <h2 className="mb-3 text-sm font-black text-slate-800">Livreur assigné</h2>
                <p className="text-sm font-bold text-slate-700">{fullName(livraison.livreur.user.nom, livraison.livreur.user.prenom)}</p>
                <p className="text-xs text-slate-400 mt-1">{livraison.livreur.user.telephone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {reassignOpen && livraison && (
        <Modal
          title="Réattribuer le livreur"
          onClose={() => setReassignOpen(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setReassignOpen(false)} disabled={reassignMutation.isPending}>Annuler</Button>
            <Button onClick={() => reassignMutation.mutate()} loading={reassignMutation.isPending} disabled={!selectedLivreur}>Réattribuer</Button>
          </>}
        >
          {livreursLoading || !livreurs ? <LoadingBlock label="Chargement des livreurs…" /> : livreurs.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun livreur validé disponible.</p>
          ) : (
            <select value={selectedLivreur} onChange={(e) => setSelectedLivreur(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-[#1A2E5A] focus:outline-none">
              <option value="" disabled>Sélectionner un livreur…</option>
              {livreurs.map((l) => <option key={l.id} value={l.id}>{l.user ? fullName(l.user.nom, l.user.prenom) : l.id} — {l.type_vehicule}</option>)}
            </select>
          )}
        </Modal>
      )}
    </div>
  );
}
