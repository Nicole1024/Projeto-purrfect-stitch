interface Props {
  titulo: string;
  valor: string;
  icone: string;
  variante: 'lilas' | 'roxo' | 'azul' | 'rosa';
}

export default function CartaoIndicador({ titulo, valor, icone, variante }: Props) {
  return (
    <div className={`card cartao-vidro cartao-indicador indicador-${variante} h-100`}>
      <div className="card-body d-flex align-items-center gap-3">
        <span className="indicador-icone">
          <i className={`bi ${icone}`} />
        </span>
        <div className="min-w-0">
          <div className="text-body-secondary small fw-semibold text-uppercase">{titulo}</div>
          <div className="fs-4 fw-bold text-truncate">{valor}</div>
        </div>
      </div>
    </div>
  );
}
