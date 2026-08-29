"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Plus, Clock, Truck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, PaginatedData, ZoneLivraison } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatMontant } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminPageHeader } from "@/components/AdminTable";

interface CreateForm {
  nom_zone: string; ville: string; quartiers: string;
  frais_livraison_base: string; delai_estime_min: string; delai_estime_max: string;
}
const EMPTY: CreateForm = { nom_zone: "", ville: "Brazzaville", quartiers: "", frais_livraison_base: "", delai_estime_min: "30", delai_estime_max: "60" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-slate-700">{label}</label>
      {children}
    </div>
  );
}

const INPUT = "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium focus:border-[#1A2E5A] focus:outline-none";

export default function ZonesPage() {
  const { notify, notifyError } = useToast();
  const canCreate = usePermission("create_zones");
  const canEdit = usePermission("edit_zones");
  const canDelete = usePermission("delete_zones");
  const [items, setItems] = useState<ZoneLivraison[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState<number | null>(null);
  const [to, setTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ZoneLivraison | null>(null);
  const [editForm, setEditForm] = useState<CreateForm>(EMPTY);
  const [editActif, setEditActif] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ZoneLivraison | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Zones affichées (page courante, 5 à la fois) et zones de référence pour les suggestions —
  // deux sources distinctes : les suggestions doivent couvrir TOUTES les zones, pas seulement la
  // page affichée, sinon la pagination ferait disparaître des suggestions valables.
  const [allZones, setAllZones] = useState<ZoneLivraison[]>([]);

  // Suggestions (pas une contrainte) des quartiers déjà couverts par une AUTRE zone — évite de
  // créer un quasi-doublon orthographique ("Moungali" vs "Moungalie") qui ferait échouer la
  // résolution exacte utilisée à la commande (resolveZoneForQuartier).
  const knownQuartiers = Array.from(new Set(allZones.flatMap((z) => z.quartiers_couverts || []))).sort();
  // Même logique pour "Ville" et "Nom de la zone" : toutes les zones réelles sont aujourd'hui
  // "Brazzaville", donc une faute de frappe ("Brazaville") créerait une zone orpheline dans une
  // ville qui n'existe nulle part ailleurs. Reste un texte libre (une vraie 2e ville doit pouvoir
  // être ajoutée un jour), juste suggéré à partir des zones déjà créées.
  const knownVilles = Array.from(new Set(allZones.map((z) => z.ville))).sort();
  const knownNomsZones = Array.from(new Set(allZones.map((z) => z.nom_zone))).sort();

  const load = useCallback(async (pageNum: number) => {
    setLoading(true); setError(null);
    try {
      const qs = buildQuery({ page: pageNum, per_page: 5 });
      const res = await api.get<ApiEnvelope<PaginatedData<ZoneLivraison>>>(`/admin/zones${qs}`);
      setItems(res.data.data);
      setPage(res.data.current_page);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
      setFrom(res.data.from);
      setTo(res.data.to);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les zones.");
    } finally { setLoading(false); }
  }, []);

  const loadAllForSuggestions = useCallback(async () => {
    try {
      const res = await api.get<ApiEnvelope<PaginatedData<ZoneLivraison>>>("/admin/zones?per_page=200");
      setAllZones(res.data.data);
    } catch { /* suggestions best-effort, la page reste utilisable sans */ }
  }, []);

  useEffect(() => { load(1); loadAllForSuggestions(); }, [load, loadAllForSuggestions]);

  const reload = useCallback(() => { load(page); loadAllForSuggestions(); }, [load, loadAllForSuggestions, page]);

  async function submitCreate() {
    setCreating(true);
    try {
      const quartiers = createForm.quartiers.split(",").map((q) => q.trim()).filter(Boolean);
      await api.post("/admin/zones", {
        nom_zone: createForm.nom_zone, ville: createForm.ville, quartiers_couverts: quartiers,
        frais_livraison_base: Number(createForm.frais_livraison_base),
        delai_estime_min: Number(createForm.delai_estime_min), delai_estime_max: Number(createForm.delai_estime_max),
      });
      notify("Zone créée."); setCreateOpen(false); reload();
    } catch (err) { notifyError(err, "Impossible de créer cette zone."); }
    finally { setCreating(false); }
  }

  function openEdit(z: ZoneLivraison) {
    setEditing(z);
    setEditForm({
      nom_zone: z.nom_zone, ville: z.ville,
      quartiers: Array.isArray(z.quartiers_couverts) ? z.quartiers_couverts.join(", ") : "",
      frais_livraison_base: String(z.frais_livraison_base),
      delai_estime_min: String(z.delai_estime_min), delai_estime_max: String(z.delai_estime_max),
    });
    setEditActif(z.statut_actif);
  }

  async function submitEdit() {
    if (!editing) return; setSaving(true);
    try {
      const quartiers = editForm.quartiers.split(",").map((q) => q.trim()).filter(Boolean);
      await api.put(`/admin/zones/${editing.id}`, {
        nom_zone: editForm.nom_zone, ville: editForm.ville, quartiers_couverts: quartiers,
        frais_livraison_base: Number(editForm.frais_livraison_base),
        delai_estime_min: Number(editForm.delai_estime_min), delai_estime_max: Number(editForm.delai_estime_max),
        statut_actif: editActif,
      });
      notify("Zone mise à jour."); setEditing(null); reload();
    } catch (err) { notifyError(err, "Impossible de mettre à jour cette zone."); }
    finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return; setDeleteLoading(true);
    try {
      await api.delete(`/admin/zones/${deleteTarget.id}`);
      notify("Zone supprimée."); setDeleteTarget(null); reload();
    } catch (err) { notifyError(err, "Impossible de supprimer cette zone."); }
    finally { setDeleteLoading(false); }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <datalist id="quartiers-existants">
        {knownQuartiers.map((q) => <option key={q} value={q} />)}
      </datalist>
      <datalist id="villes-existantes">
        {knownVilles.map((v) => <option key={v} value={v} />)}
      </datalist>
      <datalist id="noms-zones-existants">
        {knownNomsZones.map((n) => <option key={n} value={n} />)}
      </datalist>
      <AdminPageHeader
        title="Zones de livraison"
        description="Quartiers couverts, frais de livraison et délais estimés — Brazzaville."
        icon={MapPin}
        action={
          canCreate && (
            <Button variant="primary" onClick={() => { setCreateForm(EMPTY); setCreateOpen(true); }}>
              <Plus size={14} /> Nouvelle zone
            </Button>
          )
        }
      />

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((z) => (
            <div key={z.id} className={`surface-card surface-card-interactive group relative rounded-2xl p-5 overflow-hidden ${
              z.statut_actif ? "" : "opacity-60"
            }`}>
              {/* Status accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${z.statut_actif ? "bg-[#2E7D32]" : "bg-slate-300"}`} />

              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${z.statut_actif ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-400"}`}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{z.nom_zone}</p>
                    <p className="text-[12.5px] text-slate-400 font-medium">{z.ville}</p>
                  </div>
                </div>
                <Badge tone={z.statut_actif ? "green" : "gray"}>{z.statut_actif ? "Active" : "Inactive"}</Badge>
              </div>

              {/* Quartiers chips */}
              {Array.isArray(z.quartiers_couverts) && z.quartiers_couverts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {z.quartiers_couverts.slice(0, 4).map((q) => (
                    <span key={q} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[12.5px] font-bold text-slate-600">{q}</span>
                  ))}
                  {z.quartiers_couverts.length > 4 && (
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[12.5px] font-bold text-slate-400">+{z.quartiers_couverts.length - 4}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[12.5px] font-black text-emerald-700">
                    <Truck size={12} /> {formatMontant(z.frais_livraison_base)}
                  </div>
                  <div className="flex items-center gap-1 text-[12.5px] font-bold text-slate-500">
                    <Clock size={12} /> {z.delai_estime_min}–{z.delai_estime_max} min
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canEdit && (
                    <button onClick={() => openEdit(z)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-[12.5px] font-black text-slate-600 hover:border-[#1A2E5A] hover:bg-[#1A2E5A] hover:text-white transition-all">
                      Modifier
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => setDeleteTarget(z)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-[12.5px] font-black text-red-500 hover:border-[#C00000] hover:bg-[#C00000] hover:text-white transition-all">
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add zone card */}
          {canCreate && (
            <button onClick={() => { setCreateForm(EMPTY); setCreateOpen(true); }}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-5 text-sm font-bold text-slate-400 hover:border-[#C00000] hover:text-[#C00000] transition-colors min-h-[160px]">
              <Plus size={18} /> Ajouter une zone
            </button>
          )}
        </div>
      )}

      {!loading && !error && (
        <Pagination currentPage={page} lastPage={lastPage} total={total} from={from} to={to} onChange={load} />
      )}

      {/* Create Modal */}
      {createOpen && (
        <Modal title="Nouvelle zone de livraison" onClose={() => setCreateOpen(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={creating}>Annuler</Button>
            <Button onClick={submitCreate} loading={creating} disabled={!createForm.nom_zone.trim() || !createForm.frais_livraison_base}>Créer</Button>
          </>}
        >
          <div className="space-y-4">
            <Field label="Nom de la zone"><input value={createForm.nom_zone} onChange={(e) => setCreateForm((f) => ({ ...f, nom_zone: e.target.value }))} className={INPUT} placeholder="Ex : Bacongo" list="noms-zones-existants" /></Field>
            <Field label="Ville"><input value={createForm.ville} onChange={(e) => setCreateForm((f) => ({ ...f, ville: e.target.value }))} className={INPUT} list="villes-existantes" /></Field>
            <Field label="Quartiers couverts (séparés par des virgules)">
              <input value={createForm.quartiers} onChange={(e) => setCreateForm((f) => ({ ...f, quartiers: e.target.value }))} className={INPUT} placeholder="Ex : Moungali, Talangaï" list="quartiers-existants" />
            </Field>
            <Field label="Frais de livraison de base (FCFA)"><input type="number" min={0} value={createForm.frais_livraison_base} onChange={(e) => setCreateForm((f) => ({ ...f, frais_livraison_base: e.target.value }))} className={INPUT} placeholder="Ex : 1500" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Délai min (min)"><input type="number" min={0} value={createForm.delai_estime_min} onChange={(e) => setCreateForm((f) => ({ ...f, delai_estime_min: e.target.value }))} className={INPUT} placeholder="30" /></Field>
              <Field label="Délai max (min)"><input type="number" min={0} value={createForm.delai_estime_max} onChange={(e) => setCreateForm((f) => ({ ...f, delai_estime_max: e.target.value }))} className={INPUT} placeholder="60" /></Field>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editing && (
        <Modal title={`Modifier « ${editing.nom_zone} »`} onClose={() => setEditing(null)}
          footer={<>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>Annuler</Button>
            <Button onClick={submitEdit} loading={saving}>Enregistrer</Button>
          </>}
        >
          <div className="space-y-4">
            <Field label="Nom de la zone"><input value={editForm.nom_zone} onChange={(e) => setEditForm((f) => ({ ...f, nom_zone: e.target.value }))} className={INPUT} list="noms-zones-existants" placeholder="Ex : Bacongo" /></Field>
            <Field label="Ville"><input value={editForm.ville} onChange={(e) => setEditForm((f) => ({ ...f, ville: e.target.value }))} className={INPUT} list="villes-existantes" placeholder="Ex : Brazzaville" /></Field>
            <Field label="Quartiers couverts (séparés par des virgules)">
              <input value={editForm.quartiers} onChange={(e) => setEditForm((f) => ({ ...f, quartiers: e.target.value }))} className={INPUT} placeholder="Ex : Moungali, Talangaï" list="quartiers-existants" />
            </Field>
            <Field label="Frais de livraison de base (FCFA)"><input type="number" min={0} value={editForm.frais_livraison_base} onChange={(e) => setEditForm((f) => ({ ...f, frais_livraison_base: e.target.value }))} className={INPUT} placeholder="Ex : 1500" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Délai min (min)"><input type="number" min={0} value={editForm.delai_estime_min} onChange={(e) => setEditForm((f) => ({ ...f, delai_estime_min: e.target.value }))} className={INPUT} placeholder="30" /></Field>
              <Field label="Délai max (min)"><input type="number" min={0} value={editForm.delai_estime_max} onChange={(e) => setEditForm((f) => ({ ...f, delai_estime_max: e.target.value }))} className={INPUT} placeholder="60" /></Field>
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" checked={editActif} onChange={(e) => setEditActif(e.target.checked)} className="h-4 w-4 rounded accent-[#C00000]" />
              <div>
                <p className="text-sm font-black text-slate-800">Zone active</p>
                <p className="text-[12.5px] text-slate-400">Les livreurs pourront recevoir des missions dans cette zone</p>
              </div>
            </label>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog title="Supprimer cette zone"
          message={`Confirmez-vous la suppression de la zone « ${deleteTarget.nom_zone} » ?`}
          confirmLabel="Supprimer" danger loading={deleteLoading} onConfirm={confirmDelete} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
