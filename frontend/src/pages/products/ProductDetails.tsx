import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { extrairMensagemErro, servicos } from '../../services';
import { useCarregar } from '../../hooks/useFetch';
import { useNotificacao } from '../../contexts/NotificationContext';
import CabecalhoPagina from '../../components/ui/PageHeader';
import Carregando from '../../components/ui/Loading';
import MensagemErro from '../../components/ui/ErrorMessage';
import ModalConfirmacao from '../../components/ui/ConfirmationModal';
import { formatarDataHora, formatarMoeda } from '../../utils/formatters';
import { ESTOQUE_BAIXO_LIMITE } from '../../utils/constants';

export default function ProdutoDetalhes() {
  const { id } = useParams();
  const navegar = useNavigate();
  const notificacao = useNotificacao();
  const { dados: produto, carregando, erro } = useCarregar(() => servicos.buscarProduto(Number(id)), [id]);
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const excluir = async () => {
    setExcluindo(true);
    try {
      await servicos.excluirProduto(Number(id));
      notificacao.sucesso('Produto excluído com sucesso.');
      navegar('/produtos');
    } catch (e) {
      notificacao.erro(extrairMensagemErro(e));
      setExcluindo(false);
    }
  };

  if (carregando) return <Carregando />;
  if (erro || !produto) return <MensagemErro mensagem={erro ?? 'Produto não encontrado.'} />;

  const estoqueBaixo = produto.quantidade < ESTOQUE_BAIXO_LIMITE;

  return (
    <>
      <CabecalhoPagina
        titulo={produto.nome}
        subtitulo="Detalhes do produto"
        icone="bi-bag-heart"
        acoes={
          <>
            <Link to="/produtos" className="btn btn-outline-roxo"><i className="bi bi-arrow-left me-1" />Voltar</Link>
            <Link to={`/produtos/${produto.id}/editar`} className="btn btn-enviar"><i className="bi bi-pencil me-1" />Editar</Link>
            <button className="btn btn-outline-danger" onClick={() => setConfirmando(true)}><i className="bi bi-trash3 me-1" />Excluir</button>
          </>
        }
      />

      <div className="row g-4">
        <div className="col-12 col-md-5 col-xl-4">
          <div className="card cartao-vidro">
            <div className="card-body">
              {produto.imagemUrl ? <img src={produto.imagemUrl} alt={`Imagem de ${produto.nome}`} className="imagem-detalhe" /> : <div className="imagem-detalhe d-flex align-items-center justify-content-center"><i className="bi bi-image fs-1 text-roxo" /></div>}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-7 col-xl-8">
          <div className="card cartao-vidro mb-4">
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2 mb-3">
                {produto.categoria && <span className="badge rounded-pill badge-categoria">{produto.categoria}</span>}
                <span className={`badge rounded-pill ${estoqueBaixo ? 'text-bg-danger' : 'text-bg-success'}`}>
                  {estoqueBaixo ? 'Estoque baixo' : 'Em estoque'}
                </span>
              </div>
              <p className="mb-4">{produto.descricao}</p>
              <div className="row g-3">
                <div className="col-6"><div className="rotulo-detalhe">Preço</div><div className="fs-4 fw-bold text-roxo">{formatarMoeda(produto.preco)}</div></div>
                <div className="col-6"><div className="rotulo-detalhe">Quantidade</div><div className="fs-4 fw-bold">{produto.quantidade} un.</div></div>
              </div>
            </div>
          </div>

          <div className="card cartao-vidro">
            <div className="card-header bg-transparent"><h2 className="h6 fw-bold mb-0"><i className="bi bi-clock-history me-2 text-roxo" />Auditoria</h2></div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item bg-transparent d-flex flex-column flex-sm-row justify-content-between">
                <span><i className="bi bi-plus-circle me-2 text-success" />Cadastrado por <strong>{produto.criadoPor?.nome ?? '—'}</strong></span>
                <span className="text-body-secondary">{formatarDataHora(produto.criadoEm)}</span>
              </li>
              <li className="list-group-item bg-transparent d-flex flex-column flex-sm-row justify-content-between">
                <span><i className="bi bi-pencil me-2 text-primary" />Última alteração por <strong>{produto.atualizadoPor?.nome ?? '—'}</strong></span>
                <span className="text-body-secondary">{formatarDataHora(produto.atualizadoEm)}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ModalConfirmacao aberto={confirmando} nomeRegistro={produto.nome} carregando={excluindo} aoCancelar={() => setConfirmando(false)} aoConfirmar={excluir} />
    </>
  );
}
