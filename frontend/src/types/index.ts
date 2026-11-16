export interface Administrador {
  id: number;
  nome: string;
  email: string;
  fotoUrl?: string | null;
  criadoEm?: string; // ISO (o backend ainda não envia)
}

export interface ResumoAdministrador {
  id: number;
  nome: string;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  categoria?: string | null;
  imagemUrl?: string | null;
  criadoEm: string; // ISO
  atualizadoEm: string; // ISO
  criadoPor: ResumoAdministrador;
  atualizadoPor: ResumoAdministrador;
}

export type CampoOrdenacao = 'nome' | 'preco' | 'data';
export type Direcao = 'asc' | 'desc';

export interface ParametrosProdutos {
  busca?: string;
  ordenarPor?: CampoOrdenacao;
  direcao?: Direcao;
}

export interface DadosProduto {
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  categoria?: string;
  /** Novo arquivo escolhido. `undefined` = manter a imagem atual. */
  imagem?: File;
}

export interface DadosAdministrador {
  nome: string;
  email: string;
  /** Obrigatória ao criar; opcional ao editar. */
  senha?: string;
  foto?: File;
}

export type TipoAcao = 'CADASTRO' | 'EDICAO' | 'EXCLUSAO';
export type TipoRegistro = 'PRODUTO' | 'ADMINISTRADOR';

export interface RegistroHistorico {
  id: number;
  administradorId: number;
  administradorNome: string;
  acao: TipoAcao;
  tipoRegistro: TipoRegistro;
  registroId: number;
  registroNome: string;
  dataHora: string; // ISO
}

export interface FiltrosHistorico {
  administradorId?: number;
  acao?: TipoAcao;
  de?: string; // yyyy-mm-dd
  ate?: string; // yyyy-mm-dd
}

export interface ProdutoEstoqueBaixoDashboard {
  id: number;
  nome: string;
  quantidade: number;
  categoria?: { nome: string } | null;
}

export interface MaterialEstoqueBaixoDashboard {
  id: number;
  nome: string;
  quantidade: number;
  unidadeMedida: string;
}

export interface ResumoDashboard {
  totalProdutos: number;
  totalMateriais: number;
  faturamento: number;
  pedidosPorStatus: { status: string; quantidade: number }[];
  maisVendidos: {
    produtoId: number;
    nome: string;
    categoria?: string | null;
    unidadesVendidas: number;
  }[];
  alertasEstoque: {
    limiteProdutos: number;
    limiteMateriais: number;
    produtos: ProdutoEstoqueBaixoDashboard[];
    materiais: MaterialEstoqueBaixoDashboard[];
  };
}

export interface RespostaLogin {
  token: string;
  usuario: Administrador;
}
