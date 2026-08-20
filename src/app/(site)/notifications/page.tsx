"use client";

import { useEffect, useState } from "react";
import { Bell, Bike, CheckCheck, Gift, Package, Loader2 } from "lucide-react";
import { useRequirePublicAuth } from "@/lib/use-require-public-auth";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead, type UserNotification } from "@/lib/api";

function iconFor(type: string) {
  if (type === "commande" || type === "livraison") return Bike;
  if (type === "promo") return Gift;
  if (type === "produit") return Package;
  return Bell;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export default function NotificationsPage() {
  const { user, isReady } = useRequirePublicAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications().then(setNotifications).catch(() => setNotifications([])).finally(() => setLoading(false));
  }, [user]);

  if (!isReady || !user) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </main>
    );
  }

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
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B2545] hover:underline cursor-pointer">
            <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <Bell className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">Aucune notification pour le moment</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const Icon = iconFor(n.type);
            return (
              <button
                key={n.id}
                onClick={() => !n.lu && handleMarkRead(n.id)}
                className={`w-full flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-colors cursor-pointer ${
                  n.lu ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/40 hover:bg-blue-50"
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${n.lu ? "bg-slate-100 text-slate-400" : "bg-[#0B2545] text-white"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.lu ? "font-semibold text-slate-600" : "font-black text-slate-900"}`}>{n.titre}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.lu && <span className="h-2 w-2 rounded-full bg-[#c00000] mt-1.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}
