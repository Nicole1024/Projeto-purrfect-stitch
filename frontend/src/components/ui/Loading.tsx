export default function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3 text-roxo" role="status">
      <div className="novelo-girando" aria-hidden="true" />
      <span className="fw-semibold">{texto}</span>
    </div>
  );
}
