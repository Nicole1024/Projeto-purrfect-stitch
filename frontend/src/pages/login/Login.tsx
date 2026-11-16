import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../../contexts/AuthContext';
import { useNotificacao } from '../../contexts/NotificationContext';
import { extrairMensagemErro, modoSimulado } from '../../services';
import LayoutPublico from '../../components/layout/PublicLayout';
import DecoracaoAgulhas from '../../components/crochet/NeedlesDecoration';
import DecoracaoNovelo from '../../components/crochet/YarnDecoration';
import CampoFormulario from '../../components/ui/FormField';
import { NOME_LOJA } from '../../utils/constants';

export default function Login() {
  const { entrar, autenticado } = useAutenticacao();
  const notificacao = useNotificacao();
  const local = useLocation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const destino = (local.state as { de?: string } | null)?.de ?? '/dashboard';
  if (autenticado) return <Navigate to={destino} replace />;

  const aoEnviar = async (e: FormEvent) => {
    e.preventDefault();
    const novos: typeof erros = {};
    if (!email.trim()) novos.email = 'Informe o seu e-mail.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) novos.email = 'Informe um e-mail válido.';
    if (!senha) novos.senha = 'Informe a sua senha.';
    setErros(novos);
    setErroGeral(null);
    if (Object.keys(novos).length) return;

    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      notificacao.sucesso('Login realizado com sucesso. Bem-vinda de volta!');
    } catch (erro) {
      setErroGeral(extrairMensagemErro(erro));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <LayoutPublico>
      <section className="login">
        <DecoracaoAgulhas className="login-agulhas" />
        <DecoracaoNovelo className="login-novelo" />

        <div className="login-marca">
          <img src="/img/logo.png" alt="Logo da Purrfect Stitch: gatinhos pretos abraçando um novelo" className="login-logo" />
          <h1 className="login-titulo">{NOME_LOJA}</h1>
          <p className="login-subtitulo">Painel administrativo da loja de crochê</p>
        </div>

        <div className="card cartao-vidro login-cartao">
          <div className="card-body p-4 p-md-5">
            <h2 className="h3 fw-bold text-center mb-1">Login</h2>
            <p className="text-center text-body-secondary mb-4">Entre para gerenciar a loja</p>

            {erroGeral && (
              <div className="alert alert-danger py-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2" />
                {erroGeral}
              </div>
            )}

            <form onSubmit={aoEnviar} noValidate>
              <CampoFormulario id="email" rotulo="E-mail" erro={erros.email}>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  className={`form-control form-control-lg ${erros.email ? 'is-invalid' : ''}`}
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </CampoFormulario>

              <CampoFormulario id="senha" rotulo="Senha" erro={erros.senha}>
                <div className="input-group input-group-lg">
                  <input
                    id="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`form-control ${erros.senha ? 'is-invalid' : ''}`}
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-roxo"
                    onClick={() => setMostrarSenha((v) => !v)}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <i className={`bi ${mostrarSenha ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </CampoFormulario>

              <button type="submit" className="btn btn-enviar btn-lg w-100 mt-2" disabled={enviando}>
                {enviando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar <i className="bi bi-arrow-right ms-1" />
                  </>
                )}
              </button>
            </form>

            {modoSimulado && (
              <p className="small text-center text-body-secondary mt-4 mb-0">
                <i className="bi bi-info-circle me-1" />
                Modo demonstração: <code>nicole@purrfect.com</code> / <code>123456</code>
              </p>
            )}
          </div>
        </div>
      </section>
    </LayoutPublico>
  );
}
