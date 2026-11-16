import { NavLink } from 'react-router-dom';
import DecoracaoNovelo from '../crochet/YarnDecoration';

const itens = [
  { para: '/dashboard', rotulo: 'Dashboard', icone: 'bi-speedometer2' },
  { para: '/produtos', rotulo: 'Produtos', icone: 'bi-bag-heart' },
  { para: '/administradores', rotulo: 'Administradores', icone: 'bi-people' },
  { para: '/historico', rotulo: 'Histórico de Atividades', icone: 'bi-clock-history' },
];

interface Props {
  aberto: boolean;
  aoFechar: () => void;
}

export default function MenuLateral({ aberto, aoFechar }: Props) {
  return (
    <>
      {aberto && <div className="menu-sobreposicao d-lg-none" onClick={aoFechar} />}
      <aside className={`menu-lateral ${aberto ? 'aberto' : ''}`} aria-label="Menu principal">
        <nav className="nav flex-column gap-1">
          {itens.map((item) => (
            <NavLink
              key={item.para}
              to={item.para}
              onClick={aoFechar}
              className={({ isActive }) => `menu-link ${isActive ? 'ativo' : ''}`}
            >
              <i className={`bi ${item.icone}`} />
              <span>{item.rotulo}</span>
            </NavLink>
          ))}
        </nav>
        <div className="menu-rodape" aria-hidden="true">
          <DecoracaoNovelo className="decoracao-menu" />
        </div>
      </aside>
    </>
  );
}
