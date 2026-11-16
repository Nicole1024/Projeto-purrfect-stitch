import { useEffect, useState } from 'react';

/** Retorna o valor só depois de `ms` sem mudanças (debounce) — usado nas buscas. */
export function useAtraso<T>(valor: T, ms = 350): T {
  const [atrasado, setAtrasado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setAtrasado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return atrasado;
}
