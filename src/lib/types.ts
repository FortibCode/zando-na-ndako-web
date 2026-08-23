// Types du domaine, alignés sur les modèles Eloquent réels du backend
// (zando_na_ndako_api/app/Models/*.php et les migrations correspondantes).
// Ne pas ajouter de champ qui n'existe pas réellement côté backend.

export type TypeUtilisateur = "client" | "vendeur" | "livreur" | "administrateur";
export type StatutCompte = "actif" | "suspendu" | "en_attente_validation";
export type StatutValidation = "en_attente" | "valide" | "suspendu";
export type StatutDisponibilite = "disponible" | "indisponible";
export type StatutCommande =
  | "confirmee"
  | "achat_marche"
  | "preparation"
  | "en_route"
  | "en_route_client"
  | "livree"
  | "annulee";
export type ModeAttribution = "auto" | "manuel" | "manuelle";
export type TypeCommande = "locale" | "diaspora";
export type StatutLitige =
  | "ouvert"
  | "attente_vendeur"
  | "attente_client"
  | "en_cours"
  | "escalade"
  | "resolu"
  | "rejete"
  | "annule";
export type MotifLitige =
  | "produit_non_recu"
  | "produit_incorrect"
  | "produit_endommage"
  | "produit_non_conforme"
  | "article_manquant"
  | "probleme_livraison"
  | "probleme_paiement"
  | "probleme_remboursement"
  | "autre";
export type SenderTypeLitige = "client" | "vendeur" | "admin" | "system";
export type DecisionTypeLitige =
  | "acceptee"
  | "rejetee"
  | "remboursement_total"
  | "remboursement_partiel"
  | "remplacement_produit"
  | "retour_produit"
  | "dedommagement_vendeur"
  | "dedommagement_client"
  | "aucune_action";
export type StatutRemboursementLitige = "en_attente" | "en_traitement" | "termine" | "echoue" | "annule";
export type RoleAdmin = "super_admin" | "support" | "finance" | "moderation";
export type TypeVehicule = "moto" | "voiture";

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedData<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface AppUser {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string;
  type_utilisateur: TypeUtilisateur;
  langue_preferee: string;
  statut_compte: StatutCompte;
  photo_profil: string | null;
  date_inscription: string;
  derniere_connexion: string | null;
  devise_preferee: string;
  pays_residence: string | null;
  ville?: string | null;
  adresse?: string | null;
  client?: Client;
  vendeur?: Vendeur;
  livreur?: Livreur;
  administrateur?: Administrateur;
  roles?: RoleUserRow[];
}

export interface LoginUser {
  id: string;
  nom_complet: string;
  email: string | null;
  telephone: string;
  type_utilisateur: TypeUtilisateur;
  statut_compte: StatutCompte;
  photo_profil: string | null;
  devise_preferee: string;
  pays_residence: string | null;
  est_diaspora: boolean | null;
  // Uniquement renseigné pour les comptes administrateur (voir AuthController::login).
  roles: string[];
  administrateur: { role_admin: RoleAdmin; permissions: string[] } | null;
}

export interface Client {
  id: string;
  user_id: string;
  adresse_principale: string | null;
  est_diaspora: boolean;
  coordonnees_gps: unknown;
}

export interface Vendeur {
  id: string;
  user_id: string;
  nom_commerce: string;
  categorie_principale: string;
  zone_id: string | null;
  note_moyenne: string | number;
  statut_validation: StatutValidation;
  solde_disponible: string | number;
  photo_boutique: string | null;
  document_identite: string | null;
  registre_commerce: string | null;
  numero_mobile_money_reception: string | null;
  horaires_ouverture: string | null;
  message_boutique: string | null;
  statut_boutique?: "ouverte" | "pause" | "fermee";
  delai_moyen_preparation: number;
  created_at: string;
  updated_at: string;
  user?: AppUser;
  zone?: ZoneLivraison;
}

// Type de boutique (categorie_principale) géré par un admin (créer/modifier/voir/supprimer) —
// remplace l'ancienne constante Vendeur::TYPES_BOUTIQUE. `logo` vaut null tant qu'aucun admin n'en
// a envoyé un pour ce type ; le frontend retombe alors sur une icône générique.
export interface TypeBoutique {
  id: string;
  type: string;
  logo: string | null;
}

// Motif de litige (litiges.motif) géré par un admin (créer/modifier/voir/supprimer) — remplace
// l'ancienne constante LitigeController::MOTIFS.
export interface LitigeMotifAdmin {
  id: string;
  code: string;
  libelle: string;
}

// Taux de conversion (App\Models\TauxChange) géré par un admin (créer/modifier/voir/supprimer) —
// jusqu'ici seulement peuplé par un seeder, sans aucun contrôle admin.
export interface TauxChangeAdmin {
  id: string;
  devise_source: string;
  devise_cible: string;
  valeur_taux: string | number;
  source_taux: string | null;
  date_maj: string;
}

// Avis/notation (App\Models\NotationAvis) — vue de modération admin (voir/supprimer uniquement,
// jamais créer : un faux avis n'a pas de sens métier).
export interface AvisAdmin {
  id: string;
  note: number;
  commentaire: string | null;
  date_notation: string;
  type_notateur: "client" | "vendeur" | "livreur";
  type_cible: "client" | "vendeur" | "livreur";
  notateur_nom: string;
  cible_nom: string;
  commande_id: string;
}

// Forme allégée renvoyée par l'endpoint public (/vendeurs/types-logos) — pas d'`id`, filtrée aux
// types réellement en usage par une boutique ouverte/validée (voir CatalogueController).
export interface TypeBoutiqueLogo {
  type: string;
  logo: string | null;
}

export interface Livreur {
  id: string;
  user_id: string;
  type_vehicule: TypeVehicule;
  immatriculation_vehicule: string;
  statut_disponibilite: StatutDisponibilite;
  statut_validation: StatutValidation;
  note_moyenne: string | number;
  solde_disponible: string | number;
  document_identite: string | null;
  permis_conduire: string | null;
  numero_mobile_money_reception: string | null;
  created_at: string;
  updated_at: string;
  user?: AppUser;
}

export interface CoordonneesGps {
  lat: number;
  lng: number;
}

export interface Commande {
  id: string;
  numero_commande: string;
  client_id: string;
  vendeur_id: string | null;
  livreur_id: string | null;
  date_commande: string;
  statut_commande: StatutCommande;
  mode_attribution: ModeAttribution;
  montant_sous_total: string | number;
  frais_livraison: string | number;
  montant_total: string | number;
  adresse_livraison: string;
  coordonnees_gps_livraison?: CoordonneesGps | null;
  type_commande: TypeCommande;
  devise_paiement: string;
  motif_annulation: string | null;
  created_at: string;
  client?: { id: string; user?: AppUser };
  vendeur?: Vendeur;
  livreur?: Livreur;
}

export interface CommandeEnAttente {
  id: string;
  numero_commande: string;
  statut_commande: StatutCommande;
  mode_attribution: ModeAttribution;
  client: { nom: string; prenom: string } | null;
  vendeur: string | null;
  adresse_livraison: string;
  distance_estimee_km: number | string | null;
  montant_total: string | number;
  date_commande: string;
  en_retard: boolean;
}

export interface LivreurDisponible {
  id: string;
  nom: string | null;
  prenom: string | null;
  note_moyenne: string | number | null;
  missions_actives: number;
  surcharge: boolean;
}

export interface LigneCommande {
  id: string;
  commande_id: string;
  produit_id: string;
  quantite: number;
  prix_unitaire: string | number;
  sous_total: string | number;
  produit?: { id: string; nom_produit: string; photo_produit: string | null; unite_mesure?: string };
}

export type StatutPaiement = "en_attente" | "valide" | "echoue" | "rembourse";

export interface Paiement {
  id: string;
  commande_id: string;
  moyen_paiement_id: string | null;
  methode: string;
  montant: string | number;
  devise: string;
  statut: StatutPaiement;
  date_paiement: string | null;
  reference_transaction_externe: string | null;
  created_at?: string;
  commande?: Commande;
}

export type StatutLivraison = "assigne" | "en_cours" | "en_route_client" | "livree" | "echouee";

export interface SuiviPosition {
  id: string;
  livraison_id: string;
  latitude: string | number;
  longitude: string | number;
  horodatage: string;
}

export interface Livraison {
  id: string;
  commande_id: string;
  livreur_id: string;
  statut_livraison: StatutLivraison;
  date_collecte: string | null;
  date_depart_client: string | null;
  date_livraison: string | null;
  photo_preuve: string | null;
  distance_parcourue: string | number | null;
  duree_reelle: number | null;
  motif_incident: string | null;
  photo_incident: string | null;
  created_at?: string;
  livreur?: Livreur;
  commande?: Commande;
  suivi_positions?: SuiviPosition[];
}

export interface CommandeDetailData extends Commande {
  lignes: LigneCommande[];
  paiement: Paiement | null;
  livraison: Livraison | null;
  litige: Litige | null;
}

export interface LivraisonPosition {
  livraison_id: string;
  commande_id: string;
  numero_commande: string | null;
  statut_livraison: StatutLivraison;
  livreur: { id: string; nom: string } | null;
  client: string | null;
  position: { lat: number; lng: number; horodatage: string };
  destination: CoordonneesGps | null;
  origine: CoordonneesGps | null;
}

export interface Categorie {
  id: string;
  nom_categorie: string;
  icone: string | null;
  categorie_parente_id: string | null;
  created_at?: string;
  updated_at?: string;
  sous_categories?: Categorie[];
}

export interface ZoneLivraison {
  id: string;
  nom_zone: string;
  ville: string;
  quartiers_couverts: string[];
  frais_livraison_base: string | number;
  delai_estime_min: number;
  delai_estime_max: number;
  statut_actif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LitigePieceJointe {
  id: string;
  litige_id: string;
  message_id: string | null;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_type: "image" | "video" | "document" | null;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
  auteur?: AppUser;
}

export interface LitigeMessage {
  id: string;
  litige_id: string;
  user_id: string | null;
  sender_type: SenderTypeLitige;
  message: string;
  est_note_interne: boolean;
  created_at: string;
  user?: AppUser;
  pieces_jointes?: LitigePieceJointe[];
}

export interface LitigeDecision {
  id: string;
  litige_id: string;
  admin_id: string;
  decision_type: DecisionTypeLitige;
  reason: string;
  amount: string | number | null;
  currency: string | null;
  created_at: string;
  admin?: { id: string; user?: AppUser };
}

export interface LitigeRemboursement {
  id: string;
  litige_id: string;
  decision_id: string | null;
  montant: string | number;
  devise: string;
  statut: StatutRemboursementLitige;
  methode_prevue: string | null;
  reference_externe: string | null;
  created_at: string;
}

export interface Litige {
  id: string;
  numero: string | null;
  commande_id: string;
  utilisateur_plaignant_id: string;
  motif: string;
  description: string;
  decision: string | null;
  statut: StatutLitige;
  statut_label?: string;
  date_ouverture: string;
  date_resolution: string | null;
  admin_traitant_id: string | null;
  commande?: Commande;
  plaignant?: AppUser;
  admin_traitant?: { id: string; user?: AppUser };
  messages?: LitigeMessage[];
  pieces_jointes?: LitigePieceJointe[];
  decisions?: LitigeDecision[];
  remboursements?: LitigeRemboursement[];
}

export interface ParametrePlateforme {
  id: string;
  cle: string;
  valeur: string;
  description: string | null;
  date_maj: string;
  admin_dernier_maj_id: string | null;
}

export interface Administrateur {
  id: string;
  user_id: string;
  role_admin: RoleAdmin;
  permissions: string[] | null;
  date_nomination: string;
}

export interface RoleUserRow {
  id: string;
  user_id: string;
  role: string;
}

export interface LogActivite {
  id: string;
  user_id: string;
  action: string;
  date_action: string;
  adresse_ip: string | null;
  user_agent: string | null;
  details: Record<string, unknown> | null;
  user?: AppUser;
}

export interface DashboardData {
  utilisateurs: {
    total: number;
    clients: number;
    vendeurs: number;
    livreurs: number;
    nouveaux_aujourd_hui: number;
    nouveaux_cette_semaine: number;
    nouveaux_ce_mois: number;
  };
  commandes: {
    total: number;
    en_cours: number;
    livrees: number;
    annulees: number;
    aujourd_hui: number;
  };
  revenus: { ce_mois: number | string; commission?: number | string };
  litiges: { ouverts: number; en_cours: number };
  vendeurs_en_attente: number;
  livreurs_en_attente: number;
}

export interface CommandeParJour {
  jour: string;
  total: number;
  revenus: number | string;
}

export interface TopVendeurStat {
  id: string;
  nom_commerce: string;
  commandes_count: number;
  user?: AppUser;
}

export interface TopProduitStat {
  nom_produit: string;
  quantite_vendue: number | string;
}

export interface CategorieStat {
  nom_categorie: string;
  total_ventes: number | string;
}

export interface StatistiquesData {
  commandes_par_jour: CommandeParJour[];
  top_vendeurs: TopVendeurStat[];
  top_produits: TopProduitStat[];
  meilleures_categories: CategorieStat[];
}

export interface FinancesData {
  chiffre_affaires: number | string;
  commissions_percues: number | string;
  frais_livraison: number | string;
  nb_commandes: number;
  mois: number;
  annee: number;
  // Valeur actuelle du réglage taux_commission_vendeur (voir /admin/parametres) — jamais recopiée
  // en dur ("10%") dans l'UI, seul le taux figé sur chaque Commission fait foi pour l'historique.
  taux_commission_vendeur: string;
}

// ─── Statistiques & analytics du dashboard (GET /admin/dashboard/*) ───
// Alignées sur DashboardStatsController.php — aucune donnée fictive.

export type PeriodValue = "today" | "yesterday" | "7d" | "30d" | "3m" | "year" | "custom";

export interface KpiMetric {
  valeur: number;
  evolution_pct: number;
}

export interface DashboardOverview {
  periode: { valeur: PeriodValue; debut: string; fin: string };
  chiffre_affaires: KpiMetric;
  commandes: KpiMetric;
  nouveaux_clients: KpiMetric;
  livraisons: KpiMetric;
}

export interface SalesPoint {
  date: string;
  commandes: number;
  revenus: number;
}

export interface DashboardSales {
  granularite: "day" | "week";
  points: SalesPoint[];
}

export interface OrderStatusStat {
  statut: StatutCommande;
  label: string;
  total: number;
}

export interface DashboardOrders {
  total: number;
  statuts: OrderStatusStat[];
}

export interface TopProduitDashboard {
  id: string;
  nom_produit: string;
  photo_produit: string | null;
  nom_commerce: string | null;
  quantite_vendue: number | string;
  revenus: number | string;
}

export interface DashboardProducts {
  produits: TopProduitDashboard[];
}

export interface PaymentMethodStat {
  methode: string;
  label: string;
  nb: number;
  montant: number;
  pourcentage: number;
}

export interface DashboardPayments {
  total: number;
  methodes: PaymentMethodStat[];
}

export interface RegistrationPoint {
  date: string;
  total: number;
}

export interface DashboardCustomers {
  total_clients: number;
  nouveaux_clients: number;
  clients_actifs: number;
  clients_recurrents: number;
  clients_diaspora: number;
  evolution_inscriptions: RegistrationPoint[];
}

export interface ClienteleSegmentStat {
  segment: "local" | "diaspora";
  commandes: number;
  chiffre_affaires: number | string;
}

export interface ZoneSegmentStat {
  id: string;
  nom_zone: string;
  ville: string;
  commandes: number;
  chiffre_affaires: number | string;
}

export interface DashboardSegments {
  clientele: ClienteleSegmentStat[];
  zones: ZoneSegmentStat[];
}

export interface TopVendeurDashboard {
  id: string;
  nom_commerce: string;
  nom: string;
  prenom: string;
  commandes: number;
  chiffre_affaires: number | string;
}

export interface DashboardVendors {
  vendeurs_actifs: number;
  top_vendeurs: TopVendeurDashboard[];
}

export interface TopLivreurDashboard {
  id: string;
  nom: string;
  prenom: string;
  livraisons: number;
  revenus: number | string;
}

export interface DashboardDeliveries {
  total: number;
  terminees: number;
  en_cours: number;
  echouees: number;
  duree_moyenne_minutes: number | null;
  revenus_livraison: number;
  top_livreurs: TopLivreurDashboard[];
}

export type EtatStock = "disponible" | "stock_faible" | "rupture";
export type TypeFraicheur = "frais" | "fume" | "congele";

export interface ProduitAdmin {
  id: string;
  vendeur_id: string;
  categorie_id: string;
  nom_produit: string;
  description: string | null;
  prix_unitaire: string | number;
  unite_mesure: string;
  quantite_stock: number;
  statut_disponibilite: "disponible" | "rupture";
  photo_produit: string | null;
  type_fraicheur: TypeFraicheur | null;
  date_maj_prix: string;
  updated_at: string;
  etat_stock: EtatStock;
  seuil_stock_faible: number;
  vendeur?: { id: string; nom_commerce: string };
  categorie?: { id: string; nom_categorie: string };
}

export interface ProduitsAdminData extends PaginatedData<ProduitAdmin> {
  counts: { disponible: number; stock_faible: number; rupture: number };
}

export type StatutRetrait = "en_attente" | "valide" | "rejete";
export type MethodeRetrait = "mtn_momo" | "airtel_money" | "virement";

export interface RetraitVendeur {
  id: string;
  vendeur_id: string;
  montant: string | number;
  methode_retrait: MethodeRetrait;
  numero_reception: string | null;
  statut: StatutRetrait;
  date_demande: string;
  date_traitement: string | null;
  vendeur?: Vendeur;
}

export interface RetraitLivreur {
  id: string;
  livreur_id: string;
  montant: string | number;
  methode_retrait: MethodeRetrait;
  numero_reception: string | null;
  statut: StatutRetrait;
  date_demande: string;
  date_traitement: string | null;
  livreur?: Livreur;
}

export type StatutCommission = "en_attente" | "validee";

export interface CommissionAdmin {
  id: string;
  commande_id: string;
  taux_commission: string | number;
  montant_commission: string | number;
  statut: StatutCommission;
  date_calcul: string;
  commande?: Commande;
}

export interface VendeurDetailData {
  vendeur: Vendeur;
  stats: {
    produits_total: number;
    produits_rupture: number;
    commandes_total: number;
    commandes_livrees: number;
    chiffre_affaires: number;
    commissions_en_attente: number;
  };
  retraits_recents: RetraitVendeur[];
  produits: ProduitAdmin[];
}

export interface LivreurDetailData {
  livreur: Livreur;
  stats: {
    livraisons_total: number;
    livraisons_terminees: number;
    distance_totale_km: number;
    revenus_total: number;
  };
  retraits_recents: RetraitLivreur[];
}

export type TypeReduction = "pourcentage" | "montant_fixe";

export interface PromotionProduitAdmin {
  id: string;
  promotion_id: string;
  produit_id: string;
  prix_promo: string | number;
  produit?: { id: string; nom_produit: string; photo_produit: string | null; prix_unitaire?: string | number };
}

export interface PromotionAdmin {
  id: string;
  titre: string;
  description: string | null;
  type_reduction: TypeReduction;
  valeur_reduction: string | number;
  date_debut: string;
  date_fin: string;
  statut_actif: boolean;
  image_bandeau: string | null;
  produits?: PromotionProduitAdmin[];
}

export interface CouponAdmin {
  id: string;
  code: string;
  description: string | null;
  type_reduction: TypeReduction;
  valeur_reduction: string | number;
  montant_minimum_commande: string | number;
  montant_maximum_reduction: string | number | null;
  date_debut: string;
  date_fin: string;
  limite_utilisation_totale: number | null;
  limite_utilisation_par_client: number | null;
  statut_actif: boolean;
  commandes_count?: number;
}

export type CibleNotification = "tous" | "clients" | "vendeurs" | "livreurs" | "diaspora";
export type StatutCampagne = "programmee" | "envoyee" | "echouee";

export interface CampagneNotification {
  id: string;
  titre: string;
  message: string;
  cible_type: CibleNotification;
  envoyer_push: boolean;
  envoyer_sms: boolean;
  lien_action: string | null;
  date_envoi: string | null;
  statut: StatutCampagne;
  nombre_destinataires: number;
  nombre_envois_reussis: number;
  created_at: string;
}

export interface DashboardAlerts {
  commandes_en_retard: number;
  produits_rupture: number;
  vendeurs_en_attente: number;
  livreurs_en_attente: number;
  paiements_en_attente: number;
  litiges_ouverts: number;
  total: number;
}

export interface ActivityItem {
  type: string;
  titre: string;
  description: string;
  statut: string;
  date: string;
}

export type CategorieTicket = "commande" | "paiement" | "livraison" | "vendeur" | "livreur" | "produit" | "remboursement" | "compte" | "autre";
export type PrioriteTicket = "basse" | "normale" | "haute" | "urgente";
export type StatutTicket = "ouvert" | "en_cours" | "en_attente" | "resolu" | "ferme";

export interface TicketReponse {
  id: string;
  ticket_id: string;
  auteur_id: string;
  message: string;
  est_note_interne: boolean;
  created_at: string;
  auteur?: AppUser;
}

export interface TicketSupport {
  id: string;
  numero: string;
  user_id: string;
  commande_id: string | null;
  categorie: CategorieTicket;
  sujet: string;
  description: string;
  priorite: PrioriteTicket;
  admin_assigne_id: string | null;
  statut: StatutTicket;
  date_derniere_reponse: string | null;
  created_at: string;
  user?: AppUser;
  commande?: Commande;
  admin_assigne?: { id: string; user?: AppUser };
  reponses?: TicketReponse[];
}

export interface AdministrateurLite {
  id: string;
  role_admin: RoleAdmin;
  permissions: string[] | null;
  date_nomination: string;
  user?: AppUser;
}

export interface PermissionsCatalogue {
  permissions: string[];
  roles: Record<string, string[]>;
}
