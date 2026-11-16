# Front-end — Purrfect Stitch

React 19 + TypeScript + Vite + **Bootstrap 5** + Axios + React Router.

```bash
npm install
npm run dev      # desenvolvimento (http://localhost:5173)
npm run build    # build de produção (confere os tipos antes)
```

## Variáveis de ambiente

Copie `.env.example` para `.env`:

```
VITE_USAR_MOCK=false                 # true = dados simulados | false = API real (NestJS)
VITE_API_URL=http://localhost:3000   # endereço do backend
```

O backend precisa estar rodando (`npm run start:dev` na pasta do backend) quando
`VITE_USAR_MOCK=false`.

## Estrutura (`src/`)

| Pasta | O que tem |
|---|---|
| `pages/` | Telas: login, dashboard, produtos, administradores, histórico |
| `components/layout/` | Cabeçalho, rodapé, menu lateral, layouts |
| `components/ui/` | Reutilizáveis: modal de exclusão, campos, avatar, cards, seletor de imagem |
| `contexts/` | Autenticação, notificações e tema |
| `services/` | `index.ts` escolhe entre `mock/` (simulado) e `real/` (API NestJS) |
| `hooks/` | `useFetch` (carregar dados) e `useDebounce` (atraso na busca) |
| `routes/` | Rota protegida (exige login) |
| `utils/` e `types/` | Formatadores, validações, constantes e tipos |

As telas só usam `servicos` (`src/services/index.ts`); por isso trocar mock por API
real não exige mexer em nenhuma tela.

## Como o front conversa com o backend

| Tela | Rota da API |
|---|---|
| Login | `POST /auth/login` |
| Produtos | `GET/POST /produtos`, `GET/PATCH/DELETE /produtos/:id` (imagem em `multipart/form-data`) |
| Administradores | `GET/POST /usuarios`, `GET/PATCH/DELETE /usuarios/:id` |
| Dashboard | `GET /relatorios/dashboard` |
| Histórico | `GET /historico` |
