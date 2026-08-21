import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { CartProvider } from "@/components/landing/cart-context";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { CartDrawer } from "@/components/landing/CartDrawer";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { VendeurRedirectGuard } from "@/components/landing/VendeurRedirectGuard";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <VendeurRedirectGuard />
      <div className="flex min-h-screen flex-col bg-[#f0f2f5] font-sans text-slate-800 selection:bg-[#0B2545] selection:text-white">
        <AnnouncementBar />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <CartDrawer />
        <WhatsAppButton />
      </div>
    </CartProvider>
  );
}
