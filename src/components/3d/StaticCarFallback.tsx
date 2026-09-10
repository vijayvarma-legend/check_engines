'use client';

/**
 * Shown when WebGL is unavailable or the device tier is too low for the live
 * scene. A composed vector poster — deliberately not a fake 3D car, just a
 * clean brand still so the page never breaks.
 */
export function StaticCarFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-ink-900">
      <div className="absolute inset-0 ce-tech-grid opacity-60" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 72% 38%, rgba(226,43,34,0.14), transparent 55%), radial-gradient(90% 90% at 20% 100%, rgba(20,22,28,0.9), transparent 60%)',
        }}
      />
      <svg
        viewBox="0 0 1200 520"
        className="absolute left-1/2 top-1/2 w-[135%] max-w-none -translate-x-1/2 -translate-y-1/2 md:w-[90%]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ce-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b2f37" />
            <stop offset="0.5" stopColor="#191c22" />
            <stop offset="1" stopColor="#0c0e12" />
          </linearGradient>
          <linearGradient id="ce-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a4150" />
            <stop offset="1" stopColor="#12151b" />
          </linearGradient>
        </defs>

        <ellipse cx="600" cy="430" rx="430" ry="34" fill="#000" opacity="0.55" />

        <path
          d="M120 360 C160 300 250 286 330 282 C390 232 470 210 585 208 C700 206 780 240 835 288 C930 296 1030 316 1075 356 C1085 372 1082 392 1060 398 L150 398 C126 392 112 378 120 360 Z"
          fill="url(#ce-body)"
          stroke="rgba(226,43,34,0.35)"
          strokeWidth="1.5"
        />
        <path
          d="M372 284 C430 244 500 228 585 227 C672 226 738 250 788 288 C700 300 470 300 372 284 Z"
          fill="url(#ce-glass)"
          opacity="0.9"
        />
        <circle cx="330" cy="398" r="62" fill="#0a0b0d" stroke="#2b2f37" strokeWidth="6" />
        <circle cx="330" cy="398" r="26" fill="#15171c" stroke="#3a3f49" strokeWidth="3" />
        <circle cx="852" cy="398" r="62" fill="#0a0b0d" stroke="#2b2f37" strokeWidth="6" />
        <circle cx="852" cy="398" r="26" fill="#15171c" stroke="#3a3f49" strokeWidth="3" />
        <path d="M1060 340 l24 -4 6 16 -22 6 Z" fill="#e22b22" opacity="0.85" />
      </svg>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-wide2 text-chalk-dim">
        Static preview — interactive 3D unavailable on this device
      </div>
    </div>
  );
}
