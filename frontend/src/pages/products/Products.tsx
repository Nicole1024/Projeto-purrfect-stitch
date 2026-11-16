import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extrairMensagemErro, servicos } from '../../services';
import { useCarregar } from '../../hooks/useFetch';
import { useAtraso } from '../../hooks/useDebounce';
import { useNotificacao } from '../../contexts/NotificationContext';
import type { CampoOrdenacao, Direcao, Produto } from '../../types';
import CabecalhoPagina from '../../components/ui/PageHeader';
import Carregando from '../../components/ui/Loading';
import EstadoVazio from '../../components/ui/EmptyState';
import MensagemErro from '../../components/ui/ErrorMessage';
import ModalConfirmacao from '../../components/ui/ConfirmationModal';
import { formatarData, formatarMoeda } from '../../utils/formatters';
import { ESTOQUE_BAIXO_LIMITE } from '../../utils/constants';

export default function Produtos() {
  const navegar = useNavigate();
  const notificacao = useNotificacao();

  const [busca, setBusca] = useState('');
  const [ordenarPor, setOrdenarPor] = useState<CampoOrdenacao>('data');
  const [direcao, setDirecao] = useState<Direcao>('desc');
  const buscaAtrasada = useAtraso(busca.trim());

  const { dados, carregando, erro, recarregar } = useCarregar(
    () => servicos.listarProdutos({ busca: buscaAtrasada, ordenarPor, direcao }),
    [buscaAtrasada, ordenarPor, direcao],
  );

  const [paraExcluir, setParaExcluir] = useState<Produto | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const confirmarExclusao = async () => {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      await servicos.excluirProduto(paraExcluir.id);
      notificacao.sucesso('Produto excluído com sucesso.');
      setParaExcluir(null);
      recarregar();
    } catch (e) {
      notificacao.erro(extrairMensagemErro(e));
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <>
      <CabecalhoPagina
        titulo="Produtos"
        subtitulo="Gerencie o catálogo da loja."
        icone="bi-bag-heart"
        acoes={
          <Link to="/produtos/novo" className="btn btn-enviar">
            <i className="bi bi-plus-lg me-1" /> Novo produto
          </Link>
        }
      />

      <div className="card cartao-vidro mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-6">
              <label htmlFor="busca" className="form-label fw-semibold mb-1">Pesquisar por nome</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" /></span>
                <input id="busca" type="search" className="form-control" placeholder="Ex.: gatinho" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
            </div>
            <div className="col-7 col-md-4">
              <label htmlFor="ordenar" className="form-label fw-semibold mb-1">Ordenar por</label>
              <select id="ordenar" className="form-select" value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value as CampoOrdenacao)}>
                <option value="data">Data de cadastro</option>
                <option value="nome">Nome</option>
                <option value="preco">Preço</option>
              </select>
            </div>
            <div className="col-5 col-md-2">
              <button
                className="btn btn-outline-roxo w-100"
                onClick={() => setDirecao((d) => (d === 'asc' ? 'desc' : 'asc'))}
                aria-label={direcao === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'}
              >
                <i className={`bi ${direcao === 'asc' ? 'bi-sort-up' : 'bi-sort-down'} me-1`} />
                {direcao === 'asc' ? 'Cresc.' : 'Decresc.'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {erro && <MensagemErro mensagem={erro} aoTentarNovamente={recarregar} />}

      <div className="card cartao-vidro">
        {carregando && !dados ? (
          <Carregando texto="Carregando produtos..." />
        ) : (
          <div className="table-responsive" aria-busy={carregando}>
            <table className="table tabela-moderna align-middle mb-0">
              <thead>
                <tr>
                  <th>Imagem</th>
                  <th>Nome</th>
                  <th className="d-none d-md-table-cell">Categoria</th>
                  <th>Preço</th>
                  <th className="text-center">Estoque</th>
                  <th className="d-none d-lg-table-cell">Cadastro</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {dados?.map((p) => (
                  <tr key={p.id} className={p.quantidade < ESTOQUE_BAIXO_LIMITE ? 'linha-estoque-baixo' : ''}>
                    <td>{p.imagemUrl && <img src={p.imagemUrl} alt={`Imagem de ${p.nome}`} className="miniatura" />}</td>
                    <td className="fw-semibold">{p.nome}</td>
                    <td className="d-none d-md-table-cell">{p.categoria ? <span className="badge rounded-pill badge-categoria">{p.categoria}</span> : <span className="text-body-secondary">—</span>}</td>
                    <td>{formatarMoeda(p.preco)}</td>
                    <td className="text-center">
                      <span className={`badge rounded-pill ${p.quantidade < ESTOQUE_BAIXO_LIMITE ? 'text-bg-danger' : 'text-bg-success'}`}>{p.quantidade}</span>
                    </td>
                    <td className="d-none d-lg-table-cell">{formatarData(p.criadoEm)}</td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-acao" title="Detalhes" aria-label={`Ver detalhes de ${p.nome}`} onClick={() => navegar(`/produtos/${p.id}`)}>
                        <i className="bi bi-eye" />
                      </button>
                      <button className="btn btn-sm btn-acao" title="Editar" aria-label={`Editar ${p.nome}`} onClick={() => navegar(`/produtos/${p.id}/editar`)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-acao btn-acao-perigo" title="Excluir" aria-label={`Excluir ${p.nome}`} onClick={() => setParaExcluir(p)}>
                        <i className="bi bi-trash3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dados?.length === 0 && (
              <EstadoVazio
                icone="bi-search-heart"
                titulo="Nenhum produto encontrado"
                texto={buscaAtrasada ? 'Tente pesquisar por outro nome.' : 'Cadastre o primeiro produto da loja.'}
                acao={!buscaAtrasada && <Link to="/produtos/novo" className="btn btn-enviar">Novo produto</Link>}
              />
            )}
          </div>
        )}
      </div>

      <ModalConfirmacao
        aberto={!!paraExcluir}
        nomeRegistro={paraExcluir?.nome}
        carregando={excluindo}
        aoCancelar={() => setParaExcluir(null)}
        aoConfirmar={confirmarExclusao}
      />
    </>
  );
}
