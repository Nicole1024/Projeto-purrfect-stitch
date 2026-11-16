import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Cabecalho from './Header';
import MenuLateral from './Sidebar';
import Rodape from './Footer';

/** Estrutura das telas internas: cabeçalho, menu lateral, conteúdo e rodapé. */
export default function LayoutPrincipal() {
  const [menuAberto, setMenuAberto] = useState(false);
  const local = useLocation();

  useEffect(() => setMenuAberto(false), [local.pathname]);

  return (
    <div className="casca">
      <Cabecalho aoAlternarMenu={() => setMenuAberto((v) => !v)} />
      <div className="casca-corpo">
        <MenuLateral aberto={menuAberto} aoFechar={() => setMenuAberto(false)} />
        <main className="conteudo" id="conteudo">
          <div className="pagina-entrada">
            <Outlet />
          </div>
        </main>
      </div>
      <Rodape />
    </div>
  );
}
