"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Copy, Loader2, Minus, Plus, Share2, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from './cart-context';
import { usePublicAuth } from '@/lib/public-auth-context';
import { useToast } from '@/lib/toast-context';
import { useLanguage } from '@/lib/language-context';
import { ApiError, fetchDeviseEquivalents, shareServerPanier } from '@/lib/api';

const formatFcfa = (value: number) => `${Math.round(value).toLocaleString('fr-FR')} FCFA`;

export function CartDrawer() {
  const { t } = useLanguage();
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalAmount, count, clearCart } = useCart();
  const { user } = usePublicAuth();
  const { notify } = useToast();
  const router = useRouter();

  const [equivalents, setEquivalents] = useState<{ eur: number; usd: number } | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !user?.est_diaspora || totalAmount <= 0) { setEquivalents(null); return; }
    fetchDeviseEquivalents(totalAmount).then(setEquivalents).catch(() => setEquivalents(null));
  }, [isOpen, user?.est_diaspora, totalAmount]);

  const handleCheckout = () => {
    closeCart();
    if (!user) {
      // Ajouter au panier reste possible sans compte — seule la commande elle-même l'exige,
      // et ce message le dit explicitement plutôt que de rediriger silencieusement vers la connexion.
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

  const whatsappMessage = shareUrl
    ? `Voici le panier que je souhaite vous envoyer via Zando na Ndako (${formatFcfa(totalAmount)}) : ${shareUrl}`
    : '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B2545]/10 text-[#0B2545]">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">{t('client.cartDrawer.title', 'Mon Panier')}</h2>
                <p className="text-[11px] font-semibold text-slate-400">
                  {count} article{count > 1 ? 's' : ''} {t('client.cartDrawer.itemsSelectedSuffix', 'sélectionné(s)')}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label={t('client.cartDrawer.closeAria', 'Fermer le panier')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingBag className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-700">{t('client.cartDrawer.emptyTitle', 'Votre panier est vide')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('client.cartDrawer.emptyDesc', 'Ajoutez des produits frais depuis notre marché.')}</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 rounded-xl object-cover border border-slate-100 bg-white"
                  />

                  <div className="flex-1 leading-tight">
                    <h3 className="text-xs font-black text-slate-900">{item.name}</h3>
                    <p className="text-[11px] font-extrabold text-[#0B2545] mt-0.5">
                      {item.price} <span className="text-slate-400 font-normal">/ {item.unit}</span>
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl px-1.5 py-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-0.5 text-slate-500 hover:text-slate-900 rounded-md transition-colors"
                      aria-label={t('client.cartDrawer.decreaseAria', 'Diminuer la quantité')}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>

                    <span className="text-xs font-black text-slate-900 w-4 text-center">{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-0.5 text-slate-500 hover:text-slate-900 rounded-md transition-colors"
                      aria-label={t('client.cartDrawer.increaseAria', 'Augmenter la quantité')}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    aria-label={t('client.cartDrawer.removeAria', "Supprimer l'article")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Total */}
          {items.length > 0 && (
            <div className="border-t border-slate-100 p-4 sm:p-6 space-y-4 bg-slate-50/60">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>{t('client.cartDrawer.subtotal', 'Sous-total')}</span>
                  <span>{formatFcfa(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>{t('client.cartDrawer.deliveryFee', 'Frais de livraison')}</span>
                  <span className="text-slate-400 font-semibold">{t('client.cartDrawer.deliveryFeeComputed', "Calculés à l'étape suivante")}</span>
                </div>
                <div className="flex justify-between items-start text-sm font-black text-slate-900 pt-2 border-t border-slate-200/80">
                  <span>{t('client.cartDrawer.subtotal', 'Sous-total')}</span>
                  <div className="text-right">
                    <span className="text-[#0B2545]">{formatFcfa(totalAmount)}</span>
                    {equivalents && (
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        ≈ {equivalents.eur.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} € · ≈ {equivalents.usd.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} $
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {user?.est_diaspora && (
                <div>
                  <button
                    onClick={handleShareCart}
                    disabled={sharing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[#0B2545] hover:bg-slate-50 disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {sharing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
                    {sharing ? t('client.cartDrawer.sharing', 'Partage en cours…') : t('client.cartDrawer.shareCart', 'Partager ce panier avec le bénéficiaire')}
                  </button>

                  {shareUrl && (
                    <div className="mt-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
                      <p className="text-[11px] font-semibold text-slate-600 break-all">{shareUrl}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyLink}
                          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          {copied ? t('client.cartDrawer.copied', 'Copié !') : t('client.cartDrawer.copyLink', 'Copier le lien')}
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px] font-bold text-white transition-colors"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="rounded-xl border border-slate-200 px-3 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  {t('client.cartDrawer.clear', 'Vider')}
                </button>

                <button
                  onClick={handleCheckout}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-4 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#061830] transition-colors cursor-pointer"
                >
                  <span>{t('client.cartDrawer.checkout', 'Passer la commande')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
