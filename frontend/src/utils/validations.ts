import {
  TAMANHO_MAXIMO_IMAGEM_BYTES,
  TAMANHO_MAXIMO_IMAGEM_MB,
  TIPOS_IMAGEM_ACEITOS,
} from './constants';

export type Erros<T extends string> = Partial<Record<T, string>>;

export const validarImagem = (arquivo: File): string | null => {
  if (!TIPOS_IMAGEM_ACEITOS.includes(arquivo.type)) {
    return 'Formato inválido. Envie uma imagem JPG, PNG ou WEBP.';
  }
  if (arquivo.size > TAMANHO_MAXIMO_IMAGEM_BYTES) {
    return `A imagem é muito grande. O limite é de ${TAMANHO_MAXIMO_IMAGEM_MB} MB.`;
  }
  return null;
};

const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export type CamposProduto = 'nome' | 'descricao' | 'preco' | 'quantidade' | 'categoria' | 'imagem';

export const validarProduto = (
  v: { nome: string; descricao: string; preco: string; quantidade: string; categoria: string },
  erroImagem?: string | null,
): Erros<CamposProduto> => {
  const erros: Erros<CamposProduto> = {};
  if (!v.nome.trim()) erros.nome = 'O nome do produto é obrigatório.';
  if (!v.descricao.trim()) erros.descricao = 'A descrição é obrigatória.';

  const preco = Number(v.preco.replace(',', '.'));
  if (v.preco.trim() === '') erros.preco = 'Informe o preço do produto.';
  else if (Number.isNaN(preco)) erros.preco = 'O preço informado é inválido.';
  else if (preco < 0.01) erros.preco = 'O preço deve ser maior que zero.';

  const quantidade = Number(v.quantidade);
  if (v.quantidade.trim() === '') erros.quantidade = 'Informe a quantidade em estoque.';
  else if (!Number.isInteger(quantidade)) erros.quantidade = 'A quantidade deve ser um número inteiro.';
  else if (quantidade < 0) erros.quantidade = 'A quantidade não pode ser negativa.';

  if (!v.categoria.trim()) erros.categoria = 'Informe a categoria do produto.';

  if (erroImagem) erros.imagem = erroImagem;
  return erros;
};

export type CamposAdministrador = 'nome' | 'email' | 'senha' | 'foto';

export const validarAdministrador = (
  v: { nome: string; email: string; senha: string },
  editando: boolean,
  erroFoto?: string | null,
): Erros<CamposAdministrador> => {
  const erros: Erros<CamposAdministrador> = {};
  if (!v.nome.trim()) erros.nome = 'O nome é obrigatório.';
  if (!v.email.trim()) erros.email = 'O e-mail é obrigatório.';
  else if (!emailValido(v.email.trim())) erros.email = 'Informe um e-mail válido.';

  if (!editando && !v.senha) erros.senha = 'A senha é obrigatória.';
  else if (v.senha && v.senha.length < 6) erros.senha = 'A senha deve ter pelo menos 6 caracteres.';

  if (erroFoto) erros.foto = erroFoto;
  return erros;
};
