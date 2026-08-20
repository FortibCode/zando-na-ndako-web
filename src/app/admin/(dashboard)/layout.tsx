"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { LoadingBlock } from "@/components/Spinner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/admin/login");
    }
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingBlock label="Vérification de la session…" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="admin-shell-bg flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
