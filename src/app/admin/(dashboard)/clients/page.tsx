"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserCircle, Eye, Globe2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { AppUser, ApiEnvelope, PaginatedData, StatutCompte } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { StatutCompteBadge, Badge } from "@/components/Badge";
import { formatDate, fullName, initials } from "@/lib/format";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, UserAvatar, HeaderStat } from "@/components/AdminTable";

const STATUTS: { value: StatutCompte | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "actif", label: "Actif" },
  { value: "suspendu", label: "Suspendu" },
  { value: "en_attente_validation", label: "En attente" },
];

export default function ClientsPage() {
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-clients", page, statut, search],
    queryFn: async () => {
      const qs = buildQuery({ page, type: "client", statut, search });
      const res = await api.get<ApiEnvelope<PaginatedData<AppUser>>>(`/admin/utilisateurs${qs}`);
      return res.data;
    },
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Clients"
        description="Clients locaux et diaspora ayant un compte sur la plateforme."
        icon={UserCircle}
        action={<HeaderStat icon={UserCircle} label={`${data?.total ?? "—"} clients`} tone="sky" />}
      />

      <FilterBar>
        <FilterSelect value={statut} onChange={(v) => { setPage(1); setStatut(v); }} options={STATUTS} />
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}
          className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nom, email ou téléphone…"
              className="w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm font-bold text-slate-700 placeholder-slate-400 focus:border-[#1A2E5A] focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-xl bg-[#1A2E5A] px-4 py-2.5 text-sm font-black text-white hover:bg-[#0B1A35] transition-colors">
            Rechercher
          </button>
        </form>
      </FilterBar>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger les clients."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["Client", "Contact", "Origine", "Statut", "Inscrit le", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucun client trouvé."
        >
          {items.map((u) => (
            <tr key={u.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-4">
                <UserAvatar name={fullName(u.nom, u.prenom)} initials={initials(u.nom, u.prenom)} color="bg-sky-600" />
              </td>
              <td className="px-5 py-4">
                <p className="text-sm font-semibold text-slate-700">{u.email ?? "—"}</p>
                <p className="text-xs text-slate-400 mt-0.5">{u.telephone}</p>
              </td>
              <td className="px-5 py-4">
                {u.client?.est_diaspora ? (
                  <Badge tone="gold" dot><Globe2 size={11} className="inline mr-1 -mt-0.5" />Diaspora</Badge>
                ) : (
                  <span className="text-xs font-semibold text-slate-500">Local</span>
                )}
              </td>
              <td className="px-5 py-4"><StatutCompteBadge value={u.statut_compte} /></td>
              <td className="px-5 py-4 text-sm text-slate-400 font-medium">{formatDate(u.date_inscription)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <IconAction icon={Eye} label="Voir le profil" href={`/admin/utilisateurs/${u.id}`} variant="info" />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}
    </div>
  );
}
