import { Link } from 'react-router-dom';
import EstadoVazio from '../components/ui/EmptyState';

export default function NaoEncontrada() {
  return (
    <div className="card cartao-vidro">
      <EstadoVazio
        icone="bi-emoji-dizzy"
        titulo="Página não encontrada"
        texto="O gatinho mexeu no novelo e a página sumiu."
        acao={<Link to="/dashboard" className="btn btn-enviar">Voltar ao Dashboard</Link>}
      />
    </div>
  );
}
