import { Link } from 'react-router-dom';
import { NOME_LOJA } from '../../utils/constants';

/** Logo + nome da loja (canto do cabeçalho). */
export default function Marca({ destino = '/' }: { destino?: string }) {
  return (
    <Link to={destino} className="marca d-flex align-items-center gap-2 text-decoration-none">
      <img src="/img/logo.png" alt="Logo da Purrfect Stitch" className="marca-logo" />
      <span className="marca-nome">{NOME_LOJA}</span>
    </Link>
  );
}
