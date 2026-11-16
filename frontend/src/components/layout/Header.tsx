import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../contexts/AuthContext';
import { useNotificacao } from '../../contexts/NotificationContext';
import { useTema } from '../../contexts/ThemeContext';
import Avatar from '../ui/Avatar';
import Marca from './Brand';

interface Props {
  /** Quando informado, mostra o botão de menu (celular). */
  aoAlternarMenu?: () => void;
}

export default function Cabecalho({ aoAlternarMenu }: Props) {
  const { tema, alternarTema } = useTema();
  const { usuario, sair } = useAutenticacao();
  const notificacao = useNotificacao();
  const navegar = useNavigate();
  const [menuUsuario, setMenuUsuario] = useState(false);
  const referencia = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const aoClicarFora = (e: MouseEvent) => {
      if (referencia.current && !referencia.current.contains(e.target as Node)) setMenuUsuario(false);
    };
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  const aoSair = async () => {
    setMenuUsuario(false);
    await sair();
    notificacao.sucesso('Você saiu da sua conta. Até logo!');
    navegar('/login');
  };

  return (
    <header className="cabecalho">
      <div className="cabecalho-conteudo">
        <div className="d-flex align-items-center gap-2">
          {aoAlternarMenu && (
            <button className="btn btn-cabecalho d-lg-none" onClick={aoAlternarMenu} aria-label="Abrir menu">
              <i className="bi bi-list fs-3" />
            </button>
          )}
          <Marca destino={usuario ? '/dashboard' : '/login'} />
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-cabecalho"
            onClick={alternarTema}
            aria-label={tema === 'claro' ? 'Ativar tema escuro' : 'Ativar tema claro'}
            title={tema === 'claro' ? 'Tema escuro' : 'Tema claro'}
          >
            <i className={`bi ${tema === 'claro' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`} />
          </button>

          {usuario && (
            <div className="position-relative" ref={referencia}>
              <button
                className="btn btn-cabecalho d-flex align-items-center gap-2"
                onClick={() => setMenuUsuario((v) => !v)}
                aria-expanded={menuUsuario}
                aria-haspopup="menu"
              >
                <Avatar nome={usuario.nome} fotoUrl={usuario.fotoUrl} tamanho={32} />
                <span className="d-none d-md-inline fw-semibold">{usuario.nome.split(' ')[0]}</span>
                <i className="bi bi-chevron-down small" />
              </button>
              {menuUsuario && (
                <ul className="dropdown-menu dropdown-menu-end show shadow menu-usuario" role="menu">
                  <li className="px-3 py-2">
                    <div className="fw-bold">{usuario.nome}</div>
                    <div className="small text-body-secondary">{usuario.email}</div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={() => { setMenuUsuario(false); navegar(`/administradores/${usuario.id}/editar`); }}>
                      <i className="bi bi-person-gear me-2" />Meu perfil
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={aoSair}>
                      <i className="bi bi-box-arrow-right me-2" />Sair
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
