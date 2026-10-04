import React from 'react';

interface PrismaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'icon' | 'full';
  className?: string;
  useImage?: boolean;
}

export const PrismaLogo: React.FC<PrismaLogoProps> = ({
  size = 'md',
  variant = 'icon',
  className = '',
  useImage = false,
}) => {
  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-sm' },
    sm: { icon: 'w-8 h-8', text: 'text-base' },
    md: { icon: 'w-10 h-10', text: 'text-lg' },
    lg: { icon: 'w-14 h-14', text: 'text-xl' },
    xl: { icon: 'w-20 h-20', text: 'text-2xl' },
    '2xl': { icon: 'w-28 h-28', text: 'text-3xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (useImage) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <img
          src="/prisma-logo.png"
          alt="PRISMA Logo"
          className={`${currentSize.icon} object-contain`}
        />
        {variant === 'full' && (
          <span className={`font-black tracking-tight text-slate-900 ${currentSize.text}`}>
            PRISMA
          </span>
        )}
      </div>
    );
  }

  // High-performance crisp Vector SVG implementation
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        className={`${currentSize.icon} shrink-0`}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="PRISMA Logotipo"
      >
        <defs>
          <linearGradient id="prismFaceLeftCmp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="prismFaceRightCmp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        <g transform="translate(10, 0)">
          {/* 5 Refracted Light Rays (Rainbow Spectrum) */}
          <polygon points="230,172 405,110 395,138 232,178" fill="#2563eb" />
          <polygon points="232,179 403,143 392,170 234,185" fill="#0d9488" />
          <polygon points="234,186 400,174 388,201 236,192" fill="#f59e0b" />
          <polygon points="236,193 396,206 383,232 238,198" fill="#f97316" />
          <polygon points="238,199 391,237 378,262 240,203" fill="#8b5cf6" />

          {/* Prism Base inside/reflection */}
          <polygon points="120,240 185,275 285,248" fill="#f1f5f9" opacity="0.7" />
          <line x1="120" y1="240" x2="200" y2="175" stroke="#94a3b8" strokeWidth="3" strokeDasharray="4,4" />
          <line x1="285" y1="248" x2="200" y2="175" stroke="#94a3b8" strokeWidth="3" strokeDasharray="4,4" />
          <line x1="205" y1="90" x2="200" y2="175" stroke="#94a3b8" strokeWidth="3.5" strokeDasharray="4,4" />

          {/* Left Facet */}
          <polygon points="205,90 120,240 185,275" fill="url(#prismFaceLeftCmp)" stroke="#0f172a" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />

          {/* Right Facet */}
          <polygon points="205,90 185,275 285,248" fill="url(#prismFaceRightCmp)" stroke="#0f172a" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />

          {/* External contours */}
          <line x1="120" y1="240" x2="185" y2="275" stroke="#0f172a" strokeWidth="9" strokeLinecap="round" />
          <line x1="185" y1="275" x2="285" y2="248" stroke="#0f172a" strokeWidth="9" strokeLinecap="round" />
          <line x1="205" y1="90" x2="185" y2="275" stroke="#0f172a" strokeWidth="9" strokeLinecap="round" />
          <line x1="205" y1="90" x2="120" y2="240" stroke="#0f172a" strokeWidth="9" strokeLinecap="round" />
          <line x1="205" y1="90" x2="285" y2="248" stroke="#0f172a" strokeWidth="9" strokeLinecap="round" />

          {/* Reflection Highlight */}
          <line x1="203" y1="102" x2="132" y2="230" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </g>

        {variant === 'full' && (
          <g transform="translate(85, 360)">
            <path d="M 12 0 L 12 40 M 12 0 L 28 0 C 36 0 40 4 40 11 C 40 18 36 22 28 22 L 12 22" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 68 0 L 68 40 M 68 0 L 84 0 C 92 0 96 4 96 11 C 96 18 92 22 84 22 L 68 22 M 82 22 L 98 40" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 132 0 L 132 40" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
            <path d="M 194 6 C 188 0 178 0 170 3 C 160 8 160 16 166 20 L 186 24 C 196 27 196 36 188 40 C 180 43 166 43 158 36" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 224 40 L 224 0 L 244 26 L 264 0 L 264 40" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 292 40 L 314 0 L 336 40" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>

      {variant === 'full' && (
        <span className={`font-black tracking-tight text-slate-900 ${currentSize.text}`}>
          PRISMA
        </span>
      )}
    </div>
  );
};
