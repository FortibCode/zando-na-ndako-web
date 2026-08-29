"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Mail, Phone, CalendarDays, Clock, Globe, MapPin,
  Store, Bike, ShieldCheck, Check, Ban, Star, Wallet, Timer, IdCard,
  Pencil, KeyRound, ClipboardList, Copy,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ApiEnvelope, AppUser, Commande, PaginatedData } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Badge, StatutCompteBadge, StatutValidationBadge, StatutCommandeBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatDate, formatMontant, fullName, initials } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { InfoRow } from "@/components/AdminTable";

const TYPE_COLOR: Record<string, string> = {
  client: "bg-sky-600", vendeur: "bg-emerald-600",
  livreur: "bg-violet-600", administrateur: "bg-[#C00000]",
};
const TYPE_LABEL: Record<string, string> = {
  client: "Client", vendeur: "Vendeur", livreur: "Livreur", administrateur: "Administrateur",
};

export default function UtilisateurDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notify, notifyError } = useToast();
  const canManageStatus = usePermission("manage_users_status");

  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activateOpen, setActivateOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [motif, setMotif] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [tab, setTab] = useState<"info" | "commandes">("info");
  const [commandes, setCommandes] = useState<Commande[] | null>(null);
  const [commandesLoading, setCommandesLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ nom: "", prenom: "", email: "", telephone: "" });

  const [resetOpen, setResetOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<ApiEnvelope<AppUser>>(`/admin/utilisateurs/${params.id}`);
      setUser(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger ce profil.");
    } finally { setLoading(false); }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  async function loadCommandes(clientId: string) {
    setCommandesLoading(true);
    try {
      const res = await api.get<ApiEnvelope<PaginatedData<Commande>>>(`/admin/commandes?client_id=${clientId}`);
      setCommandes(res.data.data);
    } catch (err) {
      notifyError(err, "Impossible de charger les commandes.");
      setCommandes([]);
    } finally { setCommandesLoading(false); }
  }

  function openTab(t: "info" | "commandes") {
    setTab(t);
    if (t === "commandes" && user?.client && commandes === null) loadCommandes(user.client.id);
  }

  function openEdit() {
    if (!user) return;
    setEditForm({ nom: user.nom, prenom: user.prenom, email: user.email ?? "", telephone: user.telephone });
    setEditOpen(true);
  }

  async function confirmEdit() {
    if (!user) return; setActionLoading(true);
    try {
      await api.put(`/admin/utilisateurs/${user.id}`, {
        nom: editForm.nom, prenom: editForm.prenom,
        email: editForm.email || null, telephone: editForm.telephone,
      });
      notify("Profil mis à jour."); setEditOpen(false); load();
    } catch (err) { notifyError(err, "Impossible de mettre à jour ce profil."); }
    finally { setActionLoading(false); }
  }

  async function confirmReset() {
    if (!user) return; setActionLoading(true);
    try {
      const res = await api.post<{ success: boolean; data: { mot_de_passe_temporaire: string } }>(`/admin/utilisateurs/${user.id}/reset-password`);
      setTempPassword(res.data.mot_de_passe_temporaire);
      notify("Mot de passe réinitialisé.");
    } catch (err) { notifyError(err, "Impossible de réinitialiser le mot de passe."); }
    finally { setActionLoading(false); }
  }

  async function confirmActivate() {
    if (!user) return; setActionLoading(true);
    try {
      await api.post(`/admin/utilisateurs/${user.id}/activer`);
      notify("Compte activé."); setActivateOpen(false); load();
    } catch (err) { notifyError(err, "Impossible d'activer ce compte."); }
    finally { setActionLoading(false); }
  }

  async function confirmSuspend() {
    if (!user) return; setActionLoading(true);
    try {
      await api.post(`/admin/utilisateurs/${user.id}/suspendre`, { motif });
      notify("Compte suspendu."); setSuspendOpen(false); setMotif(""); load();
    } catch (err) { notifyError(err, "Impossible de suspendre ce compte."); }
    finally { setActionLoading(false); }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        onClick={() => router.push("/admin/utilisateurs")}
        className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#1A2E5A] transition-colors"
      >
        <ArrowLeft size={14} /> Retour aux utilisateurs
      </button>

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}

      {!loading && !error && user && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — identity + contact */}
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-card rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-black text-white shadow-premium-md ring-4 ring-white ${TYPE_COLOR[user.type_utilisateur] ?? "bg-slate-500"}`}>
                  {initials(user.nom, user.prenom)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-black text-slate-900">{fullName(user.nom, user.prenom)}</h1>
                    <StatutCompteBadge value={user.statut_compte} />
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {TYPE_LABEL[user.type_utilisateur] ?? user.type_utilisateur} · Langue : {user.langue_preferee}
                  </p>
                </div>
              </div>
            </div>

            {user.client && (
              <div className="flex gap-1 surface-card rounded-2xl p-1.5 w-fit">
                <button
                  onClick={() => openTab("info")}
                  className={`rounded-xl px-4 py-2 text-xs font-black transition-colors ${tab === "info" ? "bg-[#1A2E5A] text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  Informations
                </button>
                <button
                  onClick={() => openTab("commandes")}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-colors ${tab === "commandes" ? "bg-[#1A2E5A] text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  <ClipboardList size={13} /> Commandes
                </button>
              </div>
            )}

            {tab === "commandes" && user.client ? (
              <div className="surface-card rounded-2xl">
                {commandesLoading && <LoadingBlock />}
                {!commandesLoading && commandes && commandes.length === 0 && (
                  <p className="py-10 text-center text-xs font-semibold text-slate-400">Aucune commande passée par ce client.</p>
                )}
                {!commandesLoading && commandes && commandes.length > 0 && (
                  <div className="divide-y divide-slate-50">
                    {commandes.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-4 px-6 py-3.5">
                        <div>
                          <p className="text-xs font-black text-slate-800">{c.numero_commande}</p>
                          <p className="text-[12.5px] text-slate-400">{c.vendeur?.nom_commerce ?? "—"} · {formatDate(c.date_commande, true)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatutCommandeBadge value={c.statut_commande} />
                          <span className="text-sm font-black text-slate-800">{formatMontant(c.montant_total, c.devise_paiement)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
            <div className="surface-card rounded-2xl p-6">
              <h2 className="mb-1 text-sm font-black text-slate-800">Informations de contact</h2>
              <div className="divide-y divide-slate-50">
                <InfoRow icon={Mail} label="Email" value={user.email ?? "—"} />
                <InfoRow icon={Phone} label="Téléphone" value={user.telephone} />
                <InfoRow icon={CalendarDays} label="Membre depuis" value={formatDate(user.date_inscription)} />
                <InfoRow icon={Clock} label="Dernière connexion" value={user.derniere_connexion ? formatDate(user.derniere_connexion, true) : "Jamais connecté"} />
                <InfoRow icon={Globe} label="Devise préférée" value={user.devise_preferee} />
                {(user.ville || user.adresse || user.pays_residence) && (
                  <InfoRow icon={MapPin} label="Localisation" value={[user.adresse, user.ville, user.pays_residence].filter(Boolean).join(", ")} />
                )}
              </div>
            </div>
            )}

            {tab === "info" && user.vendeur && (
              <div className="surface-card rounded-2xl p-6">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-black text-slate-800"><Store size={15} className="text-emerald-600" /> Profil vendeur</h2>
                  <StatutValidationBadge value={user.vendeur.statut_validation} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                  <InfoRow icon={Store} label="Commerce" value={user.vendeur.nom_commerce} />
                  <InfoRow icon={IdCard} label="Catégorie" value={user.vendeur.categorie_principale} />
                  <InfoRow icon={Star} label="Note moyenne" value={`${user.vendeur.note_moyenne} / 5`} />
                  <InfoRow icon={Wallet} label="Solde disponible" value={formatMontant(user.vendeur.solde_disponible)} />
                  <InfoRow icon={Timer} label="Délai de préparation" value={`${user.vendeur.delai_moyen_preparation} min`} />
                </div>
              </div>
            )}

            {user.livreur && (
              <div className="surface-card rounded-2xl p-6">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-black text-slate-800"><Bike size={15} className="text-violet-600" /> Profil livreur</h2>
                  <StatutValidationBadge value={user.livreur.statut_validation} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                  <InfoRow icon={Bike} label="Véhicule" value={`${user.livreur.type_vehicule} · ${user.livreur.immatriculation_vehicule}`} />
                  <InfoRow icon={Star} label="Note moyenne" value={`${user.livreur.note_moyenne} / 5`} />
                  <InfoRow icon={Wallet} label="Solde disponible" value={formatMontant(user.livreur.solde_disponible)} />
                  <InfoRow icon={Check} label="Disponibilité" value={user.livreur.statut_disponibilite === "disponible" ? "Disponible" : "Indisponible"} />
                </div>
              </div>
            )}

            {user.administrateur && (
              <div className="surface-card rounded-2xl p-6">
                <h2 className="mb-1 flex items-center gap-2 text-sm font-black text-slate-800"><ShieldCheck size={15} className="text-[#C00000]" /> Profil administrateur</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                  <InfoRow icon={ShieldCheck} label="Rôle" value={user.administrateur.role_admin} />
                  <InfoRow icon={CalendarDays} label="Nommé le" value={formatDate(user.administrateur.date_nomination)} />
                </div>
                {user.roles && user.roles.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.roles.map((r) => <Badge key={r.id} tone="navy">{r.role}</Badge>)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column — actions */}
          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6">
              <h2 className="mb-4 text-sm font-black text-slate-800">Actions</h2>
              <div className="space-y-2.5">
                {canManageStatus ? (
                  <>
                    <Button variant="ghost" className="w-full" onClick={openEdit}>
                      <Pencil size={15} /> Modifier le profil
                    </Button>
                    <Button variant="ghost" className="w-full border-amber-200! text-amber-700! hover:bg-amber-50!" onClick={() => { setTempPassword(null); setResetOpen(true); }}>
                      <KeyRound size={15} /> Réinitialiser le mot de passe
                    </Button>
                    {user.statut_compte !== "actif" && (
                      <Button variant="secondary" className="w-full" onClick={() => setActivateOpen(true)}>
                        <Check size={15} /> Activer le compte
                      </Button>
                    )}
                    {user.statut_compte !== "suspendu" && (
                      <Button variant="danger" className="w-full" onClick={() => setSuspendOpen(true)}>
                        <Ban size={15} /> Suspendre le compte
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-xs font-semibold text-slate-400">
                    Votre rôle ne permet pas de modifier ce compte.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activateOpen && user && (
        <ConfirmDialog
          title="Activer ce compte"
          message={`Confirmez-vous l'activation du compte de ${fullName(user.nom, user.prenom)} ?`}
          confirmLabel="Activer"
          loading={actionLoading}
          onConfirm={confirmActivate}
          onClose={() => setActivateOpen(false)}
        />
      )}

      {suspendOpen && user && (
        <Modal
          title="Suspendre ce compte"
          onClose={() => { setSuspendOpen(false); setMotif(""); }}
          footer={<>
            <Button variant="ghost" onClick={() => { setSuspendOpen(false); setMotif(""); }} disabled={actionLoading}>Annuler</Button>
            <Button variant="danger" onClick={confirmSuspend} loading={actionLoading} disabled={!motif.trim()}>Suspendre</Button>
          </>}
        >
          <p className="mb-4 text-sm text-slate-600">
            Suspension du compte de <strong>{fullName(user.nom, user.prenom)}</strong>. Les sessions actives seront révoquées.
          </p>
          <label className="mb-1.5 block text-xs font-black text-slate-700">Motif de suspension (obligatoire)</label>
          <textarea value={motif} onChange={(e) => setMotif(e.target.value)} rows={3} maxLength={500}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000] focus:outline-none"
            placeholder="Ex : comportement frauduleux, violation des CGU…" />
        </Modal>
      )}

      {editOpen && user && (
        <Modal
          title="Modifier le profil"
          onClose={() => setEditOpen(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={actionLoading}>Annuler</Button>
            <Button variant="secondary" onClick={confirmEdit} loading={actionLoading}>Enregistrer</Button>
          </>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Prénom</label>
                <input value={editForm.prenom} onChange={(e) => setEditForm((f) => ({ ...f, prenom: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Nom</label>
                <input value={editForm.nom} onChange={(e) => setEditForm((f) => ({ ...f, nom: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Email</label>
              <input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Téléphone</label>
              <input value={editForm.telephone} onChange={(e) => setEditForm((f) => ({ ...f, telephone: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
            </div>
          </div>
        </Modal>
      )}

      {resetOpen && user && tempPassword === null && (
        <ConfirmDialog
          title="Réinitialiser le mot de passe"
          message={`Un nouveau mot de passe temporaire va être généré pour ${fullName(user.nom, user.prenom)} et envoyé par SMS. Ses sessions actives seront révoquées.`}
          confirmLabel="Réinitialiser"
          loading={actionLoading}
          onConfirm={confirmReset}
          onClose={() => setResetOpen(false)}
        />
      )}

      {resetOpen && tempPassword !== null && (
        <Modal
          title="Mot de passe réinitialisé"
          onClose={() => { setResetOpen(false); setTempPassword(null); }}
          footer={<Button variant="secondary" onClick={() => { setResetOpen(false); setTempPassword(null); }}>Fermer</Button>}
        >
          <p className="mb-3 text-sm text-slate-600">
            Communiquez ce mot de passe temporaire à l&apos;utilisateur. Il ne sera plus affiché ensuite.
          </p>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <code className="text-base font-black tracking-wider text-emerald-800">{tempPassword}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(tempPassword)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              title="Copier"
            >
              <Copy size={14} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
