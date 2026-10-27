import React from 'react';

interface FoliumLogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  symbolOnly?: boolean;
  className?: string;
  showSlogan?: boolean;
}

export const FoliumLogo: React.FC<FoliumLogoProps> = ({
  variant = 'dark',
  size = 'md',
  symbolOnly = false,
  className = '',
  showSlogan = true,
}) => {
  const isDark = variant === 'dark';

  // Dimensionamento proporcional
  const symbolDimensions = {
    sm: { w: 26, h: 26 },
    md: { w: 34, h: 34 },
    lg: { w: 42, h: 42 },
  }[size];

  const textColor = isDark ? 'text-white' : 'text-[#203A65]';
  const sloganColor = isDark ? 'text-[#A3BFDB]' : 'text-[#5B7394]';
  const primaryFill = isDark ? '#FFFFFF' : '#203A65';
  const accentFill = isDark ? '#EAF0F7' : '#32588F';
  const leafGlow = isDark ? '#A3BFDB' : '#7395BC';

  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* Símbolo Monograma 'F' com páginas de livro e folhas estilizadas */}
      <svg
        width={symbolDimensions.w}
        height={symbolDimensions.h}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`folium-grad-1-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryFill} />
            <stop offset="100%" stopColor={accentFill} />
          </linearGradient>
          <linearGradient id={`folium-grad-2-${variant}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentFill} />
            <stop offset="100%" stopColor={leafGlow} />
          </linearGradient>
          <linearGradient id={`folium-spine-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryFill} />
            <stop offset="100%" stopColor={isDark ? '#CBD8E6' : '#1A2F50'} />
          </linearGradient>
        </defs>

        {/* Haste Vertical / Lombada do Livro (Tronco do F) */}
        <path
          d="M22 18 C22 14, 26 12, 30 14 L36 17 C40 19, 42 23, 42 27 L42 84 C42 88, 38 90, 34 88 L28 85 C24 83, 22 79, 22 75 Z"
          fill={`url(#folium-spine-${variant})`}
        />

        {/* Asa Superior do F (Página Aberta Curvada em Forma de Folha) */}
        <path
          d="M38 18 C50 14, 74 16, 88 26 C90 28, 89 31, 86 32 L58 40 C52 42, 46 39, 44 34 L38 18 Z"
          fill={`url(#folium-grad-1-${variant})`}
        />

        {/* Detalhe interno da página superior */}
        <path
          d="M48 24 C58 22, 72 25, 82 30 L54 36 C50 37, 46 35, 45 31 Z"
          fill={leafGlow}
          opacity="0.85"
        />

        {/* Asa Intermediária do F (Segunda Página / Folha em Camada) */}
        <path
          d="M38 46 C50 42, 68 44, 78 52 C80 54, 79 57, 76 58 L54 64 C48 66, 43 63, 41 58 L38 46 Z"
          fill={`url(#folium-grad-2-${variant})`}
        />

        {/* Curva fluida na base (Página em movimento) */}
        <path
          d="M26 76 C32 82, 46 86, 60 84 C63 84, 64 86, 62 88 C50 94, 32 92, 24 82 Z"
          fill={accentFill}
          opacity="0.9"
        />
      </svg>

      {/* Tipografia da Marca Folium */}
      {!symbolOnly && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-extrabold tracking-tight leading-none ${textColor} ${
              size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Folium
          </span>
          {showSlogan && (
            <span
              className={`text-[9px] font-bold tracking-[0.18em] uppercase leading-tight mt-1 truncate ${sloganColor}`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Conhecimento em cada etapa
            </span>
          )}
        </div>
      )}
    </div>
  );
};
