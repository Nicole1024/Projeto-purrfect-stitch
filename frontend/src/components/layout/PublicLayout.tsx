import type { ReactNode } from 'react';
import Cabecalho from './Header';
import Rodape from './Footer';

/** Estrutura das telas sem login (cabeçalho e rodapé, sem menu lateral). */
export default function LayoutPublico({ children }: { children: ReactNode }) {
  return (
    <div className="casca">
      <Cabecalho />
      <main className="conteudo-publico">{children}</main>
      <Rodape />
    </div>
  );
}
