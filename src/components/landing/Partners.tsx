import { BadgeCheck, Shield, Star, Store } from 'lucide-react';

const PARTNERS = [
  {
    id: 1,
    name: 'Zando Grand Marché',
    category: 'Alimentation Générale',
    rating: '4.9',
    location: 'Brazzaville - Poto-Poto',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    verified: true,
  },
  {
    id: 2,
    name: 'Boucherie De Bacongo',
    category: 'Viandes & Volailles',
    rating: '4.8',
    location: 'Brazzaville - Bacongo',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80',
    verified: true,
  },
  {
    id: 3,
    name: 'Ferme Bio Brazzaville',
    category: 'Fruits & Légumes Frais',
    rating: '5.0',
    location: 'Brazzaville - Moungali',
    image: 'https://images.unsplash.com/photo-1595665593673-bf1ad729c69c?auto=format&fit=crop&w=400&q=80',
    verified: true,
  },
  {
    id: 4,
    name: 'Poissonnerie Du Fleuve Congo',
    category: 'Poissons & Produits de la Mer',
    rating: '4.9',
    location: 'Brazzaville - Ouenzé',
    image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=400&q=80',
    verified: true,
  },
];

export function Partners() {
  return (
    <section id="partners" className="w-full">
      <div className="rounded-3xl border border-slate-200/60 bg-white p-5 sm:p-7 shadow-xs">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-[#0B2545]" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Nos partenaires & vendeurs de confiance</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Les meilleurs marchés et producteurs locaux livrés chez vous.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/60 shadow-xs self-start sm:self-auto hover:scale-105 transition-transform cursor-pointer">
            <BadgeCheck className="h-4 w-4 text-emerald-600 icon-glow-green" /> 100% Vendeurs vérifiés
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PARTNERS.map((partner, idx) => (
            <div
              key={partner.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-300 card-3d shine-effect hover:bg-white hover:border-slate-200 hover:shadow-xl cursor-pointer"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative mb-3 h-32 w-full overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-slate-900 shadow-sm border border-white/60">
                  <Star size={10} className="fill-amber-400 text-amber-400" /> {partner.rating}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-[#0B2545] transition-colors">{partner.name}</h3>
                  <BadgeCheck className="h-4 w-4 text-[#0B2545] shrink-0" />
                </div>
                <p className="text-[11px] font-bold text-[#0B2545] mt-0.5">{partner.category}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{partner.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
