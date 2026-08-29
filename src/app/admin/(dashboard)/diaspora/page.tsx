"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Globe2, Eye } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { AppUser, ApiEnvelope, PaginatedData, StatutCompte } from "@/lib/types";
import { LoadingBlock, ErrorBlock, EmptyState } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { StatutCompteBadge } from "@/components/Badge";
import { fullName, initials } from "@/lib/format";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, UserAvatar, HeaderStat } from "@/components/AdminTable";

const STATUTS: { value: StatutCompte | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "actif", label: "Actif" },
  { value: "suspendu", label: "Suspendu" },
  { value: "en_attente_validation", label: "En attente" },
];

export default function DiasporaPage() {
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-diaspora", page, statut, search],
    queryFn: async () => {
      const qs = buildQuery({ page, type: "client", diaspora: 1, statut, search, per_page: 5 });
      const res = await api.get<ApiEnvelope<PaginatedData<AppUser>>>(`/admin/utilisateurs${qs}`);
      return res.data;
    },
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Diaspora"
        description="Clients installés à l'étranger commandant pour des bénéficiaires au Congo."
        icon={Globe2}
        action={<HeaderStat icon={Globe2} label={`${data?.total ?? "—"} clients diaspora`} tone="gold" />}
      />

      <FilterBar>
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}
          className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nom, email ou téléphone…"
              className="w-52 rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-bold text-slate-700 placeholder-slate-400 focus:border-[#1A2E5A] focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-xl bg-[#1A2E5A] px-3 py-2 text-xs font-black text-white hover:bg-[#0B1A35] transition-colors">
            Rechercher
          </button>
        </form>
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les clients diaspora."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState message="Aucun client diaspora pour le moment." />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <AdminTable headers={["Client", "Contact", "Pays de résidence", "Devise", "Statut", "Actions"]}>
          {items.map((u) => (
            <tr key={u.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-4">
                <UserAvatar name={fullName(u.nom, u.prenom)} initials={initials(u.nom, u.prenom)} color="bg-amber-500" />
              </td>
              <td className="px-5 py-4">
                <p className="text-xs font-semibold text-slate-700">{u.email ?? "—"}</p>
                <p className="text-[12.5px] text-slate-400">{u.telephone}</p>
              </td>
              <td className="px-5 py-4 text-xs font-bold text-slate-700">{u.pays_residence ?? "—"}</td>
              <td className="px-5 py-4">
                <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-black text-amber-700">{u.devise_preferee}</span>
              </td>
              <td className="px-5 py-4"><StatutCompteBadge value={u.statut_compte} /></td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <IconAction icon={Eye} label="Voir le profil" href={`/admin/utilisateurs/${u.id}`} variant="info" />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && data.total > 0 && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}
    </div>
  );
}
