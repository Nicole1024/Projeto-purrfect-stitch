import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type TipoNotificacao = 'sucesso' | 'erro';

interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  mensagem: string;
}

interface NotificacaoValor {
  sucesso: (mensagem: string) => void;
  erro: (mensagem: string) => void;
}

const NotificacaoContexto = createContext<NotificacaoValor | null>(null);
let contador = 0;

export function NotificacaoProvedor({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<Notificacao[]>([]);

  const remover = useCallback((id: number) => setItens((l) => l.filter((n) => n.id !== id)), []);

  const adicionar = useCallback(
    (tipo: TipoNotificacao, mensagem: string) => {
      const id = ++contador;
      setItens((l) => [...l, { id, tipo, mensagem }]);
      setTimeout(() => remover(id), 4500);
    },
    [remover],
  );

  const valor: NotificacaoValor = {
    sucesso: (m) => adicionar('sucesso', m),
    erro: (m) => adicionar('erro', m),
  };

  return (
    <NotificacaoContexto.Provider value={valor}>
      {children}
      <div className="toast-container position-fixed top-0 end-0 p-3 area-toasts" aria-live="polite">
        {itens.map((n) => (
          <div
            key={n.id}
            className={`toast show align-items-center border-0 toast-purrfect toast-${n.tipo}`}
            role={n.tipo === 'erro' ? 'alert' : 'status'}
          >
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className={`bi ${n.tipo === 'sucesso' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} />
                <span>{n.mensagem}</span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Fechar"
                onClick={() => remover(n.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </NotificacaoContexto.Provider>
  );
}

export const useNotificacao = () => {
  const contexto = useContext(NotificacaoContexto);
  if (!contexto) throw new Error('useNotificacao deve ser usado dentro de NotificacaoProvedor');
  return contexto;
};
