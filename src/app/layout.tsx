import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { PublicAuthProvider } from "@/lib/public-auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { QueryProvider } from "@/lib/query-provider";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Zando na Ndako — Le marché vient chez vous",
  description: "Vos produits frais et essentiels, livrés chez vous en toute simplicité et en un temps record.",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={cn("h-full", "font-sans")}>
      <body className="min-h-full bg-background text-foreground antialiased transition-colors duration-300">
        <QueryProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ToastProvider>
                <AuthProvider>
                  <PublicAuthProvider>{children}</PublicAuthProvider>
                </AuthProvider>
              </ToastProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

