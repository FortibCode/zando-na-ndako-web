import React from 'react';

export function GroceryBasketIllustration() {
  return (
    <div className="relative z-0 w-full max-w-2xl flex items-center justify-center py-2 px-2 sm:px-6 perspective-800">
      {/* Background Graphic Shapes */}
      <div className="absolute inset-0 -z-10 flex items-center justify-end overflow-visible pointer-events-none">
        <svg
          className="absolute -top-12 -right-8 sm:-right-12 w-[320px] h-[480px] sm:w-[420px] sm:h-[600px] overflow-visible"
          viewBox="0 0 400 550"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Golden Yellow Shape */}
          <path
            d="M180 20 C280 -20 380 40 390 160 C400 280 320 380 240 390 C160 400 120 310 130 200 C140 90 130 40 180 20 Z"
            fill="#FFB703"
            transform="rotate(25 250 200)"
            className="opacity-90"
          />
          {/* Bottom Red Shape */}
          <path
            d="M220 180 C320 140 410 210 400 330 C390 450 290 520 200 490 C110 460 130 350 170 270 C210 190 170 200 220 180 Z"
            fill="#D32F2F"
            transform="rotate(12 250 330)"
            className="opacity-90"
          />
        </svg>
      </div>

      {/* Hero Basket Wrapper */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Basket Container with drop shadow & 3D tilt */}
        <div className="relative w-full max-w-[480px] sm:max-w-[580px] lg:max-w-[620px] preserve-3d">
          <img
            src="/hero_basket_transparent.png"
            alt="Panier d'épicerie frais Zando na Ndako"
            className="w-full h-auto object-contain drop-shadow-2xl hover:scale-[1.03] hover:rotate-1 transition-transform duration-500 cursor-pointer"
          />

          {/* Oval Logo Sticker placed on the front face of the blue basket */}
          <div className="absolute bottom-[18%] left-[58%] transform -translate-x-1/2 bg-white px-3.5 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-1 scale-90 sm:scale-100 hover:scale-110 transition-transform cursor-pointer">
            <img
              src="/logo-icon.png"
              alt="Logo Zando Sticker"
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
