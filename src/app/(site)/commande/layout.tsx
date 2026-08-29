"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { usePublicAuth } from "@/lib/public-auth-context";
import { CheckoutProvider } from "@/lib/checkout-context";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const { user, isReady, isLoggingOut } = usePublicAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isReady && !user && !isLoggingOut.current) router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
  }, [isReady, user, router, pathname, isLoggingOut]);

  if (!isReady || !user) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </main>
    );
  }

  return <CheckoutProvider>{children}</CheckoutProvider>;
}
