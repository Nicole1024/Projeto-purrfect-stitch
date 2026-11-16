import { iniciais } from '../../utils/formatters';

interface Props {
  nome: string;
  fotoUrl?: string | null;
  tamanho?: number;
}

export default function Avatar({ nome, fotoUrl, tamanho = 40 }: Props) {
  const estilo = { width: tamanho, height: tamanho, fontSize: tamanho * 0.38 };
  if (fotoUrl) {
    return <img src={fotoUrl} alt={`Foto de ${nome}`} className="avatar" style={estilo} />;
  }
  return (
    <span className="avatar avatar-iniciais" style={estilo} aria-label={nome}>
      {iniciais(nome)}
    </span>
  );
}
