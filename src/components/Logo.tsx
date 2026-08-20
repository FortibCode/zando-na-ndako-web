import React from 'react';

type LogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
  layout?: 'row' | 'stack';
};

const ICON_SIZE = {
  sm: 32,
  md: 46,
  lg: 60,
  xl: 72,
  '2xl': 84,
};

const TEXT_SIZE = {
  sm: 'text-sm',
  md: 'text-lg sm:text-xl',
  lg: 'text-xl sm:text-2xl',
  xl: 'text-2xl sm:text-3xl',
  '2xl': 'text-3xl sm:text-4xl',
};

const SUBTITLE_SIZE = {
  sm: 'text-[11.5px]',
  md: 'text-[12.5px]',
  lg: 'text-xs sm:text-sm',
  xl: 'text-xs sm:text-sm font-bold',
  '2xl': 'text-sm sm:text-base font-extrabold',
};

export function Logo({ size = 'lg', className = '', showSubtitle = true, theme = 'light', layout = 'row' }: LogoProps) {
  const iconSize = ICON_SIZE[size];
  const textSize = TEXT_SIZE[size];
  const subtitleSize = SUBTITLE_SIZE[size];
  const taglineColor = theme === 'dark' ? 'text-white/70' : 'text-slate-500';
  // "Zando" est en bleu marine très sombre : illisible sur le fond marine de la sidebar admin.
  const zandoColor = theme === 'dark' ? 'text-white' : 'text-[#0B2545]';

  if (layout === 'stack') {
    return (
      <div className={`flex flex-col items-center gap-1 text-center select-none ${className}`}>
        <img
          src="/logo-icon.png"
          alt="Zando na Ndako"
          style={{ height: `${iconSize}px`, width: `${iconSize}px` }}
          className="rounded-full object-cover shrink-0"
        />
        <p className={`${textSize} font-black tracking-tight whitespace-nowrap mt-1`}>
          <span className={zandoColor}>Zando</span>{' '}
          <span className="text-[#F1A105]">na</span>{' '}
          <span className="text-[#C00000]">Ndako</span>
        </p>
        {showSubtitle && (
          <p className={`${subtitleSize} font-bold whitespace-nowrap ${taglineColor}`}>
            Le marché vient chez vous
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src="/logo-icon.png"
        alt="Zando na Ndako"
        style={{ height: `${iconSize}px`, width: `${iconSize}px` }}
        className="rounded-full object-cover shrink-0 transition-transform hover:scale-105"
      />
      <div className="leading-tight">
        <p className={`${textSize} font-black tracking-tight whitespace-nowrap`}>
          <span className={zandoColor}>Zando</span>{' '}
          <span className="text-[#F1A105]">na</span>{' '}
          <span className="text-[#C00000]">Ndako</span>
        </p>
        {showSubtitle && (
          <p className={`${subtitleSize} font-bold whitespace-nowrap -mt-0.5 ${taglineColor}`}>
            Le marché vient chez vous
          </p>
        )}
      </div>
    </div>
  );
}
