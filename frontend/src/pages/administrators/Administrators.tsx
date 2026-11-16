import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extrairMensagemErro, servicos } from '../../services';
import { useCarregar } from '../../hooks/useFetch';
import { useNotificacao } from '../../contexts/NotificationContext';
import { useAutenticacao } from '../../contexts/AuthContext';
import type { Administrador } from '../../types';
import Avatar from '../../components/ui/Avatar';
import CabecalhoPagina from '../../components/ui/PageHeader';
import Carregando from '../../components/ui/Loading';
import EstadoVazio from '../../components/ui/EmptyState';
import MensagemErro from '../../components/ui/ErrorMessage';
import ModalConfirmacao from '../../components/ui/ConfirmationModal';
import { formatarData } from '../../utils/formatters';

export default function Administradores() {
  const navegar = useNavigate();
  const notificacao = useNotificacao();
  const { usuario } = useAutenticacao();
  const { dados, carregando, erro, recarregar } = useCarregar(() => servicos.listarAdministradores(), []);
  const [paraExcluir, setParaExcluir] = useState<Administrador | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const confirmarExclusao = async () => {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      await servicos.excluirAdministrador(paraExcluir.id);
      notificacao.sucesso('Administrador excluído com sucesso.');
      setParaExcluir(null);
      recarregar();
    } catch (e) {
      notificacao.erro(extrairMensagemErro(e));
      setParaExcluir(null);
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <>
      <CabecalhoPagina
        titulo="Administradores"
        subtitulo="Quem pode acessar e gerenciar a loja."
        icone="bi-people"
        acoes={<Link to="/administradores/novo" className="btn btn-enviar"><i className="bi bi-person-plus me-1" />Novo administrador</Link>}
      />

      {erro && <MensagemErro mensagem={erro} aoTentarNovamente={recarregar} />}

      <div className="card cartao-vidro">
        {carregando && !dados ? (
          <Carregando texto="Carregando administradores..." />
        ) : (
          <div className="table-responsive">
            <table className="table tabela-moderna align-middle mb-0">
              <thead>
                <tr>
                  <th>Administrador</th>
                  <th className="d-none d-md-table-cell">E-mail</th>
                  <th className="d-none d-lg-table-cell">Cadastro</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {dados?.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <Avatar nome={a.nome} fotoUrl={a.fotoUrl} />
                        <div>
                          <div className="fw-semibold">{a.nome} {a.id === usuario?.id && <span className="badge rounded-pill badge-categoria ms-1">você</span>}</div>
                          <div className="small text-body-secondary d-md-none">{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="d-none d-md-table-cell">{a.email}</td>
                    <td className="d-none d-lg-table-cell">{a.criadoEm ? formatarData(a.criadoEm) : '—'}</td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-acao" title="Editar" aria-label={`Editar ${a.nome}`} onClick={() => navegar(`/administradores/${a.id}/editar`)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-acao btn-acao-perigo" title="Excluir" aria-label={`Excluir ${a.nome}`} onClick={() => setParaExcluir(a)}>
                        <i className="bi bi-trash3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dados?.length === 0 && <EstadoVazio icone="bi-people" titulo="Nenhum administrador cadastrado" />}
          </div>
        )}
      </div>

      <ModalConfirmacao aberto={!!paraExcluir} nomeRegistro={paraExcluir?.nome} carregando={excluindo} aoCancelar={() => setParaExcluir(null)} aoConfirmar={confirmarExclusao} />
    </>
  );
}
