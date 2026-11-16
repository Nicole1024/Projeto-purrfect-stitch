import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { extrairMensagemErro, servicos } from '../../services';
import { useNotificacao } from '../../contexts/NotificationContext';
import { useAutenticacao } from '../../contexts/AuthContext';
import CabecalhoPagina from '../../components/ui/PageHeader';
import CampoFormulario from '../../components/ui/FormField';
import Carregando from '../../components/ui/Loading';
import MensagemErro from '../../components/ui/ErrorMessage';
import SeletorImagem from '../../components/ui/ImagePicker';
import { validarAdministrador, type CamposAdministrador, type Erros } from '../../utils/validations';

/** Serve para cadastrar (/administradores/novo) e editar (/administradores/:id/editar). */
export default function AdministradorFormulario() {
  const { id } = useParams();
  const editando = !!id;
  const navegar = useNavigate();
  const notificacao = useNotificacao();
  const { usuario, atualizarUsuario } = useAutenticacao();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [foto, setFoto] = useState<File | undefined>();
  const [fotoAtual, setFotoAtual] = useState<string | null>(null);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const [erros, setErros] = useState<Erros<CamposAdministrador>>({});
  const [carregando, setCarregando] = useState(editando);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    servicos
      .buscarAdministrador(Number(id))
      .then((a) => {
        setNome(a.nome);
        setEmail(a.email);
        setFotoAtual(a.fotoUrl ?? null);
      })
      .catch((e) => setErroCarga(extrairMensagemErro(e)))
      .finally(() => setCarregando(false));
  }, [id]);

  const aoEnviar = async (e: FormEvent) => {
    e.preventDefault();
    const encontrados = validarAdministrador({ nome, email, senha }, editando, erroFoto);
    setErros(encontrados);
    if (Object.keys(encontrados).length) {
      notificacao.erro('Corrija os campos destacados e tente novamente.');
      return;
    }
    setSalvando(true);
    const dados = { nome: nome.trim(), email: email.trim(), senha: senha || undefined, foto };
    try {
      if (editando) {
        const atualizado = await servicos.editarAdministrador(Number(id), dados);
        if (atualizado.id === usuario?.id) atualizarUsuario(atualizado);
        notificacao.sucesso('Administrador atualizado com sucesso.');
      } else {
        await servicos.criarAdministrador(dados);
        notificacao.sucesso('Administrador cadastrado com sucesso.');
      }
      navegar('/administradores');
    } catch (erro) {
      notificacao.erro(extrairMensagemErro(erro));
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <Carregando />;
  if (erroCarga) return <MensagemErro mensagem={erroCarga} />;

  const classe = (campo: CamposAdministrador) => `form-control ${erros[campo] ? 'is-invalid' : ''}`;

  return (
    <>
      <CabecalhoPagina
        titulo={editando ? 'Editar administrador' : 'Novo administrador'}
        subtitulo={editando ? 'Atualize os dados de acesso.' : 'Cadastre uma nova pessoa para gerenciar a loja.'}
        icone={editando ? 'bi-person-gear' : 'bi-person-plus'}
      />

      <form onSubmit={aoEnviar} noValidate>
        <div className="card cartao-vidro">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-lg-7">
                <CampoFormulario id="nome" rotulo="Nome" obrigatorio erro={erros.nome}>
                  <input id="nome" className={classe('nome')} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} />
                </CampoFormulario>
                <CampoFormulario id="email" rotulo="E-mail" obrigatorio erro={erros.email}>
                  <input id="email" type="email" autoComplete="off" className={classe('email')} value={email} onChange={(e) => setEmail(e.target.value)} />
                </CampoFormulario>
                <CampoFormulario
                  id="senha"
                  rotulo={editando ? 'Nova senha' : 'Senha'}
                  obrigatorio={!editando}
                  erro={erros.senha}
                  dica={editando ? 'Deixe em branco para manter a senha atual.' : 'Mínimo de 6 caracteres.'}
                >
                  <input id="senha" type="password" autoComplete="new-password" className={classe('senha')} value={senha} onChange={(e) => setSenha(e.target.value)} />
                </CampoFormulario>
              </div>
              <div className="col-12 col-lg-5">
                <SeletorImagem
                  id="foto"
                  rotulo="Foto de perfil (opcional)"
                  redonda
                  urlAtual={fotoAtual}
                  arquivo={foto}
                  erro={erros.foto ?? erroFoto ?? undefined}
                  aoMudar={(arquivo, problema) => {
                    setFoto(arquivo);
                    setErroFoto(problema);
                    setErros((atuais) => ({ ...atuais, foto: problema ?? undefined }));
                  }}
                />
              </div>
            </div>
          </div>
          <div className="card-footer bg-transparent d-flex justify-content-end gap-2 p-3">
            <Link to="/administradores" className="btn btn-outline-roxo px-4">Cancelar</Link>
            <button type="submit" className="btn btn-enviar px-4" disabled={salvando}>
              {salvando ? (<><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Salvando...</>) : (<><i className="bi bi-check2-circle me-1" />{editando ? 'Salvar alterações' : 'Cadastrar administrador'}</>)}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
