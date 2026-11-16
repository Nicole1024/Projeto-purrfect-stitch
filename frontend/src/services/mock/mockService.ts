import type { ServicoApi } from '../contract';
import type {
  Administrador,
  DadosAdministrador,
  DadosProduto,
  Produto,
  RegistroHistorico,
  ResumoAdministrador,
  TipoAcao,
  TipoRegistro,
} from '../../types';
import { CHAVE_TOKEN, ESTOQUE_BAIXO_LIMITE } from '../../utils/constants';
import { gerarImagemNovelo } from './mockImages';

/* ------------------------------------------------------------------ */
/*  "Banco" em memória. Recarregar a página volta aos dados iniciais.  */
/* ------------------------------------------------------------------ */

const diasAtras = (dias: number, hora = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(hora, 15, 0, 0);
  return d.toISOString();
};

let administradores: Administrador[] = [
  { id: 1, nome: 'Nicole Silva', email: 'nicole@purrfect.com', criadoEm: diasAtras(40) },
  { id: 2, nome: 'Duda Correa', email: 'duda@purrfect.com', criadoEm: diasAtras(38) },
  { id: 3, nome: 'Mia Gatinha', email: 'mia@purrfect.com', criadoEm: diasAtras(12) },
];
const senhas: Record<number, string> = { 1: '123456', 2: '123456', 3: '123456' };

const resumo = (id: number): ResumoAdministrador => {
  const a = administradores.find((x) => x.id === id) ?? administradores[0];
  return { id: a.id, nome: a.nome };
};

const criarProdutoInicial = (
  id: number,
  nome: string,
  categoria: string,
  preco: number,
  quantidade: number,
  cor: string,
  dias: number,
  descricao: string,
): Produto => ({
  id,
  nome,
  descricao,
  categoria,
  preco,
  quantidade,
  imagemUrl: gerarImagemNovelo(cor),
  criadoEm: diasAtras(dias),
  atualizadoEm: diasAtras(Math.max(dias - 2, 0)),
  criadoPor: resumo(id % 2 === 0 ? 1 : 2),
  atualizadoPor: resumo(id % 3 === 0 ? 3 : 2),
});

let produtos: Produto[] = [
  criarProdutoInicial(1, 'Amigurumi Gatinho Preto', 'Amigurumi', 89.9, 12, '#7c3aed', 30, 'Gatinho de crochê feito à mão com fio de algodão e olhinhos de segurança.'),
  criarProdutoInicial(2, 'Bolsa Tiracolo Lilás', 'Bolsas', 129.0, 4, '#c4a7f5', 26, 'Bolsa pequena de crochê com forro de tecido e alça ajustável.'),
  criarProdutoInicial(3, 'Touca Orelhinhas de Gato', 'Acessórios', 59.5, 20, '#60a5fa', 21, 'Touca quentinha com orelhinhas, ideal para o inverno.'),
  criarProdutoInicial(4, 'Porta-copos Floral (kit 4)', 'Casa', 39.9, 3, '#f9a8d4', 17, 'Kit com quatro porta-copos em formato de flor.'),
  criarProdutoInicial(5, 'Amigurumi Polvinho', 'Amigurumi', 45.0, 30, '#a78bfa', 14, 'Polvinho de crochê macio, perfeito para presentear bebês.'),
  criarProdutoInicial(6, 'Cachecol Arco-íris', 'Acessórios', 98.0, 8, '#38bdf8', 9, 'Cachecol longo com degradê pastel em lã antialérgica.'),
  criarProdutoInicial(7, 'Tapete Redondo Lilás', 'Casa', 189.9, 2, '#8b5cf6', 5, 'Tapete redondo de fio de malha, 60 cm de diâmetro.'),
  criarProdutoInicial(8, 'Chaveiro Novelo', 'Chaveiros', 19.9, 50, '#f472b6', 2, 'Chaveiro mini novelo, vários tons disponíveis.'),
];

let historico: RegistroHistorico[] = [
  { id: 1, administradorId: 2, administradorNome: 'Duda Correa', acao: 'CADASTRO', tipoRegistro: 'PRODUTO', registroId: 8, registroNome: 'Chaveiro Novelo', dataHora: diasAtras(2, 14) },
  { id: 2, administradorId: 1, administradorNome: 'Nicole Silva', acao: 'EDICAO', tipoRegistro: 'PRODUTO', registroId: 7, registroNome: 'Tapete Redondo Lilás', dataHora: diasAtras(3, 9) },
  { id: 3, administradorId: 1, administradorNome: 'Nicole Silva', acao: 'CADASTRO', tipoRegistro: 'ADMINISTRADOR', registroId: 3, registroNome: 'Mia Gatinha', dataHora: diasAtras(12, 16) },
  { id: 4, administradorId: 2, administradorNome: 'Duda Correa', acao: 'EXCLUSAO', tipoRegistro: 'PRODUTO', registroId: 99, registroNome: 'Gorro Teste', dataHora: diasAtras(15, 11) },
];

let proximoIdProduto = 9;
let proximoIdAdministrador = 4;
let proximoIdHistorico = 5;

/* ------------- Persistência no navegador (para a demonstração) ------------- */
const CHAVE_MOCK = 'purrfect:mock:v1';

const carregarEstado = () => {
  try {
    const bruto = localStorage.getItem(CHAVE_MOCK);
    if (!bruto) return;
    const e = JSON.parse(bruto);
    administradores = e.administradores;
    produtos = e.produtos;
    historico = e.historico;
    Object.assign(senhas, e.senhas);
    proximoIdProduto = e.proximoIdProduto;
    proximoIdAdministrador = e.proximoIdAdministrador;
    proximoIdHistorico = e.proximoIdHistorico;
  } catch {
    /* estado corrompido: segue com os dados iniciais */
  }
};

const salvarEstado = () => {
  try {
    localStorage.setItem(
      CHAVE_MOCK,
      JSON.stringify({ administradores, produtos, historico, senhas, proximoIdProduto, proximoIdAdministrador, proximoIdHistorico }),
    );
  } catch {
    /* sem espaço/permissão: continua só em memória */
  }
};

carregarEstado();

/* ------------------------------ Utilidades ------------------------------ */

const esperar = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

/** No mock, o token tem o formato `mock-token-<id>`. */
const idUsuarioAtual = () => {
  const token = localStorage.getItem(CHAVE_TOKEN) ?? '';
  const id = Number(token.replace('mock-token-', ''));
  return administradores.some((a) => a.id === id) ? id : administradores[0].id;
};

const registrar = (acao: TipoAcao, tipoRegistro: TipoRegistro, registroId: number, registroNome: string) => {
  const responsavel = resumo(idUsuarioAtual());
  historico.unshift({
    id: proximoIdHistorico++,
    administradorId: responsavel.id,
    administradorNome: responsavel.nome,
    acao,
    tipoRegistro,
    registroId,
    registroNome,
    dataHora: new Date().toISOString(),
  });
  salvarEstado();
};

/** Reduz a imagem enviada (máx. 480 px) e a guarda como data URL, para persistir no mock. */
const urlDoArquivo = async (arquivo?: File): Promise<string | undefined> => {
  if (!arquivo) return undefined;
  const origem = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = origem;
    });
    const escala = Math.min(1, 480 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/webp', 0.82);
  } catch {
    return origem;
  }
};

const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* ------------------------------ Implementação ------------------------------ */

export const servicoSimulado: ServicoApi = {
  async entrar(email, senha) {
    await esperar();
    const admin = administradores.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!admin || senhas[admin.id] !== senha) throw new Error('E-mail ou senha incorretos.');
    return { token: `mock-token-${admin.id}`, usuario: admin };
  },
  async sair() {
    await esperar(150);
  },

  async listarProdutos({ busca, ordenarPor = 'data', direcao = 'desc' } = {}) {
    await esperar(300);
    const termo = semAcento(busca?.trim() ?? '');
    const lista = produtos.filter((p) => semAcento(p.nome).includes(termo));
    const fator = direcao === 'asc' ? 1 : -1;
    lista.sort((a, b) => {
      if (ordenarPor === 'nome') return a.nome.localeCompare(b.nome, 'pt-BR') * fator;
      if (ordenarPor === 'preco') return (a.preco - b.preco) * fator;
      return (new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()) * fator;
    });
    return lista;
  },
  async buscarProduto(id) {
    await esperar(250);
    const produto = produtos.find((p) => p.id === id);
    if (!produto) throw new Error('Produto não encontrado.');
    return produto;
  },
  async criarProduto(dados: DadosProduto) {
    await esperar();
    const agora = new Date().toISOString();
    const responsavel = resumo(idUsuarioAtual());
    const novo: Produto = {
      id: proximoIdProduto++,
      nome: dados.nome.trim(),
      descricao: dados.descricao.trim(),
      preco: dados.preco,
      quantidade: dados.quantidade,
      categoria: dados.categoria?.trim() || null,
      imagemUrl: (await urlDoArquivo(dados.imagem)) ?? gerarImagemNovelo('#c4a7f5'),
      criadoEm: agora,
      atualizadoEm: agora,
      criadoPor: responsavel,
      atualizadoPor: responsavel,
    };
    produtos = [novo, ...produtos];
    registrar('CADASTRO', 'PRODUTO', novo.id, novo.nome);
    return novo;
  },
  async editarProduto(id, dados) {
    await esperar();
    const atual = produtos.find((p) => p.id === id);
    if (!atual) throw new Error('Produto não encontrado.');
    const atualizado: Produto = {
      ...atual,
      nome: dados.nome.trim(),
      descricao: dados.descricao.trim(),
      preco: dados.preco,
      quantidade: dados.quantidade,
      categoria: dados.categoria?.trim() || null,
      imagemUrl: (await urlDoArquivo(dados.imagem)) ?? atual.imagemUrl,
      atualizadoEm: new Date().toISOString(),
      atualizadoPor: resumo(idUsuarioAtual()),
    };
    produtos = produtos.map((p) => (p.id === id ? atualizado : p));
    registrar('EDICAO', 'PRODUTO', id, atualizado.nome);
    return atualizado;
  },
  async excluirProduto(id) {
    await esperar();
    const produto = produtos.find((p) => p.id === id);
    if (!produto) throw new Error('Produto não encontrado.');
    produtos = produtos.filter((p) => p.id !== id);
    registrar('EXCLUSAO', 'PRODUTO', id, produto.nome);
  },

  async listarAdministradores() {
    await esperar(300);
    return [...administradores];
  },
  async buscarAdministrador(id) {
    await esperar(250);
    const admin = administradores.find((a) => a.id === id);
    if (!admin) throw new Error('Administrador não encontrado.');
    return admin;
  },
  async criarAdministrador(dados: DadosAdministrador) {
    await esperar();
    const email = dados.email.trim().toLowerCase();
    if (administradores.some((a) => a.email.toLowerCase() === email)) {
      throw new Error('Já existe um administrador com este e-mail.');
    }
    const novo: Administrador = {
      id: proximoIdAdministrador++,
      nome: dados.nome.trim(),
      email,
      fotoUrl: (await urlDoArquivo(dados.foto)) ?? null,
      criadoEm: new Date().toISOString(),
    };
    administradores = [...administradores, novo];
    senhas[novo.id] = dados.senha ?? '';
    registrar('CADASTRO', 'ADMINISTRADOR', novo.id, novo.nome);
    return novo;
  },
  async editarAdministrador(id, dados) {
    await esperar();
    const atual = administradores.find((a) => a.id === id);
    if (!atual) throw new Error('Administrador não encontrado.');
    const email = dados.email.trim().toLowerCase();
    if (administradores.some((a) => a.id !== id && a.email.toLowerCase() === email)) {
      throw new Error('Já existe um administrador com este e-mail.');
    }
    const atualizado: Administrador = {
      ...atual,
      nome: dados.nome.trim(),
      email,
      fotoUrl: (await urlDoArquivo(dados.foto)) ?? atual.fotoUrl,
    };
    administradores = administradores.map((a) => (a.id === id ? atualizado : a));
    if (dados.senha) senhas[id] = dados.senha;
    registrar('EDICAO', 'ADMINISTRADOR', id, atualizado.nome);
    return atualizado;
  },
  async excluirAdministrador(id) {
    await esperar();
    const admin = administradores.find((a) => a.id === id);
    if (!admin) throw new Error('Administrador não encontrado.');
    if (id === idUsuarioAtual()) throw new Error('Você não pode excluir o seu próprio usuário.');
    administradores = administradores.filter((a) => a.id !== id);
    registrar('EXCLUSAO', 'ADMINISTRADOR', id, admin.nome);
  },

  async obterDashboard() {
    await esperar(400);
    return {
      totalProdutos: produtos.length,
      totalMateriais: 0,
      faturamento: 0,
      pedidosPorStatus: [],
      maisVendidos: [],
      alertasEstoque: {
        limiteProdutos: ESTOQUE_BAIXO_LIMITE,
        limiteMateriais: 5,
        produtos: produtos
          .filter((p) => p.quantidade <= ESTOQUE_BAIXO_LIMITE)
          .sort((a, b) => a.quantidade - b.quantidade)
          .map((p) => ({
            id: p.id,
            nome: p.nome,
            quantidade: p.quantidade,
            categoria: p.categoria ? { nome: p.categoria } : null,
          })),
        materiais: [],
      },
    };
  },

  async listarHistorico({ administradorId, acao, de, ate } = {}) {
    await esperar(300);
    return historico.filter((h) => {
      if (administradorId && h.administradorId !== administradorId) return false;
      if (acao && h.acao !== acao) return false;
      const dia = h.dataHora.slice(0, 10);
      const diaLocal = new Date(h.dataHora).toLocaleDateString('sv-SE'); // yyyy-mm-dd no fuso local
      const referencia = diaLocal || dia;
      if (de && referencia < de) return false;
      if (ate && referencia > ate) return false;
      return true;
    });
  },
};
