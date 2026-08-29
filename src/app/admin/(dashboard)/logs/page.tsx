"use client";

import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollText, Search, ChevronDown, ChevronUp, Monitor, Globe } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, LogActivite, PaginatedData } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { formatDate, fullName, initials } from "@/lib/format";
import { AdminPageHeader, AdminTable, HeaderStat } from "@/components/AdminTable";

const ACTION_COLOR: Record<string, { bg: string; text: string }> = {
  login:    { bg: "bg-sky-100",     text: "text-sky-700"    },
  logout:   { bg: "bg-slate-100",   text: "text-slate-600"  },
  creer:    { bg: "bg-emerald-100", text: "text-emerald-700"},
  modifier: { bg: "bg-amber-100",   text: "text-amber-700"  },
  supprimer:{ bg: "bg-red-100",     text: "text-red-700"    },
  valider:  { bg: "bg-emerald-100", text: "text-emerald-700"},
  activer:  { bg: "bg-emerald-100", text: "text-emerald-700"},
  suspendre:{ bg: "bg-red-100",     text: "text-red-700"    },
  rejeter:  { bg: "bg-red-100",     text: "text-red-700"    },
  attribuer:{ bg: "bg-violet-100",  text: "text-violet-700" },
};

const MODULES = [
  { value: "", label: "Tous les modules" },
  { value: "utilisateurs", label: "Utilisateurs" },
  { value: "vendeurs", label: "Vendeurs" },
  { value: "livreurs", label: "Livreurs" },
  { value: "commandes", label: "Commandes" },
  { value: "livraisons", label: "Livraisons" },
  { value: "produits", label: "Produits" },
  { value: "catalogue", label: "Catalogue" },
  { value: "zones", label: "Zones" },
  { value: "litiges", label: "Litiges" },
  { value: "support", label: "Support" },
  { value: "retraits", label: "Retraits" },
  { value: "commissions", label: "Commissions" },
  { value: "marketing", label: "Marketing" },
  { value: "notifications", label: "Notifications" },
  { value: "parametres", label: "Paramètres" },
  { value: "roles", label: "Rôles" },
  { value: "administration", label: "Administration" },
  { value: "rapports", label: "Rapports" },
];

function getActionStyle(action: string) {
  const key = Object.keys(ACTION_COLOR).find((k) => action.toLowerCase().includes(k));
  return key ? ACTION_COLOR[key] : { bg: "bg-slate-100", text: "text-slate-600" };
}

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [module, setModule] = useState("");
  const [action, setAction] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-logs", page, module, action, dateDebut, dateFin],
    queryFn: async () => {
      const qs = buildQuery({ page, module, action, date_debut: dateDebut, date_fin: dateFin, per_page: 5 });
      return (await api.get<ApiEnvelope<PaginatedData<LogActivite>>>(`/super-admin/logs${qs}`)).data;
    },
  });

  function onFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setAction(actionInput.trim());
  }

  function resetFilters() {
    setModule(""); setAction(""); setActionInput(""); setDateDebut(""); setDateFin(""); setPage(1);
  }

  const items = data?.data ?? [];
  const hasFilters = module || action || dateDebut || dateFin;

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Journaux d'audit"
        description="Historique complet des actions effectuées sur la plateforme — Super Administrateur."
        icon={ScrollText}
        action={<HeaderStat icon={ScrollText} label={`${data?.total ?? "—"} entrées`} tone="slate" />}
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-3 surface-card rounded-2xl p-4">
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-400">Module</label>
          <select value={module} onChange={(e) => { setPage(1); setModule(e.target.value); }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-[#1A2E5A] focus:outline-none">
            {MODULES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-400">Du</label>
          <input type="date" value={dateDebut} onChange={(e) => { setPage(1); setDateDebut(e.target.value); }}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-[#1A2E5A] focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-400">Au</label>
          <input type="date" value={dateFin} onChange={(e) => { setPage(1); setDateFin(e.target.value); }}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-[#1A2E5A] focus:outline-none" />
        </div>
        <form onSubmit={onFilterSubmit} className="flex items-end gap-2 flex-1">
          <div className="flex-1 max-w-xs">
            <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-400">Action</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="Ex : suspendre, valider…"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm font-bold text-slate-700 placeholder-slate-400 focus:border-[#1A2E5A] focus:outline-none"
              />
            </div>
          </div>
          <button type="submit"
            className="rounded-xl bg-[#1A2E5A] px-5 py-2.5 text-sm font-black text-white hover:bg-[#0B1A35] transition-colors">
            Filtrer
          </button>
          {hasFilters && (
            <button type="button" onClick={resetFilters}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors">
              Réinitialiser
            </button>
          )}
        </form>
      </div>

      {isLoading && <LoadingBlock />}
      {!isLoading && isError && (
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Accès réservé au super administrateur."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["Utilisateur", "Action", "Adresse IP", "Date & Heure", "Détails"]}
          empty={items.length === 0}
          emptyMessage="Aucun journal d'activité trouvé."
        >
          {items.map((log) => {
            const style = getActionStyle(log.action);
            const isExpanded = expanded === log.id;
            return (
              <Fragment key={log.id}>
                <tr className="row-accent hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    {log.user ? (
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A2E5A] text-xs font-black text-white">
                          {initials(log.user.nom, log.user.prenom)}
                        </span>
                        <div>
                          <p className="text-sm font-black text-slate-800">{fullName(log.user.nom, log.user.prenom)}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{log.user.type_utilisateur}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-slate-400">{log.user_id?.slice(0, 8)}…</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-black ${style.bg} ${style.text}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {log.adresse_ip ? (
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                        <Globe size={13} className="text-slate-400" />
                        {log.adresse_ip}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400 font-medium whitespace-nowrap">
                    {formatDate(log.date_action, true)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {log.details && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : log.id)}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[12.5px] font-black transition-colors ${
                          isExpanded
                            ? "border-[#1A2E5A] bg-[#1A2E5A] text-white"
                            : "border-slate-200 text-slate-500 hover:border-[#1A2E5A] hover:text-[#1A2E5A]"
                        }`}
                      >
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {isExpanded ? "Masquer" : "Détails"}
                      </button>
                    )}
                  </td>
                </tr>

                {isExpanded && log.details && (
                  <tr>
                    <td colSpan={5} className="px-5 py-0">
                      <div className="mb-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-950">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
                          <Monitor size={12} className="text-slate-500" />
                          <span className="text-[11.5px] font-black text-slate-500 uppercase tracking-widest">Payload JSON</span>
                        </div>
                        <pre className="overflow-x-auto px-4 py-3 text-xs text-emerald-400 leading-relaxed">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
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
    </div>
  );
}
