export type Category = {
  id: string;
  name: string;
  image: string;
};

export const CATEGORIES: Category[] = [
  {
    id: 'legumes-feuilles',
    name: 'Légumes & Feuilles',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'poissons-viandes',
    name: 'Poissons & Viandes',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'tubercules-feculents',
    name: 'Tubercules & Féculents',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'epices-condiments',
    name: 'Épices & Condiments',
    image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'fruits-frais',
    name: 'Fruits Frais',
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cereales-grains',
    name: 'Céréales & Grains',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=400&q=80',
  },
];

export type Product = {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  unit: string;
  image: string;
};

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Feuilles de Manioc (Pondu)',
    price: '2 500 FCFA',
    priceValue: 2500,
    unit: 'Sachet',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '2',
    name: 'Poisson Thomson Frais',
    price: '8 500 FCFA',
    priceValue: 8500,
    unit: 'Kg',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '3',
    name: 'Banane Plantain (Makemba)',
    price: '5 000 FCFA',
    priceValue: 5000,
    unit: 'Régime',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '4',
    name: 'Piment Rouge (Pili-Pili)',
    price: '1 000 FCFA',
    priceValue: 1000,
    unit: 'Boîte',
    image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?auto=format&fit=crop&w=500&q=80',
  },
];

