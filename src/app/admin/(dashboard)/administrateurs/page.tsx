"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Pencil, Ban, Check, Plus } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, AdministrateurLite, PaginatedData, PermissionsCatalogue, RoleAdmin } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { Badge, StatutCompteBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { formatDate, fullName, initials } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { useHasRole } from "@/lib/usePermission";
import { AdminTable, AdminPageHeader, IconAction, UserAvatar, HeaderStat } from "@/components/AdminTable";

const ROLE_LABEL: Record<RoleAdmin, string> = {
  super_admin: "Super Administrateur", support: "Support", finance: "Finance", moderation: "Modération",
};
const ROLE_TONE: Record<RoleAdmin, "red" | "navy" | "green" | "gold"> = {
  super_admin: "red", support: "navy", finance: "green", moderation: "gold",
};

type Form = {
  nom: string; prenom: string; email: string; telephone: string; mot_de_passe: string;
  role_admin: RoleAdmin; permissions: string[];
};

const EMPTY_FORM: Form = {
  nom: "", prenom: "", email: "", telephone: "", mot_de_passe: "", role_admin: "support", permissions: [],
};

export default function AdministrateursPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const isSuperAdmin = useHasRole("super_admin");

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdministrateurLite | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-administrateurs", page],
    queryFn: async () => {
      const qs = buildQuery({ page, per_page: 5 });
      return (await api.get<ApiEnvelope<PaginatedData<AdministrateurLite>>>(`/admin/administrateurs${qs}`)).data;
    },
    enabled: isSuperAdmin,
  });

  const { data: catalogue } = useQuery({
    queryKey: ["permissions-catalogue"],
    queryFn: async () => (await api.get<ApiEnvelope<PermissionsCatalogue>>("/super-admin/permissions-catalogue")).data,
    enabled: isSuperAdmin && formOpen,
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      if (editTarget) {
        return api.put(`/super-admin/administrateurs/${editTarget.id}`, {
          nom: form.nom, prenom: form.prenom, email: form.email, telephone: form.telephone,
          role_admin: form.role_admin, permissions: form.permissions,
        });
      }
      return api.post("/super-admin/administrateurs", form);
    },
    onSuccess: () => {
      notify(editTarget ? "Administrateur mis à jour." : "Administrateur créé.");
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-administrateurs"] });
    },
    onError: (err) => notifyError(err, "Impossible d'enregistrer cet administrateur."),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => api.post(`/super-admin/administrateurs/${id}/suspendre`),
    onSuccess: () => { notify("Administrateur suspendu."); queryClient.invalidateQueries({ queryKey: ["admin-administrateurs"] }); },
    onError: (err) => notifyError(err, "Impossible de suspendre ce compte."),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/super-admin/administrateurs/${id}/activer`),
    onSuccess: () => { notify("Administrateur activé."); queryClient.invalidateQueries({ queryKey: ["admin-administrateurs"] }); },
    onError: (err) => notifyError(err, "Impossible d'activer ce compte."),
  });

  function openCreate() { setEditTarget(null); setForm(EMPTY_FORM); setFormOpen(true); }
  function openEdit(a: AdministrateurLite) {
    setEditTarget(a);
    setForm({
      nom: a.user?.nom ?? "", prenom: a.user?.prenom ?? "", email: a.user?.email ?? "", telephone: a.user?.telephone ?? "",
      mot_de_passe: "", role_admin: a.role_admin, permissions: a.permissions ?? [],
    });
    setFormOpen(true);
  }
  function applyRolePreset(role: RoleAdmin) {
    setForm((f) => ({ ...f, role_admin: role, permissions: catalogue?.roles[role] ?? f.permissions }));
  }
  function togglePermission(perm: string) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm) ? f.permissions.filter((p) => p !== perm) : [...f.permissions, perm],
    }));
  }

  const items = data?.data ?? [];

  if (!isSuperAdmin) {
    return (
      <div className="space-y-5 animate-fade-in">
        <AdminPageHeader title="Administrateurs" description="Réservé au Super Administrateur." icon={ShieldCheck} />
        <p className="py-16 text-center text-sm font-medium text-slate-400">Accès réservé au Super Administrateur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Administrateurs"
        description="Comptes internes de l'équipe Zando na Ndako et leurs permissions."
        icon={ShieldCheck}
        action={
          <div className="flex items-center gap-3">
            <HeaderStat icon={ShieldCheck} label={`${data?.total ?? items.length} administrateurs`} tone="navy" />
            <Button variant="secondary" onClick={openCreate}>
              <Plus size={14} /> Nouvel administrateur
            </Button>
          </div>
        }
      />

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les administrateurs."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["Administrateur", "Contact", "Rôle", "Permissions", "Statut", "Nommé le", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucun administrateur trouvé."
        >
          {items.map((a) => (
            <tr key={a.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-3.5">
                {a.user ? (
                  <UserAvatar name={fullName(a.user.nom, a.user.prenom)} initials={initials(a.user.nom, a.user.prenom)} color="bg-[#1A2E5A]" />
                ) : <span className="text-slate-400 text-xs">—</span>}
              </td>
              <td className="px-5 py-3.5">
                <p className="text-xs font-semibold text-slate-700">{a.user?.email ?? "—"}</p>
                <p className="text-[12.5px] text-slate-400">{a.user?.telephone}</p>
              </td>
              <td className="px-5 py-3.5"><Badge tone={ROLE_TONE[a.role_admin]}>{ROLE_LABEL[a.role_admin]}</Badge></td>
              <td className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                {a.role_admin === "super_admin" ? "Accès total" : `${a.permissions?.length ?? 0} permission(s)`}
              </td>
              <td className="px-5 py-3.5">{a.user && <StatutCompteBadge value={a.user.statut_compte} />}</td>
              <td className="px-5 py-3.5 text-xs text-slate-400 font-medium">{formatDate(a.date_nomination)}</td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-2">
                  <IconAction icon={Pencil} label="Modifier" onClick={() => openEdit(a)} variant="ghost" />
                  {a.user?.statut_compte !== "suspendu" ? (
                    <IconAction icon={Ban} label="Suspendre" onClick={() => suspendMutation.mutate(a.id)} variant="danger" />
                  ) : (
                    <IconAction icon={Check} label="Activer" onClick={() => activateMutation.mutate(a.id)} variant="success" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && (
        <Pagination
          currentPage={data.current_page}
          lastPage={data.last_page}
          total={data.total}
          from={data.from}
          to={data.to}
          onChange={setPage}
        />
      )}

      {formOpen && (
        <Modal
          title={editTarget ? "Modifier l'administrateur" : "Nouvel administrateur"}
          onClose={() => setFormOpen(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saveMutation.isPending}>Annuler</Button>
            <Button variant="secondary" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}
              disabled={!form.nom.trim() || !form.prenom.trim() || !form.email.trim() || !form.telephone.trim() || (!editTarget && !form.mot_de_passe)}>
              Enregistrer
            </Button>
          </>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Prénom</label>
                <input value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Nom</label>
                <input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Téléphone</label>
                <input value={form.telephone} onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
            </div>
            {!editTarget && (
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">Mot de passe temporaire</label>
                <input type="password" value={form.mot_de_passe} onChange={(e) => setForm((f) => ({ ...f, mot_de_passe: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-black text-slate-700">Rôle</label>
              <select value={form.role_admin} onChange={(e) => applyRolePreset(e.target.value as RoleAdmin)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none">
                {(Object.keys(ROLE_LABEL) as RoleAdmin[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
              <p className="mt-1 text-[12.5px] text-slate-400">Changer le rôle propose une liste de permissions par défaut, modifiable ci-dessous.</p>
            </div>

            {form.role_admin === "super_admin" ? (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-[#C00000]">
                Le Super Administrateur a un accès total, sans restriction de permission.
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">
                  Permissions ({form.permissions.length} sélectionnée{form.permissions.length > 1 ? "s" : ""})
                </label>
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-300 p-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {(catalogue?.permissions ?? []).map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer py-0.5">
                      <input type="checkbox" checked={form.permissions.includes(perm)} onChange={() => togglePermission(perm)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#1A2E5A] focus:ring-[#1A2E5A]" />
                      <span className="text-[12.5px] font-semibold text-slate-600 truncate">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
