import { useState } from 'react';
import { Link } from 'react-router-dom';
import { servicos } from '../../services';
import { useCarregar } from '../../hooks/useFetch';
import { useAtraso } from '../../hooks/useDebounce';
import { useAutenticacao } from '../../contexts/AuthContext';
import CabecalhoPagina from '../../components/ui/PageHeader';
import CartaoIndicador from '../../components/ui/StatCard';
import Carregando from '../../components/ui/Loading';
import MensagemErro from '../../components/ui/ErrorMessage';
import EstadoVazio from '../../components/ui/EmptyState';
import { formatarMoeda } from '../../utils/formatters';

const atalhos = [
  { para: '/produtos/novo', rotulo: 'Novo Produto', icone: 'bi-plus-circle-fill' },
  { para: '/produtos', rotulo: 'Lista de Produtos', icone: 'bi-bag-heart-fill' },
  { para: '/administradores/novo', rotulo: 'Novo Administrador', icone: 'bi-person-plus-fill' },
  { para: '/administradores', rotulo: 'Lista de Administradores', icone: 'bi-people-fill' },
];

const formatarQuantidade = (valor: number) => Number(valor ?? 0).toLocaleString('pt-BR');

export default function Dashboard() {
  const { usuario } = useAutenticacao();
  const { dados, carregando, erro, recarregar } = useCarregar(() => servicos.obterDashboard(), []);

  const [busca, setBusca] = useState('');
  const buscaAtrasada = useAtraso(busca.trim());
  const pesquisa = useCarregar(
    () => (buscaAtrasada ? servicos.listarProdutos({ busca: buscaAtrasada }) : Promise.resolve([])),
    [buscaAtrasada],
  );

  const totalPedidos = dados?.pedidosPorStatus.reduce((total, item) => total + Number(item.quantidade ?? 0), 0) ?? 0;
  const produtosEstoqueBaixo = dados?.alertasEstoque?.produtos ?? [];
  const materiaisEstoqueBaixo = dados?.alertasEstoque?.materiais ?? [];

  return (
    <>
      <CabecalhoPagina
        titulo={`Olá, ${usuario?.nome.split(' ')[0] ?? ''}! 🧶`}
        subtitulo="Veja como está a sua loja hoje."
        icone="bi-speedometer2"
      />

      <div className="card cartao-vidro mb-4 pesquisa-rapida">
        <div className="card-body">
          <label htmlFor="pesquisa-rapida" className="form-label fw-semibold">
            <i className="bi bi-lightning-charge-fill text-roxo me-1" />
            Pesquisa rápida
          </label>
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search" /></span>
            <input
              id="pesquisa-rapida"
              type="search"
              className="form-control"
              placeholder="Digite o nome de um produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              autoComplete="off"
            />
          </div>
          {buscaAtrasada && (
            <div className="list-group mt-2 resultados-pesquisa">
              {pesquisa.carregando && <div className="list-group-item text-body-secondary">Buscando...</div>}
              {!pesquisa.carregando && pesquisa.dados?.length === 0 && (
                <div className="list-group-item text-body-secondary">Nenhum produto encontrado.</div>
              )}
              {!pesquisa.carregando &&
                pesquisa.dados?.slice(0, 5).map((produto) => (
                  <Link key={produto.id} to={`/produtos/${produto.id}`} className="list-group-item list-group-item-action d-flex align-items-center gap-3">
                    {produto.imagemUrl && <img src={produto.imagemUrl} alt="" className="miniatura miniatura-sm" />}
                    <span className="flex-grow-1 fw-semibold">{produto.nome}</span>
                    <span className="text-body-secondary">{formatarMoeda(produto.preco)}</span>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>

      {carregando && <Carregando texto="Carregando o painel..." />}
      {erro && <MensagemErro mensagem={erro} aoTentarNovamente={recarregar} />}

      {dados && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <CartaoIndicador titulo="Produtos cadastrados" valor={formatarQuantidade(dados.totalProdutos)} icone="bi-bag-heart-fill" variante="roxo" />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <CartaoIndicador titulo="Materiais cadastrados" valor={formatarQuantidade(dados.totalMateriais)} icone="bi-box-seam-fill" variante="lilas" />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <CartaoIndicador titulo="Faturamento" valor={formatarMoeda(Number(dados.faturamento ?? 0))} icone="bi-cash-coin" variante="rosa" />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <CartaoIndicador titulo="Pedidos realizados" valor={formatarQuantidade(totalPedidos)} icone="bi-receipt" variante="azul" />
            </div>
          </div>

          <div className="row g-3 mb-4">
            {atalhos.map((atalho) => (
              <div key={atalho.para} className="col-6 col-lg-3">
                <Link to={atalho.para} className="atalho card cartao-vidro h-100 text-decoration-none">
                  <div className="card-body d-flex flex-column align-items-center text-center gap-2 py-3">
                    <i className={`bi ${atalho.icone} fs-2 text-roxo`} />
                    <span className="fw-semibold">{atalho.rotulo}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-12 col-xxl-8">
              <div className="card cartao-vidro h-100">
                <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                  <h2 className="h5 fw-bold mb-0">Produtos mais vendidos</h2>
                  <Link to="/produtos" className="small fw-semibold">Ver produtos</Link>
                </div>
                <div className="table-responsive">
                  <table className="table tabela-moderna align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th className="text-end">Unidades vendidas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.maisVendidos.map((produto) => (
                        <tr key={produto.produtoId}>
                          <td className="fw-semibold">{produto.nome}</td>
                          <td>{produto.categoria || '—'}</td>
                          <td className="text-end">{formatarQuantidade(produto.unidadesVendidas)}</td>
                        </tr>
                      ))}
                      {dados.maisVendidos.length === 0 && (
                        <tr><td colSpan={3}><EstadoVazio icone="bi-bag" titulo="Ainda não há vendas registradas" /></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-12 col-xxl-4">
              <div className="card cartao-vidro h-100 cartao-alerta">
                <div className="card-header bg-transparent">
                  <h2 className="h5 fw-bold mb-0 text-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    Estoque baixo
                  </h2>
                  <small className="text-body-secondary">
                    Produtos: até {dados.alertasEstoque.limiteProdutos} un. · Materiais: até {dados.alertasEstoque.limiteMateriais} un.
                  </small>
                </div>
                <ul className="list-group list-group-flush bg-transparent">
                  {produtosEstoqueBaixo.map((produto) => (
                    <li key={`produto-${produto.id}`} className="list-group-item bg-transparent d-flex align-items-center gap-3 item-estoque-baixo">
                      <i className="bi bi-bag-heart text-roxo" />
                      <Link to={`/produtos/${produto.id}/editar`} className="flex-grow-1 fw-semibold link-discreto">{produto.nome}</Link>
                      <span className="badge text-bg-danger rounded-pill">{produto.quantidade} un.</span>
                    </li>
                  ))}
                  {materiaisEstoqueBaixo.map((material) => (
                    <li key={`material-${material.id}`} className="list-group-item bg-transparent d-flex align-items-center gap-3 item-estoque-baixo">
                      <i className="bi bi-box-seam text-roxo" />
                      <span className="flex-grow-1 fw-semibold">{material.nome}</span>
                      <span className="badge text-bg-danger rounded-pill">{material.quantidade} {material.unidadeMedida}</span>
                    </li>
                  ))}
                  {produtosEstoqueBaixo.length === 0 && materiaisEstoqueBaixo.length === 0 && (
                    <li className="list-group-item bg-transparent text-body-secondary">Tudo certo! Nenhum item com estoque baixo. 🎉</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
