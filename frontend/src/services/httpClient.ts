import axios, { AxiosError } from 'axios';
import { CHAVE_TOKEN, CHAVE_USUARIO } from '../utils/constants';

export const clienteHttp = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  timeout: 15000,
});

// Envia o JWT em toda requisição autenticada.
clienteHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem(CHAVE_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sessão expirada: limpa os dados e volta para o login.
clienteHttp.interceptors.response.use(
  (resposta) => resposta,
  (erro: AxiosError) => {
    const naTelaDeLogin = window.location.pathname.startsWith('/login');
    if (erro.response?.status === 401 && !naTelaDeLogin) {
      localStorage.removeItem(CHAVE_TOKEN);
      localStorage.removeItem(CHAVE_USUARIO);
      window.location.href = '/login';
    }
    return Promise.reject(erro);
  },
);

/** Converte qualquer erro em uma mensagem amigável em português. */
export const extrairMensagemErro = (erro: unknown): string => {
  if (axios.isAxiosError(erro)) {
    if (!erro.response) return 'Não foi possível conectar ao servidor. Tente novamente.';
    const mensagem = erro.response.data?.message;
    if (Array.isArray(mensagem)) return mensagem.join(' ');
    if (typeof mensagem === 'string') return mensagem;
  }
  if (erro instanceof Error) return erro.message;
  return 'Ocorreu um erro inesperado.';
};
