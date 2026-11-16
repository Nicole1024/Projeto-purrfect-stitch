import { NOME_LOJA } from '../../utils/constants';

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape-conteudo">
        <span className="d-flex align-items-center gap-2">
          <img src="/img/logo.png" alt="" aria-hidden="true" width={26} height={26} />
          <strong>{NOME_LOJA}</strong>
          <span className="d-none d-sm-inline opacity-75">· Crochê feito com carinho</span>
        </span>
        <span className="opacity-75 small">
          © {new Date().getFullYear()} {NOME_LOJA}. Todos os direitos reservados.
        </span>
      </div>
    </footer>
  );
}
