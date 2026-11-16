import axios from 'axios';

export const TOKEN_KEY = 'loja_token';

// URL base do backend NestJS (pode ser trocada com VITE_API_URL no .env do frontend)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// Antes de toda requisição: se houver token salvo, envia Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tratamento único de erros. O Nest devolve { statusCode, message }, e "message"
// pode ser um texto ou uma lista de textos (erros de validação dos DTOs).
async function request(config) {
  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    // Token vencido/inválido numa rota protegida: avisa o AuthContext para deslogar.
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      window.dispatchEvent(new Event('auth:expirou'));
    }
    const message = error.response?.data?.message;
    throw new Error(
      (Array.isArray(message) ? message.join(' · ') : message) ||
        'Erro ao comunicar com o servidor.',
    );
  }
}

// Gera listar/buscar/criar/atualizar/excluir para uma rota REST.
function crud(caminho) {
  return {
    listar: (params) => request({ url: caminho, params }),
    buscar: (id) => request({ url: `${caminho}/${id}` }),
    criar: (dados) => request({ url: caminho, method: 'POST', data: dados }),
    atualizar: (id, dados) =>
      request({ url: `${caminho}/${id}`, method: 'PATCH', data: dados }),
    excluir: (id) => request({ url: `${caminho}/${id}`, method: 'DELETE' }),
  };
}

// ---------- Autenticação ----------
export const registrar = ({ nome, email, senha }) =>
  request({ url: '/auth/register', method: 'POST', data: { nome, email, senha } });

export const login = ({ email, senha }) =>
  request({ url: '/auth/login', method: 'POST', data: { email, senha } });

// ---------- Entidades ----------
export const categorias = crud('/categorias');
export const materiais = crud('/materiais');
export const pedidos = crud('/pedidos');
export const produtos = {
  ...crud('/produtos'),
  // N:N Produto <-> Material (receita)
  adicionarMaterial: (id, dados) =>
    request({ url: `/produtos/${id}/materiais`, method: 'POST', data: dados }),
  removerMaterial: (id, materialId) =>
    request({ url: `/produtos/${id}/materiais/${materialId}`, method: 'DELETE' }),
};

// 1:1 Produto <-> Detalhe
export const detalhes = {
  criar: (produtoId, dados) =>
    request({ url: `/produtos/${produtoId}/detalhe`, method: 'POST', data: dados }),
  atualizar: (produtoId, dados) =>
    request({ url: `/produtos/${produtoId}/detalhe`, method: 'PATCH', data: dados }),
  excluir: (produtoId) =>
    request({ url: `/produtos/${produtoId}/detalhe`, method: 'DELETE' }),
};

// ---------- Relatórios ----------
export const relatorios = {
  dashboard: () => request({ url: '/relatorios/dashboard' }),
};
