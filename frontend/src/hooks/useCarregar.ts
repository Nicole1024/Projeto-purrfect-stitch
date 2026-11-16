import { useCallback, useEffect, useRef, useState } from 'react';
import { extrairMensagemErro } from '../servicos';

/**
 * Executa uma busca assíncrona e controla loading/erro.
 * Ignora respostas antigas quando os parâmetros mudam rápido (ex.: digitando na busca).
 */
export function useCarregar<T>(buscar: () => Promise<T>, dependencias: unknown[]) {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const requisicaoAtual = useRef(0);

  const executar = useCallback(() => {
    const numero = ++requisicaoAtual.current;
    setCarregando(true);
    setErro(null);
    buscar()
      .then((resultado) => {
        if (numero === requisicaoAtual.current) setDados(resultado);
      })
      .catch((e) => {
        if (numero === requisicaoAtual.current) setErro(extrairMensagemErro(e));
      })
      .finally(() => {
        if (numero === requisicaoAtual.current) setCarregando(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  useEffect(() => {
    executar();
  }, [executar]);

  return { dados, carregando, erro, recarregar: executar };
}
