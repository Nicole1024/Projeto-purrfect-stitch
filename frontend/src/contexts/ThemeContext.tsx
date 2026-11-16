import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { CHAVE_TEMA } from '../utils/constants';

type Tema = 'claro' | 'escuro';

interface TemaValor {
  tema: Tema;
  alternarTema: () => void;
}

const TemaContexto = createContext<TemaValor | null>(null);

const temaInicial = (): Tema => {
  try {
    const salvo = localStorage.getItem(CHAVE_TEMA);
    if (salvo === 'claro' || salvo === 'escuro') return salvo;
  } catch {
    /* sem acesso ao armazenamento: usa a preferência do sistema */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
};

export function TemaProvedor({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', tema === 'escuro' ? 'dark' : 'light');
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch {
      /* ignora */
    }
  }, [tema]);

  const alternarTema = () => setTema((atual) => (atual === 'claro' ? 'escuro' : 'claro'));

  return <TemaContexto.Provider value={{ tema, alternarTema }}>{children}</TemaContexto.Provider>;
}

export const useTema = () => {
  const contexto = useContext(TemaContexto);
  if (!contexto) throw new Error('useTema deve ser usado dentro de TemaProvedor');
  return contexto;
};
