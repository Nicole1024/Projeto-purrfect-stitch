import { useEffect } from 'react';

interface Props {
  aberto: boolean;
  carregando?: boolean;
  nomeRegistro?: string;
  aoCancelar: () => void;
  aoConfirmar: () => void;
}

/** Modal obrigatório antes de qualquer exclusão (texto definido na especificação). */
export default function ModalConfirmacao({ aberto, carregando, nomeRegistro, aoCancelar, aoConfirmar }: Props) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && !carregando && aoCancelar();
    document.addEventListener('keydown', aoTeclar);
    document.body.classList.add('overflow-hidden');
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.classList.remove('overflow-hidden');
    };
  }, [aberto, carregando, aoCancelar]);

  if (!aberto) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-purrfect">
            <div className="modal-body text-center p-4 p-md-5">
              <div className="icone-alerta mb-3">
                <i className="bi bi-trash3-fill" />
              </div>
              <h2 className="h5 fw-bold mb-2" id="titulo-modal">
                Excluir registro
              </h2>
              {nomeRegistro && <p className="fw-semibold text-roxo mb-2">“{nomeRegistro}”</p>}
              <p className="mb-4 text-body-secondary">
                Tem certeza de que deseja excluir este registro? Esta ação não poderá ser desfeita.
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button type="button" className="btn btn-outline-roxo px-4" onClick={aoCancelar} disabled={carregando}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger px-4" onClick={aoConfirmar} disabled={carregando} autoFocus>
                  {carregando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                      Excluindo...
                    </>
                  ) : (
                    'Excluir'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={() => !carregando && aoCancelar()} />
    </>
  );
}
