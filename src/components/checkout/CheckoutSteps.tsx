import { Check } from "lucide-react";

export function CheckoutSteps({ current, firstLabel = "Adresse" }: { current: 1 | 2 | 3; firstLabel?: string }) {
  const steps = [firstLabel, "Créneau", "Paiement"];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, idx) => {
        const step = (idx + 1) as 1 | 2 | 3;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black transition-colors ${
                  done ? "bg-emerald-500 text-white" : active ? "bg-[#0B2545] text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step}
              </span>
              <span className={`text-xs font-bold ${active ? "text-[#0B2545]" : "text-slate-400"}`}>{label}</span>
            </div>
            {step < 3 && <span className="h-px w-8 bg-slate-200" />}
          </div>
        );
      })}
    </div>
  );
}
