// Miroir de mobile/src/i18n/translations.ts, limité aux clés réellement utilisées côté web
// (chrome partagé : onglets, paramètres, actions communes) — chaque valeur ici a été reprise
// telle quelle du fichier mobile quand le concept y existe déjà (mêmes clés que
// mobile/src/app/client/settings.tsx, mobile/src/app/client/(tabs)/_layout.tsx, etc.), pour ne
// jamais introduire une traduction différente de celle que l'utilisateur voit déjà sur mobile.
export type Language = 'fr' | 'lingala' | 'kituba' | 'en';

interface Translations {
  tabs: {
    discover: string;
    categories: string;
    cart: string;
    orders: string;
    profile: string;
  };
  vendorNav: {
    home: string;
    orders: string;
    products: string;
    revenue: string;
    profile: string;
    more: string;
    documents: string;
    support: string;
    disputes: string;
    notifications: string;
    logout: string;
    reviews: string;
  };
  settings: {
    title: string;
    subtitle: string;
    appearance: string;
    theme: string;
    light: string;
    dark: string;
    system: string;
    language: string;
    saved: string;
  };
  common: {
    save: string;
    cancel: string;
    login: string;
    logout: string;
    createAccount: string;
  };
}

const fr: Translations = {
  tabs: {
    discover: 'Découvrir',
    categories: 'Catégories',
    cart: 'Panier',
    orders: 'Commandes',
    profile: 'Profil',
  },
  vendorNav: {
    home: 'Accueil',
    orders: 'Commandes',
    products: 'Produits',
    revenue: 'Revenus',
    profile: 'Profil',
    more: 'Plus',
    documents: 'Documents',
    support: 'Support Zando na Ndako',
    disputes: 'Litiges',
    notifications: 'Notifications',
    logout: 'Déconnexion',
    reviews: 'Avis clients',
  },
  settings: {
    title: 'Paramètres',
    subtitle: "Préférences de l'application",
    appearance: 'Apparence',
    theme: 'Thème',
    light: 'Clair',
    dark: 'Sombre',
    system: 'Système',
    language: 'Langue',
    saved: 'Enregistré',
  },
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    login: 'Se connecter',
    logout: 'Se déconnecter',
    createAccount: 'Créer un compte',
  },
};

const lingala: Translations = {
  tabs: {
    discover: 'Komona',
    categories: 'Bibale',
    cart: 'Panier',
    orders: 'Ba commande',
    profile: 'Profil',
  },
  vendorNav: {
    home: 'Ndako',
    orders: 'Ba commande',
    products: 'Biloko',
    revenue: 'Mbongo',
    profile: 'Profil',
    more: 'Plus',
    documents: 'Ba documents',
    support: 'Support Zando na Ndako',
    disputes: 'Ba litige',
    notifications: 'Ba notification',
    logout: 'Kolongwa',
    reviews: 'Ba avis ya ba client',
  },
  settings: {
    title: 'Paramètres',
    subtitle: "Ba préférence ya application",
    appearance: 'Elilingi',
    theme: 'Thème',
    light: 'Pembe',
    dark: 'Moyindo',
    system: 'Système',
    language: 'Lokota',
    saved: 'Ebombami',
  },
  common: {
    save: 'Bomba',
    cancel: 'Boya',
    login: 'Kokota',
    logout: 'Kolongwa',
    createAccount: 'Sala compte',
  },
};

const kituba: Translations = {
  tabs: {
    discover: 'Mona',
    categories: 'Bitini',
    cart: 'Panier',
    orders: 'Ba commande',
    profile: 'Profil',
  },
  vendorNav: {
    home: 'Nzo',
    orders: 'Ba commande',
    products: 'Bima',
    revenue: 'Mbongo',
    profile: 'Profil',
    more: 'Plus',
    documents: 'Ba documents',
    support: 'Support Zando na Ndako',
    disputes: 'Ba litige',
    notifications: 'Ba notification',
    logout: 'Basika',
    reviews: 'Ba avis ya ba client',
  },
  settings: {
    title: 'Paramètres',
    subtitle: 'Ba préférence ya application',
    appearance: 'Ndenge',
    theme: 'Thème',
    light: 'Mpembe',
    dark: 'Mpimpa',
    system: 'Système',
    language: 'Ndinga',
    saved: 'Ibombami',
  },
  common: {
    save: 'Bomba',
    cancel: 'Buya',
    login: 'Kota',
    logout: 'Basika',
    createAccount: 'Sala compte',
  },
};

const en: Translations = {
  tabs: {
    discover: 'Discover',
    categories: 'Categories',
    cart: 'Cart',
    orders: 'Orders',
    profile: 'Profile',
  },
  vendorNav: {
    home: 'Home',
    orders: 'Orders',
    products: 'Products',
    revenue: 'Revenue',
    profile: 'Profile',
    more: 'More',
    documents: 'Documents',
    support: 'Zando na Ndako Support',
    disputes: 'Disputes',
    notifications: 'Notifications',
    logout: 'Log out',
    reviews: 'Customer reviews',
  },
  settings: {
    title: 'Settings',
    subtitle: 'App preferences',
    appearance: 'Appearance',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
    saved: 'Saved',
  },
  common: {
    save: 'Save',
    cancel: 'Cancel',
    login: 'Log in',
    logout: 'Log out',
    createAccount: 'Create an account',
  },
};

export const translations: Record<Language, Translations> = { fr, lingala, kituba, en };
