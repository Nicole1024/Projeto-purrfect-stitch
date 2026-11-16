import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  subtitulo?: string;
  icone?: string;
  acoes?: ReactNode;
}

export default function CabecalhoPagina({ titulo, subtitulo, icone, acoes }: Props) {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div className="d-flex align-items-center gap-3">
        {icone && (
          <span className="icone-titulo">
            <i className={`bi ${icone}`} />
          </span>
        )}
        <div>
          <h1 className="h3 fw-bold mb-0">{titulo}</h1>
          {subtitulo && <p className="text-body-secondary mb-0">{subtitulo}</p>}
        </div>
      </div>
      {acoes && <div className="d-flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}
