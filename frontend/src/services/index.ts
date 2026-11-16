import { servicoReal } from './real/realService';
import { servicoSimulado } from './mock/mockService';
import type { ServicoApi } from './contract';

const usarSimulado = import.meta.env.VITE_USAR_MOCK !== 'false';

/** Use sempre `servicos` nas telas: ele escolhe mock ou API real automaticamente. */
export const servicos: ServicoApi = usarSimulado ? servicoSimulado : servicoReal;
export const modoSimulado = usarSimulado;
export { extrairMensagemErro } from './httpClient';
