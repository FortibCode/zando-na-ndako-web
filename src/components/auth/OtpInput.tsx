"use client";

import React, { useEffect, useRef, useState } from 'react';

interface OtpInputProps {
  length?: number;
  initialCode?: string;
  onComplete: (code: string) => void;
  disabled?: boolean;
  resetKey?: number;
}

export function OtpInput({ length = 6, initialCode, onComplete, disabled, resetKey }: OtpInputProps) {
  const seed = (initialCode || '').replace(/\D/g, '').slice(0, length).split('');
  const [values, setValues] = useState<string[]>(() =>
    Array.from({ length }, (_, i) => seed[i] || ''),
  );
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Un nouveau code (renvoi OTP) doit vider les cases précédentes plutôt que de les laisser
  // affichées avec l'ancien code, qui n'est alors plus valide côté serveur.
  useEffect(() => {
    const next = (initialCode || '').replace(/\D/g, '').slice(0, length).split('');
    setValues(Array.from({ length }, (_, i) => next[i] || ''));
  }, [resetKey, initialCode, length]);

  const setDigit = (index: number, digit: string) => {
    setValues((prev) => {
      const copy = [...prev];
      copy[index] = digit;
      return copy;
    });
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
    const next = [...values];
    next[index] = digit;
    if (next.every((d) => d) && next.join('').length === length) {
      onComplete(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setDigit(index - 1, '');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    const next = Array.from({ length }, (_, i) => pasted[i] || '');
    setValues(next);
    const lastFilled = Math.min(pasted.length, length) - 1;
    inputsRef.current[Math.max(lastFilled, 0)]?.focus();
    if (pasted.length === length) onComplete(pasted);
  };

  const complete = values.every((d) => d) && values.length === length;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-2.5">
        {values.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black text-[#0D347C] rounded-xl border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-[#0D347C] focus:bg-white focus:ring-2 focus:ring-[#0D347C]/15 transition-all disabled:opacity-50"
          />
        ))}
      </div>
      {/* Un code prérempli (convenience de développement) n'auto-soumet jamais : il faut ce
          bouton explicite pour appeler la vérification réelle, comme les écrans mobile équivalents. */}
      <button
        type="button"
        disabled={!complete || disabled}
        onClick={() => onComplete(values.join(''))}
        className="text-xs font-extrabold text-[#0D347C] disabled:text-slate-300 disabled:cursor-not-allowed hover:underline"
      >
        Vérifier le code
      </button>
    </div>
  );
}
