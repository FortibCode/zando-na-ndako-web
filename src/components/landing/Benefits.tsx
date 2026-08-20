import { Headphones, Leaf, ShieldCheck, Truck } from 'lucide-react';

const BENEFITS = [
  { icon: Leaf, label: 'Produits frais\net de qualité', bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  { icon: Truck, label: 'Livraison rapide\net fiable', bg: 'bg-blue-50 text-blue-600 border border-blue-100' },
  { icon: ShieldCheck, label: 'Paiement sécurisé\nà 100%', bg: 'bg-amber-50 text-amber-600 border border-amber-100' },
  { icon: Headphones, label: 'Assistance 24h/24\nà votre écoute', bg: 'bg-red-50 text-red-600 border border-red-100' },
];

export function Benefits() {
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-slate-100/80 pt-6 sm:grid-cols-4">
      {BENEFITS.map(({ icon: Icon, label, bg }) => (
        <div key={label} className="flex items-center gap-2.5 text-left">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-xs ${bg}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-[11px] leading-tight font-bold text-slate-700 whitespace-pre-line">{label}</span>
        </div>
      ))}
    </div>
  );
}
