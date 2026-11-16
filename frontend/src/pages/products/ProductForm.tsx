import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { extrairMensagemErro, modoSimulado, servicos } from '../../services';
import { useNotificacao } from '../../contexts/NotificationContext';
import CabecalhoPagina from '../../components/ui/PageHeader';
import CampoFormulario from '../../components/ui/FormField';
import Carregando from '../../components/ui/Loading';
import MensagemErro from '../../components/ui/ErrorMessage';
import SeletorImagem from '../../components/ui/ImagePicker';
import { validarProduto, type CamposProduto, type Erros } from '../../utils/validations';

/** Serve para cadastrar (/produtos/novo) e editar (/produtos/:id/editar). */
export default function ProdutoFormulario() {
  const { id } = useParams();
  const editando = !!id;
  const navegar = useNavigate();
  const notificacao = useNotificacao();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagem, setImagem] = useState<File | undefined>();
  const [imagemAtual, setImagemAtual] = useState<string | null>(null);
  const [erroImagem, setErroImagem] = useState<string | null>(null);

  const [erros, setErros] = useState<Erros<CamposProduto>>({});
  const [carregando, setCarregando] = useState(editando);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    servicos
      .buscarProduto(Number(id))
      .then((p) => {
        setNome(p.nome);
        setDescricao(p.descricao ?? '');
        setPreco(String(p.preco));
        setQuantidade(String(p.quantidade));
        setCategoria(p.categoria ?? '');
        setImagemAtual(p.imagemUrl ?? null);
      })
      .catch((e) => setErroCarga(extrairMensagemErro(e)))
      .finally(() => setCarregando(false));
  }, [id]);

  const aoEnviar = async (e: FormEvent) => {
    e.preventDefault();
    const encontrados = validarProduto({ nome, descricao, preco, quantidade, categoria }, erroImagem);
    setErros(encontrados);
    if (Object.keys(encontrados).length) {
      notificacao.erro('Corrija os campos destacados e tente novamente.');
      return;
    }

    setSalvando(true);
    const dados = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco: Number(preco.replace(',', '.')),
      quantidade: Number(quantidade),
      categoria: categoria.trim() || undefined,
      imagem,
    };
    try {
      if (editando) {
        await servicos.editarProduto(Number(id), dados);
        notificacao.sucesso('Produto atualizado com sucesso.');
      } else {
        await servicos.criarProduto(dados);
        notificacao.sucesso('Produto cadastrado com sucesso.');
      }
      navegar('/produtos');
    } catch (erro) {
      notificacao.erro(extrairMensagemErro(erro));
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <Carregando />;
  if (erroCarga) return <MensagemErro mensagem={erroCarga} />;

  const classe = (campo: CamposProduto) => `form-control ${erros[campo] ? 'is-invalid' : ''}`;

  return (
    <>
      <CabecalhoPagina
        titulo={editando ? 'Editar produto' : 'Novo produto'}
        subtitulo={editando ? 'Atualize as informações do produto.' : 'Preencha os dados para cadastrar um produto.'}
        icone={editando ? 'bi-pencil-square' : 'bi-plus-circle'}
      />

      <form onSubmit={aoEnviar} noValidate>
        <div className="card cartao-vidro">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-lg-7">
                <CampoFormulario id="nome" rotulo="Nome" obrigatorio erro={erros.nome}>
                  <input id="nome" className={classe('nome')} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Amigurumi Gatinho" maxLength={120} />
                </CampoFormulario>

                <CampoFormulario id="descricao" rotulo="Descrição" obrigatorio erro={erros.descricao}>
                  <textarea id="descricao" rows={4} className={classe('descricao')} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Conte detalhes sobre o produto..." />
                </CampoFormulario>

                <div className="row">
                  <CampoFormulario id="preco" rotulo="Preço (R$)" obrigatorio erro={erros.preco} className="col-12 col-sm-4">
                    <input id="preco" type="number" min="0.01" step="0.01" inputMode="decimal" className={classe('preco')} value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0,00" />
                  </CampoFormulario>
                  <CampoFormulario id="quantidade" rotulo="Qtd. em estoque" obrigatorio erro={erros.quantidade} className="col-12 col-sm-4">
                    <input id="quantidade" type="number" step="1" inputMode="numeric" className={classe('quantidade')} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="0" />
                  </CampoFormulario>
                  <CampoFormulario id="categoria" rotulo="Categoria" obrigatorio erro={erros.categoria} className="col-12 col-sm-4">
                    <input id="categoria" className={classe('categoria')} value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ex.: Amigurumi" maxLength={60} />
                  </CampoFormulario>
                </div>
              </div>

              <div className="col-12 col-lg-5">
                {modoSimulado ? (
                  <>
                    <SeletorImagem
                      id="imagem"
                      rotulo="Imagem do produto"
                      urlAtual={imagemAtual}
                      arquivo={imagem}
                      erro={erros.imagem ?? erroImagem ?? undefined}
                      aoMudar={(arquivo, problema) => {
                        setImagem(arquivo);
                        setErroImagem(problema);
                        setErros((atuais) => ({ ...atuais, imagem: problema ?? undefined }));
                      }}
                    />
                    {editando && <p className="small text-body-secondary">Ao escolher uma nova imagem, a anterior será substituída.</p>}
                  </>
                ) : (
                  <p className="small text-body-secondary">O backend atual ainda não oferece suporte a imagens de produtos.</p>
                )}
              </div>
            </div>
          </div>
          <div className="card-footer bg-transparent d-flex justify-content-end gap-2 p-3">
            <Link to="/produtos" className="btn btn-outline-roxo px-4">Cancelar</Link>
            <button type="submit" className="btn btn-enviar px-4" disabled={salvando}>
              {salvando ? (<><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Salvando...</>) : (<><i className="bi bi-check2-circle me-1" />{editando ? 'Salvar alterações' : 'Cadastrar produto'}</>)}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
