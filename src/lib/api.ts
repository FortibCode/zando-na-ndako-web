import { CATEGORIES, FEATURED_PRODUCTS, type Category, type Product } from '@/components/landing/data';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

const TOKEN_KEY = "zando_token";
const USER_KEY = "zando_user";

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Convertit un chemin de stockage relatif (ex: "photos/produits/xxx.jpg", renvoyé tel quel par
// les modèles Eloquent) en URL absolue vers le disque public Laravel (storage:link).
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const base = API_URL.replace(/\/api\/?$/, "");
  return `${base}/storage/${path.replace(/^\/+/, "")}`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser<T = any>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(token: string, user: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Session des comptes publics (client/vendeur) — stockée sous des clés distinctes de celles de
// l'admin ci-dessus : ce même site sert à la fois le back-office (réservé aux administrateurs) et
// la vitrine publique, un partage des clés localStorage écraserait l'une des deux sessions.
const PUBLIC_TOKEN_KEY = "zando_public_token";
const PUBLIC_USER_KEY = "zando_public_user";

export function getPublicToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PUBLIC_TOKEN_KEY);
}

export function getStoredPublicUser<T = any>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PUBLIC_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setPublicSession(token: string, user: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PUBLIC_TOKEN_KEY, token);
  localStorage.setItem(PUBLIC_USER_KEY, JSON.stringify(user));
}

export function clearPublicSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PUBLIC_TOKEN_KEY);
  localStorage.removeItem(PUBLIC_USER_KEY);
}

export const api = {
  async request<T = any>(
    endpoint: string,
    options: RequestInit & { auth?: boolean } = {}
  ): Promise<T> {
    const { auth = true, headers: customHeaders, ...rest } = options;
    const token = getToken();
    const isFormData = rest.body instanceof FormData;
    const headers: Record<string, string> = {
      // Pour FormData, le navigateur doit fixer lui-même le Content-Type (avec le boundary multipart).
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Accept: "application/json",
      ...(customHeaders as Record<string, string>),
    };

    if (auth && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, { headers, ...rest });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Erreur serveur" }));
      throw new ApiError(err.message || `Erreur ${res.status}`, res.status, err);
    }
    return res.json();
  },

  get<T = any>(endpoint: string, options: RequestInit & { auth?: boolean } = {}) {
    return this.request<T>(endpoint, { method: "GET", ...options });
  },

  post<T = any>(endpoint: string, body?: any, options: RequestInit & { auth?: boolean } = {}) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  put<T = any>(endpoint: string, body?: any, options: RequestInit & { auth?: boolean } = {}) {
    // PHP ne parse pas les corps multipart des requêtes PUT : on repasse en POST avec
    // le spoofing Laravel (_method=PUT) pour que $_FILES soit bien peuplé côté serveur.
    if (body instanceof FormData) {
      body.append("_method", "PUT");
      return this.request<T>(endpoint, { method: "POST", body, ...options });
    }
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  delete<T = any>(endpoint: string, bodyOrOptions?: any, options: RequestInit & { auth?: boolean } = {}) {
    const isOptions = bodyOrOptions && typeof bodyOrOptions === 'object' && ('auth' in bodyOrOptions || 'headers' in bodyOrOptions || 'signal' in bodyOrOptions);
    const opts = isOptions ? bodyOrOptions : options;
    const body = isOptions ? undefined : bodyOrOptions;
    return this.request<T>(endpoint, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
      ...opts,
    });
  },

  // Télécharge un fichier authentifié (export CSV, etc.) — un simple <a href> ne peut pas porter
  // l'en-tête Authorization requis par Sanctum, donc on récupère le blob nous-mêmes.
  async download(endpoint: string, filename: string): Promise<void> {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${endpoint}`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Erreur serveur" }));
      throw new ApiError(err.message || `Erreur ${res.status}`, res.status, err);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

export type DeliveryZone = {
  id: number | string;
  name: string;
  city: string;
  neighborhoods: string[];
  fee: number | string;
  minTime: number;
  maxTime: number;
};

export const DEFAULT_ZONES: DeliveryZone[] = [
  { id: 1, name: 'Brazzaville - Centre & Poto-Poto', city: 'Brazzaville', neighborhoods: ['Poto-Poto', 'Moungali', 'Centre-ville', 'Plateau'], fee: '2 000 FCFA', minTime: 25, maxTime: 45 },
  { id: 2, name: 'Brazzaville - Nord (Ouenzé & Talangaï)', city: 'Brazzaville', neighborhoods: ['Ouenzé', 'Talangaï', 'Ngamaba', 'Mikala'], fee: '2 500 FCFA', minTime: 30, maxTime: 60 },
  { id: 3, name: 'Brazzaville - Sud (Bacongo & Makélékélé)', city: 'Brazzaville', neighborhoods: ['Bacongo', 'Makélékélé', 'Kinsoundi', 'Mfilou'], fee: '2 500 FCFA', minTime: 35, maxTime: 65 },
  { id: 4, name: 'Brazzaville - Est (Djiri & Massengo)', city: 'Brazzaville', neighborhoods: ['Djiri', 'Massengo', 'Nganga-Lingolo'], fee: '3 000 FCFA', minTime: 40, maxTime: 75 },
  { id: 5, name: 'Pointe-Noire - Centre & Port', city: 'Pointe-Noire', neighborhoods: ['Loandjili', 'Mvoumvou', 'Tié-Tié'], fee: '3 000 FCFA', minTime: 35, maxTime: 70 },
];

export async function fetchCategoriesFromApi(): Promise<Category[]> {
  try {
    // Appelée uniquement depuis des composants "use client" (Categories, Header...) : l'option
    // Next.js `next: { revalidate }` n'a d'effet que côté serveur et est silencieusement ignorée
    // par le fetch du navigateur — l'API elle-même ne met déjà rien en cache (toujours live).
    const res = await fetch(`${API_URL}/categories`, { cache: "no-store" });
    if (!res.ok) throw new Error('Échec du chargement des catégories API');
    const json = await res.json();
    const data = json.data || json;
    
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: any, idx: number) => ({
        id: String(item.id || idx),
        name: item.nom_categorie || item.name || 'Catégorie',
        // icone est soit une URL externe (données de seed), soit un chemin de stockage relatif
        // (icône uploadée via l'admin) — resolveMediaUrl gère les deux correctement.
        image: resolveMediaUrl(item.icone) || CATEGORIES[idx % CATEGORIES.length].image,
      }));
    }
  } catch {
    console.info('API non disponible pour les catégories, utilisation du fallback enrichi.');
  }
  return CATEGORIES;
}

export async function fetchPopularProductsFromApi(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/produits/populaires`, { cache: "no-store" });
    if (!res.ok) throw new Error('Échec du chargement des produits API');
    const json = await res.json();
    const data = json.data || json;

    if (Array.isArray(data) && data.length > 0) {
      return data.slice(0, 4).map((item: any, idx: number) => {
        const fallback = FEATURED_PRODUCTS[idx % FEATURED_PRODUCTS.length];
        const priceValue = item.prix_unitaire != null ? Number(item.prix_unitaire) : fallback.priceValue;
        return {
          id: String(item.id || idx),
          name: item.nom_produit || item.name || 'Produit frais',
          price: item.prix_unitaire ? `${priceValue.toLocaleString('fr-FR')} FCFA` : fallback.price,
          priceValue,
          unit: item.unite_mesure || item.unit || 'pièce',
          // Le champ réel renvoyé par l'API est photo_produit (chemin de stockage relatif), pas
          // image_url/image — sans resolveMediaUrl, la vraie photo du produit n'était jamais utilisée.
          image: resolveMediaUrl(item.photo_produit) || fallback.image,
        };
      });
    }
  } catch {
    console.info('API non disponible pour les produits populaires, utilisation du fallback enrichi.');
  }
  return FEATURED_PRODUCTS;
}

// Injecte le token du COMPTE PUBLIC connecté (pas celui de l'admin) sur un appel authentifié.
// auth:false désactive l'injection automatique du token admin ; l'en-tête Authorization explicite
// ci-dessous le remplace par le bon token, évitant toute collision entre les deux systèmes de session.
function publicAuthOptions(extra?: RequestInit) {
  const token = getPublicToken();
  return {
    auth: false as const,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    ...extra,
  };
}

// ─── Inscription & connexion publiques (client local, client diaspora, vendeur) ───
// Même logique et mêmes endpoints que l'application mobile (voir mobile/src/services/api.ts) —
// c'est la garantie que les deux parcours restent cohérents avec les mêmes règles côté backend.

export interface SignupResult {
  user_id: string;
  telephone: string;
  otp_dev?: string;
}

export interface LocalClientSignupInput {
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: "homme" | "femme";
  email?: string;
  telephone: string;
  mot_de_passe: string;
  ville: string;
  adresse: string;
}

export async function registerLocalClient(input: LocalClientSignupInput): Promise<SignupResult> {
  const res = await api.post<{ success: boolean; message?: string; data: SignupResult }>(
    "/client/local/register",
    {
      ...input,
      // LocalClientController::register() calcule ces champs côté serveur puis délègue à
      // AuthController::register($request) — mais c'est $request (le corps brut envoyé ici) qui
      // est re-validé, pas le tableau calculé. Sans ces champs explicites, la validation de
      // AuthController échoue sur "type_utilisateur" manquant même si LocalClientController
      // pensait l'avoir déjà fourni. Même contournement que côté mobile (services/api.ts).
      type_utilisateur: "client",
      est_diaspora: false,
      pays_residence: "Congo-Brazzaville",
      consentement_cgu: true,
      mot_de_passe_confirmation: input.mot_de_passe,
    },
    { auth: false },
  );
  return res.data;
}

export interface DiasporaClientSignupInput {
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: "homme" | "femme";
  email: string;
  telephone: string;
  mot_de_passe: string;
  pays_residence: string;
  adresse: string;
  devise_preferee?: string;
}

export async function registerDiasporaClient(input: DiasporaClientSignupInput): Promise<SignupResult> {
  const res = await api.post<{ success: boolean; message?: string; data: SignupResult }>(
    "/client/diaspora/register",
    {
      ...input,
      type_utilisateur: "client",
      est_diaspora: true,
      consentement_cgu: true,
      mot_de_passe_confirmation: input.mot_de_passe,
    },
    { auth: false },
  );
  return res.data;
}

export interface VendeurSignupInput {
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe?: "homme" | "femme";
  email: string;
  telephone: string;
  mot_de_passe: string;
  ville: string;
  adresse: string;
  nom_commerce?: string;
  categorie_principale?: string;
  zone_id?: string;
}

export async function registerVendeurPublic(input: VendeurSignupInput): Promise<SignupResult> {
  const res = await api.post<{ success: boolean; message?: string; data: SignupResult }>(
    "/register",
    { ...input, type_utilisateur: "vendeur", consentement_cgu: true, mot_de_passe_confirmation: input.mot_de_passe },
    { auth: false },
  );
  return res.data;
}

export async function sendPublicOtp(credential: string, canal: "sms" | "email"): Promise<string> {
  const res = await api.post<{ success: boolean; otp_dev?: string }>(
    "/otp/send",
    { credential, canal },
    { auth: false },
  );
  return res.otp_dev || "";
}

export interface PublicOtpVerifyResult {
  token?: string;
  user?: any;
}

export async function verifyPublicOtp(credential: string, code: string): Promise<PublicOtpVerifyResult> {
  const res = await api.post<{ success: boolean; data?: { token?: string; user?: any } }>(
    "/otp/verify",
    { credential, code },
    { auth: false },
  );
  return { token: res.data?.token, user: res.data?.user };
}

export async function resendPublicOtp(credential: string, canal: "sms" | "email"): Promise<string> {
  const res = await api.post<{ success: boolean; otp_dev?: string }>(
    "/otp/resend",
    { credential, canal },
    { auth: false },
  );
  return res.otp_dev || "";
}

export async function publicLogin(credential: string, motDePasse: string): Promise<{ token: string; user: any }> {
  const res = await api.post<{ success: boolean; data: { token: string; token_type: string; user: any } }>(
    "/login",
    { credential, mot_de_passe: motDePasse },
    { auth: false },
  );
  return { token: res.data.token, user: res.data.user };
}

export interface ZoneOption {
  id: string;
  nom_zone: string;
  ville: string;
  quartiers_couverts?: string[];
  frais_livraison_base: number | string;
  delai_estime_min?: number;
  delai_estime_max?: number;
  statut_actif?: boolean;
}

// Réplique la logique de resolveZoneForAddress/resolveZoneForQuartier du mobile
// (client-context.tsx) : une zone couvre une adresse si son quartier apparaît dans
// quartiers_couverts, avec repli sur la première zone de la même ville, puis sur la
// toute première zone active si rien ne correspond.
export function resolveZoneForQuartier(zones: ZoneOption[], quartier: string | undefined, ville?: string): ZoneOption | null {
  if (zones.length === 0) return null;
  const q = (quartier || '').trim().toLowerCase();
  if (q) {
    const exact = zones.find((z) => (z.quartiers_couverts || []).some((n) => n.toLowerCase() === q));
    if (exact) return exact;
  }
  if (ville) {
    const sameCity = zones.find((z) => z.ville.toLowerCase() === ville.toLowerCase());
    if (sameCity) return sameCity;
  }
  return zones[0];
}

export async function fetchZonesRaw(): Promise<ZoneOption[]> {
  const res = await api.get<{ success: boolean; data: ZoneOption[] }>("/zones", { auth: false });
  return res.data;
}

// Nécessite le token du COMPTE PUBLIC connecté (pas celui de l'admin) — auth:false désactive
// l'injection automatique du token admin, et l'en-tête Authorization explicite ci-dessous la
// remplace par le bon token, appelé uniquement une fois le vendeur inscrit et connecté.
export async function uploadVendeurDocumentsPublic(docs: {
  photo_boutique?: File;
  document_identite?: File;
  registre_commerce?: File;
}): Promise<void> {
  const form = new FormData();
  if (docs.photo_boutique) form.append("photo_boutique", docs.photo_boutique);
  if (docs.document_identite) form.append("document_identite", docs.document_identite);
  if (docs.registre_commerce) form.append("registre_commerce", docs.registre_commerce);

  const token = getPublicToken();
  await api.post<{ success: boolean; message?: string }>("/vendeur/documents", form, {
    auth: false,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function fetchDeliveryZonesFromApi(): Promise<DeliveryZone[]> {
  try {
    const res = await fetch(`${API_URL}/zones`, { cache: "no-store" });
    if (!res.ok) throw new Error('Échec du chargement des zones API');
    const json = await res.json();
    const data = json.data || json;

    if (Array.isArray(data) && data.length > 0) {
      return data.map((z: any) => ({
        id: z.id,
        name: z.nom_zone || 'Zone de livraison',
        city: z.ville || 'Brazzaville',
        neighborhoods: Array.isArray(z.quartiers_couverts) ? z.quartiers_couverts : ['Centre-ville'],
        fee: z.frais_livraison_base ? `${z.frais_livraison_base} FCFA` : '2,50 $',
        minTime: z.delai_estime_min || 30,
        maxTime: z.delai_estime_max || 60,
      }));
    }
  } catch {
    console.info('API non disponible pour les zones, utilisation des zones par défaut.');
  }
  return DEFAULT_ZONES;
}

// ─── Catalogue produits (espace client) ───
// Même shape que ApiProduit côté mobile (mobile/src/services/api.ts) — un seul modèle de données
// pour les deux plateformes.
export interface Produit {
  id: string;
  categorie_id: string;
  vendeur_id: string;
  nom_produit: string;
  description: string | null;
  prix_unitaire: string | number;
  unite_mesure: string;
  quantite_stock: number;
  statut_disponibilite: "disponible" | "rupture";
  photo_produit: string | null;
  type_fraicheur: "frais" | "fume" | "congele" | null;
  categorie?: { id: string; nom_categorie: string } | null;
  vendeur?: { id: string; nom_commerce: string; note_moyenne?: number | null } | null;
  promotions?: { id: string; titre: string; type_reduction: string; valeur_reduction: string | number }[];
}

export async function fetchProduits(params?: { categorie?: string; search?: string; prix_min?: number; prix_max?: number }): Promise<Produit[]> {
  const qs = new URLSearchParams();
  if (params?.categorie) qs.set("categorie", params.categorie);
  if (params?.search) qs.set("search", params.search);
  if (params?.prix_min != null) qs.set("prix_min", String(params.prix_min));
  if (params?.prix_max != null) qs.set("prix_max", String(params.prix_max));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await api.get<{ success: boolean; data: { data: Produit[] } | Produit[] }>(`/produits${suffix}`, { auth: false });
  const data = res.data as any;
  return Array.isArray(data) ? data : data.data || [];
}

export async function fetchProduitsPromotions(): Promise<Produit[]> {
  const res = await api.get<{ success: boolean; data: Produit[] }>("/produits/promotions", { auth: false });
  return res.data;
}

export async function searchProduits(query: string): Promise<Produit[]> {
  const res = await api.get<{ success: boolean; data: Produit[] }>(`/produits/search?q=${encodeURIComponent(query)}`, { auth: false });
  return res.data;
}

export async function fetchProduitDetail(id: string): Promise<Produit> {
  const res = await api.get<{ success: boolean; data: Produit }>(`/produits/${id}`, { auth: false });
  return res.data;
}

// Recompose le nom complet à partir de prenom/nom — nom_complet est un accessor Eloquent jamais
// inclus dans le JSON d'une relation imbriquée (voir VendeurCommande.client/livreur).
export function fullName(user?: { nom?: string; prenom?: string } | null): string {
  if (!user) return "";
  return [user.prenom, user.nom].filter(Boolean).join(" ");
}

const PRODUCT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

// Formatte la réduction d'une promotion en badge lisible ("-20%" ou "-500 FCFA") — même logique
// que discountLabel() côté mobile (mobile/src/app/client/promo.tsx), pour un affichage identique.
export function discountLabel(promo: NonNullable<Produit['promotions']>[number]): string {
  const valeur = typeof promo.valeur_reduction === 'string' ? parseFloat(promo.valeur_reduction) : promo.valeur_reduction;
  return promo.type_reduction === 'pourcentage' ? `-${valeur}%` : `-${valeur.toLocaleString('fr-FR')} FCFA`;
}

// Adapte un Produit (shape API brute) vers le Product d'affichage utilisé par ProductCard/le
// panier (prix déjà formaté en FCFA + valeur numérique, image résolue).
export function produitToDisplayProduct(p: Produit) {
  const priceValue = Number(p.prix_unitaire) || 0;
  return {
    id: p.id,
    name: p.nom_produit,
    price: `${priceValue.toLocaleString('fr-FR')} FCFA`,
    priceValue,
    unit: p.unite_mesure,
    image: resolveMediaUrl(p.photo_produit) || PRODUCT_FALLBACK_IMAGE,
  };
}

// ─── Carnet d'adresses (client local) ───
export interface DeliveryAddress {
  id: string;
  label: string;
  adresse: string;
  quartier?: string | null;
  ville: string;
  coordonnees_gps?: { lat: number; lng: number } | null;
  est_defaut: boolean;
}

export type DeliveryAddressInput = Omit<DeliveryAddress, "id" | "est_defaut">;

export async function fetchAddresses(): Promise<DeliveryAddress[]> {
  const res = await api.get<{ success: boolean; data: DeliveryAddress[] }>("/client/adresses", publicAuthOptions());
  return res.data;
}

export async function createAddress(input: DeliveryAddressInput): Promise<DeliveryAddress> {
  const res = await api.post<{ success: boolean; data: DeliveryAddress }>("/client/adresses", input, publicAuthOptions());
  return res.data;
}

export async function updateAddress(id: string, input: DeliveryAddressInput): Promise<DeliveryAddress> {
  const res = await api.put<{ success: boolean; data: DeliveryAddress }>(`/client/adresses/${id}`, input, publicAuthOptions());
  return res.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/client/adresses/${id}`, publicAuthOptions());
}

export async function setDefaultAddress(id: string): Promise<void> {
  await api.post(`/client/adresses/${id}/default`, undefined, publicAuthOptions());
}

// ─── Panier serveur (synchronisé uniquement au moment de la commande) ───
// Le panier "de travail" reste local (voir cart-context.tsx), exactement comme sur mobile : il
// n'est poussé côté serveur qu'au moment de passer commande (viderPanier + N×ajouterAuPanier),
// jamais tenu synchronisé en continu.
export async function ajouterAuPanier(produitId: string, quantite: number): Promise<void> {
  await api.post("/panier/ajouter", { produit_id: produitId, quantite }, publicAuthOptions());
}

export async function viderPanier(): Promise<void> {
  await api.delete("/panier/vider", publicAuthOptions());
}

export async function assignerBeneficiairePanier(beneficiaireId: string): Promise<void> {
  await api.post(`/panier/beneficiaire/${beneficiaireId}`, undefined, publicAuthOptions());
}

// ─── Commandes ───
export interface CommandeInput {
  adresse_livraison: string;
  adresse_livraison_id?: string;
  zone_id: string;
  creneau_livraison_debut: string;
  creneau_livraison_fin: string;
  beneficiaire_id?: string;
  coordonnees_gps?: { lat: number; lng: number };
}

export interface CommandeResult {
  commande_id: string;
  numero_commande: string;
  montant_total: number;
  devise: string;
  statut: string;
}

export interface ApiCommandeLigne {
  id: string;
  produit_id: string;
  quantite: number;
  prix_unitaire: number | string;
  produit?: Produit;
}

export interface ApiCommande {
  id: string;
  numero_commande: string;
  statut_commande: string;
  montant_total: number | string;
  frais_livraison: number | string;
  adresse_livraison: string;
  creneau_livraison_debut?: string;
  creneau_livraison_fin?: string;
  created_at: string;
  lignes?: ApiCommandeLigne[];
  litige?: { id: string } | null;
  vendeur_id?: string | null;
  livreur_id?: string | null;
}

export interface ApiCommandeSuivi {
  statut_commande: string;
  etapes: { code: string; label: string; fait: boolean }[];
  destination?: { lat: number; lng: number } | null;
  derniere_position?: { lat: number; lng: number } | null;
  // CommandeController::suivi() renvoie la clé 'nom' (déjà le nom complet concaténé côté
  // serveur via l'accessor), pas 'nom_complet'.
  livreur?: { nom: string; telephone: string | null } | null;
}

export async function validerCommande(input: CommandeInput): Promise<CommandeResult> {
  const res = await api.post<{ success: boolean; data: CommandeResult }>("/commandes/valider", input, publicAuthOptions());
  return res.data;
}

export async function fetchClientCommandes(statut?: string): Promise<ApiCommande[]> {
  const suffix = statut ? `?statut=${encodeURIComponent(statut)}` : "";
  // GET /commandes pagine sa réponse (Commande::paginate(15)) — res.data est donc l'enveloppe
  // {current_page, data: [...], ...}, pas directement le tableau.
  const res = await api.get<{ success: boolean; data: { data: ApiCommande[] } | ApiCommande[] }>(`/commandes${suffix}`, publicAuthOptions());
  const payload = res.data as any;
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function fetchClientCommandeDetail(id: string): Promise<ApiCommande> {
  const res = await api.get<{ success: boolean; data: ApiCommande }>(`/commandes/${id}`, publicAuthOptions());
  return res.data;
}

export async function fetchClientCommandeSuivi(id: string): Promise<ApiCommandeSuivi> {
  const res = await api.get<{ success: boolean; data: ApiCommandeSuivi }>(`/commandes/${id}/suivi`, publicAuthOptions());
  return res.data;
}

export async function annulerClientCommande(id: string, motif: string): Promise<void> {
  await api.post(`/commandes/${id}/annuler`, { motif }, publicAuthOptions());
}

// ─── Paiement ───
export interface ApiPaiement {
  id: string;
  commande_id: string;
  methode: string;
  montant: number | string;
  devise: string;
  statut: string;
}

export async function confirmerPaiementLivraison(commandeId: string): Promise<ApiPaiement> {
  const res = await api.post<{ success: boolean; data: ApiPaiement }>("/payment/livraison/confirm", { commande_id: commandeId }, publicAuthOptions());
  return res.data;
}

export async function initierCarteLocale(commandeId: string): Promise<ApiPaiement> {
  const res = await api.post<{ success: boolean; data: ApiPaiement }>("/payment/carte-locale/init", { commande_id: commandeId }, publicAuthOptions());
  return res.data;
}

export async function confirmerCarteLocale(paiementId: string, reference: string): Promise<void> {
  await api.post("/payment/carte-locale/confirm", { paiement_id: paiementId, reference }, publicAuthOptions());
}

export async function initierMtnMoMo(commandeId: string): Promise<ApiPaiement> {
  const res = await api.post<{ success: boolean; data: ApiPaiement }>("/payment/mtn-momo/init", { commande_id: commandeId }, publicAuthOptions());
  return res.data;
}

export async function confirmerMtnMoMo(paiementId: string, reference: string): Promise<void> {
  await api.post("/payment/mtn-momo/confirm", { paiement_id: paiementId, reference }, publicAuthOptions());
}

export async function initierAirtelMoney(commandeId: string): Promise<ApiPaiement> {
  const res = await api.post<{ success: boolean; data: ApiPaiement }>("/payment/airtel-money/init", { commande_id: commandeId }, publicAuthOptions());
  return res.data;
}

export async function confirmerAirtelMoney(paiementId: string, reference: string): Promise<void> {
  await api.post("/payment/airtel-money/confirm", { paiement_id: paiementId, reference }, publicAuthOptions());
}

// ─── Profil utilisateur connecté ───
export async function fetchMe<T = any>(): Promise<T> {
  const res = await api.get<{ success: boolean; data: T }>("/user/me", publicAuthOptions());
  return res.data;
}

export async function updateUserProfile<T = any>(input: Record<string, any>): Promise<T> {
  const res = await api.put<{ success: boolean; data: T }>("/user/profile", input, publicAuthOptions());
  return res.data;
}

export async function uploadUserPhotoPublic(photo: File): Promise<string> {
  const form = new FormData();
  form.append("photo", photo);
  // Particularité de cette route : photo_url est à la racine de la réponse, pas sous .data.
  const res = await api.post<{ success: boolean; photo_url: string }>("/user/upload-photo", form, publicAuthOptions());
  return res.photo_url;
}

// Les champs attendus par UserController::changePassword() sont ancien_mot_de_passe /
// nouveau_mot_de_passe(_confirmation) — pas mot_de_passe_actuel/mot_de_passe, jamais vérifié en
// conditions réelles jusqu'ici. Le backend révoque aussi tous les tokens de l'utilisateur en cas
// de succès (déconnexion forcée partout), il faut donc reconnecter l'utilisateur après coup.
export async function changePassword(input: { ancienMotDePasse: string; nouveauMotDePasse: string }): Promise<void> {
  await api.post("/user/change-password", {
    ancien_mot_de_passe: input.ancienMotDePasse,
    nouveau_mot_de_passe: input.nouveauMotDePasse,
    nouveau_mot_de_passe_confirmation: input.nouveauMotDePasse,
  }, publicAuthOptions());
}

// ─── Notifications ───
export interface UserNotification {
  id: string;
  titre: string;
  message: string;
  type: string;
  lu: boolean;
  created_at: string;
}

export async function fetchNotifications(): Promise<UserNotification[]> {
  // Paginée côté backend (paginate(20)) — même enveloppe que fetchClientCommandes.
  const res = await api.get<{ success: boolean; data: { data: UserNotification[] } | UserNotification[] }>("/user/notifications", publicAuthOptions());
  const payload = res.data as any;
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.post(`/user/notifications/${id}/lire`, undefined, publicAuthOptions());
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post("/user/notifications/lire-tout", undefined, publicAuthOptions());
}

// Déballe l'enveloppe de pagination Laravel ({data: {data: [...]}}) si présente, sinon renvoie
// le tableau tel quel — mêmes endpoints paginés que fetchClientCommandes/fetchNotifications.
function unwrapPaginated<T>(payload: T[] | { data: T[] }): T[] {
  const p = payload as any;
  return Array.isArray(p) ? p : p?.data || [];
}

// ─── Espace vendeur ───
export interface VendeurDashboard {
  nom_commerce: string;
  solde_disponible: number | string;
  note_moyenne: number | string | null;
  statut_validation: string;
  commandes_aujourd_hui: number;
  commandes_en_cours: number;
  commandes_livrees: number;
  total_produits: number;
  produits_disponibles: number;
  produits_rupture: number;
  revenus_mois: number | string;
}

export async function fetchVendeurDashboard(): Promise<VendeurDashboard> {
  const res = await api.get<{ success: boolean; data: VendeurDashboard }>("/vendeur/dashboard", publicAuthOptions());
  return res.data;
}

export async function updateVendeurProfil(input: {
  nom_commerce?: string;
  coordonnees_gps?: { lat: number; lng: number };
  numero_mobile_money_reception?: string;
  horaires_ouverture?: string;
}): Promise<void> {
  await api.put("/vendeur/profil", input, publicAuthOptions());
}

export interface VendeurCommande {
  id: string;
  numero_commande: string;
  statut_commande: string;
  montant_sous_total: number | string;
  montant_total: number | string;
  adresse_livraison: string;
  date_commande: string;
  motif_annulation?: string | null;
  // nom_complet est un accessor Eloquent (prenom . ' ' . nom), jamais inclus dans le JSON d'une
  // relation imbriquée faute de $appends sur le modèle User — nom/prenom sont les vrais champs
  // sérialisés ici, à recomposer côté client.
  client?: { user?: { nom: string; prenom: string; telephone: string } };
  lignes?: ApiCommandeLigne[];
  paiement?: { methode: string; statut: string } | null;
  livreur?: { user?: { nom: string; prenom: string; telephone: string } } | null;
}

export async function fetchVendeurCommandes(statut?: string): Promise<VendeurCommande[]> {
  const suffix = statut ? `?statut=${encodeURIComponent(statut)}` : "";
  const res = await api.get<{ success: boolean; data: { data: VendeurCommande[] } | VendeurCommande[] }>(`/vendeur/commandes${suffix}`, publicAuthOptions());
  return unwrapPaginated(res.data);
}

export async function fetchVendeurCommandeDetail(id: string): Promise<VendeurCommande> {
  const res = await api.get<{ success: boolean; data: VendeurCommande }>(`/vendeur/commandes/${id}`, publicAuthOptions());
  return res.data;
}

export async function accepterVendeurCommande(id: string): Promise<void> {
  await api.post(`/vendeur/commandes/${id}/accepter`, undefined, publicAuthOptions());
}

export async function refuserVendeurCommande(id: string, motif: string): Promise<void> {
  await api.post(`/vendeur/commandes/${id}/refuser`, { motif }, publicAuthOptions());
}

export async function fetchVendeurProduits(): Promise<Produit[]> {
  const res = await api.get<{ success: boolean; data: { data: Produit[] } | Produit[] }>("/vendeur/produits", publicAuthOptions());
  return unwrapPaginated(res.data);
}

export interface VendeurProduitInput {
  nom_produit: string;
  description?: string;
  categorie_id: string;
  prix_unitaire: number;
  unite_mesure: string;
  quantite_stock: number;
  type_fraicheur?: "frais" | "fume" | "congele";
  photo?: File;
}

export async function ajouterVendeurProduit(input: VendeurProduitInput): Promise<Produit> {
  const form = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value as any);
  });
  const res = await api.post<{ success: boolean; data: Produit }>("/vendeur/produits", form, publicAuthOptions());
  return res.data;
}

// modifierProduit ne permet de changer ni la photo ni la catégorie côté backend (validation
// limitée à nom_produit/description/prix_unitaire/unite_mesure/type_fraicheur) — ces deux champs
// ne sont donc volontairement pas éditables depuis le formulaire de modification.
export async function modifierVendeurProduit(id: string, input: Partial<Pick<VendeurProduitInput, "nom_produit" | "description" | "prix_unitaire" | "unite_mesure" | "type_fraicheur">>): Promise<Produit> {
  const res = await api.put<{ success: boolean; data: Produit }>(`/vendeur/produits/${id}`, input, publicAuthOptions());
  return res.data;
}

export async function supprimerVendeurProduit(id: string): Promise<void> {
  await api.delete(`/vendeur/produits/${id}`, publicAuthOptions());
}

export async function gererVendeurStock(id: string, quantite: number, operation: "ajouter" | "definir"): Promise<number> {
  const res = await api.post<{ success: boolean; nouveau_stock: number }>(`/vendeur/produits/${id}/stock`, { quantite, operation }, publicAuthOptions());
  return res.nouveau_stock;
}

export async function signalerVendeurRupture(id: string): Promise<void> {
  await api.post(`/vendeur/produits/${id}/rupture`, undefined, publicAuthOptions());
}

export interface VendeurRevenus {
  solde_disponible: number | string;
  revenus_bruts: number | string;
  commissions: number | string;
  revenus_nets: number | string;
  mois: number;
  annee: number;
  ventes_semaine: { jour: string; montant: number }[];
  produits_plus_vendus: { nom: string; ventes: number }[];
}

export async function fetchVendeurRevenus(mois?: number, annee?: number): Promise<VendeurRevenus> {
  const qs = new URLSearchParams();
  if (mois != null) qs.set("mois", String(mois));
  if (annee != null) qs.set("annee", String(annee));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await api.get<{ success: boolean; data: VendeurRevenus }>(`/vendeur/revenus${suffix}`, publicAuthOptions());
  return res.data;
}

export interface RetraitVendeur {
  id: string;
  montant: number | string;
  methode_retrait: "mtn_momo" | "airtel_money" | "virement";
  numero_reception: string;
  statut: "en_attente" | "valide" | "rejete";
  date_demande: string;
}

export async function demanderVendeurRetrait(input: { montant: number; methode_retrait: RetraitVendeur["methode_retrait"]; numero_reception: string }): Promise<RetraitVendeur> {
  const res = await api.post<{ success: boolean; data: RetraitVendeur }>("/vendeur/retraits", input, publicAuthOptions());
  return res.data;
}

export async function fetchVendeurRetraits(): Promise<RetraitVendeur[]> {
  const res = await api.get<{ success: boolean; data: { data: RetraitVendeur[] } | RetraitVendeur[] }>("/vendeur/retraits", publicAuthOptions());
  return unwrapPaginated(res.data);
}

// ─── Espace diaspora : bénéficiaires, commande pour un proche, conversion de devise ───
export interface Beneficiaire {
  id: string;
  nom: string;
  telephone: string;
  ville?: string | null;
  adresse: string;
  quartier: string;
  relation?: string | null;
  coordonnees_gps?: { lat: number; lng: number } | null;
  instructions?: string | null;
  est_defaut: boolean;
}

export type BeneficiaireInput = Omit<Beneficiaire, "id" | "est_defaut">;

export async function fetchBeneficiaires(): Promise<Beneficiaire[]> {
  const res = await api.get<{ success: boolean; data: Beneficiaire[] }>("/diaspora/beneficiaires", publicAuthOptions());
  return res.data;
}

export async function createBeneficiaire(input: BeneficiaireInput & { est_defaut?: boolean }): Promise<Beneficiaire> {
  const res = await api.post<{ success: boolean; data: Beneficiaire }>("/diaspora/beneficiaires", input, publicAuthOptions());
  return res.data;
}

export async function updateBeneficiaire(id: string, input: Partial<BeneficiaireInput> & { est_defaut?: boolean }): Promise<Beneficiaire> {
  const res = await api.put<{ success: boolean; data: Beneficiaire }>(`/diaspora/beneficiaires/${id}`, input, publicAuthOptions());
  return res.data;
}

export async function deleteBeneficiaire(id: string): Promise<void> {
  await api.delete(`/diaspora/beneficiaires/${id}`, publicAuthOptions());
}

export async function commanderPourProche(input: CommandeInput): Promise<CommandeResult> {
  const res = await api.post<{ success: boolean; data: CommandeResult }>("/diaspora/commander", input, publicAuthOptions());
  return res.data;
}

export interface ConversionDevise {
  montant_source: number;
  devise_source: string;
  montant_converti: number;
  devise_cible: string;
  taux_applique: number;
}

// PUBLIC — convertit TOUJOURS vers FCFA (devise_source -> FCFA), jamais l'inverse. Pour afficher
// un montant FCFA en devise étrangère, inverser le taux (voir formatDeviseEquivalents ci-dessous).
export async function convertirDevise(montant: number, deviseSource: "USD" | "EUR" | "GBP" | "CAD"): Promise<ConversionDevise> {
  const res = await api.post<{ success: boolean; data: ConversionDevise }>("/diaspora/convertir", { montant, devise_source: deviseSource }, { auth: false });
  return res.data;
}

// Peg fixe FCFA/EUR (accord de coopération monétaire, invariable) — même constante que mobile
// (client-context.tsx). Le taux USD est lui dynamique, dérivé de convertirDevise(1, 'USD').
const FCFA_PER_EUR = 655.957;

export async function fetchDeviseEquivalents(montantFcfa: number): Promise<{ eur: number; usd: number }> {
  const eur = montantFcfa / FCFA_PER_EUR;
  try {
    const { taux_applique } = await convertirDevise(1, "USD");
    return { eur, usd: taux_applique > 0 ? montantFcfa / taux_applique : 0 };
  } catch {
    return { eur, usd: 0 };
  }
}

export async function initierPayPal(commandeId: string): Promise<{ url: string; order_id: string | null }> {
  const res = await api.post<{ success: boolean; data: { url: string; order_id: string | null } }>("/payment/paypal/init", { commande_id: commandeId }, publicAuthOptions());
  return res.data;
}

export async function confirmerPayPal(commandeId: string, paypalOrderId: string): Promise<void> {
  await api.post("/payment/paypal/confirm", { commande_id: commandeId, paypal_order_id: paypalOrderId }, publicAuthOptions());
}

export async function initierStripe(commandeId: string): Promise<{ url: string; client_secret: string | null }> {
  const res = await api.post<{ success: boolean; data: { url: string; client_secret: string | null } }>("/payment/stripe/init", { commande_id: commandeId }, publicAuthOptions());
  return res.data;
}

export async function confirmerStripe(commandeId: string, paymentIntentId: string): Promise<void> {
  await api.post("/payment/stripe/confirm", { commande_id: commandeId, payment_intent_id: paymentIntentId }, publicAuthOptions());
}

// ─── Litiges (client, vendeur) ───
export const LITIGE_MOTIFS: { id: string; label: string }[] = [
  { id: "produit_non_recu", label: "Produit non reçu" },
  { id: "produit_incorrect", label: "Produit incorrect" },
  { id: "produit_endommage", label: "Produit endommagé" },
  { id: "produit_non_conforme", label: "Produit non conforme" },
  { id: "article_manquant", label: "Article manquant" },
  { id: "probleme_livraison", label: "Problème de livraison" },
  { id: "probleme_paiement", label: "Problème de paiement" },
  { id: "probleme_remboursement", label: "Problème de remboursement" },
  { id: "autre", label: "Autre" },
];

export interface LitigeDecision {
  id: string;
  decision_type: string;
  reason: string;
  amount: number | string | null;
  currency: string | null;
  created_at: string;
}

export interface LitigeRemboursement {
  id: string;
  montant: number | string;
  devise: string;
  statut: string;
  methode_prevue: string | null;
}

export interface Litige {
  id: string;
  numero: string;
  commande_id: string;
  motif: string;
  description: string;
  statut: string;
  date_ouverture: string;
  date_resolution?: string | null;
  commande?: { numero_commande: string; montant_total: number | string; vendeur?: { nom_commerce: string }; client?: { user?: { nom: string; prenom: string } } };
  plaignant?: { nom: string; prenom: string };
  adminTraitant?: { user?: { nom: string; prenom: string } } | null;
  decisions?: LitigeDecision[];
  remboursements?: LitigeRemboursement[];
}

export async function ouvrirLitige(commandeId: string, motif: string, description: string): Promise<Litige> {
  const res = await api.post<{ success: boolean; data: Litige }>(`/commandes/${commandeId}/litige`, { motif, description }, publicAuthOptions());
  return res.data;
}

// ─── Notations/avis (client note vendeur/livreur, vendeur ou livreur note le client) ───
export interface ApiNotation {
  id: string;
  commande_id: string;
  type_notateur: "client" | "vendeur" | "livreur";
  type_cible: "client" | "vendeur" | "livreur";
  note: number;
  commentaire: string | null;
}

export async function fetchCommandeNotations(commandeId: string): Promise<ApiNotation[]> {
  const res = await api.get<{ success: boolean; data: ApiNotation[] }>(`/commandes/${commandeId}/notations`, publicAuthOptions());
  return res.data;
}

export async function soumettreNotation(commandeId: string, input: { note: number; commentaire?: string; cible?: "vendeur" | "livreur" }): Promise<void> {
  await api.post(`/commandes/${commandeId}/notation`, input, publicAuthOptions());
}

export interface VendeurAvis {
  note_moyenne: number;
  nombre_avis: number;
  avis: { id: string; note: number; commentaire: string | null; date_notation: string; numero_commande: string | null; client: { nom: string; photo: string | null } | null }[];
}

export async function fetchVendeurAvis(): Promise<VendeurAvis> {
  const res = await api.get<{ success: boolean; data: VendeurAvis }>("/vendeur/avis", publicAuthOptions());
  return res.data;
}

export async function fetchClientLitiges(statut?: string): Promise<Litige[]> {
  const suffix = statut ? `?statut=${encodeURIComponent(statut)}` : "";
  const res = await api.get<{ success: boolean; data: { data: Litige[] } | Litige[] }>(`/client/litiges${suffix}`, publicAuthOptions());
  return unwrapPaginated(res.data);
}

export async function fetchClientLitigeDetail(id: string): Promise<Litige> {
  const res = await api.get<{ success: boolean; data: Litige }>(`/client/litiges/${id}`, publicAuthOptions());
  return res.data;
}

export async function fetchVendeurLitiges(statut?: string): Promise<Litige[]> {
  const suffix = statut ? `?statut=${encodeURIComponent(statut)}` : "";
  const res = await api.get<{ success: boolean; data: { data: Litige[] } | Litige[] }>(`/vendeur/litiges${suffix}`, publicAuthOptions());
  return unwrapPaginated(res.data);
}

export async function fetchVendeurLitigeDetail(id: string): Promise<Litige> {
  const res = await api.get<{ success: boolean; data: Litige }>(`/vendeur/litiges/${id}`, publicAuthOptions());
  return res.data;
}

export interface LitigePieceJointe {
  id: string;
  file_name: string;
  file_path: string;
  file_type: "image" | "video" | "document";
}

export interface LitigeMessage {
  id: string;
  litige_id: string;
  sender_type: "client" | "vendeur" | "admin";
  message: string;
  est_note_interne: boolean;
  created_at: string;
  user?: { id: string; nom: string; prenom: string; photo_profil: string | null; type_utilisateur: string };
  piecesJointes?: LitigePieceJointe[];
}

export async function fetchLitigeMessages(litigeId: string): Promise<LitigeMessage[]> {
  const res = await api.get<{ success: boolean; data: LitigeMessage[] }>(`/litiges/${litigeId}/messages`, publicAuthOptions());
  return res.data;
}

export async function sendLitigeMessage(litigeId: string, message: string): Promise<LitigeMessage> {
  const res = await api.post<{ success: boolean; data: LitigeMessage }>(`/litiges/${litigeId}/messages`, { message }, publicAuthOptions());
  return res.data;
}

export async function uploadLitigePreuve(litigeId: string, fichier: File, messageId?: string): Promise<LitigePieceJointe> {
  const form = new FormData();
  form.append("fichier", fichier);
  if (messageId) form.append("message_id", messageId);
  const res = await api.post<{ success: boolean; data: LitigePieceJointe }>(`/litiges/${litigeId}/pieces-jointes`, form, publicAuthOptions());
  return res.data;
}

// ─── Partage de panier (diaspora) ───
// sharePanier() opère sur le panier CÔTÉ SERVEUR (/panier/*) — distinct du panier local tenu par
// cart-context.tsx. Comme ce dernier n'est jamais synchronisé avant la commande finale (voir
// [[web_client_interface_build]]), le partager sans synchronisation préalable échouerait presque
// toujours avec "panier vide" (bug latent déjà présent côté mobile, qui se contente d'un repli en
// texte brut) — ici on synchronise réellement le panier local vers le serveur avant de générer le
// lien, pour que le partage fonctionne à chaque fois.
export async function shareServerPanier(items: { id: string; quantity: number }[]): Promise<{ lien: string; token: string }> {
  await viderPanier().catch(() => undefined);
  for (const item of items) {
    await ajouterAuPanier(item.id, item.quantity);
  }
  const res = await api.post<{ success: boolean; lien: string; token: string }>("/panier/partager", undefined, publicAuthOptions());
  return { lien: res.lien, token: res.token };
}

export interface SharedPanierLigne {
  nom_produit: string;
  photo: string | null;
  quantite: number;
  prix_unitaire: number | string;
  sous_total: number | string;
  unite: string;
}

export interface SharedPanier {
  expediteur: string | null;
  beneficiaire: string | null;
  lignes: SharedPanierLigne[];
  sous_total: number | string;
  nombre_articles: number;
}

export async function fetchSharedPanier(token: string): Promise<SharedPanier> {
  const res = await api.get<{ success: boolean; data: SharedPanier }>(`/panier/partage/${token}`, { auth: false });
  return res.data;
}

// ─── Support vendeur ↔ administration ───
export interface VendeurMessage {
  id: string;
  objet: string;
  contenu: string;
  expediteur: "vendeur" | "admin";
  statut_lecture: boolean;
  created_at: string;
  reponses?: VendeurMessage[];
}

export async function fetchVendeurMessages(): Promise<VendeurMessage[]> {
  const res = await api.get<{ success: boolean; data: { data: VendeurMessage[] } | VendeurMessage[] }>("/vendeur/messages", publicAuthOptions());
  return unwrapPaginated(res.data);
}

export async function fetchVendeurMessageDetail(id: string): Promise<VendeurMessage> {
  const res = await api.get<{ success: boolean; data: VendeurMessage }>(`/vendeur/messages/${id}`, publicAuthOptions());
  return res.data;
}

export async function envoyerVendeurMessage(objet: string, contenu: string): Promise<VendeurMessage> {
  const res = await api.post<{ success: boolean; data: VendeurMessage }>("/vendeur/messages", { objet, contenu }, publicAuthOptions());
  return res.data;
}

export async function repondreVendeurMessage(id: string, contenu: string): Promise<VendeurMessage> {
  const res = await api.post<{ success: boolean; data: VendeurMessage }>(`/vendeur/messages/${id}/repondre`, { contenu }, publicAuthOptions());
  return res.data;
}

export async function marquerVendeurMessageLu(id: string): Promise<void> {
  await api.post(`/vendeur/messages/${id}/lu`, undefined, publicAuthOptions());
}
