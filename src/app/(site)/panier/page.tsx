"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Minus, Plus, Share2, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/components/landing/cart-context";
import { usePublicAuth } from "@/lib/public-auth-context";
import { useToast } from "@/lib/toast-context";
import { useLanguage } from "@/lib/language-context";
import { ApiError, fetchDeviseEquivalents, shareServerPanier } from "@/lib/api";

const formatFcfa = (value: number) => `${Math.round(value).toLocaleString('fr-FR')} FCFA`;

export default function PanierPage() {
  const { t } = useLanguage();
  const { items, updateQuantity, removeItem, clearCart, totalAmount, count } = useCart();
  const { user } = usePublicAuth();
  const { notify } = useToast();
  const router = useRouter();

  const [equivalents, setEquivalents] = useState<{ eur: number; usd: number } | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.est_diaspora || totalAmount <= 0) { setEquivalents(null); return; }
    fetchDeviseEquivalents(totalAmount).then(setEquivalents).catch(() => setEquivalents(null));
  }, [user?.est_diaspora, totalAmount]);

  const handleCheckout = () => {
    if (!user) {
      notify(t('client.panier.guestPrompt', 'Créez un compte ou connectez-vous pour finaliser votre commande.'), "info");
      router.push(`/auth/login?redirect=${encodeURIComponent('/commande/adresse')}`);
      return;
    }
    router.push(user.est_diaspora ? '/commande/diaspora/beneficiaire' : '/commande/adresse');
  };

  const handleShareCart = async () => {
    if (sharing) return;
    setSharing(true);
    setShareUrl(null);
    try {
      const { token } = await shareServerPanier(items);
      setShareUrl(`${window.location.origin}/panier/partage/${token}`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : t('client.panier.shareError', 'Impossible de partager ce panier pour le moment.'), "error");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = shareUrl ? `Voici le panier que je souhaite vous envoyer via Zando na Ndako (${formatFcfa(totalAmount)}) : ${shareUrl}` : '';

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-16 flex-1 text-center">
        <ShoppingBag className="h-14 w-14 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-black text-slate-900">{t('client.panier.emptyTitle', 'Votre panier est vide')}</h1>
        <p className="text-sm text-slate-500 mt-2">{t('client.panier.emptySub', 'Ajoutez des produits pour commencer.')}</p>
        <Link href="/categories" className="inline-flex items-center gap-2 mt-6 rounded-full bg-[#0B2545] px-6 py-2.5 text-xs font-extrabold text-white hover:bg-[#061830] transition-colors">
          <ShoppingCart className="h-4 w-4" /> {t('client.panier.discoverProducts', 'Découvrir nos produits')}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t('client.panier.title', 'Mon panier')} ({count})</h1>
        <button onClick={clearCart} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer">
          <Trash2 className="h-3.5 w-3.5" /> {t('client.panier.clear', 'Vider')}
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white">
            <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover border border-slate-100 shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-slate-900 truncate">{item.name}</h3>
              <p className="text-xs font-extrabold text-[#0B2545] mt-0.5">{item.price} <span className="text-slate-400 font-normal">/ {item.unit}</span></p>
            </div>
            <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-xl px-2 py-1.5 shrink-0">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-0.5 text-slate-500 hover:text-slate-900 cursor-pointer" aria-label={t('client.panier.decreaseAria', 'Diminuer')}>
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-black text-slate-900 w-5 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-0.5 text-slate-500 hover:text-slate-900 cursor-pointer" aria-label={t('client.panier.increaseAria', 'Augmenter')}>
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button onClick={() => removeItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0" aria-label={t('client.panier.removeAria', 'Supprimer')}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl border border-slate-200 bg-white mb-4">
        <p className="text-sm font-black text-slate-900 mb-3">{t('client.panier.summary', 'Résumé')}</p>
        <div className="flex justify-between text-sm text-slate-500 font-medium mb-1.5">
          <span>{t('client.panier.subtotalPrefix', 'Sous-total')} ({count} {t('client.panier.articlesSuffix', 'article(s)')})</span>
          <span>{formatFcfa(totalAmount)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-400 font-semibold mb-3">
          <span>{t('client.panier.deliveryFee', 'Frais de livraison')}</span>
          <span>{t('client.panier.deliveryFeeComputed', "Calculés à l'étape suivante")}</span>
        </div>
        <div className="flex justify-between items-start pt-3 border-t border-slate-100">
          <span className="text-sm font-black text-slate-900">{t('client.panier.total', 'Total à payer')}</span>
          <div className="text-right">
            <span className="text-lg font-black text-[#0B2545]">{formatFcfa(totalAmount)}</span>
            {equivalents && (
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                ≈ {equivalents.eur.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} € · ≈ {equivalents.usd.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} $
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 mb-4 text-center">
        <p className="text-xs font-bold text-[#0B2545]">{t('client.panier.deliveryNote', '🛵 Livraison en 30–60 min · Zone : Brazzaville uniquement')}</p>
      </div>

      {user?.est_diaspora && (
        <div className="mb-4">
          <button
            onClick={handleShareCart}
            disabled={sharing}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#0B2545] hover:bg-slate-50 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            {sharing ? t('client.panier.sharing', 'Partage en cours…') : t('client.panier.shareCart', 'Partager ce panier avec le bénéficiaire')}
          </button>

          {shareUrl && (
            <div className="mt-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
              <p className="text-[11px] font-semibold text-slate-600 break-all">{shareUrl}</p>
              <div className="flex gap-2">
                <button onClick={handleCopyLink} className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t('client.panier.copied', 'Copié !') : t('client.panier.copyLink', 'Copier le lien')}
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors">
                  WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleCheckout}
        className="w-full h-13 rounded-xl bg-[#e01313] hover:bg-[#c00000] text-white font-extrabold text-sm shadow-lg shadow-[#e01313]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <ShoppingCart className="h-4 w-4" />
        {user?.est_diaspora ? t('client.panier.checkoutDiaspora', 'Commander pour un proche') : t('client.panier.checkoutSelf', 'Commander maintenant')}
      </button>
    </main>
  );
}
