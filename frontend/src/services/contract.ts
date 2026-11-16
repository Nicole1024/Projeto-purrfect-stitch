import type {
  Administrador,
  DadosAdministrador,
  DadosProduto,
  FiltrosHistorico,
  ParametrosProdutos,
  Produto,
  RegistroHistorico,
  RespostaLogin,
  ResumoDashboard,
} from '../types';

/**
 * Contrato único que o front-end consome.
 * Existem duas implementações: `simulados` (mock) e `reais` (API da Nicole).
 * Para trocar, basta mudar VITE_USAR_MOCK no arquivo .env.
 */
export interface ServicoApi {
  entrar(email: string, senha: string): Promise<RespostaLogin>;
  sair(): Promise<void>;

  listarProdutos(parametros?: ParametrosProdutos): Promise<Produto[]>;
  buscarProduto(id: number): Promise<Produto>;
  criarProduto(dados: DadosProduto): Promise<Produto>;
  editarProduto(id: number, dados: DadosProduto): Promise<Produto>;
  excluirProduto(id: number): Promise<void>;

  listarAdministradores(): Promise<Administrador[]>;
  buscarAdministrador(id: number): Promise<Administrador>;
  criarAdministrador(dados: DadosAdministrador): Promise<Administrador>;
  editarAdministrador(id: number, dados: DadosAdministrador): Promise<Administrador>;
  excluirAdministrador(id: number): Promise<void>;

  obterDashboard(): Promise<ResumoDashboard>;
  listarHistorico(filtros?: FiltrosHistorico): Promise<RegistroHistorico[]>;
}
