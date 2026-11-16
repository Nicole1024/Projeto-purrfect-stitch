/** Decoração 2: novelo de lã em SVG. Rola e "pula" ao passar o mouse. */
export default function DecoracaoNovelo({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`decoracao decoracao-novelo ${className}`}
      viewBox="0 0 160 160"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="novelo-fundo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d8c4ff" />
          <stop offset="0.55" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <g className="novelo-corpo">
        <circle cx="80" cy="76" r="56" fill="url(#novelo-fundo)" stroke="#6d28d9" strokeWidth="3" />
        <g fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="3.5" strokeLinecap="round">
          <path d="M30 62 Q80 92 130 56" />
          <path d="M26 82 Q80 112 134 76" />
          <path d="M40 40 Q82 68 120 38" />
          <path d="M44 108 Q86 92 118 106" />
        </g>
      </g>
      <path
        className="novelo-fio"
        d="M118 118 C142 128 150 146 126 152 C104 157 96 148 108 142"
        fill="none"
        stroke="#6d28d9"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
