import type { TipoAcao } from '../../types';

const configuracao: Record<TipoAcao, { texto: string; classe: string; icone: string }> = {
  CADASTRO: { texto: 'Cadastro', classe: 'acao-cadastro', icone: 'bi-plus-circle-fill' },
  EDICAO: { texto: 'Edição', classe: 'acao-edicao', icone: 'bi-pencil-fill' },
  EXCLUSAO: { texto: 'Exclusão', classe: 'acao-exclusao', icone: 'bi-trash3-fill' },
};

export default function BadgeAcao({ acao }: { acao: TipoAcao }) {
  const c = configuracao[acao];
  return (
    <span className={`badge rounded-pill badge-acao ${c.classe}`}>
      <i className={`bi ${c.icone} me-1`} />
      {c.texto}
    </span>
  );
}
