import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Administrador } from '../types';
import { servicos } from '../services';
import { CHAVE_TOKEN, CHAVE_USUARIO } from '../utils/constants';

interface AutenticacaoValor {
  usuario: Administrador | null;
  autenticado: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  /** Atualiza os dados do usuário logado (ex.: depois de editar o próprio perfil). */
  atualizarUsuario: (dados: Administrador) => void;
}

const AutenticacaoContexto = createContext<AutenticacaoValor | null>(null);

const lerUsuarioSalvo = (): Administrador | null => {
  try {
    const bruto = localStorage.getItem(CHAVE_USUARIO);
    return bruto && localStorage.getItem(CHAVE_TOKEN) ? (JSON.parse(bruto) as Administrador) : null;
  } catch {
    return null;
  }
};

export function AutenticacaoProvedor({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Administrador | null>(lerUsuarioSalvo);

  const entrar = useCallback(async (email: string, senha: string) => {
    const resposta = await servicos.entrar(email, senha);
    localStorage.setItem(CHAVE_TOKEN, resposta.token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(resposta.usuario));
    setUsuario(resposta.usuario);
  }, []);

  const sair = useCallback(async () => {
    try {
      await servicos.sair();
    } catch {
      /* mesmo se a API falhar, encerramos a sessão local */
    }
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
    setUsuario(null);
  }, []);

  const atualizarUsuario = useCallback((dados: Administrador) => {
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(dados));
    setUsuario(dados);
  }, []);

  const valor = useMemo(
    () => ({ usuario, autenticado: !!usuario, entrar, sair, atualizarUsuario }),
    [usuario, entrar, sair, atualizarUsuario],
  );

  return <AutenticacaoContexto.Provider value={valor}>{children}</AutenticacaoContexto.Provider>;
}

export const useAutenticacao = () => {
  const contexto = useContext(AutenticacaoContexto);
  if (!contexto) throw new Error('useAutenticacao deve ser usado dentro de AutenticacaoProvedor');
  return contexto;
};
