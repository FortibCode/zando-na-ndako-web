"use client";

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Minus, PackageX, Plus, ShoppingCart, Store } from 'lucide-react';
import { fetchProduitDetail, resolveMediaUrl, type Produit, ApiError } from '@/lib/api';
import { useCart } from '@/components/landing/cart-context';
import { useFavorites } from '@/lib/favorites';
import { useToast } from '@/lib/toast-context';
import { useLanguage } from '@/lib/language-context';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

function formatFcfa(value: number | string) {
  return `${Number(value).toLocaleString('fr-FR')} FCFA`;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLanguage();
  const { id } = use(params);
  const [product, setProduct] = useState<Produit | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not_found'>('loading');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { notify } = useToast();

  useEffect(() => {
    setStatus('loading');
    fetchProduitDetail(id)
      .then((data) => { setProduct(data); setStatus('ready'); })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setStatus('not_found');
        else setStatus('not_found');
      });
  }, [id]);

  if (status === 'loading') {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 my-10 sm:my-14 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="h-80 sm:h-96 rounded-3xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-6 w-2/3 rounded-full bg-slate-200" />
            <div className="h-4 w-1/3 rounded-full bg-slate-200" />
            <div className="h-24 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (status === 'not_found' || !product) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 my-16 flex-1 text-center">
        <PackageX className="h-14 w-14 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-black text-slate-900">{t('client.produitDetail.notFoundTitle', 'Produit introuvable')}</h1>
        <p className="text-sm text-slate-500 mt-2">{t('client.produitDetail.notFoundDesc', "Ce produit n'existe pas ou n'est plus disponible.")}</p>
        <Link href="/categories" className="inline-flex items-center gap-2 mt-6 rounded-full bg-[#0B2545] px-6 py-2.5 text-xs font-extrabold text-white hover:bg-[#061830] transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t('client.produitDetail.backToCatalog', 'Retour au catalogue')}
        </Link>
      </main>
    );
  }

  const image = resolveMediaUrl(product.photo_produit) || FALLBACK_IMAGE;
  const priceValue = Number(product.prix_unitaire);
  const outOfStock = product.statut_disponibilite === 'rupture' || product.quantite_stock <= 0;
  const fav = isFavorite(product.id);

  const handleAdd = () => {
    if (outOfStock) return;
    setIsAdding(true);
    addItem(
      {
        id: product.id,
        name: product.nom_produit,
        price: formatFcfa(priceValue),
        priceValue,
        unit: product.unite_mesure,
        image,
        vendeurId: product.vendeur_id,
        vendeurName: product.vendeur?.nom_commerce,
      },
      quantity,
    );
    notify(`« ${product.nom_produit} » (x${quantity}) ${t('client.produitDetail.addedToCartSuffix', 'ajouté à votre panier.')}`);
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 my-8 sm:my-14 flex-1">
      <Link href="/categories" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0B2545] transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> {t('client.produitDetail.backToCatalog', 'Retour au catalogue')}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-100 shadow-sm">
          <img src={image} alt={product.nom_produit} className="h-full w-full object-cover" />
          <button
            onClick={() => toggleFavorite(product.id)}
            className={`absolute top-4 right-4 rounded-full p-2.5 backdrop-blur-md transition-all cursor-pointer ${
              fav ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-white/90 text-slate-400 hover:text-red-500'
            }`}
            aria-label={fav ? t('client.produitDetail.removeFavoriteAria', 'Retirer des favoris') : t('client.produitDetail.addFavoriteAria', 'Ajouter aux favoris')}
          >
            <Heart className={`h-5 w-5 ${fav ? 'fill-current' : ''}`} />
          </button>
          {outOfStock && (
            <span className="absolute bottom-4 left-4 rounded-full bg-slate-900/85 text-white text-xs font-bold px-3 py-1.5">
              {t('client.produitDetail.outOfStockBadge', 'Rupture de stock')}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          {product.categorie && (
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c00000]">
              {product.categorie.nom_categorie}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{product.nom_produit}</h1>

          {product.vendeur && (
            <Link href={`/boutique/${product.vendeur_id}`} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-2 hover:text-[#0B2545] transition-colors w-fit">
              <Store className="h-3.5 w-3.5" /> {product.vendeur.nom_commerce}
            </Link>
          )}

          <p className="text-2xl font-black text-[#c00000] mt-4">
            {formatFcfa(priceValue)} <span className="text-sm font-normal text-slate-400">/ {product.unite_mesure}</span>
          </p>

          {product.description && (
            <p className="text-sm text-slate-600 leading-relaxed mt-4">{product.description}</p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xs hover:bg-slate-100 transition-all cursor-pointer"
                aria-label={t('client.produitDetail.decreaseAria', 'Diminuer la quantité')}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-black text-slate-900 w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xs hover:bg-slate-100 transition-all cursor-pointer"
                aria-label={t('client.produitDetail.increaseAria', 'Augmenter la quantité')}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#0B2545] py-3 text-sm font-black text-white transition-all duration-300 hover:bg-[#061830] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                isAdding ? 'scale-95 bg-emerald-700' : ''
              }`}
            >
              <span>{outOfStock ? t('client.produitDetail.unavailable', 'Indisponible') : isAdding ? t('client.produitDetail.added', 'Ajouté !') : t('client.produitDetail.addToCart', 'Ajouter au panier')}</span>
              {!outOfStock && <ShoppingCart className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
