import { Quote, Star } from 'lucide-react';
import type { Testimonial } from './data';

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-slate-100/90 bg-white p-5 shadow-xs transition-all duration-300 card-3d-sm hover:shadow-xl hover:border-slate-200 cursor-pointer">
      {/* Decorative Floating Quote Icon */}
      <Quote className="absolute top-4 right-4 h-6 w-6 text-amber-500/20 group-hover:text-amber-500/40 transition-colors duration-300 group-hover:scale-125" />

      <div>
        <div className="mb-3 flex items-center gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400 icon-glow-gold" />
          ))}
        </div>
        <p className="mb-4 text-xs leading-relaxed font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
          &ldquo;{testimonial.comment}&rdquo;
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="h-9 w-9 rounded-full object-cover ring-2 ring-[#0B2545]/20 group-hover:ring-[#0B2545] transition-all duration-300"
        />
        <div className="leading-tight">
          <h4 className="text-xs font-black text-slate-900 group-hover:text-[#0B2545] transition-colors">{testimonial.name}</h4>
          <p className="text-[10px] font-bold text-slate-400">{testimonial.city}, Congo</p>
        </div>
      </div>
    </div>
  );
}
