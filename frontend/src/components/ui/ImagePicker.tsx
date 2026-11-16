import { useEffect, useMemo, useRef } from 'react';
import { TAMANHO_MAXIMO_IMAGEM_MB } from '../../utils/constants';
import { validarImagem } from '../../utils/validations';

interface Props {
  id: string;
  rotulo: string;
  urlAtual?: string | null;
  arquivo?: File;
  erro?: string;
  redonda?: boolean;
  aoMudar: (arquivo: File | undefined, erro: string | null) => void;
}

/** Escolhe uma imagem (JPG/PNG/WEBP até 5 MB) e mostra a pré-visualização. */
export default function SeletorImagem({ id, rotulo, urlAtual, arquivo, erro, redonda, aoMudar }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const previa = useMemo(() => (arquivo ? URL.createObjectURL(arquivo) : null), [arquivo]);
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa); }, [previa]);

  const imagem = previa ?? urlAtual;

  const aoEscolher = (e: React.ChangeEvent<HTMLInputElement>) => {
    const escolhido = e.target.files?.[0];
    if (!escolhido) return;
    const problema = validarImagem(escolhido);
    if (problema) {
      aoMudar(undefined, problema);
      e.target.value = '';
    } else {
      aoMudar(escolhido, null);
    }
  };

  const remover = () => {
    if (entrada.current) entrada.current.value = '';
    aoMudar(undefined, null);
  };

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold">{rotulo}</label>
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <div className={`previa-imagem ${redonda ? 'previa-redonda' : ''}`}>
          {imagem ? <img src={imagem} alt="Pré-visualização" /> : <i className="bi bi-image text-roxo fs-1" />}
        </div>
        <div>
          <input
            ref={entrada}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={`form-control ${erro ? 'is-invalid' : ''}`}
            onChange={aoEscolher}
          />
          <div className="form-text">JPG, PNG ou WEBP, até {TAMANHO_MAXIMO_IMAGEM_MB} MB.</div>
          {arquivo && (
            <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={remover}>
              Remover imagem escolhida
            </button>
          )}
        </div>
      </div>
      {erro && <div className="invalid-feedback d-block">{erro}</div>}
    </div>
  );
}
