import type { ReactNode } from 'react';

interface Props {
  id: string;
  rotulo: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  children: ReactNode;
  className?: string;
}

/** Rótulo + campo + mensagem de erro/dica, padronizando todos os formulários. */
export default function CampoFormulario({ id, rotulo, erro, dica, obrigatorio, children, className = '' }: Props) {
  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={id} className="form-label fw-semibold">
        {rotulo}
        {obrigatorio && <span className="text-danger ms-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {erro ? (
        <div className="invalid-feedback d-block" id={`${id}-erro`}>
          {erro}
        </div>
      ) : (
        dica && <div className="form-text">{dica}</div>
      )}
    </div>
  );
}
