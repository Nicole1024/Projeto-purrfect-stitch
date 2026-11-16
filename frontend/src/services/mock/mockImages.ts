/** Gera uma imagem SVG (data URI) de um novelo, usada nos produtos do mock. */
export const gerarImagemNovelo = (cor: string): string => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="f" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".55"/>
      <stop offset="1" stop-color="${cor}"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="18" fill="#f3ecff"/>
  <circle cx="60" cy="60" r="40" fill="url(#f)" stroke="${cor}" stroke-width="3"/>
  <g fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="2.5" stroke-linecap="round">
    <path d="M26 52 Q60 70 94 48"/>
    <path d="M24 66 Q60 88 96 62"/>
    <path d="M34 36 Q62 54 90 34"/>
    <path d="M40 90 Q70 76 88 88"/>
  </g>
  <path d="M92 86 Q108 96 98 108" fill="none" stroke="${cor}" stroke-width="3" stroke-linecap="round"/>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};
