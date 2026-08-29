// Unités de mesure les plus courantes, proposées en suggestions (pas une liste stricte —
// `unite_mesure` reste un simple texte libre côté backend, aucune contrainte à respecter) pour que
// vendeur/admin réutilisent des libellés déjà en usage réel (voir ProduitsSeeder.php) au lieu de
// retaper des variantes de "kg"/"Kg"/"kilo" à chaque produit. Garder alignée avec mobile/src/app/
// vendor/products/add.tsx (UNITES) pour rester cohérent entre les deux plateformes.
export const UNITES_MESURE_SUGGESTIONS = ["kg", "pièce", "litre", "sachet", "boîte", "régime", "sac"];
