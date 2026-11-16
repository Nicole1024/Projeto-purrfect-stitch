import type { ReactNode } from 'react';

interface Props {
  icone?: string;
  titulo: string;
  texto?: string;
  acao?: ReactNode;
}

export default function EstadoVazio({ icone = 'bi-emoji-frown', titulo, texto, acao }: Props) {
  return (
    <div className="text-center py-5 px-3">
      <i className={`bi ${icone} display-4 text-roxo opacity-75`} />
      <h3 className="h5 fw-bold mt-3">{titulo}</h3>
      {texto && <p className="text-body-secondary mb-3">{texto}</p>}
      {acao}
    </div>
  );
}
