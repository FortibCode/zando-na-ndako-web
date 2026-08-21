// Traductions pour toutes les pages/composants CLIENT (local + diaspora) sous src/app/(site)/ et
// src/components/landing/. Espace de noms séparé de vendor-translations.ts pour permettre un
// travail parallèle sans conflit sur le même fichier (piège déjà rencontré une fois cette session).
//
// Sourcing : quand un concept existe déjà côté mobile (mobile/src/i18n/translations.ts — panier,
// commande, adresse, créneau, paiement, favoris, notifications, litiges, mode diaspora, etc.), les
// valeurs lingala/kituba/en ont été reprises telles quelles de ce fichier. Les sections propres au
// site web (vitrine marketing : Hero, Benefits, HowItWorks, Partners, Testimonials, Footer,
// AppBanner, AnnouncementBar, ZoneModal — et la page de panier partagé /panier/partage/[token], qui
// n'a pas d'équivalent mobile) ont été traduites simplement et prudemment faute d'équivalent mobile.
import type { Language } from './translations';

export interface ClientTranslations {
  common: {
    loading: string;
    back: string;
    cancel: string;
  };
  promoBanner: {
    promoOfDayLabel: string;
    offerNow: string;
    freshOffer: string;
    defaultProductName: string;
    defaultDescription: string;
    discountSuffix: string;
    discoverOffer: string;
    viewAllPromotions: string;
  };
  productCard: {
    freshBadge: string;
    addToCart: string;
    added: string;
    decreaseAria: string;
    increaseAria: string;
    addFavoriteAria: string;
    removeFavoriteAria: string;
    addedToCartSuffix: string;
    addedToFavoritesSuffix: string;
    removedFromFavoritesSuffix: string;
  };
  hero: {
    zonePrefix: string;
    title1: string;
    title2: string;
    subtitle: string;
    orderNow: string;
    createAccount: string;
  };
  benefits: {
    fresh: string;
    delivery: string;
    payment: string;
    support: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  partners: {
    title: string;
    subtitle: string;
    verifiedBadge: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
    prevAria: string;
    nextAria: string;
    dotAriaPrefix: string;
  };
  footer: {
    tagline: string;
    usefulLinks: string;
    about: string;
    howItWorks: string;
    ourPartners: string;
    terms: string;
    privacy: string;
    faq: string;
    categoriesTitle: string;
    contactTitle: string;
    rightsReserved: string;
    cgu: string;
    confidentiality: string;
    contact: string;
    addressLine: string;
  };
  appBanner: {
    badge: string;
    titleLine: string;
    subtitle: string;
    availableOn: string;
    googlePlay: string;
    downloadOnThe: string;
    appStore: string;
    ourCategories: string;
    availableInBrazzaville: string;
    googlePlayToast: string;
    appStoreToast: string;
  };
  announcementBar: {
    badge: string;
    message: string;
    supportLabel: string;
    closeAria: string;
  };
  whatsapp: {
    label: string;
    ariaLabel: string;
  };
  zoneModal: {
    title: string;
    subtitle: string;
    closeAria: string;
    searchPlaceholder: string;
    noResultsPrefix: string;
    neighborhoodsLabel: string;
  };
  categoriesSection: {
    title: string;
    viewAll: string;
  };
  featuredProducts: {
    title: string;
    viewAll: string;
  };
  categoriesPage: {
    title: string;
    productSuffix: string;
  };
  categoryDetail: {
    home: string;
    availabilityAll: string;
    inStock: string;
    outOfStock: string;
    sortRelevance: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    emptyTitle: string;
    productsAvailableSuffix: string;
  };
  produits: {
    title: string;
    searchPlaceholder: string;
    emptyTitle: string;
  };
  produitDetail: {
    backToCatalog: string;
    notFoundTitle: string;
    notFoundDesc: string;
    outOfStockBadge: string;
    addToCart: string;
    added: string;
    unavailable: string;
    decreaseAria: string;
    increaseAria: string;
    addFavoriteAria: string;
    removeFavoriteAria: string;
    addedToCartSuffix: string;
  };
  accueil: {
    greetingPrefix: string;
    openStatus: string;
    tagline: string;
    searchPlaceholder: string;
    expressDeliveryTitle: string;
    expressDeliverySubPrefix: string;
    myFavoritesTitle: string;
    favoritesSavedSuffix: string;
    noFavoritesYet: string;
    diasporaTitle: string;
    diasporaSubtitle: string;
  };
  panier: {
    title: string;
    clear: string;
    emptyTitle: string;
    emptySub: string;
    discoverProducts: string;
    summary: string;
    subtotalPrefix: string;
    articlesSuffix: string;
    deliveryFee: string;
    deliveryFeeComputed: string;
    total: string;
    deliveryNote: string;
    shareCart: string;
    sharing: string;
    shareError: string;
    copyLink: string;
    copied: string;
    checkoutSelf: string;
    checkoutDiaspora: string;
    guestPrompt: string;
    decreaseAria: string;
    increaseAria: string;
    removeAria: string;
  };
  cartDrawer: {
    title: string;
    itemsSelectedSuffix: string;
    closeAria: string;
    emptyTitle: string;
    emptyDesc: string;
    decreaseAria: string;
    increaseAria: string;
    removeAria: string;
    subtotal: string;
    deliveryFee: string;
    deliveryFeeComputed: string;
    shareCart: string;
    sharing: string;
    copyLink: string;
    copied: string;
    clear: string;
    checkout: string;
  };
  favoris: {
    title: string;
    emptyMessage: string;
    discoverCatalog: string;
  };
  promotions: {
    title: string;
    loading: string;
    subtitle: string;
    emptyTitle: string;
    emptyDesc: string;
  };
  notifications: {
    title: string;
    markAllRead: string;
    emptyTitle: string;
    justNow: string;
    minutesAgoSuffix: string;
    hoursAgoSuffix: string;
    daysAgoSuffix: string;
    agoPrefix: string;
  };
  mesCommandes: {
    title: string;
    searchPlaceholder: string;
    tabAll: string;
    tabOngoing: string;
    tabDone: string;
    tabCancelled: string;
    emptyTitle: string;
    discoverMarket: string;
    statusDelivered: string;
    statusCancelled: string;
    statusOngoing: string;
  };
  commandeDetail: {
    back: string;
    notFoundTitle: string;
    statusConfirmed: string;
    statusShopping: string;
    statusPreparing: string;
    statusEnRoute: string;
    statusArriving: string;
    statusDelivered: string;
    statusCancelled: string;
    call: string;
    total: string;
    noteVendor: string;
    noteDriver: string;
    thanksForReview: string;
    cancelOrder: string;
    cancelReasonPlaceholder: string;
    confirmCancel: string;
    cancelling: string;
    cancelError: string;
    reorder: string;
    viewDispute: string;
    reportProblem: string;
    disputeDescPlaceholder: string;
    openLitigeError: string;
    disputeSend: string;
    disputeSending: string;
    ratingCommentPlaceholder: string;
    ratingSend: string;
    ratingSending: string;
    starAriaSuffix: string;
  };
  mesLitiges: {
    title: string;
    emptyTitle: string;
    emptyDesc: string;
  };
  litigeDetail: {
    back: string;
    notFound: string;
    decisionTitle: string;
    conversationTitle: string;
  };
  litigeConversation: {
    noMessages: string;
    closedNotice: string;
    messagePlaceholder: string;
    sendError: string;
    uploadError: string;
    clientLabel: string;
    vendorLabel: string;
  };
  monCompte: {
    defaultTitle: string;
    myOrders: string;
    myAddresses: string;
    myBeneficiaries: string;
    favoritesLabel: string;
    notificationsLabel: string;
    myDisputes: string;
    settingsLabel: string;
    diasporaBadge: string;
    myInfoTitle: string;
    nom: string;
    prenom: string;
    email: string;
    ville: string;
    adresse: string;
    saving: string;
    saveChanges: string;
    saved: string;
    saveError: string;
    logout: string;
  };
  checkoutSteps: {
    addressLabel: string;
    slotLabel: string;
    paymentLabel: string;
    beneficiaryLabel: string;
  };
  checkoutAddress: {
    title: string;
    subtitle: string;
    defaultBadge: string;
    setDefaultTitle: string;
    deleteTitle: string;
    addAddress: string;
    newAddressTitle: string;
    labelPlaceholder: string;
    addressPlaceholder: string;
    neighborhoodPlaceholder: string;
    cityPlaceholder: string;
    saveError: string;
    saving: string;
    saveAddress: string;
    continueBtn: string;
  };
  checkoutSlot: {
    title: string;
    subtitle: string;
    computingFees: string;
    estimatedFeesPrefix: string;
    today: string;
    tomorrow: string;
    continueToPayment: string;
  };
  checkoutPayment: {
    title: string;
    totalToPayPrefix: string;
    methodCod: string;
    methodCodHint: string;
    methodCard: string;
    methodCardHint: string;
    methodMtn: string;
    methodAirtel: string;
    methodMobileHint: string;
    requestSentPrefix: string;
    requestSentSuffix: string;
    approveUssd: string;
    thenEnterCode: string;
    codePlaceholder: string;
    confirmPayment: string;
    confirmOrder: string;
    deliveryUnavailableError: string;
    finalizeOrderError: string;
    invalidCodeError: string;
    mtnRequestSent: string;
    mtnEnterPin: string;
    mtnWaiting: string;
    mtnFailed: string;
    mtnTimeout: string;
  };
  checkoutConfirmed: {
    title: string;
    messagePrefix: string;
    messageMiddle: string;
    messageEnd: string;
    trackOrder: string;
    backHome: string;
  };
  diasporaActivation: {
    title: string;
    feature1: string;
    feature2: string;
    feature3: string;
    cta: string;
    later: string;
    back: string;
  };
  diasporaBeneficiary: {
    title: string;
    subtitle: string;
    defaultBadge: string;
    relationDefault: string;
    setDefaultTitle: string;
    deleteTitle: string;
    addBeneficiary: string;
    newBeneficiaryTitle: string;
    namePlaceholder: string;
    phonePlaceholder: string;
    relationPlaceholder: string;
    addressPlaceholder: string;
    neighborhoodPlaceholder: string;
    cityPlaceholder: string;
    saveError: string;
    saving: string;
    saveBeneficiary: string;
    continueBtn: string;
  };
  diasporaSlot: {
    title: string;
    subtitlePrefix: string;
    subtitleSuffix: string;
    computingFees: string;
    estimatedFeesPrefix: string;
    continueToPayment: string;
  };
  diasporaPayment: {
    title: string;
    totalPrefix: string;
    methodCard: string;
    methodCardHint: string;
    methodPaypal: string;
    methodPaypalHint: string;
    finalizeViaPrefix: string;
    finalizeViaSuffix: string;
    referencePlaceholder: string;
    confirmPayment: string;
    confirmOrder: string;
    deliveryUnavailableError: string;
    finalizeOrderError: string;
    invalidReferenceError: string;
  };
  sharedCart: {
    title: string;
    sentByPrefix: string;
    forPrefix: string;
    introPrefix: string;
    introMiddle: string;
    introEnd: string;
    articlesSuffix: string;
    footerNotePrefix: string;
    footerNoteSuffix: string;
    defaultSender: string;
    defaultSenderAlt: string;
    invalidTitle: string;
    backHome: string;
  };
}

const fr: ClientTranslations = {
  common: {
    loading: 'Chargement…',
    back: 'Retour',
    cancel: 'Annuler',
  },
  promoBanner: {
    promoOfDayLabel: 'Promo du jour',
    offerNow: 'Offre du moment',
    freshOffer: 'Offre fraîche',
    defaultProductName: 'Poisson frais',
    defaultDescription: 'Découvrez notre sélection de poissons frais du jour',
    discountSuffix: 'sur ce produit en ce moment',
    discoverOffer: "Découvrir l'offre",
    viewAllPromotions: 'Voir toutes les promotions',
  },
  productCard: {
    freshBadge: 'Produits Frais',
    addToCart: 'Ajouter au panier',
    added: 'Ajouté !',
    decreaseAria: 'Diminuer la quantité',
    increaseAria: 'Augmenter la quantité',
    addFavoriteAria: 'Ajouter aux favoris',
    removeFavoriteAria: 'Retirer des favoris',
    addedToCartSuffix: 'ajouté à votre panier.',
    addedToFavoritesSuffix: 'ajouté à vos favoris.',
    removedFromFavoritesSuffix: 'retiré de vos favoris.',
  },
  hero: {
    zonePrefix: 'Livraison à',
    title1: 'Le marché',
    title2: 'vient chez vous',
    subtitle: 'Vos produits frais et essentiels, livrés chez vous en toute simplicité et en un temps record.',
    orderNow: 'Commander maintenant',
    createAccount: 'Créer un compte',
  },
  benefits: {
    fresh: 'Produits frais\net de qualité',
    delivery: 'Livraison rapide\net fiable',
    payment: 'Paiement sécurisé\nà 100%',
    support: 'Assistance 24h/24\nà votre écoute',
  },
  howItWorks: {
    title: 'Comment ça marche ?',
    subtitle: 'Votre marché à domicile en 3 étapes simples.',
    step1Title: '1. Choisissez vos produits',
    step1Desc: 'Parcourez nos catégories fraîches de Brazzaville et ajoutez vos articles au panier.',
    step2Title: '2. Passez votre commande',
    step2Desc: "Validez votre panier, choisissez votre commune (Poto-Poto, Bacongo...) et votre mode de paiement.",
    step3Title: '3. Livraison express à domicile',
    step3Desc: 'Votre marché frais est livré directement chez vous en 30 à 60 minutes chrono.',
  },
  partners: {
    title: 'Nos partenaires & vendeurs de confiance',
    subtitle: 'Les meilleurs marchés et producteurs locaux livrés chez vous.',
    verifiedBadge: '100% Vendeurs vérifiés',
  },
  testimonials: {
    title: 'Ce que disent nos clients',
    subtitle: "Avis vérifiés d'utilisateurs au Congo.",
    prevAria: 'Témoignage précédent',
    nextAria: 'Témoignage suivant',
    dotAriaPrefix: 'Aller au témoignage',
  },
  footer: {
    tagline: 'Votre marché en ligne de confiance. Des produits frais, livrés chez vous en toute simplicité.',
    usefulLinks: 'Liens utiles',
    about: 'À propos',
    howItWorks: 'Comment ça marche',
    ourPartners: 'Nos partenaires',
    terms: 'Conditions générales',
    privacy: 'Politique de confidentialité',
    faq: 'FAQ',
    categoriesTitle: 'Catégories',
    contactTitle: 'Contact',
    rightsReserved: '© 2024 Zando na Ndako. Tous droits réservés.',
    cgu: 'CGU',
    confidentiality: 'Confidentialité',
    contact: 'Contact',
    addressLine: "Avenue de l'Indépendance, Poto-Poto, Brazzaville, Congo",
  },
  appBanner: {
    badge: 'Application Mobile Officielle',
    titleLine: "Téléchargez l'application",
    subtitle: 'Faites vos courses au marché de Brazzaville depuis votre téléphone, où que vous soyez.',
    availableOn: 'DISPONIBLE SUR',
    googlePlay: 'Google Play',
    downloadOnThe: "Télécharger dans l'",
    appStore: 'App Store',
    ourCategories: 'Nos catégories',
    availableInBrazzaville: 'Disponible à Brazzaville',
    googlePlayToast: 'Redirection vers Google Play Store…',
    appStoreToast: 'Redirection vers Apple App Store…',
  },
  announcementBar: {
    badge: 'Offre Spéciale',
    message: 'Livraison gratuite à Brazzaville dès 15 000 FCFA avec le code',
    supportLabel: 'Support :',
    closeAria: "Fermer la barre d'annonce",
  },
  whatsapp: {
    label: 'Commander via WhatsApp',
    ariaLabel: 'Commander par WhatsApp',
  },
  zoneModal: {
    title: 'Zone de livraison',
    subtitle: 'Choisissez votre commune ou secteur',
    closeAria: 'Fermer le modal',
    searchPlaceholder: 'Rechercher une commune (Poto-Poto, Bacongo, Ouenzé...)',
    noResultsPrefix: 'Aucune zone trouvée pour',
    neighborhoodsLabel: 'Quartiers :',
  },
  categoriesSection: {
    title: 'Nos catégories populaires',
    viewAll: 'Voir toutes les catégories',
  },
  featuredProducts: {
    title: 'Nos produits vedettes',
    viewAll: 'Voir tout',
  },
  categoriesPage: {
    title: 'Catégories',
    productSuffix: 'produit',
  },
  categoryDetail: {
    home: 'Accueil',
    availabilityAll: 'Toute disponibilité',
    inStock: 'En stock',
    outOfStock: 'Rupture',
    sortRelevance: 'Pertinence',
    sortPriceAsc: 'Prix croissant',
    sortPriceDesc: 'Prix décroissant',
    emptyTitle: 'Aucun produit dans cette catégorie pour le moment',
    productsAvailableSuffix: 'disponible',
  },
  produits: {
    title: 'Tous nos produits',
    searchPlaceholder: 'Rechercher un produit…',
    emptyTitle: 'Aucun produit trouvé',
  },
  produitDetail: {
    backToCatalog: 'Retour au catalogue',
    notFoundTitle: 'Produit introuvable',
    notFoundDesc: "Ce produit n'existe pas ou n'est plus disponible.",
    outOfStockBadge: 'Rupture de stock',
    addToCart: 'Ajouter au panier',
    added: 'Ajouté !',
    unavailable: 'Indisponible',
    decreaseAria: 'Diminuer la quantité',
    increaseAria: 'Augmenter la quantité',
    addFavoriteAria: 'Ajouter aux favoris',
    removeFavoriteAria: 'Retirer des favoris',
    addedToCartSuffix: 'ajouté à votre panier.',
  },
  accueil: {
    greetingPrefix: 'Bonjour',
    openStatus: 'Ouvert',
    tagline: 'Le marché frais, livré chez vous',
    searchPlaceholder: 'Rechercher un produit, un marché…',
    expressDeliveryTitle: 'Livraison express à Brazzaville',
    expressDeliverySubPrefix: 'En 30–60 min · dès',
    myFavoritesTitle: 'Mes favoris',
    favoritesSavedSuffix: 'enregistré(s)',
    noFavoritesYet: 'Aucun favori pour le moment',
    diasporaTitle: "Commander pour quelqu'un au Congo",
    diasporaSubtitle: 'Mode Diaspora',
  },
  panier: {
    title: 'Mon panier',
    clear: 'Vider',
    emptyTitle: 'Votre panier est vide',
    emptySub: 'Ajoutez des produits pour commencer.',
    discoverProducts: 'Découvrir nos produits',
    summary: 'Résumé',
    subtotalPrefix: 'Sous-total',
    articlesSuffix: 'article(s)',
    deliveryFee: 'Frais de livraison',
    deliveryFeeComputed: "Calculés à l'étape suivante",
    total: 'Total à payer',
    deliveryNote: '🛵 Livraison en 30–60 min · Zone : Brazzaville uniquement',
    shareCart: 'Partager ce panier avec le bénéficiaire',
    sharing: 'Partage en cours…',
    shareError: 'Impossible de partager ce panier pour le moment.',
    copyLink: 'Copier le lien',
    copied: 'Copié !',
    checkoutSelf: 'Commander maintenant',
    checkoutDiaspora: 'Commander pour un proche',
    guestPrompt: 'Créez un compte ou connectez-vous pour finaliser votre commande.',
    decreaseAria: 'Diminuer',
    increaseAria: 'Augmenter',
    removeAria: 'Supprimer',
  },
  cartDrawer: {
    title: 'Mon Panier',
    itemsSelectedSuffix: 'sélectionné(s)',
    closeAria: 'Fermer le panier',
    emptyTitle: 'Votre panier est vide',
    emptyDesc: 'Ajoutez des produits frais depuis notre marché.',
    decreaseAria: 'Diminuer la quantité',
    increaseAria: 'Augmenter la quantité',
    removeAria: "Supprimer l'article",
    subtotal: 'Sous-total',
    deliveryFee: 'Frais de livraison',
    deliveryFeeComputed: "Calculés à l'étape suivante",
    shareCart: 'Partager ce panier avec le bénéficiaire',
    sharing: 'Partage en cours…',
    copyLink: 'Copier le lien',
    copied: 'Copié !',
    clear: 'Vider',
    checkout: 'Passer la commande',
  },
  favoris: {
    title: 'Mes favoris',
    emptyMessage: "Vous n'avez pas encore de favoris",
    discoverCatalog: 'Découvrir le catalogue',
  },
  promotions: {
    title: 'Promotions',
    loading: 'Chargement…',
    subtitle: 'Offres en cours chez nos vendeurs',
    emptyTitle: 'Aucune promotion en cours',
    emptyDesc: "Revenez bientôt : les réductions mises en place par nos vendeurs s'affichent ici automatiquement.",
  },
  notifications: {
    title: 'Notifications',
    markAllRead: 'Tout marquer comme lu',
    emptyTitle: 'Aucune notification pour le moment',
    justNow: "à l'instant",
    minutesAgoSuffix: 'min',
    hoursAgoSuffix: 'h',
    daysAgoSuffix: 'j',
    agoPrefix: 'il y a',
  },
  mesCommandes: {
    title: 'Mes commandes',
    searchPlaceholder: 'Rechercher par numéro de commande…',
    tabAll: 'Toutes',
    tabOngoing: 'En cours',
    tabDone: 'Terminées',
    tabCancelled: 'Annulées',
    emptyTitle: 'Aucune commande pour le moment',
    discoverMarket: 'Découvrir le marché',
    statusDelivered: 'Livrée',
    statusCancelled: 'Annulée',
    statusOngoing: 'En cours',
  },
  commandeDetail: {
    back: 'Mes commandes',
    notFoundTitle: 'Commande introuvable',
    statusConfirmed: 'Confirmée',
    statusShopping: 'Achats en cours',
    statusPreparing: 'En préparation',
    statusEnRoute: 'Livreur en route',
    statusArriving: 'Arrivée imminente',
    statusDelivered: 'Livrée',
    statusCancelled: 'Annulée',
    call: 'Appeler',
    total: 'Total',
    noteVendor: 'Noter le vendeur',
    noteDriver: 'Noter le livreur',
    thanksForReview: 'Merci pour votre avis !',
    cancelOrder: 'Annuler la commande',
    cancelReasonPlaceholder: "Motif de l'annulation…",
    confirmCancel: "Confirmer l'annulation",
    cancelling: 'Annulation…',
    cancelError: "Impossible d'annuler cette commande.",
    reorder: 'Commander à nouveau',
    viewDispute: 'Voir le litige ouvert',
    reportProblem: 'Signaler un problème',
    disputeDescPlaceholder: 'Décrivez le problème rencontré…',
    openLitigeError: "Impossible d'ouvrir ce litige.",
    disputeSend: 'Envoyer',
    disputeSending: 'Envoi…',
    ratingCommentPlaceholder: 'Un commentaire (facultatif)…',
    ratingSend: 'Envoyer mon avis',
    ratingSending: 'Envoi…',
    starAriaSuffix: 'étoile(s)',
  },
  mesLitiges: {
    title: 'Mes litiges',
    emptyTitle: 'Aucun litige ouvert',
    emptyDesc: 'Un problème avec une commande ? Signalez-le depuis son détail.',
  },
  litigeDetail: {
    back: 'Mes litiges',
    notFound: 'Litige introuvable.',
    decisionTitle: 'Décision',
    conversationTitle: 'Conversation',
  },
  litigeConversation: {
    noMessages: 'Aucun message pour le moment.',
    closedNotice: 'Ce litige est clôturé — la conversation est en lecture seule.',
    messagePlaceholder: 'Écrire un message…',
    sendError: "Impossible d'envoyer ce message.",
    uploadError: "Impossible d'envoyer cette preuve.",
    clientLabel: 'Client',
    vendorLabel: 'Vendeur',
  },
  monCompte: {
    defaultTitle: 'Mon compte',
    myOrders: 'Mes commandes',
    myAddresses: 'Mes adresses',
    myBeneficiaries: 'Mes bénéficiaires',
    favoritesLabel: 'Favoris',
    notificationsLabel: 'Notifications',
    myDisputes: 'Mes litiges',
    settingsLabel: 'Paramètres',
    diasporaBadge: 'Compte client diaspora',
    myInfoTitle: 'Mes informations',
    nom: 'Nom',
    prenom: 'Prénom',
    email: 'Email',
    ville: 'Ville',
    adresse: 'Adresse',
    saving: 'Enregistrement…',
    saveChanges: 'Enregistrer les modifications',
    saved: 'Enregistré !',
    saveError: "Impossible d'enregistrer les modifications.",
    logout: 'Se déconnecter',
  },
  checkoutSteps: {
    addressLabel: 'Adresse',
    slotLabel: 'Créneau',
    paymentLabel: 'Paiement',
    beneficiaryLabel: 'Bénéficiaire',
  },
  checkoutAddress: {
    title: 'Adresse de livraison',
    subtitle: 'Choisissez où vous souhaitez être livré.',
    defaultBadge: 'Défaut',
    setDefaultTitle: 'Définir par défaut',
    deleteTitle: 'Supprimer',
    addAddress: 'Ajouter une adresse',
    newAddressTitle: 'Nouvelle adresse',
    labelPlaceholder: 'Libellé (ex: Domicile, Bureau)',
    addressPlaceholder: 'Adresse (rue, numéro…)',
    neighborhoodPlaceholder: 'Quartier',
    cityPlaceholder: 'Ville',
    saveError: "Impossible d'enregistrer cette adresse.",
    saving: 'Enregistrement…',
    saveAddress: "Enregistrer l'adresse",
    continueBtn: 'Continuer',
  },
  checkoutSlot: {
    title: 'Créneau de livraison',
    subtitle: 'Quand souhaitez-vous être livré ?',
    computingFees: 'Calcul des frais…',
    estimatedFeesPrefix: 'Frais de livraison estimés :',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    continueToPayment: 'Continuer vers le paiement',
  },
  checkoutPayment: {
    title: 'Paiement',
    totalToPayPrefix: 'Total à payer :',
    methodCod: 'Paiement à la livraison',
    methodCodHint: 'Payez en espèces à la réception',
    methodCard: 'Carte bancaire',
    methodCardHint: 'Visa, Mastercard',
    methodMtn: 'MTN Mobile Money',
    methodAirtel: 'Airtel Money',
    methodMobileHint: 'Confirmez via USSD sur votre téléphone',
    requestSentPrefix: 'Une demande de paiement de',
    requestSentSuffix: 'FCFA a été envoyée.',
    approveUssd: 'Approuvez-la via le message USSD reçu sur votre téléphone,',
    thenEnterCode: 'puis saisissez le code de confirmation reçu.',
    codePlaceholder: 'Code de confirmation',
    confirmPayment: 'Confirmer le paiement',
    confirmOrder: 'Confirmer la commande',
    deliveryUnavailableError: 'Livraison indisponible pour ce quartier pour le moment.',
    finalizeOrderError: 'Impossible de finaliser la commande.',
    invalidCodeError: 'Code de confirmation invalide.',
    mtnRequestSent: 'Une notification MTN Mobile Money a été envoyée à',
    mtnEnterPin: 'Entrez votre code PIN sur votre téléphone pour valider le paiement de',
    mtnWaiting: 'En attente de votre validation…',
    mtnFailed: 'Le paiement MTN MoMo a échoué.',
    mtnTimeout: "Délai dépassé. Vous n'avez pas validé le paiement à temps.",
  },
  checkoutConfirmed: {
    title: 'Commande confirmée !',
    messagePrefix: 'Votre commande',
    messageMiddle: "d'un montant de",
    messageEnd: 'a bien été enregistrée.',
    trackOrder: 'Suivre ma commande',
    backHome: "Retour à l'accueil",
  },
  diasporaActivation: {
    title: 'Envoyez des courses\nà vos proches au Congo',
    feature1: 'Paiement sécurisé en € ou $',
    feature2: 'Livraison rapide à Brazzaville',
    feature3: 'Suivi en temps réel',
    cta: 'Activer le Mode Diaspora',
    later: 'Plus tard',
    back: 'Retour',
  },
  diasporaBeneficiary: {
    title: 'Bénéficiaire',
    subtitle: 'Pour qui souhaitez-vous passer cette commande ?',
    defaultBadge: 'Défaut',
    relationDefault: 'Bénéficiaire',
    setDefaultTitle: 'Définir par défaut',
    deleteTitle: 'Supprimer',
    addBeneficiary: 'Ajouter un bénéficiaire',
    newBeneficiaryTitle: 'Nouveau bénéficiaire',
    namePlaceholder: 'Nom complet',
    phonePlaceholder: 'Téléphone',
    relationPlaceholder: 'Relation (ex: Mère)',
    addressPlaceholder: 'Adresse',
    neighborhoodPlaceholder: 'Quartier',
    cityPlaceholder: 'Ville',
    saveError: "Impossible d'enregistrer ce bénéficiaire.",
    saving: 'Enregistrement…',
    saveBeneficiary: 'Enregistrer le bénéficiaire',
    continueBtn: 'Continuer',
  },
  diasporaSlot: {
    title: 'Créneau de livraison',
    subtitlePrefix: 'Quand souhaitez-vous que',
    subtitleSuffix: 'soit livré(e) ?',
    computingFees: 'Calcul des frais…',
    estimatedFeesPrefix: 'Frais de livraison estimés :',
    continueToPayment: 'Continuer vers le paiement',
  },
  diasporaPayment: {
    title: 'Paiement',
    totalPrefix: 'Total :',
    methodCard: 'Carte bancaire internationale',
    methodCardHint: 'Visa, Mastercard via Stripe',
    methodPaypal: 'PayPal',
    methodPaypalHint: 'Payer avec votre compte PayPal',
    finalizeViaPrefix: 'Finalisez votre paiement via',
    finalizeViaSuffix: ', puis saisissez la référence de confirmation reçue.',
    referencePlaceholder: 'Référence de confirmation',
    confirmPayment: 'Confirmer le paiement',
    confirmOrder: 'Confirmer la commande',
    deliveryUnavailableError: 'Livraison indisponible pour ce quartier pour le moment.',
    finalizeOrderError: 'Impossible de finaliser la commande.',
    invalidReferenceError: 'Confirmation de paiement invalide.',
  },
  sharedCart: {
    title: 'Panier partagé',
    sentByPrefix: 'Envoyé par',
    forPrefix: 'pour',
    introPrefix: 'Voici les produits que',
    introMiddle: 'souhaite vous envoyer via Zando na Ndako.',
    introEnd: "Ce panier est à titre indicatif — la commande sera finalisée directement par l'expéditeur.",
    articlesSuffix: 'article(s)',
    footerNotePrefix: "Vous n'avez rien à faire ici — répondez simplement à",
    footerNoteSuffix: 'pour confirmer.',
    defaultSender: 'un proche',
    defaultSenderAlt: "l'expéditeur",
    invalidTitle: 'Ce lien de panier est invalide ou a expiré.',
    backHome: "Retour à l'accueil",
  },
};

const lingala: ClientTranslations = {
  common: {
    loading: 'Ezali kopamba…',
    back: 'Kozonga',
    cancel: 'Kolongola',
  },
  promoBanner: {
    promoOfDayLabel: 'Promo ya lelo',
    offerNow: 'Offre ya sikoyo',
    freshOffer: 'Offre ya sika',
    defaultProductName: 'Mbisi ya sika',
    defaultDescription: 'Tala ba mbisi ya sika oyo topona mpo na lelo',
    discountSuffix: 'na eloko oyo sikoyo',
    discoverOffer: 'Komona offre',
    viewAllPromotions: 'Mona ba promotions nyonso',
  },
  productCard: {
    freshBadge: 'Biloko ya sika',
    addToCart: 'Bakisa na panier',
    added: 'Ebakisami !',
    decreaseAria: 'Kokitisa motango',
    increaseAria: 'Komatisa motango',
    addFavoriteAria: 'Kobakisa na favoris',
    removeFavoriteAria: 'Kolongola na favoris',
    addedToCartSuffix: 'ebakisami na panier na yo.',
    addedToFavoritesSuffix: 'ebakisami na favoris na yo.',
    removedFromFavoritesSuffix: 'elongolami na favoris na yo.',
  },
  hero: {
    zonePrefix: 'Kokumisa na',
    title1: 'Zando',
    title2: 'ekomeli epai na yo',
    subtitle: 'Biloko na yo ya sika mpe ya ntina, ekomeli epai na yo na pete mpe na ntango moke.',
    orderNow: 'Commander sikoyo',
    createAccount: 'Sala compte',
  },
  benefits: {
    fresh: 'Biloko ya sika\nmpe ya kitoko',
    delivery: 'Kokumisa noki\nmpe na confiance',
    payment: 'Kofuta na sécurité\nna 100%',
    support: 'Lisalisi ngonga 24/24\npene na yo',
  },
  howItWorks: {
    title: 'Ndenge nini esalema ?',
    subtitle: 'Zando na ndako na yo na ba étape 3 ya pete.',
    step1Title: '1. Pona biloko na yo',
    step1Desc: 'Tala ba bibale na biso ya sika ya Brazzaville mpe bakisa biloko na panier na yo.',
    step2Title: '2. Sala commande na yo',
    step2Desc: 'Ndima panier na yo, pona commune na yo (Poto-Poto, Bacongo...) mpe nzela ya kofuta.',
    step3Title: '3. Kokumisa noki na ndako',
    step3Desc: 'Zando na yo ya sika ekomeli mbala moko epai na yo na miniti 30 tii 60.',
  },
  partners: {
    title: 'Ba partenaires mpe ba vendeurs na biso ya confiance',
    subtitle: 'Ba zando mpe ba producteurs ya malamu koleka bakomeli epai na yo.',
    verifiedBadge: 'Ba vendeurs 100% bandimami',
  },
  testimonials: {
    title: 'Oyo ba client na biso balobaka',
    subtitle: 'Ba avis ya solo ya bato ya Congo.',
    prevAria: 'Témoignage ya liboso',
    nextAria: 'Témoignage oyo elandi',
    dotAriaPrefix: 'Kende na témoignage',
  },
  footer: {
    tagline: 'Zando na yo ya confiance na internet. Biloko ya sika, ekomeli epai na yo na pete.',
    usefulLinks: 'Ba lien ya ntina',
    about: 'Na tina na biso',
    howItWorks: 'Ndenge nini esalema',
    ourPartners: 'Ba partenaires na biso',
    terms: 'Ba conditions générales',
    privacy: 'Politique ya confidentialité',
    faq: 'FAQ',
    categoriesTitle: 'Bibale',
    contactTitle: 'Kokutana',
    rightsReserved: '© 2024 Zando na Ndako. Makoki nyonso ebombami.',
    cgu: 'CGU',
    confidentiality: 'Confidentialité',
    contact: 'Kokutana',
    addressLine: "Avenue de l'Indépendance, Poto-Poto, Brazzaville, Congo",
  },
  appBanner: {
    badge: 'Application Mobile ya solo',
    titleLine: 'Kotisa application',
    subtitle: 'Sala ba achat na zando ya Brazzaville na telephone na yo, esika nyonso ozali.',
    availableOn: 'EZALI NA',
    googlePlay: 'Google Play',
    downloadOnThe: 'Kotisa na',
    appStore: 'App Store',
    ourCategories: 'Bibale na biso',
    availableInBrazzaville: 'Ezali na Brazzaville',
    googlePlayToast: 'Kokende na Google Play Store…',
    appStoreToast: 'Kokende na Apple App Store…',
  },
  announcementBar: {
    badge: 'Offre ya sipesiale',
    message: 'Kokumisa ya ofele na Brazzaville banda na 15 000 FCFA na code',
    supportLabel: 'Support :',
    closeAria: 'Kokanga barre ya annonce',
  },
  whatsapp: {
    label: 'Commander na WhatsApp',
    ariaLabel: 'Commander na WhatsApp',
  },
  zoneModal: {
    title: 'Zone ya kokumisa',
    subtitle: 'Pona commune to secteur na yo',
    closeAria: 'Kokanga modal',
    searchPlaceholder: 'Koluka commune (Poto-Poto, Bacongo, Ouenzé...)',
    noResultsPrefix: 'Zone moko te ezwami mpo na',
    neighborhoodsLabel: 'Ba quartier :',
  },
  categoriesSection: {
    title: 'Bibale na biso ya mingi bazali kolinga',
    viewAll: 'Mona bibale nyonso',
  },
  featuredProducts: {
    title: 'Biloko na biso ya kitoko',
    viewAll: 'Mona nyonso',
  },
  categoriesPage: {
    title: 'Bibale',
    productSuffix: 'eloko',
  },
  categoryDetail: {
    home: 'Ndako',
    availabilityAll: 'Disponibilité nyonso',
    inStock: 'Ezali',
    outOfStock: 'Esili',
    sortRelevance: 'Malamu koleka',
    sortPriceAsc: 'Ntalo ekomata',
    sortPriceDesc: 'Ntalo ekita',
    emptyTitle: 'Eloko moko te ezali na ebale oyo sikoyo',
    productsAvailableSuffix: 'ezali',
  },
  produits: {
    title: 'Biloko na biso nyonso',
    searchPlaceholder: 'Koluka eloko…',
    emptyTitle: 'Eloko moko te ezwami',
  },
  produitDetail: {
    backToCatalog: 'Kozonga na catalogue',
    notFoundTitle: 'Eloko ezwami te',
    notFoundDesc: 'Eloko oyo ezali te to ezali lisusu te disponible.',
    outOfStockBadge: 'Esili na stock',
    addToCart: 'Bakisa na panier',
    added: 'Ebakisami !',
    unavailable: 'Ezali te',
    decreaseAria: 'Kokitisa motango',
    increaseAria: 'Komatisa motango',
    addFavoriteAria: 'Kobakisa na favoris',
    removeFavoriteAria: 'Kolongola na favoris',
    addedToCartSuffix: 'ebakisami na panier na yo.',
  },
  accueil: {
    greetingPrefix: 'Mbote',
    openStatus: 'Efungwami',
    tagline: 'Zando ya sika, ekomeli epai na yo',
    searchPlaceholder: 'Koluka eloko, zando…',
    expressDeliveryTitle: 'Kokumisa noki na Brazzaville',
    expressDeliverySubPrefix: 'Na 30–60 min · banda na',
    myFavoritesTitle: 'Biloko na ngai',
    favoritesSavedSuffix: 'ebombami',
    noFavoritesYet: 'Eloko moko te ebombami naino',
    diasporaTitle: 'Kinda commande mpo na moto na Congo',
    diasporaSubtitle: 'Mode Diaspora',
  },
  panier: {
    title: 'Panier na ngai',
    clear: 'Kopolisa',
    emptyTitle: 'Panier na yo ezali polele',
    emptySub: 'Bakisa biloko mpo na kobanda.',
    discoverProducts: 'Komona biloko na biso',
    summary: 'Liste',
    subtotalPrefix: 'Sous-total',
    articlesSuffix: 'eloko',
    deliveryFee: 'Frais ya kokumisa',
    deliveryFeeComputed: 'Ekotangama na étape elandi',
    total: 'Total ya kofuta',
    deliveryNote: '🛵 Kokumisa na 30–60 min · Zone : Brazzaville kaka',
    shareCart: 'Kabola panier oyo na bénéficiaire',
    sharing: 'Kokabola ezali kosalema…',
    shareError: 'Ekoki kokabola panier te sikoyo.',
    copyLink: 'Kopi lien',
    copied: 'Ekopiami !',
    checkoutSelf: 'Commander sikoyo',
    checkoutDiaspora: 'Kinda commande mpo na proche',
    guestPrompt: 'Sala compte to kota mpo na kosukisa commande na yo.',
    decreaseAria: 'Kokitisa',
    increaseAria: 'Komatisa',
    removeAria: 'Kolongola',
  },
  cartDrawer: {
    title: 'Panier na ngai',
    itemsSelectedSuffix: 'eponami',
    closeAria: 'Kokanga panier',
    emptyTitle: 'Panier na yo ezali polele',
    emptyDesc: 'Bakisa biloko ya sika ya zando na biso.',
    decreaseAria: 'Kokitisa motango',
    increaseAria: 'Komatisa motango',
    removeAria: 'Kolongola eloko',
    subtotal: 'Sous-total',
    deliveryFee: 'Frais ya kokumisa',
    deliveryFeeComputed: 'Ekotangama na étape elandi',
    shareCart: 'Kabola panier oyo na bénéficiaire',
    sharing: 'Kokabola ezali kosalema…',
    copyLink: 'Kopi lien',
    copied: 'Ekopiami !',
    clear: 'Kopolisa',
    checkout: 'Kokende na commande',
  },
  favoris: {
    title: 'Biloko na ngai',
    emptyMessage: 'Ozali nanu na favoris te',
    discoverCatalog: 'Tala biloko na biso',
  },
  promotions: {
    title: 'Ba promotions',
    loading: 'Ezali kopamba…',
    subtitle: "Ba oferite ya sik'oyo epai ya ba vendeurs na biso",
    emptyTitle: "Ezali na promotion te sik'oyo",
    emptyDesc: "Zonga nsima : ba réduction oyo ba vendeurs na biso batie ekomonana awa automatiquement.",
  },
  notifications: {
    title: 'Ba notification',
    markAllRead: 'Tanga nyonso lokola etangami',
    emptyTitle: 'Notification moko te sikoyo',
    justNow: 'sikawa',
    minutesAgoSuffix: 'min',
    hoursAgoSuffix: 'h',
    daysAgoSuffix: 'mokolo',
    agoPrefix: 'esali',
  },
  mesCommandes: {
    title: 'Ba commande na ngai',
    searchPlaceholder: 'Koluka na numero ya commande…',
    tabAll: 'Nyonso',
    tabOngoing: 'Ezali kokende',
    tabDone: 'Esili',
    tabCancelled: 'Elongolami',
    emptyTitle: 'Commande moko te sikoyo',
    discoverMarket: 'Komona zando',
    statusDelivered: 'Ekomeli',
    statusCancelled: 'Elongolami',
    statusOngoing: 'Ezali kokende',
  },
  commandeDetail: {
    back: 'Ba commande na ngai',
    notFoundTitle: 'Commande ezwami te',
    statusConfirmed: 'Endimami',
    statusShopping: 'Achat ezali kosalema',
    statusPreparing: 'Kobongisama',
    statusEnRoute: 'Livreur azali na nzela',
    statusArriving: 'Akomi pene',
    statusDelivered: 'Ekomeli',
    statusCancelled: 'Elongolami',
    call: 'Benga',
    total: 'Total',
    noteVendor: 'Pesa note na vendeur',
    noteDriver: 'Pesa note na livreur',
    thanksForReview: 'Melesi mpo na avis na yo !',
    cancelOrder: 'Kolongola commande',
    cancelReasonPlaceholder: "Ntina ya kolongola…",
    confirmCancel: 'Kondima kolongola',
    cancelling: 'Kolongolama…',
    cancelError: 'Ekoki kolongola commande oyo te.',
    reorder: 'Kosala commande lisusu',
    viewDispute: 'Mona litige efungwami',
    reportProblem: 'Kolakisa likambo',
    disputeDescPlaceholder: 'Limbola likambo oyo okutani na yango…',
    openLitigeError: 'Ekoki kofungola litige oyo te.',
    disputeSend: 'Tinda',
    disputeSending: 'Kotinda…',
    ratingCommentPlaceholder: 'Commentaire (esengami te)…',
    ratingSend: 'Tinda avis na ngai',
    ratingSending: 'Kotinda…',
    starAriaSuffix: 'étoile(s)',
  },
  mesLitiges: {
    title: 'Ba litige na ngai',
    emptyTitle: 'Litige moko te efungwami',
    emptyDesc: 'Likambo moko na commande ? Lakisa yango uta na détail na yango.',
  },
  litigeDetail: {
    back: 'Ba litige na ngai',
    notFound: 'Litige ezwami te.',
    decisionTitle: 'Décision',
    conversationTitle: 'Causerie',
  },
  litigeConversation: {
    noMessages: 'Message moko te sikoyo.',
    closedNotice: 'Litige oyo ekangami — causerie ezali kaka mpo na kotanga.',
    messagePlaceholder: 'Koma message…',
    sendError: 'Ekoki kotinda message oyo te.',
    uploadError: 'Ekoki kotinda preuve oyo te.',
    clientLabel: 'Client',
    vendorLabel: 'Vendeur',
  },
  monCompte: {
    defaultTitle: 'Compte na ngai',
    myOrders: 'Ba commande na ngai',
    myAddresses: 'Ba adresse na ngai',
    myBeneficiaries: 'Ba bénéficiaires na ngai',
    favoritesLabel: 'Favoris',
    notificationsLabel: 'Ba notification',
    myDisputes: 'Ba litige na ngai',
    settingsLabel: 'Paramètres',
    diasporaBadge: 'Compte client diaspora',
    myInfoTitle: 'Makambo na ngai',
    nom: 'Kombo',
    prenom: 'Prenom',
    email: 'Email',
    ville: 'Ville',
    adresse: 'Adresse',
    saving: 'Kobombama…',
    saveChanges: 'Bomba ba changement',
    saved: 'Ebombami !',
    saveError: 'Ekoki kobomba ba changement te.',
    logout: 'Kolongwa',
  },
  checkoutSteps: {
    addressLabel: 'Adresse',
    slotLabel: 'Ntango',
    paymentLabel: 'Paiement',
    beneficiaryLabel: 'Bénéficiaire',
  },
  checkoutAddress: {
    title: 'Adresse ya kokumisa',
    subtitle: 'Pona esika olingi bakumisela yo.',
    defaultBadge: 'Ya libosó',
    setDefaultTitle: 'Tia lokola ya libosó',
    deleteTitle: 'Kolongola',
    addAddress: 'Bakisa adresse',
    newAddressTitle: 'Adresse ya sika',
    labelPlaceholder: 'Kombo (ndakisa : Ndako, Bureau)',
    addressPlaceholder: 'Adresse (balabala, numero…)',
    neighborhoodPlaceholder: 'Quartier',
    cityPlaceholder: 'Ville',
    saveError: 'Ekoki kobomba adresse oyo te.',
    saving: 'Kobombama…',
    saveAddress: 'Bomba adresse',
    continueBtn: 'Kokende liboso',
  },
  checkoutSlot: {
    title: 'Ntango ya kokumisa',
    subtitle: 'Ntango nini olingi bakumisela yo ?',
    computingFees: 'Kotanga frais…',
    estimatedFeesPrefix: 'Frais ya kokumisa oyo etangami :',
    today: 'Lelo',
    tomorrow: 'Lobi',
    continueToPayment: 'Kokende na paiement',
  },
  checkoutPayment: {
    title: 'Paiement',
    totalToPayPrefix: 'Total ya kofuta :',
    methodCod: 'Kofuta na ntango ya kokumisa',
    methodCodHint: 'Futa na mbongo ya loboko tango ekomi',
    methodCard: 'Carte bancaire',
    methodCardHint: 'Visa, Mastercard',
    methodMtn: 'MTN Mobile Money',
    methodAirtel: 'Airtel Money',
    methodMobileHint: 'Ndima na USSD na telephone na yo',
    requestSentPrefix: 'Demande ya kofuta ya',
    requestSentSuffix: 'FCFA etindami.',
    approveUssd: 'Ndima yango na message USSD oyo ozwi na telephone na yo,',
    thenEnterCode: 'na sima kotisa code ya kondima oyo ozwi.',
    codePlaceholder: 'Code ya kondima',
    confirmPayment: 'Kondima kofuta',
    confirmOrder: 'Kondima commande',
    deliveryUnavailableError: 'Kokumisa ezali te na quartier oyo sikoyo.',
    finalizeOrderError: 'Ekoki kosukisa commande te.',
    invalidCodeError: 'Code ya kondima ebongi te.',
    mtnRequestSent: 'Notification MTN Mobile Money etindami na',
    mtnEnterPin: 'Kotisa code PIN na yo na telephone mpo na kondima kofuta ya',
    mtnWaiting: 'Kozela kondima na yo…',
    mtnFailed: 'Kofuta na MTN MoMo elongi te.',
    mtnTimeout: 'Ntango eleki. Ondimaki kofuta te na ntango.',
  },
  checkoutConfirmed: {
    title: 'Commande endimami !',
    messagePrefix: 'Commande na yo',
    messageMiddle: 'ya montant ya',
    messageEnd: 'ebombami malamu.',
    trackOrder: 'Kolanda commande na ngai',
    backHome: 'Kozonga na ndako',
  },
  diasporaActivation: {
    title: 'Tinda ba courses\nepai ya bandeko na Congo',
    feature1: 'Paiement na sécurité na € to $',
    feature2: 'Livraison ya mbangu na Brazzaville',
    feature3: 'Suivi na temps réel',
    cta: 'Activer Mode Diaspora',
    later: 'Kala mosusu',
    back: 'Kozonga',
  },
  diasporaBeneficiary: {
    title: 'Bénéficiaire',
    subtitle: 'Mpo na nani olingi kosala commande oyo ?',
    defaultBadge: 'Ya libosó',
    relationDefault: 'Bénéficiaire',
    setDefaultTitle: 'Tia lokola ya libosó',
    deleteTitle: 'Kolongola',
    addBeneficiary: 'Bakisa bénéficiaire',
    newBeneficiaryTitle: 'Bénéficiaire ya sika',
    namePlaceholder: 'Kombo mobimba',
    phonePlaceholder: 'Téléphone',
    relationPlaceholder: 'Relation (ndakisa : Mama)',
    addressPlaceholder: 'Adresse',
    neighborhoodPlaceholder: 'Quartier',
    cityPlaceholder: 'Ville',
    saveError: 'Ekoki kobomba bénéficiaire oyo te.',
    saving: 'Kobombama…',
    saveBeneficiary: 'Bomba bénéficiaire',
    continueBtn: 'Kokende liboso',
  },
  diasporaSlot: {
    title: 'Ntango ya kokumisa',
    subtitlePrefix: 'Ntango nini olingi',
    subtitleSuffix: 'akumisela ?',
    computingFees: 'Kotanga frais…',
    estimatedFeesPrefix: 'Frais ya kokumisa oyo etangami :',
    continueToPayment: 'Kokende na paiement',
  },
  diasporaPayment: {
    title: 'Paiement',
    totalPrefix: 'Total :',
    methodCard: 'Carte bancaire internationale',
    methodCardHint: 'Visa, Mastercard na Stripe',
    methodPaypal: 'PayPal',
    methodPaypalHint: 'Futa na compte PayPal na yo',
    finalizeViaPrefix: 'Sukisa paiement na yo na',
    finalizeViaSuffix: ', na sima kotisa référence ya kondima oyo ozwi.',
    referencePlaceholder: 'Référence ya kondima',
    confirmPayment: 'Kondima kofuta',
    confirmOrder: 'Kondima commande',
    deliveryUnavailableError: 'Kokumisa ezali te na quartier oyo sikoyo.',
    finalizeOrderError: 'Ekoki kosukisa commande te.',
    invalidReferenceError: 'Référence ya kofuta ebongi te.',
  },
  sharedCart: {
    title: 'Panier oyo bakabolaki',
    sentByPrefix: 'Etindami na',
    forPrefix: 'mpo na',
    introPrefix: 'Tala biloko oyo',
    introMiddle: 'alingi kotindela yo na Zando na Ndako.',
    introEnd: 'Panier oyo ezali kaka mpo na koyeba — commande ekosila kaka na moto oyo atindaki yango.',
    articlesSuffix: 'eloko',
    footerNotePrefix: 'Ozali na eloko ya kosala awa te — yanola kaka na',
    footerNoteSuffix: 'mpo na kondima.',
    defaultSender: 'moto moko',
    defaultSenderAlt: 'moto oyo atindaki',
    invalidTitle: 'Lien ya panier oyo ebongi te to esili.',
    backHome: 'Kozonga na ndako',
  },
};

const kituba: ClientTranslations = {
  common: {
    loading: 'Kekele…',
    back: 'Vutuka',
    cancel: 'Kolongola',
  },
  promoBanner: {
    promoOfDayLabel: 'Promo ya lelo',
    offerNow: 'Offre ya lelo',
    freshOffer: 'Offre ya mpa',
    defaultProductName: 'Mbisi ya mbote',
    defaultDescription: 'Tala ba mbisi ya mbote yina beto mepona mpo na lelo',
    discountSuffix: 'na kima yayi bubu',
    discoverOffer: 'Mona offre',
    viewAllPromotions: 'Tala ba promotions yonso',
  },
  productCard: {
    freshBadge: 'Bima ya mbote',
    addToCart: 'Yika na panier',
    added: 'Yikami !',
    decreaseAria: 'Kukitisa motango',
    increaseAria: 'Kutombisa motango',
    addFavoriteAria: 'Yika na favoris',
    removeFavoriteAria: 'Katula na favoris',
    addedToCartSuffix: 'meyikama na panier na nge.',
    addedToFavoritesSuffix: 'meyikama na favoris na nge.',
    removedFromFavoritesSuffix: 'mekatulama na favoris na nge.',
  },
  hero: {
    zonePrefix: 'Kwiza na',
    title1: 'Zando',
    title2: 'ke kwiza na nzo na nge',
    subtitle: 'Bima na nge ya mbote mpe ya mfunu, ke kwiza na nzo na nge na pete mpe nswalu.',
    orderNow: 'Commander sikaawa',
    createAccount: 'Sala compte',
  },
  benefits: {
    fresh: 'Bima ya mbote\nmpe ya kitoko',
    delivery: 'Kwiza nswalu\nmpe na confiance',
    payment: 'Kufuta na sécurité\nna 100%',
    support: 'Lusadisu ngonga 24/24\npene na nge',
  },
  howItWorks: {
    title: 'Inki mutindu yo ke salama ?',
    subtitle: 'Zando na nzo na nge na ba étape 3 ya pete.',
    step1Title: '1. Pona bima na nge',
    step1Desc: 'Tala bitini na beto ya mbote ya Brazzaville mpe yika bima na panier na nge.',
    step2Title: '2. Sala commande na nge',
    step2Desc: 'Ndima panier na nge, pona commune na nge (Poto-Poto, Bacongo...) mpe nzila ya kufuta.',
    step3Title: '3. Kwiza nswalu na nzo',
    step3Desc: 'Zando na nge ya mbote ke kwiza mbala mosi na nzo na nge na miniti 30 tii 60.',
  },
  partners: {
    title: 'Ba partenaires na beto mpe ba vendeurs ya confiance',
    subtitle: 'Ba zando mpe ba producteurs ya mbote ke kwiza na nzo na nge.',
    verifiedBadge: 'Ba vendeurs 100% mendimama',
  },
  testimonials: {
    title: 'Inki ba client na beto ke tuba',
    subtitle: 'Ba avis ya kieleka ya bantu ya Congo.',
    prevAria: 'Témoignage ya ntwala',
    nextAria: 'Témoignage yina ke landa',
    dotAriaPrefix: 'Kwenda na témoignage',
  },
  footer: {
    tagline: 'Zando na nge ya confiance na internet. Bima ya mbote, ke kwiza na nzo na nge na pete.',
    usefulLinks: 'Ba lien ya mfunu',
    about: 'Na yina ya beto',
    howItWorks: 'Inki mutindu yo ke salama',
    ourPartners: 'Ba partenaires na beto',
    terms: 'Ba condition générales',
    privacy: 'Politique ya confidentialité',
    faq: 'FAQ',
    categoriesTitle: 'Bitini',
    contactTitle: 'Kwenda na beto',
    rightsReserved: '© 2024 Zando na Ndako. Baloki yonso mebumbama.',
    cgu: 'CGU',
    confidentiality: 'Confidentialité',
    contact: 'Kwenda na beto',
    addressLine: "Avenue de l'Indépendance, Poto-Poto, Brazzaville, Congo",
  },
  appBanner: {
    badge: 'Application Mobile ya kieleka',
    titleLine: 'Kutula application',
    subtitle: 'Sala ba achat na zando ya Brazzaville na telefone na nge, na kisika yonso nge kele.',
    availableOn: 'KELE NA',
    googlePlay: 'Google Play',
    downloadOnThe: 'Kutula na',
    appStore: 'App Store',
    ourCategories: 'Bitini na beto',
    availableInBrazzaville: 'Kele na Brazzaville',
    googlePlayToast: 'Kwenda na Google Play Store…',
    appStoreToast: 'Kwenda na Apple App Store…',
  },
  announcementBar: {
    badge: 'Offre ya spécial',
    message: 'Kwiza ya ofele na Brazzaville banda na 15 000 FCFA na code',
    supportLabel: 'Support :',
    closeAria: 'Kanga barre ya annonce',
  },
  whatsapp: {
    label: 'Commander na WhatsApp',
    ariaLabel: 'Commander na WhatsApp',
  },
  zoneModal: {
    title: 'Zone ya kwiza',
    subtitle: 'Pona commune to secteur na nge',
    closeAria: 'Kanga modal',
    searchPlaceholder: 'Sosa commune (Poto-Poto, Bacongo, Ouenzé...)',
    noResultsPrefix: 'Zone mosi ve mezwana sambu na',
    neighborhoodsLabel: 'Ba quartier :',
  },
  categoriesSection: {
    title: 'Bitini na beto ya mingi ke zolama',
    viewAll: 'Tala bitini yonso',
  },
  featuredProducts: {
    title: 'Bima na beto ya kitoko',
    viewAll: 'Tala yonso',
  },
  categoriesPage: {
    title: 'Bitini',
    productSuffix: 'kima',
  },
  categoryDetail: {
    home: 'Nzo',
    availabilityAll: 'Disponibilité yonso',
    inStock: 'Kele',
    outOfStock: 'Mesi',
    sortRelevance: 'Ya mbote',
    sortPriceAsc: 'Ntalu ke tombuka',
    sortPriceDesc: 'Ntalu ke kulumuka',
    emptyTitle: 'Kima mosi ve kele na kitini yayi bubu',
    productsAvailableSuffix: 'kele',
  },
  produits: {
    title: 'Bima na beto yonso',
    searchPlaceholder: 'Sosa kima…',
    emptyTitle: 'Kima mosi ve mezwana',
  },
  produitDetail: {
    backToCatalog: 'Vutuka na catalogue',
    notFoundTitle: 'Kima ke monika ve',
    notFoundDesc: 'Kima yayi kele ve to kele diaka ve disponible.',
    outOfStockBadge: 'Mesi na stock',
    addToCart: 'Yika na panier',
    added: 'Yikami !',
    unavailable: 'Kele ve',
    decreaseAria: 'Kukitisa motango',
    increaseAria: 'Kutombisa motango',
    addFavoriteAria: 'Yika na favoris',
    removeFavoriteAria: 'Katula na favoris',
    addedToCartSuffix: 'meyikama na panier na nge.',
  },
  accueil: {
    greetingPrefix: 'Mbote',
    openStatus: 'Yazuka',
    tagline: 'Zando ya mbote, na kwiza na nzo na nge',
    searchPlaceholder: 'Sosa kima, zando…',
    expressDeliveryTitle: 'Kwiza nswalu na Brazzaville',
    expressDeliverySubPrefix: 'Na 30–60 min · banda na',
    myFavoritesTitle: 'Bima na mono',
    favoritesSavedSuffix: 'kubumbama',
    noFavoritesYet: 'Kima mosi ve kubumbama nanu',
    diasporaTitle: 'Sumba bima mpo na muntu na Congo',
    diasporaSubtitle: 'Mode Diaspora',
  },
  panier: {
    title: 'Panier na mono',
    clear: 'Katula yonso',
    emptyTitle: 'Panier na nge kele mpamba',
    emptySub: 'Yika bima mpo na kubanda.',
    discoverProducts: 'Mona bima na beto',
    summary: 'Liste',
    subtotalPrefix: 'Sous-total',
    articlesSuffix: 'kima',
    deliveryFee: 'Frais ya kwiza',
    deliveryFeeComputed: 'Ta tangama na étape yina ke landa',
    total: 'Total ya kufuta',
    deliveryNote: '🛵 Kwiza na 30–60 min · Zone : Brazzaville kaka',
    shareCart: 'Kabula panier yai na bénéficiaire',
    sharing: 'Kukabula ke salama…',
    shareError: 'Kekabula panier ve sikaawa.',
    copyLink: 'Kopia lien',
    copied: 'Mekopiama !',
    checkoutSelf: 'Commander sikaawa',
    checkoutDiaspora: 'Sumba bima mpo na muntu',
    guestPrompt: 'Sala compte to kota mpo na kumanisa commande na nge.',
    decreaseAria: 'Kukitisa',
    increaseAria: 'Kutombisa',
    removeAria: 'Katula',
  },
  cartDrawer: {
    title: 'Panier na mono',
    itemsSelectedSuffix: 'mepona',
    closeAria: 'Kanga panier',
    emptyTitle: 'Panier na nge kele mpamba',
    emptyDesc: 'Yika bima ya mbote ya zando na beto.',
    decreaseAria: 'Kukitisa motango',
    increaseAria: 'Kutombisa motango',
    removeAria: 'Katula kima',
    subtotal: 'Sous-total',
    deliveryFee: 'Frais ya kwiza',
    deliveryFeeComputed: 'Ta tangama na étape yina ke landa',
    shareCart: 'Kabula panier yai na bénéficiaire',
    sharing: 'Kukabula ke salama…',
    copyLink: 'Kopia lien',
    copied: 'Mekopiama !',
    clear: 'Katula yonso',
    checkout: 'Kwenda na commande',
  },
  favoris: {
    title: 'Bima na mono',
    emptyMessage: 'Nge kele nanu ve na favoris',
    discoverCatalog: 'Tala bima na beto',
  },
  promotions: {
    title: 'Ba promotions',
    loading: 'Kekele…',
    subtitle: 'Ba oferi ya ntangu yayi na ba vendeurs na beto',
    emptyTitle: 'Kena ve promotion ya ntangu yayi',
    emptyDesc: 'Vutuka nima : ba réduction ya ba vendeurs na beto ta monana awa automatiquement.',
  },
  notifications: {
    title: 'Ba notification',
    markAllRead: 'Sonika yonso bonso ke tangama',
    emptyTitle: 'Notification mosi ve bubu',
    justNow: 'sikaawa',
    minutesAgoSuffix: 'min',
    hoursAgoSuffix: 'h',
    daysAgoSuffix: 'kilumbu',
    agoPrefix: 'mesalaka',
  },
  mesCommandes: {
    title: 'Ba commande na mono',
    searchPlaceholder: 'Sosa na numero ya commande…',
    tabAll: 'Yonso',
    tabOngoing: 'Kele na nzila',
    tabDone: 'Mesi',
    tabCancelled: 'Katulami',
    emptyTitle: 'Commande mosi ve bubu',
    discoverMarket: 'Mona zando',
    statusDelivered: 'Yizaka',
    statusCancelled: 'Katulami',
    statusOngoing: 'Kele na nzila',
  },
  commandeDetail: {
    back: 'Ba commande na mono',
    notFoundTitle: 'Commande ke monika ve',
    statusConfirmed: 'Mendima',
    statusShopping: 'Achat ke salama',
    statusPreparing: 'Kubongisama',
    statusEnRoute: 'Livreur kele na nzila',
    statusArriving: 'Ke lunga penepene',
    statusDelivered: 'Yizaka',
    statusCancelled: 'Katulami',
    call: 'Bengana',
    total: 'Total',
    noteVendor: 'Pesa note na vendeur',
    noteDriver: 'Pesa note na livreur',
    thanksForReview: 'Matondo sambu na avis na nge !',
    cancelOrder: 'Katula commande',
    cancelReasonPlaceholder: 'Kikuma ya kukatula…',
    confirmCancel: 'Ndima kukatula',
    cancelling: 'Kekatulama…',
    cancelError: 'Kekatula commande yayi ve.',
    reorder: 'Sala commande diaka',
    viewDispute: 'Tala litige ya kufungulama',
    reportProblem: 'Songa likambu',
    disputeDescPlaceholder: 'Tendula likambu yina nge me kutana na yandi…',
    openLitigeError: 'Kefungula litige yayi ve.',
    disputeSend: 'Tinda',
    disputeSending: 'Kutinda…',
    ratingCommentPlaceholder: 'Commentaire (kelombama ve)…',
    ratingSend: 'Tinda avis na mono',
    ratingSending: 'Kutinda…',
    starAriaSuffix: 'étoile(s)',
  },
  mesLitiges: {
    title: 'Ba litige na mono',
    emptyTitle: 'Litige mosi ve ya kufungulama',
    emptyDesc: 'Likambu na commande ? Songa yandi banda na détail na yandi.',
  },
  litigeDetail: {
    back: 'Ba litige na mono',
    notFound: 'Litige ke monika ve.',
    decisionTitle: 'Décision',
    conversationTitle: 'Disolo',
  },
  litigeConversation: {
    noMessages: 'Message mosi ve bubu.',
    closedNotice: 'Litige yayi mekangama — disolo kele kaka mpo na kutanga.',
    messagePlaceholder: 'Sonika message…',
    sendError: 'Ketinda message yayi ve.',
    uploadError: 'Kekutinda preuve yayi ve.',
    clientLabel: 'Client',
    vendorLabel: 'Vendeur',
  },
  monCompte: {
    defaultTitle: 'Compte na mono',
    myOrders: 'Ba commande na mono',
    myAddresses: 'Ba adresse na mono',
    myBeneficiaries: 'Ba bénéficiaires na mono',
    favoritesLabel: 'Favoris',
    notificationsLabel: 'Ba notification',
    myDisputes: 'Ba litige na mono',
    settingsLabel: 'Paramètres',
    diasporaBadge: 'Compte client diaspora',
    myInfoTitle: 'Malongi na mono',
    nom: 'Zina',
    prenom: 'Zina ya ntete',
    email: 'Email',
    ville: 'Mbanza',
    adresse: 'Adresse',
    saving: 'Kebumbama…',
    saveChanges: 'Bumba ba changement',
    saved: 'Mebumbama !',
    saveError: 'Kebumba ba changement ve.',
    logout: 'Basika',
  },
  checkoutSteps: {
    addressLabel: 'Adresse',
    slotLabel: 'Ngonga',
    paymentLabel: 'Paiement',
    beneficiaryLabel: 'Bénéficiaire',
  },
  checkoutAddress: {
    title: 'Adresse ya kwiza',
    subtitle: 'Pona kisika nge zola ta futa.',
    defaultBadge: 'Ya ntwala',
    setDefaultTitle: 'Tia bonso ya ntwala',
    deleteTitle: 'Katula',
    addAddress: 'Yika adresse',
    newAddressTitle: 'Adresse ya mpa',
    labelPlaceholder: 'Zina (mbandu : Nzo, Bureau)',
    addressPlaceholder: 'Adresse (nzila, numero…)',
    neighborhoodPlaceholder: 'Quartier',
    cityPlaceholder: 'Ville',
    saveError: 'Kebumba adresse yayi ve.',
    saving: 'Kebumbama…',
    saveAddress: 'Bumba adresse',
    continueBtn: 'Kwenda na ntwala',
  },
  checkoutSlot: {
    title: 'Ngonga ya kwiza',
    subtitle: 'Ntangu nki nge zola ta futa ?',
    computingFees: 'Kutanga frais…',
    estimatedFeesPrefix: 'Frais ya kwiza yina metangama :',
    today: 'Bubu',
    tomorrow: 'Mbazi',
    continueToPayment: 'Kwenda na paiement',
  },
  checkoutPayment: {
    title: 'Paiement',
    totalToPayPrefix: 'Total ya kufuta :',
    methodCod: 'Kufuta na ntangu ya kwiza',
    methodCodHint: 'Futa na mbongo ya moko ntangu ke lunga',
    methodCard: 'Carte bancaire',
    methodCardHint: 'Visa, Mastercard',
    methodMtn: 'MTN Mobile Money',
    methodAirtel: 'Airtel Money',
    methodMobileHint: 'Ndima na USSD na telefone na nge',
    requestSentPrefix: 'Demande ya kufuta ya',
    requestSentSuffix: 'FCFA metindama.',
    approveUssd: 'Ndima yandi na message USSD nge mezwaka na telefone na nge,',
    thenEnterCode: 'na nima tula code ya kundima yina nge mezwaka.',
    codePlaceholder: 'Code ya kundima',
    confirmPayment: 'Ndima kufuta',
    confirmOrder: 'Ndima commande',
    deliveryUnavailableError: 'Kwiza kele ve na quartier yayi bubu.',
    finalizeOrderError: 'Kemana commande ve.',
    invalidCodeError: 'Code ya kundima mefwana ve.',
    mtnRequestSent: 'Notification MTN Mobile Money metindibwa na',
    mtnEnterPin: 'Tula code PIN na nge na telefone mpo kundima kufuta ya',
    mtnWaiting: 'Kevanda kundima na nge…',
    mtnFailed: 'Kufuta na MTN MoMo mekwendaka ve.',
    mtnTimeout: 'Ntangu meluta. Nge kundimaka ve kufuta na ntangu.',
  },
  checkoutConfirmed: {
    title: 'Commande mendima !',
    messagePrefix: 'Commande na nge',
    messageMiddle: 'ya montant ya',
    messageEnd: 'mebumbama mbote.',
    trackOrder: 'Landa commande na mono',
    backHome: 'Vutuka na nzo',
  },
  diasporaActivation: {
    title: 'Tinda bima\nna bantu na nge na Congo',
    feature1: 'Paiement na sécurité na € to $',
    feature2: 'Livraison ya nswalu na Brazzaville',
    feature3: 'Suivi na temps réel',
    cta: 'Kufungula Mode Diaspora',
    later: 'Nima ya mbala yankaka',
    back: 'Vutuka',
  },
  diasporaBeneficiary: {
    title: 'Bénéficiaire',
    subtitle: 'Sambu na nani nge zola sala commande yayi ?',
    defaultBadge: 'Ya ntwala',
    relationDefault: 'Bénéficiaire',
    setDefaultTitle: 'Tia bonso ya ntwala',
    deleteTitle: 'Katula',
    addBeneficiary: 'Yika bénéficiaire',
    newBeneficiaryTitle: 'Bénéficiaire ya mpa',
    namePlaceholder: 'Zina mvimba',
    phonePlaceholder: 'Téléphone',
    relationPlaceholder: 'Relation (mbandu : Mama)',
    addressPlaceholder: 'Adresse',
    neighborhoodPlaceholder: 'Quartier',
    cityPlaceholder: 'Ville',
    saveError: 'Kebumba bénéficiaire yayi ve.',
    saving: 'Kebumbama…',
    saveBeneficiary: 'Bumba bénéficiaire',
    continueBtn: 'Kwenda na ntwala',
  },
  diasporaSlot: {
    title: 'Ngonga ya kwiza',
    subtitlePrefix: 'Ntangu nki nge zola',
    subtitleSuffix: 'ta futa ?',
    computingFees: 'Kutanga frais…',
    estimatedFeesPrefix: 'Frais ya kwiza yina metangama :',
    continueToPayment: 'Kwenda na paiement',
  },
  diasporaPayment: {
    title: 'Paiement',
    totalPrefix: 'Total :',
    methodCard: 'Carte bancaire internationale',
    methodCardHint: 'Visa, Mastercard na Stripe',
    methodPaypal: 'PayPal',
    methodPaypalHint: 'Futa na compte PayPal na nge',
    finalizeViaPrefix: 'Mana kufuta na nge na',
    finalizeViaSuffix: ', na nima tula référence ya kundima yina nge mezwaka.',
    referencePlaceholder: 'Référence ya kundima',
    confirmPayment: 'Ndima kufuta',
    confirmOrder: 'Ndima commande',
    deliveryUnavailableError: 'Kwiza kele ve na quartier yayi bubu.',
    finalizeOrderError: 'Kemana commande ve.',
    invalidReferenceError: 'Référence ya kufuta mefwana ve.',
  },
  sharedCart: {
    title: 'Panier yina kekabulama',
    sentByPrefix: 'Metindama na',
    forPrefix: 'sambu na',
    introPrefix: 'Tala bima yina',
    introMiddle: 'ke zola kutindila nge na Zando na Ndako.',
    introEnd: 'Panier yayi kele kaka mpo na kuzaba — commande ta manisama kaka na muntu yina metindaka yandi.',
    articlesSuffix: 'kima',
    footerNotePrefix: 'Nge kena ve kima ya kusala awa — vutula kaka na',
    footerNoteSuffix: 'mpo na ndima.',
    defaultSender: 'muntu mosi',
    defaultSenderAlt: 'muntu yina metindaka',
    invalidTitle: 'Lien ya panier yayi mefwana ve to mesila.',
    backHome: 'Vutuka na nzo',
  },
};

const en: ClientTranslations = {
  common: {
    loading: 'Loading…',
    back: 'Back',
    cancel: 'Cancel',
  },
  promoBanner: {
    promoOfDayLabel: 'Deal of the day',
    offerNow: 'Current offer',
    freshOffer: 'Fresh offer',
    defaultProductName: 'Fresh fish',
    defaultDescription: "Discover today's selection of fresh fish",
    discountSuffix: 'on this product right now',
    discoverOffer: 'Discover offer',
    viewAllPromotions: 'View all promotions',
  },
  productCard: {
    freshBadge: 'Fresh Products',
    addToCart: 'Add to cart',
    added: 'Added!',
    decreaseAria: 'Decrease quantity',
    increaseAria: 'Increase quantity',
    addFavoriteAria: 'Add to favorites',
    removeFavoriteAria: 'Remove from favorites',
    addedToCartSuffix: 'added to your cart.',
    addedToFavoritesSuffix: 'added to your favorites.',
    removedFromFavoritesSuffix: 'removed from your favorites.',
  },
  hero: {
    zonePrefix: 'Delivery to',
    title1: 'The market',
    title2: 'comes to you',
    subtitle: 'Your fresh and essential products, delivered to your home simply and in record time.',
    orderNow: 'Order now',
    createAccount: 'Create an account',
  },
  benefits: {
    fresh: 'Fresh, quality\nproducts',
    delivery: 'Fast, reliable\ndelivery',
    payment: '100% secure\npayment',
    support: '24/7 support\nat your service',
  },
  howItWorks: {
    title: 'How does it work?',
    subtitle: 'Your market at home in 3 simple steps.',
    step1Title: '1. Choose your products',
    step1Desc: 'Browse our fresh Brazzaville categories and add your items to the cart.',
    step2Title: '2. Place your order',
    step2Desc: 'Confirm your cart, choose your district (Poto-Poto, Bacongo...) and your payment method.',
    step3Title: '3. Express home delivery',
    step3Desc: 'Your fresh market is delivered straight to your home in 30 to 60 minutes flat.',
  },
  partners: {
    title: 'Our trusted partners & vendors',
    subtitle: 'The best markets and local producers delivered to your home.',
    verifiedBadge: '100% Verified vendors',
  },
  testimonials: {
    title: 'What our customers say',
    subtitle: 'Verified reviews from users in Congo.',
    prevAria: 'Previous testimonial',
    nextAria: 'Next testimonial',
    dotAriaPrefix: 'Go to testimonial',
  },
  footer: {
    tagline: 'Your trusted online market. Fresh products, delivered to your home with ease.',
    usefulLinks: 'Useful links',
    about: 'About',
    howItWorks: 'How it works',
    ourPartners: 'Our partners',
    terms: 'Terms & conditions',
    privacy: 'Privacy policy',
    faq: 'FAQ',
    categoriesTitle: 'Categories',
    contactTitle: 'Contact',
    rightsReserved: '© 2024 Zando na Ndako. All rights reserved.',
    cgu: 'Terms',
    confidentiality: 'Privacy',
    contact: 'Contact',
    addressLine: "Avenue de l'Indépendance, Poto-Poto, Brazzaville, Congo",
  },
  appBanner: {
    badge: 'Official Mobile App',
    titleLine: 'Download the app',
    subtitle: 'Shop the Brazzaville market from your phone, wherever you are.',
    availableOn: 'AVAILABLE ON',
    googlePlay: 'Google Play',
    downloadOnThe: 'Download on the',
    appStore: 'App Store',
    ourCategories: 'Our categories',
    availableInBrazzaville: 'Available in Brazzaville',
    googlePlayToast: 'Redirecting to Google Play Store…',
    appStoreToast: 'Redirecting to Apple App Store…',
  },
  announcementBar: {
    badge: 'Special Offer',
    message: 'Free delivery in Brazzaville from 15,000 FCFA with code',
    supportLabel: 'Support:',
    closeAria: 'Close the announcement bar',
  },
  whatsapp: {
    label: 'Order via WhatsApp',
    ariaLabel: 'Order via WhatsApp',
  },
  zoneModal: {
    title: 'Delivery zone',
    subtitle: 'Choose your district or area',
    closeAria: 'Close the modal',
    searchPlaceholder: 'Search a district (Poto-Poto, Bacongo, Ouenzé...)',
    noResultsPrefix: 'No zone found for',
    neighborhoodsLabel: 'Neighborhoods:',
  },
  categoriesSection: {
    title: 'Our popular categories',
    viewAll: 'View all categories',
  },
  featuredProducts: {
    title: 'Our featured products',
    viewAll: 'View all',
  },
  categoriesPage: {
    title: 'Categories',
    productSuffix: 'product',
  },
  categoryDetail: {
    home: 'Home',
    availabilityAll: 'All availability',
    inStock: 'In stock',
    outOfStock: 'Out of stock',
    sortRelevance: 'Relevance',
    sortPriceAsc: 'Price: low to high',
    sortPriceDesc: 'Price: high to low',
    emptyTitle: 'No products in this category yet',
    productsAvailableSuffix: 'available',
  },
  produits: {
    title: 'All our products',
    searchPlaceholder: 'Search a product…',
    emptyTitle: 'No products found',
  },
  produitDetail: {
    backToCatalog: 'Back to catalog',
    notFoundTitle: 'Product not found',
    notFoundDesc: 'This product does not exist or is no longer available.',
    outOfStockBadge: 'Out of stock',
    addToCart: 'Add to cart',
    added: 'Added!',
    unavailable: 'Unavailable',
    decreaseAria: 'Decrease quantity',
    increaseAria: 'Increase quantity',
    addFavoriteAria: 'Add to favorites',
    removeFavoriteAria: 'Remove from favorites',
    addedToCartSuffix: 'added to your cart.',
  },
  accueil: {
    greetingPrefix: 'Hello',
    openStatus: 'Open',
    tagline: 'Fresh market, delivered to your home',
    searchPlaceholder: 'Search a product, a market…',
    expressDeliveryTitle: 'Express delivery in Brazzaville',
    expressDeliverySubPrefix: 'In 30–60 min · from',
    myFavoritesTitle: 'My favorites',
    favoritesSavedSuffix: 'saved',
    noFavoritesYet: 'No favorites yet',
    diasporaTitle: 'Order for someone in Congo',
    diasporaSubtitle: 'Diaspora Mode',
  },
  panier: {
    title: 'My cart',
    clear: 'Clear',
    emptyTitle: 'Your cart is empty',
    emptySub: 'Add products to get started.',
    discoverProducts: 'Discover our products',
    summary: 'Summary',
    subtotalPrefix: 'Subtotal',
    articlesSuffix: 'item(s)',
    deliveryFee: 'Delivery fee',
    deliveryFeeComputed: 'Calculated at the next step',
    total: 'Total to pay',
    deliveryNote: '🛵 Delivery in 30–60 min · Zone: Brazzaville only',
    shareCart: 'Share this cart with the recipient',
    sharing: 'Sharing…',
    shareError: 'Unable to share this cart right now.',
    copyLink: 'Copy link',
    copied: 'Copied!',
    checkoutSelf: 'Order now',
    checkoutDiaspora: 'Order for a loved one',
    guestPrompt: 'Create an account or sign in to complete your order.',
    decreaseAria: 'Decrease',
    increaseAria: 'Increase',
    removeAria: 'Remove',
  },
  cartDrawer: {
    title: 'My Cart',
    itemsSelectedSuffix: 'selected',
    closeAria: 'Close the cart',
    emptyTitle: 'Your cart is empty',
    emptyDesc: 'Add fresh products from our market.',
    decreaseAria: 'Decrease quantity',
    increaseAria: 'Increase quantity',
    removeAria: 'Remove item',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery fee',
    deliveryFeeComputed: 'Calculated at the next step',
    shareCart: 'Share this cart with the recipient',
    sharing: 'Sharing…',
    copyLink: 'Copy link',
    copied: 'Copied!',
    clear: 'Clear',
    checkout: 'Checkout',
  },
  favoris: {
    title: 'My favorites',
    emptyMessage: "You don't have any favorites yet",
    discoverCatalog: 'Discover the catalog',
  },
  promotions: {
    title: 'Promotions',
    loading: 'Loading…',
    subtitle: 'Current offers from our vendors',
    emptyTitle: 'No promotions right now',
    emptyDesc: 'Check back soon: discounts set up by our vendors will automatically appear here.',
  },
  notifications: {
    title: 'Notifications',
    markAllRead: 'Mark all as read',
    emptyTitle: 'No notifications yet',
    justNow: 'just now',
    minutesAgoSuffix: 'min ago',
    hoursAgoSuffix: 'h ago',
    daysAgoSuffix: 'd ago',
    agoPrefix: '',
  },
  mesCommandes: {
    title: 'My orders',
    searchPlaceholder: 'Search by order number…',
    tabAll: 'All',
    tabOngoing: 'Ongoing',
    tabDone: 'Completed',
    tabCancelled: 'Cancelled',
    emptyTitle: 'No orders yet',
    discoverMarket: 'Discover the market',
    statusDelivered: 'Delivered',
    statusCancelled: 'Cancelled',
    statusOngoing: 'Ongoing',
  },
  commandeDetail: {
    back: 'My orders',
    notFoundTitle: 'Order not found',
    statusConfirmed: 'Confirmed',
    statusShopping: 'Shopping in progress',
    statusPreparing: 'Preparing',
    statusEnRoute: 'Driver on the way',
    statusArriving: 'Arriving soon',
    statusDelivered: 'Delivered',
    statusCancelled: 'Cancelled',
    call: 'Call',
    total: 'Total',
    noteVendor: 'Rate the vendor',
    noteDriver: 'Rate the driver',
    thanksForReview: 'Thank you for your review!',
    cancelOrder: 'Cancel order',
    cancelReasonPlaceholder: 'Reason for cancellation…',
    confirmCancel: 'Confirm cancellation',
    cancelling: 'Cancelling…',
    cancelError: 'Unable to cancel this order.',
    reorder: 'Order again',
    viewDispute: 'View open dispute',
    reportProblem: 'Report a problem',
    disputeDescPlaceholder: 'Describe the problem you encountered…',
    openLitigeError: 'Unable to open this dispute.',
    disputeSend: 'Send',
    disputeSending: 'Sending…',
    ratingCommentPlaceholder: 'A comment (optional)…',
    ratingSend: 'Send my review',
    ratingSending: 'Sending…',
    starAriaSuffix: 'star(s)',
  },
  mesLitiges: {
    title: 'My disputes',
    emptyTitle: 'No open disputes',
    emptyDesc: 'A problem with an order? Report it from its detail page.',
  },
  litigeDetail: {
    back: 'My disputes',
    notFound: 'Dispute not found.',
    decisionTitle: 'Decision',
    conversationTitle: 'Conversation',
  },
  litigeConversation: {
    noMessages: 'No messages yet.',
    closedNotice: 'This dispute is closed — the conversation is read-only.',
    messagePlaceholder: 'Write a message…',
    sendError: 'Unable to send this message.',
    uploadError: 'Unable to send this evidence.',
    clientLabel: 'Client',
    vendorLabel: 'Vendor',
  },
  monCompte: {
    defaultTitle: 'My account',
    myOrders: 'My orders',
    myAddresses: 'My addresses',
    myBeneficiaries: 'My beneficiaries',
    favoritesLabel: 'Favorites',
    notificationsLabel: 'Notifications',
    myDisputes: 'My disputes',
    settingsLabel: 'Settings',
    diasporaBadge: 'Diaspora client account',
    myInfoTitle: 'My information',
    nom: 'Last name',
    prenom: 'First name',
    email: 'Email',
    ville: 'City',
    adresse: 'Address',
    saving: 'Saving…',
    saveChanges: 'Save changes',
    saved: 'Saved!',
    saveError: 'Unable to save changes.',
    logout: 'Log out',
  },
  checkoutSteps: {
    addressLabel: 'Address',
    slotLabel: 'Time slot',
    paymentLabel: 'Payment',
    beneficiaryLabel: 'Beneficiary',
  },
  checkoutAddress: {
    title: 'Delivery address',
    subtitle: 'Choose where you would like to be delivered.',
    defaultBadge: 'Default',
    setDefaultTitle: 'Set as default',
    deleteTitle: 'Delete',
    addAddress: 'Add an address',
    newAddressTitle: 'New address',
    labelPlaceholder: 'Label (e.g. Home, Office)',
    addressPlaceholder: 'Address (street, number…)',
    neighborhoodPlaceholder: 'District',
    cityPlaceholder: 'City',
    saveError: 'Unable to save this address.',
    saving: 'Saving…',
    saveAddress: 'Save address',
    continueBtn: 'Continue',
  },
  checkoutSlot: {
    title: 'Delivery time slot',
    subtitle: 'When would you like to be delivered?',
    computingFees: 'Calculating fees…',
    estimatedFeesPrefix: 'Estimated delivery fee:',
    today: 'Today',
    tomorrow: 'Tomorrow',
    continueToPayment: 'Continue to payment',
  },
  checkoutPayment: {
    title: 'Payment',
    totalToPayPrefix: 'Total to pay:',
    methodCod: 'Cash on delivery',
    methodCodHint: 'Pay in cash on arrival',
    methodCard: 'Bank card',
    methodCardHint: 'Visa, Mastercard',
    methodMtn: 'MTN Mobile Money',
    methodAirtel: 'Airtel Money',
    methodMobileHint: 'Confirm via USSD on your phone',
    requestSentPrefix: 'A payment request for',
    requestSentSuffix: 'FCFA has been sent.',
    approveUssd: 'Approve it via the USSD message received on your phone,',
    thenEnterCode: 'then enter the confirmation code received.',
    codePlaceholder: 'Confirmation code',
    confirmPayment: 'Confirm payment',
    confirmOrder: 'Confirm order',
    deliveryUnavailableError: 'Delivery unavailable for this district right now.',
    finalizeOrderError: 'Unable to finalize the order.',
    invalidCodeError: 'Invalid confirmation code.',
    mtnRequestSent: 'An MTN Mobile Money notification has been sent to',
    mtnEnterPin: 'Enter your PIN code on your phone to confirm the payment of',
    mtnWaiting: 'Waiting for your confirmation…',
    mtnFailed: 'The MTN MoMo payment failed.',
    mtnTimeout: "Time's up. You did not confirm the payment in time.",
  },
  checkoutConfirmed: {
    title: 'Order confirmed!',
    messagePrefix: 'Your order',
    messageMiddle: 'for an amount of',
    messageEnd: 'has been successfully placed.',
    trackOrder: 'Track my order',
    backHome: 'Back to home',
  },
  diasporaActivation: {
    title: 'Send groceries\nto your loved ones in Congo',
    feature1: 'Secure payment in € or $',
    feature2: 'Fast delivery in Brazzaville',
    feature3: 'Real-time tracking',
    cta: 'Activate Diaspora Mode',
    later: 'Later',
    back: 'Back',
  },
  diasporaBeneficiary: {
    title: 'Beneficiary',
    subtitle: 'Who would you like to place this order for?',
    defaultBadge: 'Default',
    relationDefault: 'Beneficiary',
    setDefaultTitle: 'Set as default',
    deleteTitle: 'Delete',
    addBeneficiary: 'Add a beneficiary',
    newBeneficiaryTitle: 'New beneficiary',
    namePlaceholder: 'Full name',
    phonePlaceholder: 'Phone',
    relationPlaceholder: 'Relationship (e.g. Mother)',
    addressPlaceholder: 'Address',
    neighborhoodPlaceholder: 'District',
    cityPlaceholder: 'City',
    saveError: 'Unable to save this beneficiary.',
    saving: 'Saving…',
    saveBeneficiary: 'Save beneficiary',
    continueBtn: 'Continue',
  },
  diasporaSlot: {
    title: 'Delivery time slot',
    subtitlePrefix: 'When would you like',
    subtitleSuffix: 'to be delivered?',
    computingFees: 'Calculating fees…',
    estimatedFeesPrefix: 'Estimated delivery fee:',
    continueToPayment: 'Continue to payment',
  },
  diasporaPayment: {
    title: 'Payment',
    totalPrefix: 'Total:',
    methodCard: 'International bank card',
    methodCardHint: 'Visa, Mastercard via Stripe',
    methodPaypal: 'PayPal',
    methodPaypalHint: 'Pay with your PayPal account',
    finalizeViaPrefix: 'Finalize your payment via',
    finalizeViaSuffix: ', then enter the confirmation reference received.',
    referencePlaceholder: 'Confirmation reference',
    confirmPayment: 'Confirm payment',
    confirmOrder: 'Confirm order',
    deliveryUnavailableError: 'Delivery unavailable for this district right now.',
    finalizeOrderError: 'Unable to finalize the order.',
    invalidReferenceError: 'Invalid payment confirmation.',
  },
  sharedCart: {
    title: 'Shared cart',
    sentByPrefix: 'Sent by',
    forPrefix: 'for',
    introPrefix: 'Here are the products that',
    introMiddle: 'would like to send you via Zando na Ndako.',
    introEnd: 'This cart is for information only — the order will be finalized directly by the sender.',
    articlesSuffix: 'item(s)',
    footerNotePrefix: "You don't need to do anything here — just reply to",
    footerNoteSuffix: 'to confirm.',
    defaultSender: 'a loved one',
    defaultSenderAlt: 'the sender',
    invalidTitle: 'This cart link is invalid or has expired.',
    backHome: 'Back to home',
  },
};

export const clientTranslations: Record<Language, ClientTranslations> = { fr, lingala, kituba, en };
