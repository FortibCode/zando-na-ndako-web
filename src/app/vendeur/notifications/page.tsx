"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Package } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { LoadingBlock, EmptyState } from "@/components/Spinner";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead, type UserNotification } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

function timeAgo(dateStr: string, t: (key: string, fallback?: string) => string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t("vendor.notifications.justNow", "à l'instant");
  const agoPrefix = t("vendor.notifications.agoPrefix", "il y a");
  if (minutes < 60) return `${agoPrefix} ${minutes} ${t("vendor.notifications.minUnit", "min")}`.trim();
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${agoPrefix} ${hours} ${t("vendor.notifications.hUnit", "h")}`.trim();
  return `${agoPrefix} ${Math.floor(hours / 24)} ${t("vendor.notifications.dayUnit", "j")}`.trim();
}

export default function VendeurNotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications().then(setNotifications).catch(() => setNotifications([])).finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
    try { await markNotificationRead(id); } catch { /* best-effort */ }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    try { await markAllNotificationsRead(); } catch { /* best-effort */ }
  };

  const unreadCount = notifications.filter((n) => !n.lu).length;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={t("vendor.notifications.title", "Notifications")}
        actions={unreadCount > 0 ? (
          <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B2545] hover:underline cursor-pointer">
            <CheckCheck className="h-4 w-4" /> {t("vendor.notifications.markAllRead", "Tout marquer comme lu")}
          </button>
        ) : undefined}
      />

      {loading ? (
        <LoadingBlock label={t("vendor.notifications.loading", "Chargement…")} />
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <Bell className="h-12 w-12 text-slate-300 mb-3" />
          <EmptyState message={t("vendor.notifications.emptyState", "Aucune notification pour le moment.")} />
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.lu && handleMarkRead(n.id)}
              className={`w-full flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-colors cursor-pointer ${
                n.lu ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/40 hover:bg-blue-50"
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${n.lu ? "bg-slate-100 text-slate-400" : "bg-[#0B2545] text-white"}`}>
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.lu ? "font-semibold text-slate-600" : "font-black text-slate-900"}`}>{n.titre}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.created_at, t)}</p>
              </div>
              {!n.lu && <span className="h-2 w-2 rounded-full bg-[#c00000] mt-1.5 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
