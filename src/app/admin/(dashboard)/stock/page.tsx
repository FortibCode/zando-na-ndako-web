"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Boxes, AlertTriangle, PackageX, PackageCheck, PenSquare } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { ApiEnvelope, ProduitAdmin, ProduitsAdminData } from "@/lib/types";
import { LoadingBlock, ErrorBlock } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { EtatStockBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { formatDate } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { usePermission } from "@/lib/usePermission";
import { AdminTable, AdminPageHeader, FilterBar, FilterSelect, IconAction, HeaderStat } from "@/components/AdminTable";

const ETATS = [
  { value: "", label: "Tous les états" },
  { value: "disponible", label: "Disponible" },
  { value: "stock_faible", label: "Stock faible" },
  { value: "rupture", label: "Rupture" },
];

function SummaryTile({ icon: Icon, label, value, tone, active, onClick }: {
  icon: typeof Boxes; label: string; value: number; tone: "green" | "gold" | "red"; active: boolean; onClick: () => void;
}) {
  const TONE_CLASSES: Record<string, string> = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    gold: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3.5 rounded-2xl border px-5 py-4 text-left transition-all hover:-translate-y-0.5 ${TONE_CLASSES[tone]} ${active ? "ring-2 ring-offset-1 ring-current" : ""}`}
    >
      <Icon size={20} className="shrink-0" />
      <div>
        <p className="text-xl font-black leading-none">{value}</p>
        <p className="text-xs font-bold uppercase tracking-wide mt-1.5">{label}</p>
      </div>
    </button>
  );
}

export default function StockPage() {
  const { notify, notifyError } = useToast();
  const queryClient = useQueryClient();
  const canEdit = usePermission("edit_produits");

  const [page, setPage] = useState(1);
  const [etatStock, setEtatStock] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [adjustTarget, setAdjustTarget] = useState<ProduitAdmin | null>(null);
  const [adjustValue, setAdjustValue] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-stock", page, etatStock, search],
    queryFn: async () => {
      const qs = buildQuery({ page, etat_stock: etatStock, search });
      const res = await api.get<ApiEnvelope<ProduitsAdminData>>(`/admin/produits${qs}`);
      return res.data;
    },
  });

  const adjustMutation = useMutation({
    mutationFn: () => api.put(`/admin/produits/${adjustTarget!.id}`, { quantite_stock: Number(adjustValue) }),
    onSuccess: () => {
      notify("Stock mis à jour.");
      setAdjustTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-stock"] });
    },
    onError: (err) => notifyError(err, "Impossible de mettre à jour le stock."),
  });

  const items = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <AdminPageHeader
        title="Gestion du stock"
        description="Suivi des niveaux de stock et alertes de rupture, tous vendeurs confondus."
        icon={Boxes}
        action={<HeaderStat icon={Boxes} label={`${data?.total ?? "—"} produits`} tone="navy" />}
      />

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SummaryTile icon={PackageCheck} label="Disponibles" value={data.counts.disponible} tone="green"
            active={etatStock === "disponible"} onClick={() => { setPage(1); setEtatStock(etatStock === "disponible" ? "" : "disponible"); }} />
          <SummaryTile icon={AlertTriangle} label="Stock faible" value={data.counts.stock_faible} tone="gold"
            active={etatStock === "stock_faible"} onClick={() => { setPage(1); setEtatStock(etatStock === "stock_faible" ? "" : "stock_faible"); }} />
          <SummaryTile icon={PackageX} label="En rupture" value={data.counts.rupture} tone="red"
            active={etatStock === "rupture"} onClick={() => { setPage(1); setEtatStock(etatStock === "rupture" ? "" : "rupture"); }} />
        </div>
      )}

      <FilterBar>
        <FilterSelect value={etatStock} onChange={(v) => { setPage(1); setEtatStock(v); }} options={ETATS} />
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}
          className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nom du produit…"
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
        <ErrorBlock message={error instanceof ApiError || error instanceof Error ? error.message : "Impossible de charger le stock."} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <AdminTable
          headers={["Produit", "Vendeur", "Quantité", "Seuil faible", "Dernière MAJ", "Disponibilité", "Actions"]}
          empty={items.length === 0}
          emptyMessage="Aucun produit trouvé."
        >
          {items.map((p) => (
            <tr key={p.id} className="row-accent hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-4">
                <p className="text-sm font-black text-slate-800">{p.nom_produit}</p>
                <p className="text-xs text-slate-400 mt-0.5">{p.unite_mesure}</p>
              </td>
              <td className="px-5 py-4 text-sm font-bold text-slate-600">{p.vendeur?.nom_commerce ?? "—"}</td>
              <td className="px-5 py-4 text-sm font-black text-slate-800">{p.quantite_stock} <span className="text-slate-400 font-medium text-xs">{p.unite_mesure}</span></td>
              <td className="px-5 py-4 text-sm font-semibold text-slate-500">{p.seuil_stock_faible} {p.unite_mesure}</td>
              <td className="px-5 py-4 text-sm text-slate-400 font-medium">{formatDate(p.updated_at, true)}</td>
              <td className="px-5 py-4"><EtatStockBadge value={p.etat_stock} /></td>
              <td className="px-5 py-4">
                <div className="flex justify-end">
                  {canEdit && (
                    <IconAction icon={PenSquare} label="Ajuster le stock" variant="ghost"
                      onClick={() => { setAdjustTarget(p); setAdjustValue(String(p.quantite_stock)); }} />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} total={data.total} from={data.from} to={data.to} onChange={setPage} />}

      {adjustTarget && (
        <Modal
          title="Ajuster le stock"
          onClose={() => setAdjustTarget(null)}
          footer={<>
            <Button variant="ghost" onClick={() => setAdjustTarget(null)} disabled={adjustMutation.isPending}>Annuler</Button>
            <Button variant="secondary" onClick={() => adjustMutation.mutate()} loading={adjustMutation.isPending}>Enregistrer</Button>
          </>}
        >
          <p className="mb-4 text-sm text-slate-600">
            Nouvelle quantité en stock pour <strong>{adjustTarget.nom_produit}</strong> ({adjustTarget.unite_mesure}).
          </p>
          <input type="number" min={0} value={adjustValue} onChange={(e) => setAdjustValue(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:border-[#1A2E5A] focus:outline-none" autoFocus />
        </Modal>
      )}
    </div>
  );
}
