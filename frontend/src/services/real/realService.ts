import { clienteHttp } from '../httpClient';
import type { ServicoApi } from '../contract';
import type { DadosAdministrador, DadosProduto } from '../../types';

interface CategoriaApi {
  id: number;
  nome: string;
}

const resolverCategoriaId = async (nomeCategoria?: string) => {
  const nome = nomeCategoria?.trim();
  if (!nome) throw new Error('Informe uma categoria para o produto.');

  const { data: categorias } = await clienteHttp.get<CategoriaApi[]>('/categorias');
  const categoriaExistente = categorias.find(
    (categoria) => categoria.nome.trim().toLocaleLowerCase('pt-BR') === nome.toLocaleLowerCase('pt-BR'),
  );
  if (categoriaExistente) return categoriaExistente.id;

  const { data: categoriaCriada } = await clienteHttp.post<CategoriaApi>('/categorias', {
    nome,
    descricao: nome,
  });
  return categoriaCriada.id;
};

// Multipart: o produto vai junto com a imagem (campo "imagem").
// Sem arquivo novo, a imagem não é enviada e o backend mantém a atual.
const formularioProduto = async (d: DadosProduto) => {
  const dados = new FormData();
  dados.append('nome', d.nome);
  dados.append('descricao', d.descricao);
  dados.append('preco', String(d.preco));
  dados.append('quantidade', String(d.quantidade));
  dados.append('categoriaId', String(await resolverCategoriaId(d.categoria)));
  if (d.imagem) dados.append('imagem', d.imagem);
  return dados;
};

// O backend devolve o caminho relativo (/uploads/...): monta a URL completa.
const urlImagem = (caminho?: string | null) =>
  caminho ? `${clienteHttp.defaults.baseURL ?? ''}${caminho}` : null;

const normalizarProduto = <T extends { categoria?: string | { nome: string } | null }>(produto: T) => ({
  ...produto,
  imagemUrl: urlImagem((produto as { imagemUrl?: string | null }).imagemUrl),
  categoria:
    typeof produto.categoria === 'object' && produto.categoria !== null
      ? produto.categoria.nome
      : produto.categoria,
});

// O backend recebe JSON (não multipart) e ainda não guarda foto de perfil.
// Senha em branco ao editar = não enviar, para manter a senha atual.
const corpoUsuario = (d: DadosAdministrador) => ({
  nome: d.nome,
  email: d.email,
  ...(d.senha ? { senha: d.senha } : {}),
});

/**
 * Implementação que conversa com a API NestJS.
 * Rotas combinadas estão documentadas em docs/CONTRATO_API.md
 */
export const servicoReal: ServicoApi = {
  entrar: async (email, senha) => {
    const resposta = (await clienteHttp.post('/auth/login', { email, senha })).data;
    return { token: resposta.access_token, usuario: resposta.usuario };
  },
  // O backend atual não possui rota de logout; a sessão é encerrada no navegador.
  sair: async () => {},

  listarProdutos: async (parametros) => {
    const { data } = await clienteHttp.get('/produtos', { params: parametros });
    return data.map(normalizarProduto);
  },
  buscarProduto: async (id) => {
    const { data } = await clienteHttp.get(`/produtos/${id}`);
    return normalizarProduto(data);
  },
  criarProduto: async (dados) =>
    normalizarProduto((await clienteHttp.post('/produtos', await formularioProduto(dados))).data),
  editarProduto: async (id, dados) =>
    normalizarProduto((await clienteHttp.patch(`/produtos/${id}`, await formularioProduto(dados))).data),
  excluirProduto: async (id) => {
    await clienteHttp.delete(`/produtos/${id}`);
  },

  // "Administrador" no front = Usuario no backend (rota /usuarios).
  listarAdministradores: async () => (await clienteHttp.get('/usuarios')).data,
  buscarAdministrador: async (id) => (await clienteHttp.get(`/usuarios/${id}`)).data,
  criarAdministrador: async (dados) => (await clienteHttp.post('/usuarios', corpoUsuario(dados))).data,
  editarAdministrador: async (id, dados) =>
    (await clienteHttp.patch(`/usuarios/${id}`, corpoUsuario(dados))).data,
  excluirAdministrador: async (id) => {
    await clienteHttp.delete(`/usuarios/${id}`);
  },

  obterDashboard: async () => (await clienteHttp.get('/relatorios/dashboard')).data,
  listarHistorico: async (filtros) => (await clienteHttp.get('/historico', { params: filtros })).data,
};
