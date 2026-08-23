import { Fish, Beef, Carrot, Shirt, Gift, ShoppingBasket, Store, type LucideIcon } from "lucide-react";

// Icône de repli par type de boutique, tant qu'aucun admin n'a envoyé de vrai logo pour ce type
// (voir /admin/types-boutique) — mise en correspondance par mot-clé sur le libellé français, même
// logique que deriveStoreEmoji() côté mobile (mobile/src/contexts/vendor-context.tsx), pour que les
// deux plateformes restent visuellement cohérentes.
export function deriveTypeBoutiqueIcon(type: string): LucideIcon {
  const t = type.toLowerCase();
  if (t.includes("poisson")) return Fish;
  if (t.includes("bouch") || t.includes("charcut")) return Beef;
  if (t.includes("maraîch") || t.includes("maraich") || t.includes("fruit") || t.includes("légume") || t.includes("legume")) return Carrot;
  if (t.includes("mode") || t.includes("habill")) return Shirt;
  if (t.includes("artisan")) return Gift;
  if (t.includes("épic") || t.includes("epic") || t.includes("aliment")) return ShoppingBasket;
  return Store;
}
