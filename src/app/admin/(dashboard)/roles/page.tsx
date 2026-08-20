"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Search, ShieldCheck, UserMinus, UserPlus, Headset, Wallet, AlertTriangle, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ApiEnvelope, AppUser, PaginatedData } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Badge } from "@/components/Badge";
import { fullName, initials } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { AdminPageHeader } from "@/components/AdminTable";

const SUGGESTED_ROLES = ["super_admin", "support", "finance", "moderation"];

const ROLE_COLORS: Record<string, { bg: string; text: string; icon: LucideIcon }> = {
  super_admin: { bg: "bg-[#C00000]/10", text: "text-[#C00000]", icon: Shield },
  support:     { bg: "bg-sky-100",      text: "text-sky-700",   icon: Headset },
  finance:     { bg: "bg-emerald-100",  text: "text-emerald-700", icon: Wallet },
  moderation:  { bg: "bg-amber-100",    text: "text-amber-700", icon: AlertTriangle },
};

export default function RolesPage() {
  const { notify, notifyError } = useToast();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<AppUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<ApiEnvelope<string[]>>("/super-admin/roles");
      setRoles(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Accès réservé au super administrateur.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await api.get<ApiEnvelope<PaginatedData<AppUser>>>(
        `/admin/utilisateurs?search=${encodeURIComponent(search.trim())}`
      );
      setResults(res.data.data);
    } catch (err) { notifyError(err, "Recherche impossible."); }
    finally { setSearching(false); }
  }

  async function assign() {
    if (!selectedUser || !role.trim()) return;
    setBusy(true);
    try {
      await api.post(`/super-admin/users/${selectedUser.id}/role`, { role: role.trim() });
      notify(`Rôle « ${role} » attribué à ${fullName(selectedUser.nom, selectedUser.prenom)}.`);
      setRole(""); load();
    } catch (err) { notifyError(err, "Impossible d'attribuer ce rôle."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!selectedUser || !role.trim()) return;
    setBusy(true);
    try {
      await api.delete(`/super-admin/users/${selectedUser.id}/role`, { role: role.trim() });
      notify(`Rôle « ${role} » retiré de ${fullName(selectedUser.nom, selectedUser.prenom)}.`);
      setRole(""); load();
    } catch (err) { notifyError(err, "Impossible de retirer ce rôle."); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Gestion des rôles"
        description="Attribution et révocation de rôles applicatifs — réservé au Super Administrateur."
        icon={KeyRound}
      />

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Current Roles Panel */}
          <div className="surface-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1A2E5A]/8">
                <ShieldCheck size={16} className="text-[#1A2E5A]" />
              </div>
              <h2 className="text-sm font-black text-slate-800">Rôles actifs sur la plateforme</h2>
            </div>
            {roles.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium">Aucun rôle spécial attribué pour le moment.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => {
                  const style = ROLE_COLORS[r] ?? { bg: "bg-slate-100", text: "text-slate-600", icon: KeyRound };
                  const RoleIcon = style.icon;
                  return (
                    <span key={r} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black ${style.bg} ${style.text}`}>
                      <RoleIcon size={13} /> {r}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assign/Remove Panel */}
          <div className="surface-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50">
                <KeyRound size={16} className="text-amber-600" />
              </div>
              <h2 className="text-sm font-black text-slate-800">Attribuer ou retirer un rôle</h2>
            </div>

            {/* Search Bar */}
            <form onSubmit={runSearch} className="mb-5 flex gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nom, email ou téléphone de l'utilisateur…"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs font-bold text-slate-700 placeholder-slate-400 focus:border-[#1A2E5A] focus:outline-none"
                />
              </div>
              <button type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#1A2E5A] px-4 py-2 text-xs font-black text-white hover:bg-[#0B1A35] transition-colors disabled:opacity-50"
                disabled={searching}>
                {searching ? "Recherche…" : "Rechercher"}
              </button>
            </form>

            {/* Search Results */}
            {results.length > 0 && (
              <div className="mb-5 max-h-52 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-50">
                {results.map((u) => (
                  <button key={u.id} onClick={() => setSelectedUser(u)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors ${
                      selectedUser?.id === u.id ? "bg-blue-50 border-l-2 border-[#1A2E5A]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A2E5A] text-xs font-black text-white">
                        {initials(u.nom, u.prenom)}
                      </span>
                      <div>
                        <p className="font-black text-slate-800 text-xs">{fullName(u.nom, u.prenom)}</p>
                        <p className="text-[11.5px] text-slate-400">{u.email ?? u.telephone} · {u.type_utilisateur}</p>
                      </div>
                    </div>
                    {selectedUser?.id === u.id && (
                      <Badge tone="green">Sélectionné</Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Assign Panel */}
            {selectedUser && (
              <div className="rounded-2xl border border-[#1A2E5A]/15 bg-[#1A2E5A]/4 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A2E5A] text-sm font-black text-white">
                    {initials(selectedUser.nom, selectedUser.prenom)}
                  </span>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{fullName(selectedUser.nom, selectedUser.prenom)}</p>
                    <p className="text-xs text-slate-500">{selectedUser.email ?? selectedUser.telephone}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[160px]">
                    <label className="mb-1.5 block text-[11.5px] font-black text-slate-500 uppercase tracking-widest">Rôle à attribuer / retirer</label>
                    <input
                      list="suggested-roles"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold focus:border-[#1A2E5A] focus:outline-none"
                      placeholder="Ex : support, finance…"
                    />
                    <datalist id="suggested-roles">
                      {SUGGESTED_ROLES.map((r) => <option key={r} value={r} />)}
                    </datalist>
                  </div>
                  <button onClick={assign} disabled={!role.trim() || busy}
                    className="flex items-center gap-1.5 rounded-xl bg-[#2E7D32] px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
                    <UserPlus size={13} /> Attribuer
                  </button>
                  <button onClick={remove} disabled={!role.trim() || busy}
                    className="flex items-center gap-1.5 rounded-xl bg-[#C00000] px-4 py-2.5 text-xs font-black text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                    <UserMinus size={13} /> Retirer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
