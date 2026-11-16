import { useState } from 'react';
import { servicos } from '../../services';
import { useCarregar } from '../../hooks/useFetch';
import type { TipoAcao } from '../../types';
import BadgeAcao from '../../components/ui/ActionBadge';
import CabecalhoPagina from '../../components/ui/PageHeader';
import Carregando from '../../components/ui/Loading';
import EstadoVazio from '../../components/ui/EmptyState';
import MensagemErro from '../../components/ui/ErrorMessage';
import { formatarData, formatarHora } from '../../utils/formatters';

/** Página somente de consulta: o histórico não pode ser alterado nem excluído. */
export default function Historico() {
  const [administradorId, setAdministradorId] = useState('');
  const [acao, setAcao] = useState<TipoAcao | ''>('');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');

  const administradores = useCarregar(() => servicos.listarAdministradores(), []);
  const periodoInvalido = !!de && !!ate && de > ate;

  const { dados, carregando, erro, recarregar } = useCarregar(
    () =>
      periodoInvalido
        ? Promise.resolve([])
        : servicos.listarHistorico({
            administradorId: administradorId ? Number(administradorId) : undefined,
            acao: acao || undefined,
            de: de || undefined,
            ate: ate || undefined,
          }),
    [administradorId, acao, de, ate],
  );

  const limpar = () => {
    setAdministradorId('');
    setAcao('');
    setDe('');
    setAte('');
  };

  return (
    <>
      <CabecalhoPagina titulo="Histórico de Atividades" subtitulo="Tudo o que foi cadastrado, editado ou excluído no sistema." icone="bi-clock-history" />

      <div className="card cartao-vidro mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-6 col-xl-3">
              <label htmlFor="f-admin" className="form-label fw-semibold mb-1">Administrador</label>
              <select id="f-admin" className="form-select" value={administradorId} onChange={(e) => setAdministradorId(e.target.value)}>
                <option value="">Todos</option>
                {administradores.dados?.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <label htmlFor="f-acao" className="form-label fw-semibold mb-1">Tipo da ação</label>
              <select id="f-acao" className="form-select" value={acao} onChange={(e) => setAcao(e.target.value as TipoAcao | '')}>
                <option value="">Todas</option>
                <option value="CADASTRO">Cadastro</option>
                <option value="EDICAO">Edição</option>
                <option value="EXCLUSAO">Exclusão</option>
              </select>
            </div>
            <div className="col-6 col-xl-2">
              <label htmlFor="f-de" className="form-label fw-semibold mb-1">De</label>
              <input id="f-de" type="date" className="form-control" value={de} max={ate || undefined} onChange={(e) => setDe(e.target.value)} />
            </div>
            <div className="col-6 col-xl-2">
              <label htmlFor="f-ate" className="form-label fw-semibold mb-1">Até</label>
              <input id="f-ate" type="date" className="form-control" value={ate} min={de || undefined} onChange={(e) => setAte(e.target.value)} />
            </div>
            <div className="col-12 col-xl-2">
              <button className="btn btn-outline-roxo w-100" onClick={limpar}><i className="bi bi-x-circle me-1" />Limpar</button>
            </div>
          </div>
          {periodoInvalido && <div className="text-danger small mt-2">A data inicial não pode ser maior que a data final.</div>}
        </div>
      </div>

      {erro && <MensagemErro mensagem={erro} aoTentarNovamente={recarregar} />}

      <div className="card cartao-vidro">
        {carregando && !dados ? (
          <Carregando texto="Carregando histórico..." />
        ) : (
          <div className="table-responsive" aria-busy={carregando}>
            <table className="table tabela-moderna align-middle mb-0">
              <thead>
                <tr>
                  <th>Administrador</th>
                  <th>Ação</th>
                  <th>Registro afetado</th>
                  <th>Data</th>
                  <th>Horário</th>
                </tr>
              </thead>
              <tbody>
                {dados?.map((h) => (
                  <tr key={h.id}>
                    <td className="fw-semibold">{h.administradorNome}</td>
                    <td><BadgeAcao acao={h.acao} /></td>
                    <td>
                      <span className="text-body-secondary small text-uppercase me-2">{h.tipoRegistro === 'PRODUTO' ? 'Produto' : 'Administrador'}</span>
                      {h.registroNome}
                    </td>
                    <td>{formatarData(h.dataHora)}</td>
                    <td>{formatarHora(h.dataHora)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dados?.length === 0 && <EstadoVazio icone="bi-journal-x" titulo="Nenhuma atividade encontrada" texto="Ajuste os filtros para ver outros registros." />}
          </div>
        )}
      </div>
    </>
  );
}
