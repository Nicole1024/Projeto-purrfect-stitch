export default function MensagemErro({ mensagem, aoTentarNovamente }: { mensagem: string; aoTentarNovamente?: () => void }) {
  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between gap-3" role="alert">
      <span>
        <i className="bi bi-exclamation-triangle-fill me-2" />
        {mensagem}
      </span>
      {aoTentarNovamente && (
        <button className="btn btn-sm btn-outline-danger" onClick={aoTentarNovamente}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
