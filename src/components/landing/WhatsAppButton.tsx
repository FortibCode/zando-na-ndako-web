"use client";

import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function WhatsAppButton() {
  const { t } = useLanguage();
  return (
    <a
      href="https://wa.me/242066454321?text=Bonjour%20Zando%20na%20Ndako%2C%20je%20souhaite%20commander%20des%20produits%20frais."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-emerald-600 px-4 py-3 text-white font-extrabold shadow-2xl transition-all duration-300 hover:bg-emerald-700 hover:scale-110 active:scale-95 group cursor-pointer border-2 border-white/20 animate-pulse-glow"
      aria-label={t('client.whatsapp.ariaLabel', 'Commander par WhatsApp')}
    >
      <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-12" />
      <span className="hidden sm:inline text-xs font-black tracking-wide">{t('client.whatsapp.label', 'Commander via WhatsApp')}</span>
    </a>
  );
}
