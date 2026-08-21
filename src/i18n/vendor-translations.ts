// Traductions pour toutes les pages VENDEUR sous src/app/vendeur/. Espace de noms séparé de
// client-translations.ts pour permettre un travail parallèle sans conflit sur le même fichier.
// Une valeur a été reprise telle quelle de mobile/src/i18n/translations.ts (namespaces vendorNav,
// vendorHome, vendorOrdersList, vendorProductsList, vendorProfile, vendorRevenue, vendorBanking,
// vendorProfileInfo, vendorReviews, vendorOrderDetail, vendorAddProduct, vendorEditProduct,
// vendorSupport, vendorSupportNew, rateClient, changePassword, client.notifications, etc.) chaque
// fois que le concept y existait déjà. Les concepts propres au web (litiges dédiés, tableau de bord
// web) n'ont pas d'écran mobile équivalent direct : traductions inventées, gardées simples.
import type { Language } from './translations';

export interface VendorTranslations {
  common: {
    clientFallback: string;
    cancel: string;
    save: string;
  };
  dashboard: {
    loading: string;
    loadError: string;
    greeting: string;
    subtitle: string;
    notValidatedPrefix: string;
    notValidatedSuffix: string;
    statOrdersToday: string;
    statOrdersOngoing: string;
    statOrdersDelivered: string;
    statRevenueMonth: string;
    statProductsOnline: string;
    statTotalSuffix: string;
    statOutOfStock: string;
    statAvailableBalance: string;
    statAvgRating: string;
    quickAddProductTitle: string;
    quickAddProductDesc: string;
    quickOrdersTitle: string;
    quickOrdersDesc: string;
    quickWithdrawTitle: string;
    quickWithdrawDesc: string;
  };
  avis: {
    loading: string;
    loadError: string;
    reviewsReceivedOne: string;
    reviewsReceivedMany: string;
    avgRatingPrefix: string;
    avgRatingSuffix: string;
    emptyState: string;
  };
  commandes: {
    title: string;
    subtitle: string;
    tabAll: string;
    tabNew: string;
    tabOngoing: string;
    tabDelivered: string;
    tabCancelled: string;
    loading: string;
    emptyState: string;
    accept: string;
    refuse: string;
    refuseModalTitle: string;
    refuseModalBodyPrefix: string;
    refuseModalBodySuffix: string;
    refusePlaceholder: string;
    confirmRefuseBtn: string;
  };
  commandeDetail: {
    loading: string;
    notFound: string;
    backToOrdersNotFound: string;
    backToOrdersLink: string;
    rateClientTitle: string;
    ratingSendError: string;
    commentPlaceholder: string;
    send: string;
    articlesTitle: string;
    subtotalLabel: string;
    alreadyRatedPrefix: string;
    alreadyRatedSuffix: string;
    rateClientBtn: string;
    cancelReasonLabel: string;
    acceptBtn: string;
    refuseBtn: string;
    refuseModalTitle: string;
    refusePlaceholder: string;
    confirmRefuseBtn: string;
    driverLabel: string;
    starsAriaLabel: string;
    chatBtn: string;
    statusTimelineTitle: string;
    stageConfirmee: string;
    stageAchatMarche: string;
    stagePreparation: string;
    stageEnRoute: string;
    stageLivree: string;
    stageConfirmeeDesc: string;
    stageAchatMarcheDesc: string;
    stagePreparationDesc: string;
    stageEnRouteDesc: string;
    stageLivreeDesc: string;
  };
  chat: {
    title: string;
    backToOrderLink: string;
    loading: string;
    noMessages: string;
    messagePlaceholder: string;
    sendError: string;
    clientLabel: string;
    driverLabel: string;
    youLabel: string;
  };
  litiges: {
    title: string;
    subtitle: string;
    loading: string;
    emptyState: string;
    orderPrefix: string;
  };
  litigeDetail: {
    loading: string;
    notFound: string;
    backToLitigesNotFound: string;
    backToLitigesLink: string;
    decisionTitle: string;
    conversationTitle: string;
  };
  notifications: {
    title: string;
    markAllRead: string;
    loading: string;
    emptyState: string;
    justNow: string;
    agoPrefix: string;
    minUnit: string;
    hUnit: string;
    dayUnit: string;
  };
  produits: {
    title: string;
    countOne: string;
    countMany: string;
    addProduct: string;
    loading: string;
    emptyState: string;
    noCategory: string;
    stockLabelPrefix: string;
    edit: string;
    deleteConfirmTitle: string;
    deleteConfirmPrefix: string;
    deleteConfirmSuffix: string;
    deleteConfirmBtn: string;
    reportOutOfStockTooltip: string;
    deleteTooltip: string;
  };
  produitDetail: {
    loading: string;
    notFound: string;
    backToProductsNotFound: string;
    backToProductsLink: string;
    title: string;
    notModifiableNote: string;
    currentStockPrefix: string;
    stockAddPlaceholder: string;
    addBtn: string;
    stockRemovePlaceholder: string;
    removeBtn: string;
    stockRemoveExceedsError: string;
    nameLabel: string;
    descriptionLabel: string;
    priceLabel: string;
    unitLabel: string;
    freshnessLabel: string;
    freshFrais: string;
    freshFume: string;
    freshCongele: string;
    saveError: string;
    saveBtn: string;
    savedBtn: string;
  };
  produitNouveau: {
    backToProductsLink: string;
    title: string;
    subtitle: string;
    validationPendingWarning: string;
    validationSuspendedWarning: string;
    photoLabel: string;
    photoHint: string;
    nameLabel: string;
    namePlaceholder: string;
    descriptionLabel: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    priceLabel: string;
    unitLabel: string;
    unitPlaceholder: string;
    stockLabel: string;
    freshnessLabel: string;
    freshFrais: string;
    freshFume: string;
    freshCongele: string;
    error: string;
    publishBtn: string;
  };
  profil: {
    title: string;
    connectedAccount: string;
    storeSectionTitle: string;
    storeNameLabel: string;
    storeNamePlaceholder: string;
    gpsLabel: string;
    gpsHint: string;
    positionPrefix: string;
    useCurrentPosition: string;
    paymentInfoLabel: string;
    paymentInfoHint: string;
    mobileMoneyPlaceholder: string;
    hoursLabel: string;
    hoursPlaceholder: string;
    saveError: string;
    saveBtn: string;
    savedBtn: string;
    documentsTitle: string;
    docPhotoBoutique: string;
    docIdentite: string;
    docRegistre: string;
    noFileSelected: string;
    sendDocsBtn: string;
    docsSentBtn: string;
    changePasswordTitle: string;
    currentPasswordPlaceholder: string;
    newPasswordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    passwordMismatch: string;
    passwordError: string;
    changePasswordBtn: string;
    passwordChangedBtn: string;
  };
  revenus: {
    title: string;
    subtitle: string;
    loading: string;
    loadError: string;
    statAvailableBalance: string;
    statGrossRevenue: string;
    statCommissions: string;
    statNetRevenue: string;
    salesChartTitle: string;
    topProductsTitle: string;
    noSales: string;
    soldSuffix: string;
    withdrawFormTitle: string;
    amountLabel: string;
    methodLabel: string;
    methodMtn: string;
    methodAirtel: string;
    methodBank: string;
    receptionNumberLabel: string;
    receptionNumberPlaceholder: string;
    submitError: string;
    submitBtn: string;
    submittedBtn: string;
    withdrawHistoryTitle: string;
    noWithdrawals: string;
    statusPending: string;
    statusValidated: string;
    statusRejected: string;
  };
  support: {
    title: string;
    subtitle: string;
    newMessageBtn: string;
    loading: string;
    emptyState: string;
    unreadBadge: string;
    modalTitle: string;
    objectLabel: string;
    messageLabel: string;
    sendBtn: string;
    sendError: string;
  };
  supportThread: {
    loading: string;
    notFound: string;
    backToSupportNotFound: string;
    backToSupportLink: string;
    youLabel: string;
    teamLabel: string;
    replyPlaceholder: string;
    replyError: string;
  };
}

const fr: VendorTranslations = {
  common: { clientFallback: 'Client', cancel: 'Annuler', save: 'Enregistrer' },
  dashboard: {
    loading: 'Chargement du tableau de bord…',
    loadError: 'Impossible de charger votre tableau de bord.',
    greeting: 'Bonjour',
    subtitle: "Aperçu de votre boutique aujourd'hui.",
    notValidatedPrefix: "Votre boutique n'est pas encore validée (",
    notValidatedSuffix: '). Certaines fonctionnalités peuvent être limitées.',
    statOrdersToday: "Commandes aujourd'hui",
    statOrdersOngoing: 'Commandes en cours',
    statOrdersDelivered: 'Commandes livrées',
    statRevenueMonth: 'Revenus du mois',
    statProductsOnline: 'Produits en ligne',
    statTotalSuffix: 'au total',
    statOutOfStock: 'Ruptures de stock',
    statAvailableBalance: 'Solde disponible',
    statAvgRating: 'Note moyenne',
    quickAddProductTitle: 'Ajouter un produit',
    quickAddProductDesc: 'Publiez un nouvel article dans votre boutique.',
    quickOrdersTitle: 'Gérer les commandes',
    quickOrdersDesc: 'Acceptez ou refusez les commandes reçues.',
    quickWithdrawTitle: 'Demander un retrait',
    quickWithdrawDesc: 'Transférez votre solde disponible.',
  },
  avis: {
    loading: 'Chargement des avis…',
    loadError: 'Impossible de charger vos avis.',
    reviewsReceivedOne: 'avis reçu',
    reviewsReceivedMany: 'avis reçus',
    avgRatingPrefix: 'Note moyenne sur',
    avgRatingSuffix: 'avis',
    emptyState: 'Aucun avis pour le moment.',
  },
  commandes: {
    title: 'Commandes',
    subtitle: 'Gérez les commandes reçues par votre boutique.',
    tabAll: 'Toutes',
    tabNew: 'Nouvelles',
    tabOngoing: 'En cours',
    tabDelivered: 'Livrées',
    tabCancelled: 'Annulées',
    loading: 'Chargement des commandes…',
    emptyState: 'Aucune commande dans cette catégorie.',
    accept: 'Accepter',
    refuse: 'Refuser',
    refuseModalTitle: 'Refuser cette commande',
    refuseModalBodyPrefix: 'Commande',
    refuseModalBodySuffix: '— le stock sera automatiquement restitué.',
    refusePlaceholder: 'Motif du refus…',
    confirmRefuseBtn: 'Refuser la commande',
  },
  commandeDetail: {
    loading: 'Chargement de la commande…',
    notFound: 'Commande introuvable.',
    backToOrdersNotFound: 'Retour aux commandes',
    backToOrdersLink: 'Mes commandes',
    rateClientTitle: 'Noter ce client',
    ratingSendError: "Impossible d'envoyer cet avis.",
    commentPlaceholder: 'Un commentaire (facultatif)…',
    send: 'Envoyer',
    articlesTitle: 'Articles',
    subtotalLabel: 'Sous-total (part vendeur)',
    alreadyRatedPrefix: 'Client noté ·',
    alreadyRatedSuffix: '/5',
    rateClientBtn: 'Noter ce client',
    cancelReasonLabel: "Motif d'annulation :",
    acceptBtn: 'Accepter la commande',
    refuseBtn: 'Refuser',
    refuseModalTitle: 'Refuser cette commande',
    refusePlaceholder: 'Motif du refus…',
    confirmRefuseBtn: 'Refuser la commande',
    driverLabel: 'Livreur :',
    starsAriaLabel: 'étoiles',
    chatBtn: 'Discuter à propos de cette commande',
    statusTimelineTitle: 'Statut de la commande',
    stageConfirmee: 'Confirmée',
    stageAchatMarche: 'Achat au marché',
    stagePreparation: 'Préparation',
    stageEnRoute: 'En route',
    stageLivree: 'Livrée',
    stageConfirmeeDesc: "La commande a été reçue et attend votre acceptation.",
    stageAchatMarcheDesc: 'Vous préparez les achats des produits commandés.',
    stagePreparationDesc: 'La commande est emballée et prête pour le livreur.',
    stageEnRouteDesc: "Le livreur a récupéré la commande et l'achemine vers le client.",
    stageLivreeDesc: 'Le client a reçu sa commande.',
  },
  chat: {
    title: 'Conversation',
    backToOrderLink: 'Retour à la commande',
    loading: 'Chargement de la conversation…',
    noMessages: 'Aucun message pour le moment.',
    messagePlaceholder: 'Écrire un message…',
    sendError: "Impossible d'envoyer ce message.",
    clientLabel: 'Client',
    driverLabel: 'Livreur',
    youLabel: 'Vous',
  },
  litiges: {
    title: 'Litiges',
    subtitle: 'Litiges ouverts sur vos commandes.',
    loading: 'Chargement des litiges…',
    emptyState: 'Aucun litige pour le moment.',
    orderPrefix: 'Commande',
  },
  litigeDetail: {
    loading: 'Chargement du litige…',
    notFound: 'Litige introuvable.',
    backToLitigesNotFound: 'Retour aux litiges',
    backToLitigesLink: 'Mes litiges',
    decisionTitle: "Décision de l'administration",
    conversationTitle: 'Conversation',
  },
  notifications: {
    title: 'Notifications',
    markAllRead: 'Tout marquer comme lu',
    loading: 'Chargement…',
    emptyState: 'Aucune notification pour le moment.',
    justNow: "à l'instant",
    agoPrefix: 'il y a',
    minUnit: 'min',
    hUnit: 'h',
    dayUnit: 'j',
  },
  produits: {
    title: 'Mes produits',
    countOne: 'produit',
    countMany: 'produits',
    addProduct: 'Ajouter un produit',
    loading: 'Chargement de vos produits…',
    emptyState: "Vous n'avez pas encore de produit. Ajoutez-en un pour commencer à vendre.",
    noCategory: 'Sans catégorie',
    stockLabelPrefix: 'Stock:',
    edit: 'Modifier',
    deleteConfirmTitle: 'Supprimer ce produit ?',
    deleteConfirmPrefix: '«',
    deleteConfirmSuffix: '» sera définitivement retiré de votre boutique.',
    deleteConfirmBtn: 'Supprimer',
    reportOutOfStockTooltip: 'Signaler une rupture',
    deleteTooltip: 'Supprimer',
  },
  produitDetail: {
    loading: 'Chargement du produit…',
    notFound: 'Produit introuvable.',
    backToProductsNotFound: 'Retour à mes produits',
    backToProductsLink: 'Mes produits',
    title: 'Modifier le produit',
    notModifiableNote: 'Photo et catégorie non modifiables après création.',
    currentStockPrefix: 'Stock actuel :',
    stockAddPlaceholder: 'Quantité à ajouter',
    addBtn: 'Ajouter',
    stockRemovePlaceholder: 'Quantité à retirer',
    removeBtn: 'Retirer',
    stockRemoveExceedsError: 'Cette quantité dépasse le stock disponible.',
    nameLabel: 'Nom du produit',
    descriptionLabel: 'Description',
    priceLabel: 'Prix unitaire (FCFA)',
    unitLabel: 'Unité de mesure',
    freshnessLabel: 'Fraîcheur',
    freshFrais: 'Frais',
    freshFume: 'Fumé',
    freshCongele: 'Congelé',
    saveError: "Impossible d'enregistrer les modifications.",
    saveBtn: 'Enregistrer les modifications',
    savedBtn: 'Enregistré !',
  },
  produitNouveau: {
    backToProductsLink: 'Mes produits',
    title: 'Ajouter un produit',
    subtitle: 'Renseignez les informations de votre nouvel article.',
    validationPendingWarning: "Votre compte vendeur est en attente de validation par un administrateur. Vous pourrez publier dès qu'il sera validé.",
    validationSuspendedWarning: 'Votre compte vendeur est suspendu. Contactez le support pour publier des produits.',
    photoLabel: 'Photo du produit',
    photoHint: 'JPEG, PNG ou WebP, 3 Mo max',
    nameLabel: 'Nom du produit',
    namePlaceholder: 'ex: Banane Plantain (Makemba)',
    descriptionLabel: 'Description',
    categoryLabel: 'Catégorie',
    categoryPlaceholder: 'Sélectionner…',
    priceLabel: 'Prix unitaire (FCFA)',
    unitLabel: 'Unité de mesure',
    unitPlaceholder: 'Kg, Sachet, Régime…',
    stockLabel: 'Stock initial',
    freshnessLabel: 'Fraîcheur',
    freshFrais: 'Frais',
    freshFume: 'Fumé',
    freshCongele: 'Congelé',
    error: "Impossible d'ajouter ce produit.",
    publishBtn: 'Publier le produit',
  },
  profil: {
    title: 'Profil de la boutique',
    connectedAccount: 'Compte connecté',
    storeSectionTitle: 'Boutique',
    storeNameLabel: 'Nom commercial',
    storeNamePlaceholder: 'Nom de votre boutique',
    gpsLabel: 'Point de collecte (position GPS)',
    gpsHint: 'Utilisé pour calculer les frais de livraison à la distance réelle.',
    positionPrefix: 'Position :',
    useCurrentPosition: 'Utiliser ma position actuelle',
    paymentInfoLabel: 'Coordonnées de paiement',
    paymentInfoHint: 'Numéro mobile money qui recevra vos retraits.',
    mobileMoneyPlaceholder: 'ex: 06 123 45 67',
    hoursLabel: "Horaires d'ouverture",
    hoursPlaceholder: 'ex: Lun-Sam 8h-19h',
    saveError: "Impossible d'enregistrer les modifications.",
    saveBtn: 'Enregistrer',
    savedBtn: 'Enregistré !',
    documentsTitle: 'Documents de la boutique',
    docPhotoBoutique: 'Photo de la boutique',
    docIdentite: "Pièce d'identité",
    docRegistre: 'Registre de commerce (RCCM)',
    noFileSelected: 'Aucun fichier sélectionné',
    sendDocsBtn: 'Envoyer les documents',
    docsSentBtn: 'Documents envoyés !',
    changePasswordTitle: 'Changer le mot de passe',
    currentPasswordPlaceholder: 'Mot de passe actuel',
    newPasswordPlaceholder: 'Nouveau mot de passe (min. 8 caractères)',
    confirmPasswordPlaceholder: 'Confirmer le nouveau mot de passe',
    passwordMismatch: 'Les mots de passe ne correspondent pas.',
    passwordError: 'Impossible de changer le mot de passe.',
    changePasswordBtn: 'Changer le mot de passe',
    passwordChangedBtn: 'Mot de passe changé, reconnexion…',
  },
  revenus: {
    title: 'Revenus',
    subtitle: 'Suivez vos ventes et gérez vos retraits.',
    loading: 'Chargement de vos revenus…',
    loadError: 'Impossible de charger vos revenus.',
    statAvailableBalance: 'Solde disponible',
    statGrossRevenue: 'Revenus bruts (mois)',
    statCommissions: 'Commissions',
    statNetRevenue: 'Revenus nets (mois)',
    salesChartTitle: 'Ventes des 7 derniers jours',
    topProductsTitle: 'Produits les plus vendus',
    noSales: 'Aucune vente livrée pour le moment.',
    soldSuffix: 'vendus',
    withdrawFormTitle: 'Demander un retrait',
    amountLabel: 'Montant (FCFA)',
    methodLabel: 'Méthode',
    methodMtn: 'MTN Mobile Money',
    methodAirtel: 'Airtel Money',
    methodBank: 'Virement bancaire',
    receptionNumberLabel: 'Numéro de réception',
    receptionNumberPlaceholder: 'Numéro mobile money ou RIB',
    submitError: 'Impossible de soumettre la demande.',
    submitBtn: 'Soumettre la demande',
    submittedBtn: 'Demande envoyée !',
    withdrawHistoryTitle: 'Historique des retraits',
    noWithdrawals: 'Aucune demande de retrait.',
    statusPending: 'En attente',
    statusValidated: 'Validé',
    statusRejected: 'Rejeté',
  },
  support: {
    title: 'Support Zando na Ndako',
    subtitle: "Échangez directement avec l'équipe d'administration.",
    newMessageBtn: 'Nouveau message',
    loading: 'Chargement des conversations…',
    emptyState: "Aucune conversation avec l'administration pour le moment.",
    unreadBadge: 'Non lu',
    modalTitle: 'Nouveau message',
    objectLabel: 'Objet',
    messageLabel: 'Message',
    sendBtn: 'Envoyer',
    sendError: "Impossible d'envoyer ce message.",
  },
  supportThread: {
    loading: 'Chargement de la conversation…',
    notFound: 'Conversation introuvable.',
    backToSupportNotFound: 'Retour au support',
    backToSupportLink: 'Support',
    youLabel: 'Vous',
    teamLabel: 'Zando na Ndako',
    replyPlaceholder: 'Répondre…',
    replyError: "Impossible d'envoyer la réponse.",
  },
};

const lingala: VendorTranslations = {
  common: { clientFallback: 'Client', cancel: 'Boya', save: 'Bomba' },
  dashboard: {
    loading: 'Kozela tableau de bord…',
    loadError: 'Ekoki te kozwa tableau de bord na yo.',
    greeting: 'Mbote',
    subtitle: 'Boutique na yo, lelo.',
    notValidatedPrefix: 'Boutique na yo endimami nanu te (',
    notValidatedSuffix: '). Mwa ba fonctionnalités ekoki kozala na limite.',
    statOrdersToday: 'Ba commande ya lelo',
    statOrdersOngoing: 'Ba commande na nzela',
    statOrdersDelivered: 'Ba commande ekomaki',
    statRevenueMonth: 'Mbongo ya sanza',
    statProductsOnline: 'Biloko oyo ezali',
    statTotalSuffix: 'nyonso',
    statOutOfStock: 'Rupture ya stock',
    statAvailableBalance: 'Mbongo oyo ezali',
    statAvgRating: 'Note ya kati-kati',
    quickAddProductTitle: 'Bakisa eloko',
    quickAddProductDesc: 'Tinda eloko ya sika na boutique na yo.',
    quickOrdersTitle: 'Kamba ba commande',
    quickOrdersDesc: 'Ndima to boya ba commande oyo eyaki.',
    quickWithdrawTitle: 'Senga retrait',
    quickWithdrawDesc: 'Tinda mbongo na yo oyo ezali.',
  },
  avis: {
    loading: 'Kozela ba avis…',
    loadError: 'Ekoki te kozwa ba avis na yo.',
    reviewsReceivedOne: 'avis ezwami',
    reviewsReceivedMany: 'avis ezwami',
    avgRatingPrefix: 'Note ya kati-kati na likolo ya',
    avgRatingSuffix: 'avis',
    emptyState: "Avis moko te sik'oyo.",
  },
  commandes: {
    title: 'Ba commande',
    subtitle: 'Kamba ba commande oyo boutique na yo ezwaki.',
    tabAll: 'Nyonso',
    tabNew: 'Ya sika',
    tabOngoing: 'Na nzela',
    tabDelivered: 'Ekomaki',
    tabCancelled: 'Elongolami',
    loading: 'Kozela ba commande…',
    emptyState: 'Commande moko te na catégorie oyo.',
    accept: 'Ndima',
    refuse: 'Boya',
    refuseModalTitle: 'Koboya commande oyo',
    refuseModalBodyPrefix: 'Commande',
    refuseModalBodySuffix: '— stock ekozonga na esika na yango na ndenge ya automatique.',
    refusePlaceholder: 'Motif ya koboya…',
    confirmRefuseBtn: 'Boya commande',
  },
  commandeDetail: {
    loading: 'Kozela commande…',
    notFound: 'Commande ezwami te.',
    backToOrdersNotFound: 'Kozonga na ba commande',
    backToOrdersLink: 'Ba commande na ngai',
    rateClientTitle: 'Nota client oyo',
    ratingSendError: 'Ekoki te kotinda avis na yo.',
    commentPlaceholder: 'Commentaire (na posa)…',
    send: 'Tinda',
    articlesTitle: 'Biloko',
    subtotalLabel: 'Nyonso ya kati (ndambo ya vendeur)',
    alreadyRatedPrefix: 'Client anotami ·',
    alreadyRatedSuffix: '/5',
    rateClientBtn: 'Nota client oyo',
    cancelReasonLabel: 'Motif ya kolongola :',
    acceptBtn: 'Ndima commande',
    refuseBtn: 'Boya',
    refuseModalTitle: 'Koboya commande oyo',
    refusePlaceholder: 'Motif ya koboya…',
    confirmRefuseBtn: 'Boya commande',
    driverLabel: 'Livreur :',
    starsAriaLabel: 'ba étoile',
    chatBtn: 'Solola na ntina ya commande oyo',
    statusTimelineTitle: 'Statut ya commande',
    stageConfirmee: 'Endimami',
    stageAchatMarche: 'Kosomba na zando',
    stagePreparation: 'Kobongisa',
    stageEnRoute: 'Na nzela',
    stageLivree: 'Epesami',
    stageConfirmeeDesc: 'Commande ezwami mpe ezali kozela ndingisa na yo.',
    stageAchatMarcheDesc: 'Ozali kosomba biloko ya commande.',
    stagePreparationDesc: 'Commande ebongisami mpe ezali pene mpo na livreur.',
    stageEnRouteDesc: 'Livreur azwi commande mpe azali komema yango epai ya client.',
    stageLivreeDesc: 'Client azwi commande na ye.',
  },
  chat: {
    title: 'Masolo',
    backToOrderLink: 'Kozonga na commande',
    loading: 'Kozela masolo…',
    noMessages: 'Ata message moko te sikoyo.',
    messagePlaceholder: 'Koma message…',
    sendError: 'Ekoki te kotinda message oyo.',
    clientLabel: 'Client',
    driverLabel: 'Livreur',
    youLabel: 'Yo',
  },
  litiges: {
    title: 'Ba litige',
    subtitle: 'Ba litige oyo efungwami na ba commande na yo.',
    loading: 'Kozela ba litige…',
    emptyState: "Litige moko te sik'oyo.",
    orderPrefix: 'Commande',
  },
  litigeDetail: {
    loading: 'Kozela litige…',
    notFound: 'Litige ezwami te.',
    backToLitigesNotFound: 'Kozonga na ba litige',
    backToLitigesLink: 'Ba litige na ngai',
    decisionTitle: "Décision de l'administration",
    conversationTitle: 'Discussion',
  },
  notifications: {
    title: 'Ba notification',
    markAllRead: 'Tanga nyonso lokola etangami',
    loading: 'Kozela…',
    emptyState: "Notification moko te sik'oyo.",
    justNow: 'Sikawa',
    agoPrefix: 'Esali',
    minUnit: 'min',
    hUnit: 'h',
    dayUnit: 'mokolo',
  },
  produits: {
    title: 'Biloko na ngai',
    countOne: 'eloko',
    countMany: 'biloko',
    addProduct: 'Bakisa eloko',
    loading: 'Kozela biloko na yo…',
    emptyState: 'Ozali na eloko moko te. Bakisa moko mpo na kobanda kotekisa.',
    noCategory: 'Catégorie te',
    stockLabelPrefix: 'Stock :',
    edit: 'Bongisa',
    deleteConfirmTitle: 'Kolongola eloko oyo ?',
    deleteConfirmPrefix: '«',
    deleteConfirmSuffix: '» ekolongwa libela na boutique na yo.',
    deleteConfirmBtn: 'Longola',
    reportOutOfStockTooltip: 'Laka rupture ya stock',
    deleteTooltip: 'Longola',
  },
  produitDetail: {
    loading: 'Kozela eloko…',
    notFound: 'Eloko ezwami te.',
    backToProductsNotFound: 'Kozonga na biloko na ngai',
    backToProductsLink: 'Biloko na ngai',
    title: 'Bongisa eloko',
    notModifiableNote: 'Photo mpe catégorie ekoki kobongwana te nsima ya kokela.',
    currentStockPrefix: "Stock ya sik'oyo :",
    stockAddPlaceholder: 'Quantité ya kobakisa',
    addBtn: 'Bakisa',
    stockRemovePlaceholder: 'Quantité ya kolongola',
    removeBtn: 'Longola',
    stockRemoveExceedsError: 'Quantité oyo eleki stock oyo ezali.',
    nameLabel: 'Kombo ya eloko',
    descriptionLabel: 'Description',
    priceLabel: 'Ntalo ya eloko (FCFA)',
    unitLabel: 'Unité ya kilo',
    freshnessLabel: 'Fraîcheur',
    freshFrais: 'Frais',
    freshFume: 'Fumé',
    freshCongele: 'Congelé',
    saveError: 'Ekoki te kobomba ba bongoli.',
    saveBtn: 'Bomba ba bongoli',
    savedBtn: 'Ebombami !',
  },
  produitNouveau: {
    backToProductsLink: 'Biloko na ngai',
    title: 'Bakisa eloko',
    subtitle: 'Tia ba makambo ya eloko na yo ya sika.',
    validationPendingWarning: 'Compte na yo ya vendeur ezali kozela ndingisa ya administrateur. Okoki kotinda kaka soki endimami.',
    validationSuspendedWarning: 'Compte na yo ya vendeur epekisami. Benga support mpo na kotinda biloko.',
    photoLabel: 'Photo ya eloko',
    photoHint: 'JPEG, PNG to WebP, 3 Mo na se-esika',
    nameLabel: 'Kombo ya eloko',
    namePlaceholder: 'Ndakisa : Banane Plantain (Makemba)',
    descriptionLabel: 'Description',
    categoryLabel: 'Catégorie',
    categoryPlaceholder: 'Pona…',
    priceLabel: 'Ntalo ya eloko (FCFA)',
    unitLabel: 'Unité ya kilo',
    unitPlaceholder: 'Kg, Sachet, Régime…',
    stockLabel: 'Stock ya ebandeli',
    freshnessLabel: 'Fraîcheur',
    freshFrais: 'Frais',
    freshFume: 'Fumé',
    freshCongele: 'Congelé',
    error: 'Ekoki te kobakisa eloko oyo.',
    publishBtn: 'Tinda eloko',
  },
  profil: {
    title: 'Profil ya boutique',
    connectedAccount: 'Compte oyo ekoti',
    storeSectionTitle: 'Boutique',
    storeNameLabel: 'Kombo ya boutique',
    storeNamePlaceholder: 'Kombo ya boutique na yo',
    gpsLabel: 'Position GPS ya boutique',
    gpsHint: 'Esalisaka mpo na kotanga ntalo ya livraison na distance ya solo tii epai ya client.',
    positionPrefix: 'Position :',
    useCurrentPosition: "Salela position na ngai ya sik'oyo",
    paymentInfoLabel: 'Ba coordonnées ya paiement',
    paymentInfoHint: 'Numéro mobile money oyo ekozwa ba retrait na yo.',
    mobileMoneyPlaceholder: 'ndakisa : 06 123 45 67',
    hoursLabel: 'Ba ngonga ya kofungwama',
    hoursPlaceholder: 'ndakisa : Mokolo1-Mokolo6 8h-19h',
    saveError: 'Ekoki te kobomba ba bongoli.',
    saveBtn: 'Bomba',
    savedBtn: 'Ebombami !',
    documentsTitle: 'Ba documents ya boutique',
    docPhotoBoutique: 'Photo ya boutique',
    docIdentite: 'Document ya identité',
    docRegistre: 'Registre de commerce (RCCM)',
    noFileSelected: 'Fichier moko te eponami',
    sendDocsBtn: 'Tinda ba documents',
    docsSentBtn: 'Ba documents etindami !',
    changePasswordTitle: 'Bongola mot de passe',
    currentPasswordPlaceholder: 'Mot de passe ya sikoyo',
    newPasswordPlaceholder: 'Mot de passe ya sika (ba lettre 8 ya se moke)',
    confirmPasswordPlaceholder: 'Kondima mot de passe ya sika',
    passwordMismatch: 'Ba mots de passe ekokani te.',
    passwordError: 'Ekoki te kobongola mot de passe.',
    changePasswordBtn: 'Bongola mot de passe',
    passwordChangedBtn: 'Mot de passe ebongwani, kokota lisusu…',
  },
  revenus: {
    title: 'Mbongo na ngai',
    subtitle: 'Landa ba vente na yo mpe kamba ba retrait na yo.',
    loading: 'Kozela mbongo na yo…',
    loadError: 'Ekoki te kozwa mbongo na yo.',
    statAvailableBalance: 'Mbongo oyo ezali',
    statGrossRevenue: 'Mbongo ya mobimba (sanza)',
    statCommissions: 'Ba commission',
    statNetRevenue: 'Mbongo ya peto (sanza)',
    salesChartTitle: 'Ba vente ya mikolo 7 eleki',
    topProductsTitle: 'Biloko oyo etekisami mingi',
    noSales: "Vente moko te ekomaki sik'oyo.",
    soldSuffix: 'etekisami',
    withdrawFormTitle: 'Senga retrait',
    amountLabel: 'Montant (FCFA)',
    methodLabel: 'Lolenge',
    methodMtn: 'MTN Mobile Money',
    methodAirtel: 'Airtel Money',
    methodBank: 'Virement bancaire',
    receptionNumberLabel: 'Numéro oyo ekozwa',
    receptionNumberPlaceholder: 'Numéro mobile money to RIB',
    submitError: 'Ekoki te kotinda demande.',
    submitBtn: 'Tinda demande',
    submittedBtn: 'Demande etindami !',
    withdrawHistoryTitle: 'Historique ya ba retrait',
    noWithdrawals: 'Demande ya retrait ezali te.',
    statusPending: 'Kozela',
    statusValidated: 'Endimami',
    statusRejected: 'Eboyami',
  },
  support: {
    title: 'Support Zando na Ndako',
    subtitle: 'Solola directement na ekipe ya administration.',
    newMessageBtn: 'Message ya sika',
    loading: 'Kozela ba discussion…',
    emptyState: "Discussion moko te na administration sik'oyo.",
    unreadBadge: 'Etangami te',
    modalTitle: 'Message ya sika',
    objectLabel: 'Motuya',
    messageLabel: 'Message',
    sendBtn: 'Tinda',
    sendError: 'Ekoki te kotinda message.',
  },
  supportThread: {
    loading: 'Kozela discussion…',
    notFound: 'Discussion ezwami te.',
    backToSupportNotFound: 'Kozonga na support',
    backToSupportLink: 'Support',
    youLabel: 'Yo',
    teamLabel: 'Zando na Ndako',
    replyPlaceholder: 'Yanola…',
    replyError: 'Ekoki te kotinda eyano.',
  },
};

const kituba: VendorTranslations = {
  common: { clientFallback: 'Client', cancel: 'Buya', save: 'Bumba' },
  dashboard: {
    loading: 'Kekele tableau de bord…',
    loadError: 'Ta kuka ve kubaka tableau de bord na nge.',
    greeting: 'Mbote',
    subtitle: 'Boutique na nge, bubu.',
    notValidatedPrefix: 'Boutique na nge me ndimama nanu ve (',
    notValidatedSuffix: '). Mwa ba fonctionnalités lenda zala na limite.',
    statOrdersToday: 'Ba commande ya bubu',
    statOrdersOngoing: 'Ba commande na nzila',
    statOrdersDelivered: 'Ba commande me lungaka',
    statRevenueMonth: 'Mbongo ya ngonda',
    statProductsOnline: 'Bima ya kuzala',
    statTotalSuffix: 'yonso',
    statOutOfStock: 'Rupture ya stock',
    statAvailableBalance: 'Mbongo ya kuzala',
    statAvgRating: 'Note ya kati-kati',
    quickAddProductTitle: 'Yika kima',
    quickAddProductDesc: 'Tinda kima ya mpa na boutique na nge.',
    quickOrdersTitle: 'Yala ba commande',
    quickOrdersDesc: 'Ndima to buisa ba commande yina me lunga.',
    quickWithdrawTitle: 'Lomba retrait',
    quickWithdrawDesc: 'Tinda mbongo na nge ya kuzala.',
  },
  avis: {
    loading: 'Kekele ba avis…',
    loadError: 'Ta kuka ve kubaka ba avis na nge.',
    reviewsReceivedOne: 'avis me zwama',
    reviewsReceivedMany: 'avis me zwama',
    avgRatingPrefix: 'Note ya kati-kati na zulu ya',
    avgRatingSuffix: 'avis',
    emptyState: 'Avis mosi ve bubu.',
  },
  commandes: {
    title: 'Ba commande',
    subtitle: 'Yala ba commande yina boutique na nge me baka.',
    tabAll: 'Yonso',
    tabNew: 'Ya mpa',
    tabOngoing: 'Na nzila',
    tabDelivered: 'Me lungaka',
    tabCancelled: 'Me katulama',
    loading: 'Kekele ba commande…',
    emptyState: 'Kena ve commande na catégorie yayi.',
    accept: 'Ndima',
    refuse: 'Buisa',
    refuseModalTitle: 'Kubuisa commande yayi',
    refuseModalBodyPrefix: 'Commande',
    refuseModalBodySuffix: '— stock ta vutuka na kisika na yandi na mutindu ya automatique.',
    refusePlaceholder: 'Motif ya kubuisa…',
    confirmRefuseBtn: 'Buisa commande',
  },
  commandeDetail: {
    loading: 'Kekele commande…',
    notFound: 'Commande me zwama ve.',
    backToOrdersNotFound: 'Vutuka na ba commande',
    backToOrdersLink: 'Ba commande na mono',
    rateClientTitle: 'Nota client yayi',
    ratingSendError: 'Ta kuka ve kutinda avis na nge.',
    commentPlaceholder: 'Commentaire (kana nge zola)…',
    send: 'Tinda',
    articlesTitle: 'Bima',
    subtotalLabel: 'Yonso ya kati (ndambu ya vendeur)',
    alreadyRatedPrefix: 'Client me notama ·',
    alreadyRatedSuffix: '/5',
    rateClientBtn: 'Nota client yayi',
    cancelReasonLabel: 'Motif ya kukatula :',
    acceptBtn: 'Ndima commande',
    refuseBtn: 'Buisa',
    refuseModalTitle: 'Kubuisa commande yayi',
    refusePlaceholder: 'Motif ya kubuisa…',
    confirmRefuseBtn: 'Buisa commande',
    driverLabel: 'Livreur :',
    starsAriaLabel: 'ba étoile',
    chatBtn: 'Solula na diambu ya commande yayi',
    statusTimelineTitle: 'Statut ya commande',
    stageConfirmee: 'Me ndimama',
    stageAchatMarche: 'Kusumba na zando',
    stagePreparation: 'Kubongisa',
    stageEnRoute: 'Na nzila',
    stageLivree: 'Me pesama',
    stageConfirmeeDesc: 'Commande me zwama mpe ke kekele ndingisa na nge.',
    stageAchatMarcheDesc: 'Nge ke sumba bima ya commande.',
    stagePreparationDesc: 'Commande me bongisama mpe kele pene ya livreur.',
    stageEnRouteDesc: 'Livreur me baka commande mpe ke nata yawu na client.',
    stageLivreeDesc: 'Client me baka commande na yandi.',
  },
  chat: {
    title: 'Disolo',
    backToOrderLink: 'Vutuka na commande',
    loading: 'Kekele disolo…',
    noMessages: 'Ata message mosi ve bubu.',
    messagePlaceholder: 'Sonika message…',
    sendError: 'Ta kuka ve kutinda message yayi.',
    clientLabel: 'Client',
    driverLabel: 'Livreur',
    youLabel: 'Nge',
  },
  litiges: {
    title: 'Ba litige',
    subtitle: 'Ba litige yina me fungwama na ba commande na nge.',
    loading: 'Kekele ba litige…',
    emptyState: 'Litige mosi ve bubu.',
    orderPrefix: 'Commande',
  },
  litigeDetail: {
    loading: 'Kekele litige…',
    notFound: 'Litige me zwama ve.',
    backToLitigesNotFound: 'Vutuka na ba litige',
    backToLitigesLink: 'Ba litige na mono',
    decisionTitle: "Décision de l'administration",
    conversationTitle: 'Discussion',
  },
  notifications: {
    title: 'Ba notification',
    markAllRead: 'Sonika yonso bonso ke tangama',
    loading: 'Kekele…',
    emptyState: 'Notification mosi ve bubu.',
    justNow: 'Sikaawa',
    agoPrefix: 'Mesalaka',
    minUnit: 'min',
    hUnit: 'h',
    dayUnit: 'kilumbu',
  },
  produits: {
    title: 'Bima na mono',
    countOne: 'kima',
    countMany: 'bima',
    addProduct: 'Yika kima',
    loading: 'Kekele bima na nge…',
    emptyState: 'Nge kena ve kima. Yika mosi sambu na kuyantika kuteka.',
    noCategory: 'Kena ve catégorie',
    stockLabelPrefix: 'Stock :',
    edit: 'Soba',
    deleteConfirmTitle: 'Kukatula kima yayi ?',
    deleteConfirmPrefix: '«',
    deleteConfirmSuffix: '» ta katulama mvimba na boutique na nge.',
    deleteConfirmBtn: 'Katula',
    reportOutOfStockTooltip: 'Zabisa rupture ya stock',
    deleteTooltip: 'Katula',
  },
  produitDetail: {
    loading: 'Kekele kima…',
    notFound: 'Kima me zwama ve.',
    backToProductsNotFound: 'Vutuka na bima na mono',
    backToProductsLink: 'Bima na mono',
    title: 'Soba kima',
    notModifiableNote: 'Photo na catégorie ke soba ve na nima ya kusala.',
    currentStockPrefix: 'Stock ya bubu :',
    stockAddPlaceholder: 'Quantité ya kuyika',
    addBtn: 'Yika',
    stockRemovePlaceholder: 'Quantité ya kukatula',
    removeBtn: 'Katula',
    stockRemoveExceedsError: 'Quantité yayi me luta stock ya kubaka.',
    nameLabel: 'Zina ya kima',
    descriptionLabel: 'Description',
    priceLabel: 'Ntalu ya kima (FCFA)',
    unitLabel: 'Unité ya kilo',
    freshnessLabel: 'Fraîcheur',
    freshFrais: 'Frais',
    freshFume: 'Fumé',
    freshCongele: 'Congelé',
    saveError: 'Ta kuka ve kubumba ba mbongolo.',
    saveBtn: 'Bumba ba mbongolo',
    savedBtn: 'Me bumbama !',
  },
  produitNouveau: {
    backToProductsLink: 'Bima na mono',
    title: 'Yika kima',
    subtitle: 'Tula ba malongi ya kima na nge ya mpa.',
    validationPendingWarning: 'Compte na nge ya vendeur ke kekele ndingisa ya administrateur. Nge ta kuka kutinda kaka kana yandi me ndimama.',
    validationSuspendedWarning: 'Compte na nge ya vendeur me kangama. Binga support sambu na kutinda bima.',
    photoLabel: 'Photo ya kima',
    photoHint: 'JPEG, PNG to WebP, 3 Mo na se-esika',
    nameLabel: 'Zina ya kima',
    namePlaceholder: 'Mbandu : Banane Plantain (Makemba)',
    descriptionLabel: 'Description',
    categoryLabel: 'Catégorie',
    categoryPlaceholder: 'Sola…',
    priceLabel: 'Ntalu ya kima (FCFA)',
    unitLabel: 'Unité ya kilo',
    unitPlaceholder: 'Kg, Sachet, Régime…',
    stockLabel: 'Stock ya luyantiku',
    freshnessLabel: 'Fraîcheur',
    freshFrais: 'Frais',
    freshFume: 'Fumé',
    freshCongele: 'Congelé',
    error: 'Ta kuka ve kuyika kima yayi.',
    publishBtn: 'Tinda kima',
  },
  profil: {
    title: 'Profil ya boutique',
    connectedAccount: 'Compte yina me kota',
    storeSectionTitle: 'Boutique',
    storeNameLabel: 'Zina ya boutique',
    storeNamePlaceholder: 'Zina ya boutique na nge',
    gpsLabel: 'Position GPS ya boutique',
    gpsHint: 'Ke sadisa sambu na kutanga ntalu ya livraison na distance ya kieleka tii na client.',
    positionPrefix: 'Position :',
    useCurrentPosition: 'Sadila position na mono ya bubu',
    paymentInfoLabel: 'Ba coordonnées ya paiement',
    paymentInfoHint: 'Numéro mobile money yina ta zwa ba retrait na nge.',
    mobileMoneyPlaceholder: 'mbandu : 06 123 45 67',
    hoursLabel: 'Ba ngonga ya kufungwama',
    hoursPlaceholder: 'mbandu : Kilumbu1-Kilumbu6 8h-19h',
    saveError: 'Ta kuka ve kubumba ba mbongolo.',
    saveBtn: 'Bumba',
    savedBtn: 'Me bumbama !',
    documentsTitle: 'Ba documents ya boutique',
    docPhotoBoutique: 'Photo ya boutique',
    docIdentite: 'Document ya identité',
    docRegistre: 'Registre de commerce (RCCM)',
    noFileSelected: 'Fichier mosi ve me solama',
    sendDocsBtn: 'Tinda ba documents',
    docsSentBtn: 'Ba documents me tindama !',
    changePasswordTitle: 'Soba mot de passe',
    currentPasswordPlaceholder: 'Mot de passe ya lelo',
    newPasswordPlaceholder: 'Mot de passe ya mpa (bilembo 8 na se moke)',
    confirmPasswordPlaceholder: 'Ndima mot de passe ya mpa',
    passwordMismatch: 'Ba mot de passe ke fwana ve.',
    passwordError: 'Ta kuka ve kusoba mot de passe.',
    changePasswordBtn: 'Soba mot de passe',
    passwordChangedBtn: 'Mot de passe me sobama, kukota dyaka…',
  },
  revenus: {
    title: 'Mbongo na mono',
    subtitle: 'Landa ba vente na nge mpi yala ba retrait na nge.',
    loading: 'Kekele mbongo na nge…',
    loadError: 'Ta kuka ve kubaka mbongo na nge.',
    statAvailableBalance: 'Mbongo ya kuzala',
    statGrossRevenue: 'Mbongo ya mvimba (ngonda)',
    statCommissions: 'Ba commission',
    statNetRevenue: 'Mbongo ya peto (ngonda)',
    salesChartTitle: 'Ba vente ya bilumbu 7 me luta',
    topProductsTitle: 'Bima ya kutekasa mingi',
    noSales: 'Kena ve vente me lungaka bubu.',
    soldSuffix: 'me tekasa',
    withdrawFormTitle: 'Lomba retrait',
    amountLabel: 'Montant (FCFA)',
    methodLabel: 'Mutindu',
    methodMtn: 'MTN Mobile Money',
    methodAirtel: 'Airtel Money',
    methodBank: 'Virement bancaire',
    receptionNumberLabel: 'Numéro yina ta zwa',
    receptionNumberPlaceholder: 'Numéro mobile money to RIB',
    submitError: 'Ta kuka ve kutinda demande.',
    submitBtn: 'Tinda demande',
    submittedBtn: 'Demande me tindama !',
    withdrawHistoryTitle: 'Historique ya ba retrait',
    noWithdrawals: 'Kena ve demande ya retrait.',
    statusPending: 'Kuzenga',
    statusValidated: 'Me ndimama',
    statusRejected: 'Me buisama',
  },
  support: {
    title: 'Support Zando na Ndako',
    subtitle: 'Solula mbala mosi na ekipe ya administration.',
    newMessageBtn: 'Message ya mpa',
    loading: 'Kekele ba discussion…',
    emptyState: 'Kena ve discussion na administration bubu.',
    unreadBadge: 'Ke tangama ve',
    modalTitle: 'Message ya mpa',
    objectLabel: 'Motuya',
    messageLabel: 'Message',
    sendBtn: 'Tinda',
    sendError: 'Ta kuka ve kutinda message.',
  },
  supportThread: {
    loading: 'Kekele discussion…',
    notFound: 'Discussion me zwama ve.',
    backToSupportNotFound: 'Vutuka na support',
    backToSupportLink: 'Support',
    youLabel: 'Nge',
    teamLabel: 'Zando na Ndako',
    replyPlaceholder: 'Vutula…',
    replyError: 'Ta kuka ve kutinda mvutu.',
  },
};

const en: VendorTranslations = {
  common: { clientFallback: 'Customer', cancel: 'Cancel', save: 'Save' },
  dashboard: {
    loading: 'Loading dashboard…',
    loadError: 'Unable to load your dashboard.',
    greeting: 'Hello',
    subtitle: 'Your store at a glance today.',
    notValidatedPrefix: 'Your store is not yet validated (',
    notValidatedSuffix: '). Some features may be limited.',
    statOrdersToday: 'Orders today',
    statOrdersOngoing: 'Orders in progress',
    statOrdersDelivered: 'Delivered orders',
    statRevenueMonth: 'Revenue this month',
    statProductsOnline: 'Products online',
    statTotalSuffix: 'in total',
    statOutOfStock: 'Out of stock',
    statAvailableBalance: 'Available balance',
    statAvgRating: 'Average rating',
    quickAddProductTitle: 'Add a product',
    quickAddProductDesc: 'Publish a new item in your store.',
    quickOrdersTitle: 'Manage orders',
    quickOrdersDesc: 'Accept or refuse the orders you receive.',
    quickWithdrawTitle: 'Request withdrawal',
    quickWithdrawDesc: 'Transfer your available balance.',
  },
  avis: {
    loading: 'Loading reviews…',
    loadError: 'Unable to load your reviews.',
    reviewsReceivedOne: 'review received',
    reviewsReceivedMany: 'reviews received',
    avgRatingPrefix: 'Average rating over',
    avgRatingSuffix: 'reviews',
    emptyState: 'No reviews yet.',
  },
  commandes: {
    title: 'Orders',
    subtitle: 'Manage the orders received by your store.',
    tabAll: 'All',
    tabNew: 'New',
    tabOngoing: 'Ongoing',
    tabDelivered: 'Delivered',
    tabCancelled: 'Cancelled',
    loading: 'Loading orders…',
    emptyState: 'No orders in this category.',
    accept: 'Accept',
    refuse: 'Refuse',
    refuseModalTitle: 'Refuse this order',
    refuseModalBodyPrefix: 'Order',
    refuseModalBodySuffix: '— the stock will be automatically restored.',
    refusePlaceholder: 'Reason for refusal…',
    confirmRefuseBtn: 'Refuse the order',
  },
  commandeDetail: {
    loading: 'Loading order…',
    notFound: 'Order not found.',
    backToOrdersNotFound: 'Back to orders',
    backToOrdersLink: 'My orders',
    rateClientTitle: 'Rate this client',
    ratingSendError: 'Unable to send this review.',
    commentPlaceholder: 'A comment (optional)…',
    send: 'Send',
    articlesTitle: 'Items',
    subtotalLabel: 'Subtotal (vendor share)',
    alreadyRatedPrefix: 'Client rated ·',
    alreadyRatedSuffix: '/5',
    rateClientBtn: 'Rate this client',
    cancelReasonLabel: 'Cancellation reason:',
    acceptBtn: 'Accept order',
    refuseBtn: 'Refuse',
    refuseModalTitle: 'Refuse this order',
    refusePlaceholder: 'Reason for refusal…',
    confirmRefuseBtn: 'Refuse the order',
    driverLabel: 'Driver:',
    starsAriaLabel: 'stars',
    chatBtn: 'Chat about this order',
    statusTimelineTitle: 'Order status',
    stageConfirmee: 'Confirmed',
    stageAchatMarche: 'Market purchase',
    stagePreparation: 'Preparation',
    stageEnRoute: 'On the way',
    stageLivree: 'Delivered',
    stageConfirmeeDesc: 'The order has been received and is awaiting your acceptance.',
    stageAchatMarcheDesc: 'You are purchasing the ordered products.',
    stagePreparationDesc: 'The order is packed and ready for the driver.',
    stageEnRouteDesc: 'The driver has picked up the order and is delivering it to the client.',
    stageLivreeDesc: 'The client has received their order.',
  },
  chat: {
    title: 'Conversation',
    backToOrderLink: 'Back to order',
    loading: 'Loading conversation…',
    noMessages: 'No messages yet.',
    messagePlaceholder: 'Write a message…',
    sendError: 'Unable to send this message.',
    clientLabel: 'Client',
    driverLabel: 'Driver',
    youLabel: 'You',
  },
  litiges: {
    title: 'Disputes',
    subtitle: 'Disputes open on your orders.',
    loading: 'Loading disputes…',
    emptyState: 'No disputes yet.',
    orderPrefix: 'Order',
  },
  litigeDetail: {
    loading: 'Loading dispute…',
    notFound: 'Dispute not found.',
    backToLitigesNotFound: 'Back to disputes',
    backToLitigesLink: 'My disputes',
    decisionTitle: "Administration's decision",
    conversationTitle: 'Conversation',
  },
  notifications: {
    title: 'Notifications',
    markAllRead: 'Mark all as read',
    loading: 'Loading…',
    emptyState: 'No notifications yet.',
    justNow: 'Just now',
    agoPrefix: '',
    minUnit: 'min ago',
    hUnit: 'h ago',
    dayUnit: 'd ago',
  },
  produits: {
    title: 'My products',
    countOne: 'product',
    countMany: 'products',
    addProduct: 'Add a product',
    loading: 'Loading your products…',
    emptyState: "You don't have any products yet. Add one to start selling.",
    noCategory: 'No category',
    stockLabelPrefix: 'Stock:',
    edit: 'Edit',
    deleteConfirmTitle: 'Delete this product?',
    deleteConfirmPrefix: '«',
    deleteConfirmSuffix: '» will be permanently removed from your store.',
    deleteConfirmBtn: 'Delete',
    reportOutOfStockTooltip: 'Report out of stock',
    deleteTooltip: 'Delete',
  },
  produitDetail: {
    loading: 'Loading product…',
    notFound: 'Product not found.',
    backToProductsNotFound: 'Back to my products',
    backToProductsLink: 'My products',
    title: 'Edit product',
    notModifiableNote: 'Photo and category cannot be changed after creation.',
    currentStockPrefix: 'Current stock:',
    stockAddPlaceholder: 'Quantity to add',
    addBtn: 'Add',
    stockRemovePlaceholder: 'Quantity to remove',
    removeBtn: 'Remove',
    stockRemoveExceedsError: 'This quantity exceeds the available stock.',
    nameLabel: 'Product name',
    descriptionLabel: 'Description',
    priceLabel: 'Unit price (FCFA)',
    unitLabel: 'Unit of measure',
    freshnessLabel: 'Freshness',
    freshFrais: 'Fresh',
    freshFume: 'Smoked',
    freshCongele: 'Frozen',
    saveError: 'Unable to save the changes.',
    saveBtn: 'Save changes',
    savedBtn: 'Saved!',
  },
  produitNouveau: {
    backToProductsLink: 'My products',
    title: 'Add a product',
    subtitle: 'Fill in the details of your new item.',
    validationPendingWarning: 'Your vendor account is awaiting validation by an administrator. You will be able to publish once it is validated.',
    validationSuspendedWarning: 'Your vendor account is suspended. Contact support to publish products.',
    photoLabel: 'Product photo',
    photoHint: 'JPEG, PNG or WebP, 3 MB max',
    nameLabel: 'Product name',
    namePlaceholder: 'e.g. Banana Plantain (Makemba)',
    descriptionLabel: 'Description',
    categoryLabel: 'Category',
    categoryPlaceholder: 'Select…',
    priceLabel: 'Unit price (FCFA)',
    unitLabel: 'Unit of measure',
    unitPlaceholder: 'Kg, Bag, Bunch…',
    stockLabel: 'Initial stock',
    freshnessLabel: 'Freshness',
    freshFrais: 'Fresh',
    freshFume: 'Smoked',
    freshCongele: 'Frozen',
    error: 'Unable to add this product.',
    publishBtn: 'Publish product',
  },
  profil: {
    title: 'Store profile',
    connectedAccount: 'Logged in account',
    storeSectionTitle: 'Store',
    storeNameLabel: 'Business name',
    storeNamePlaceholder: "Your store's name",
    gpsLabel: 'Pickup point (GPS position)',
    gpsHint: 'Used to calculate delivery cost based on real distance to the customer.',
    positionPrefix: 'Position:',
    useCurrentPosition: 'Use my current position',
    paymentInfoLabel: 'Payment details',
    paymentInfoHint: 'Mobile money number that will receive your withdrawals.',
    mobileMoneyPlaceholder: 'e.g. 06 123 45 67',
    hoursLabel: 'Opening hours',
    hoursPlaceholder: 'e.g. Mon-Sat 8am-7pm',
    saveError: 'Unable to save the changes.',
    saveBtn: 'Save',
    savedBtn: 'Saved!',
    documentsTitle: 'Store documents',
    docPhotoBoutique: 'Store photo',
    docIdentite: 'ID document',
    docRegistre: 'Business registration (RCCM)',
    noFileSelected: 'No file selected',
    sendDocsBtn: 'Send documents',
    docsSentBtn: 'Documents sent!',
    changePasswordTitle: 'Change password',
    currentPasswordPlaceholder: 'Current password',
    newPasswordPlaceholder: 'New password (min. 8 characters)',
    confirmPasswordPlaceholder: 'Confirm new password',
    passwordMismatch: 'Passwords do not match.',
    passwordError: 'Unable to change password.',
    changePasswordBtn: 'Change password',
    passwordChangedBtn: 'Password changed, signing in again…',
  },
  revenus: {
    title: 'Revenue',
    subtitle: 'Track your sales and manage your withdrawals.',
    loading: 'Loading your revenue…',
    loadError: 'Unable to load your revenue.',
    statAvailableBalance: 'Available balance',
    statGrossRevenue: 'Gross revenue (month)',
    statCommissions: 'Commissions',
    statNetRevenue: 'Net revenue (month)',
    salesChartTitle: 'Sales over the last 7 days',
    topProductsTitle: 'Best-selling products',
    noSales: 'No delivered sales yet.',
    soldSuffix: 'sold',
    withdrawFormTitle: 'Request a withdrawal',
    amountLabel: 'Amount (FCFA)',
    methodLabel: 'Method',
    methodMtn: 'MTN Mobile Money',
    methodAirtel: 'Airtel Money',
    methodBank: 'Bank transfer',
    receptionNumberLabel: 'Receiving number',
    receptionNumberPlaceholder: 'Mobile money number or bank details',
    submitError: 'Unable to submit the request.',
    submitBtn: 'Submit request',
    submittedBtn: 'Request sent!',
    withdrawHistoryTitle: 'Withdrawal history',
    noWithdrawals: 'No withdrawal requests.',
    statusPending: 'Pending',
    statusValidated: 'Approved',
    statusRejected: 'Rejected',
  },
  support: {
    title: 'Zando na Ndako Support',
    subtitle: 'Chat directly with the admin team.',
    newMessageBtn: 'New message',
    loading: 'Loading conversations…',
    emptyState: 'No conversation with admin yet.',
    unreadBadge: 'Unread',
    modalTitle: 'New message',
    objectLabel: 'Subject',
    messageLabel: 'Message',
    sendBtn: 'Send',
    sendError: 'Unable to send this message.',
  },
  supportThread: {
    loading: 'Loading conversation…',
    notFound: 'Conversation not found.',
    backToSupportNotFound: 'Back to support',
    backToSupportLink: 'Support',
    youLabel: 'You',
    teamLabel: 'Zando na Ndako',
    replyPlaceholder: 'Reply…',
    replyError: 'Unable to send the reply.',
  },
};

export const vendorTranslations: Record<Language, VendorTranslations> = { fr, lingala, kituba, en };
