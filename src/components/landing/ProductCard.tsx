"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Minus, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import type { Product } from './data';
import { useCart } from './cart-context';
import { useToast } from '@/lib/toast-context';
import { useFavorites } from '@/lib/favorites';
import { useLanguage } from '@/lib/language-context';

export function ProductCard({ product }: { product: Product }) {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const { notify } = useToast();
  const { isFavorite: isFav, toggleFavorite } = useFavorites();
  const isFavorite = isFav(product.id);

  const handleAdd = () => {
    setIsAdding(true);
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    notify(`« ${product.name} » (x${quantity}) ${t('client.productCard.addedToCartSuffix', 'ajouté à votre panier.')}`);
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 card-3d shine-effect shadow-sm hover:shadow-2xl transition-all duration-300 w-full min-h-[360px]">
      {/* Heart Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(product.id);
          notify(
            isFavorite
              ? `« ${product.name} » ${t('client.productCard.removedFromFavoritesSuffix', 'retiré de vos favoris.')}`
              : `« ${product.name} » ${t('client.productCard.addedToFavoritesSuffix', 'ajouté à vos favoris.')}`,
            "info",
          );
        }}
        className={`absolute top-4 right-4 z-10 rounded-full p-2.5 backdrop-blur-md transition-all duration-300 cursor-pointer ${
          isFavorite
            ? 'bg-red-50 text-red-500 scale-110 shadow-sm'
            : 'bg-white/90 text-slate-300 hover:bg-white hover:text-red-500 hover:scale-110'
        }`}
        aria-label={isFavorite ? t('client.productCard.removeFavoriteAria', 'Retirer des favoris') : t('client.productCard.addFavoriteAria', 'Ajouter aux favoris')}
        aria-pressed={isFavorite}
      >
        <Heart className={`h-4.5 w-4.5 transition-transform duration-300 ${isFavorite ? 'scale-110 fill-current' : ''}`} />
      </button>

      <Link href={`/produit/${product.id}`}>
        {/* Enlarged Product Image Container */}
        <div className="relative mb-4 h-36 sm:h-44 w-full overflow-hidden rounded-2xl bg-slate-50 shadow-inner">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Fresh badge overlay */}
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-[#0B2545] shadow-xs opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <Sparkles className="h-3 w-3 text-amber-500" /> {t('client.productCard.freshBadge', 'Produits Frais')}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#0B2545] transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="text-sm sm:text-base font-black text-[#c00000]">
            {product.price} <span className="text-xs font-normal text-slate-400">/ {product.unit}</span>
          </p>
        </div>
      </Link>

      {/* Quantity & Enlarged Action Controls */}
      <div className="mt-4 space-y-2.5">
        {/* Quantity selector */}
        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xs hover:bg-slate-100 active:scale-90 transition-all cursor-pointer font-bold"
            aria-label={t('client.productCard.decreaseAria', 'Diminuer la quantité')}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-black text-slate-900 px-2">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xs hover:bg-slate-100 active:scale-90 transition-all cursor-pointer font-bold"
            aria-label={t('client.productCard.increaseAria', 'Augmenter la quantité')}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAdd}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B2545] py-2.5 sm:py-3 text-xs sm:text-sm font-black text-white transition-all duration-300 hover:bg-[#061830] hover:shadow-xl hover:shadow-[#0B2545]/25 active:scale-95 cursor-pointer ${
            isAdding ? 'scale-95 bg-emerald-700' : ''
          }`}
        >
          <span>{isAdding ? t('client.productCard.added', 'Ajouté !') : t('client.productCard.addToCart', 'Ajouter au panier')}</span>
          <ShoppingCart className={`h-4 w-4 transition-transform duration-300 ${isAdding ? 'translate-x-1 rotate-12 scale-115' : 'group-hover:scale-110'}`} />
        </button>
      </div>
    </div>
  );
}
