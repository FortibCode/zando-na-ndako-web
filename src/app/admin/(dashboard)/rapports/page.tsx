"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileDown, ClipboardList, Package, Store, Users, Globe2, Truck, Receipt, Landmark, Wallet, Download,
} from "lucide-react";
import { api } from "@/lib/api";
import type { ApiEnvelope, Categorie } from "@/lib/types";
import { AdminPageHeader } from "@/components/AdminTable";
import { EmptyState } from "@/components/Spinner";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";

type ReportType = "commandes" | "produits" | "vendeurs" | "utilisateurs" | "diaspora" | "livraisons" | "finances" | "commissions" | "retraits";

const REPORT_TYPES: { value: ReportType; label: string; description: string; icon: typeof ClipboardList }[] = [
  { value: "commandes", label: "Commandes / Ventes", description: "Détail de toutes les commandes de la période.", icon: ClipboardList },
  { value: "produits", label: "Produits les plus vendus", description: "Quantités et chiffre d'affaires par produit.", icon: Package },
  { value: "vendeurs", label: "Performance des vendeurs", description: "Commandes livrées, CA et commissions par vendeur.", icon: Store },
  { value: "utilisateurs", label: "Utilisateurs / Inscriptions", description: "Nouveaux comptes créés sur la période.", icon: Users },
  { value: "diaspora", label: "Commandes diaspora", description: "Commandes passées depuis l'étranger.", icon: Globe2 },
  { value: "livraisons", label: "Livraisons", description: "Missions de livraison, statuts et incidents.", icon: Truck },
  { value: "finances", label: "Transactions / Paiements", description: "Historique détaillé des paiements.", icon: Receipt },
  { value: "commissions", label: "Commissions", description: "Commissions calculées par commande.", icon: Landmark },
  { value: "retraits", label: "Retraits", description: "Demandes de retrait vendeurs ou livreurs.", icon: Wallet },
];

const PRESETS: { label: string; days: number }[] = [
  { label: "7 derniers jours", days: 7 },
  { label: "30 derniers jours", days: 30 },
  { label: "3 derniers mois", days: 90 },
  { label: "Cette année", days: 365 },
];

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function RapportsPage() {
  const { notifyError } = useToast();
  const canGenerate = usePermission("generate_reports");
  const [type, setType] = useState<ReportType>("commandes");
  const [dateDebut, setDateDebut] = useState(() => toDateInput(new Date(Date.now() - 29 * 86400000)));
  const [dateFin, setDateFin] = useState(() => toDateInput(new Date()));
  const [statut, setStatut] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [typeUtilisateur, setTypeUtilisateur] = useState("");
  const [methode, setMethode] = useState("");
  const [acteur, setActeur] = useState("vendeurs");
  const [downloading, setDownloading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories-public"],
    queryFn: async () => (await api.get<ApiEnvelope<Categorie[]>>("/categories")).data,
    enabled: type === "produits",
  });

  function applyPreset(days: number) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    setDateDebut(toDateInput(start));
    setDateFin(toDateInput(today));
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const params = new URLSearchParams({ type, date_debut: dateDebut, date_fin: dateFin });
      if (statut) params.set("statut", statut);
      if (categorieId) params.set("categorie_id", categorieId);
      if (typeUtilisateur) params.set("type_utilisateur", typeUtilisateur);
      if (methode) params.set("methode", methode);
      if (type === "retraits") params.set("acteur", acteur);

      await api.download(`/admin/rapports/export?${params.toString()}`, `rapport-${type}-${dateDebut}-au-${dateFin}.csv`);
    } catch (err) {
      notifyError(err, "Impossible de générer ce rapport.");
    } finally {
      setDownloading(false);
    }
  }

  const selected = REPORT_TYPES.find((r) => r.value === type)!;

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Rapports"
        description="Exports CSV détaillés pour analyse comptable ou commerciale."
        icon={FileDown}
      />

      {!canGenerate && <EmptyState message="Votre rôle ne permet pas de générer de rapports." />}

      {canGenerate && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REPORT_TYPES.map((r) => {
              const Icon = r.icon;
              const active = r.value === type;
              return (
                <button
                  key={r.value}
                  onClick={() => setType(r.value)}
                  className={`text-left rounded-2xl border p-4 transition-all ${active ? "border-[#1A2E5A] bg-[#1A2E5A]/5 shadow-premium-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${active ? "bg-[#1A2E5A] text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Icon size={15} />
                    </span>
                    <p className="text-sm font-black text-slate-800">{r.label}</p>
                  </div>
                  <p className="text-xs text-slate-400">{r.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="surface-card rounded-2xl p-6 h-fit space-y-5">
          <div>
            <h2 className="text-sm font-black text-slate-800 mb-1">{selected.label}</h2>
            <p className="text-xs text-slate-400">{selected.description}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Période rapide</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => applyPreset(p.days)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-[12.5px] font-bold text-slate-600 hover:border-[#1A2E5A] hover:text-[#1A2E5A] transition-colors">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Du</label>
              <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1A2E5A] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Au</label>
              <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1A2E5A] focus:outline-none" />
            </div>
          </div>

          {(type === "commandes") && (
            <div>
              <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Statut</label>
              <select value={statut} onChange={(e) => setStatut(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1A2E5A] focus:outline-none">
                <option value="">Tous</option>
                <option value="confirmee">Confirmée</option>
                <option value="achat_marche">Achat au marché</option>
                <option value="preparation">Préparation</option>
                <option value="en_route">En route</option>
                <option value="livree">Livrée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
          )}

          {type === "produits" && (
            <div>
              <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Catégorie</label>
              <select value={categorieId} onChange={(e) => setCategorieId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1A2E5A] focus:outline-none">
                <option value="">Toutes</option>
                {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.nom_categorie}</option>)}
              </select>
            </div>
          )}

          {type === "utilisateurs" && (
            <div>
              <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Type d&apos;utilisateur</label>
              <select value={typeUtilisateur} onChange={(e) => setTypeUtilisateur(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1A2E5A] focus:outline-none">
                <option value="">Tous</option>
                <option value="client">Client</option>
                <option value="vendeur">Vendeur</option>
                <option value="livreur">Livreur</option>
              </select>
            </div>
          )}

          {type === "livraisons" && (
            <div>
              <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Statut</label>
              <select value={statut} onChange={(e) => setStatut(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1A2E5A] focus:outline-none">
                <option value="">Tous</option>
                <option value="assigne">Assignée</option>
                <option value="en_cours">En cours</option>
                <option value="livree">Livrée</option>
                <option value="echouee">Échouée (retards/incidents)</option>
              </select>
            </div>
          )}

          {type === "finances" && (
            <>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Moyen de paiement</label>
                <select value={methode} onChange={(e) => setMethode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1A2E5A] focus:outline-none">
                  <option value="">Tous</option>
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="airtel_money">Airtel Money</option>
                  <option value="carte_locale">Carte bancaire</option>
                  <option value="stripe">Carte (Stripe)</option>
                  <option value="paypal">PayPal</option>
                  <option value="paiement_livraison">Paiement à la livraison</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Statut</label>
                <select value={statut} onChange={(e) => setStatut(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1A2E5A] focus:outline-none">
                  <option value="">Tous</option>
                  <option value="en_attente">En attente</option>
                  <option value="valide">Validé</option>
                  <option value="echoue">Échoué</option>
                  <option value="rembourse">Remboursé</option>
                </select>
              </div>
            </>
          )}

          {type === "commissions" && (
            <div>
              <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Statut</label>
              <select value={statut} onChange={(e) => setStatut(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1A2E5A] focus:outline-none">
                <option value="">Tous</option>
                <option value="en_attente">En attente</option>
                <option value="validee">Validée</option>
              </select>
            </div>
          )}

          {type === "retraits" && (
            <div>
              <label className="mb-1.5 block text-[12.5px] font-black uppercase tracking-wide text-slate-400">Acteur</label>
              <select value={acteur} onChange={(e) => setActeur(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1A2E5A] focus:outline-none">
                <option value="vendeurs">Vendeurs</option>
                <option value="livreurs">Livreurs</option>
              </select>
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="focus-premium w-full flex items-center justify-center gap-2 rounded-xl bg-[#1A2E5A] px-4 py-2.5 text-xs font-black text-white hover:bg-[#0B1A35] disabled:opacity-50 transition-colors"
          >
            <Download size={14} /> {downloading ? "Génération…" : "Télécharger le CSV"}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
