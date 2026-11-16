# Purrfect Stitch — Gerenciamento de Loja de Crochê

> Projeto desenvolvido para a disciplina de Backend do IFRS — Campus Rio Grande.
> A API permite gerenciar produtos de crochê, categorias, materiais (a "receita" de cada
> peça), pedidos e usuários, usando NestJS, Prisma ORM 7 e PostgreSQL (Neon).
> O frontend em React (opcional) consome a API.

## Tecnologias utilizadas

- Node.js, NestJS 12, Prisma ORM 7.10, PostgreSQL (Neon)
- JWT (`@nestjs/jwt`), Bcrypt, class-validator / class-transformer
- Frontend (bônus): React 18, Vite, React Router, Axios

## Pré-requisitos

Node.js 20+, npm, Git e uma conta no [Neon](https://neon.tech).

## Instalação

```bash
git clone https://github.com/usuario/repositorio.git
cd repositorio
npm install
```

## Variáveis de ambiente

Crie um `.env` na raiz (modelo em `.env.example`). **Não suba o `.env` para o Git.**

```env
DATABASE_URL="postgresql://usuario:senha@host/database?sslmode=require"
JWT_SECRET="troque_por_uma_chave_longa_e_secreta"
PORT=3000
```

## Migrações

```bash
npx prisma migrate dev     # aplica as migrações no banco (Neon)
npx prisma generate        # gera o client em src/generated/prisma
```

Em produção/CI use `npx prisma migrate deploy`.

> A migração `20261112120000_loja_completa` adiciona `UNIQUE` em `usuarios.email`,
> `categorias.nome` e `materiais.nome`. Se já existirem registros duplicados nesses
> campos no banco, apague/ajuste os duplicados antes de migrar.

## Executando

```bash
npm run start:dev
```

A API fica em `http://localhost:3000`.

### Testes

```bash
npm test            # testes unitários (regras de pedidos)
npm run test:e2e    # API completa com o Prisma "simulado" (não precisa do banco)
```

## Modelagem (DER)

```mermaid
erDiagram
    USUARIO ||--o{ PEDIDO : registra
    CATEGORIA ||--o{ PRODUTO : agrupa
    PRODUTO ||--o| DETALHE_PRODUTO : "tem (1:1)"
    PRODUTO ||--o{ PRODUTO_MATERIAL : usa
    MATERIAL ||--o{ PRODUTO_MATERIAL : "é usado em"
    PEDIDO ||--o{ ITEM_PEDIDO : contém
    PRODUTO ||--o{ ITEM_PEDIDO : "é vendido em"
```

| Relacionamento | Tipo | Como está modelado |
|---|---|---|
| Produto ↔ DetalheProduto | **1:1** | `detalhes_produto.id_produto` é PK **e** FK de `produtos` |
| Categoria → Produto | **1:N** | `produtos.categoria_id` |
| Usuário → Pedido | **1:N** | `pedidos.usuario_id` |
| Produto ↔ Material | **N:N** | tabela `produtos_materiais` (com `quantidade_usada`) |
| Pedido ↔ Produto | **N:N** | tabela `itens_pedido` (com `quantidade` e `preco_unitario`) |

Tabelas: `usuarios`, `categorias`, `produtos`, `detalhes_produto`, `materiais`,
`produtos_materiais`, `pedidos`, `itens_pedido`.

## Estrutura do projeto

```
src/
├── auth/              (module, controller, service, guard, @Public, @CurrentUser, dto)
├── prisma/            (module global + service com adapter Neon)
├── common/            (filtro que converte erros do Prisma em 404/409)
├── categorias/        (module, controller, service, dto)
├── produtos/          (module, controller, service, dto) — inclui a receita (N:N)
├── detalhes-produto/  (module, controller, service, dto) — relação 1:1
├── materiais/         (module, controller, service, dto)
├── pedidos/           (module, controller, service, dto)
├── relatorios/        (module, controller, service) — consultas com 3+ tabelas
├── app.module.ts
└── main.ts
prisma/
├── schema.prisma
└── migrations/
prisma.config.ts
frontend/              (React + Vite — bônus)
```

## Autenticação

Fluxo: registrar → logar → receber o token → enviar `Authorization: Bearer SEU_TOKEN`.

- A senha é guardada com **bcrypt**; o login devolve um **JWT** (validade de 1h).
- O `AuthGuard` está registrado **globalmente** (`APP_GUARD`): toda rota é protegida
  por padrão. Apenas as rotas marcadas com `@Public()` (cadastro e login) são abertas.

## Rotas da API

| Método | Rota | Descrição | Pública? |
|---|---|---|---|
| POST | /auth/register | Cadastro de usuário | Sim |
| POST | /auth/login | Login (retorna JWT e dados do usuário) | Sim |
| GET | /categorias | Lista categorias (com contagem de produtos) | Não |
| GET | /categorias/:id | Busca categoria | Não |
| POST | /categorias | Cria categoria | Não |
| PATCH | /categorias/:id | Atualiza categoria | Não |
| DELETE | /categorias/:id | Remove categoria (409 se tiver produtos) | Não |
| GET | /produtos | Lista produtos (`?categoriaId=` e `?busca=`) | Não |
| GET | /produtos/:id | Busca produto com categoria, detalhe e materiais | Não |
| POST | /produtos | Cria produto | Não |
| PATCH | /produtos/:id | Atualiza produto | Não |
| DELETE | /produtos/:id | Remove produto (409 se já foi vendido) | Não |
| POST | /produtos/:id/materiais | Vincula material ao produto (N:N) | Não |
| DELETE | /produtos/:id/materiais/:materialId | Remove vínculo produto-material | Não |
| POST | /produtos/:id/detalhe | Cria o detalhe do produto (1:1; 409 se já existir) | Não |
| GET | /produtos/:id/detalhe | Busca o detalhe do produto | Não |
| PATCH | /produtos/:id/detalhe | Atualiza o detalhe | Não |
| DELETE | /produtos/:id/detalhe | Remove o detalhe | Não |
| GET | /materiais | Lista materiais | Não |
| GET | /materiais/:id | Busca material (com os produtos que o usam) | Não |
| POST | /materiais | Cria material | Não |
| PATCH | /materiais/:id | Atualiza material | Não |
| DELETE | /materiais/:id | Remove material (409 se estiver em uso) | Não |
| GET | /pedidos | Lista pedidos (`?status=PENDENTE\|CONCLUIDO\|CANCELADO`) | Não |
| GET | /pedidos/:id | Busca pedido | Não |
| POST | /pedidos | Registra pedido (baixa o estoque) | Não |
| PATCH | /pedidos/:id | Altera cliente e/ou status | Não |
| DELETE | /pedidos/:id | Remove pedido (devolve estoque, se ativo) | Não |
| GET | /relatorios/pedidos-detalhados | Pedidos + usuário + itens + produto + categoria | Não |
| GET | /relatorios/catalogo | Categorias + produtos + detalhe + materiais | Não |
| GET | /relatorios/dashboard | Totais, faturamento, mais vendidos e alertas de estoque | Não |

### Corpos de exemplo

```jsonc
// POST /auth/register
{ "nome": "Ana", "email": "ana@email.com", "senha": "123456" }

// POST /produtos
{ "categoriaId": 1, "nome": "Gatinho amigurumi", "descricao": "Feito à mão", "preco": 59.9, "quantidade": 4 }

// POST /produtos/1/detalhe
{ "tempoProducao": 6, "peso": 120, "nivelDificuldade": "Médio", "dimensoes": "15x10x8 cm" }

// POST /produtos/1/materiais
{ "materialId": 2, "quantidadeUsada": 3 }

// POST /pedidos   (o usuário vem do token)
{ "clienteNome": "Carla", "itens": [ { "produtoId": 1, "quantidade": 2 } ] }

// PATCH /pedidos/1
{ "status": "CANCELADO" }
```

## Regras de negócio

- **Estoque nunca fica negativo:** produto/material não aceitam quantidade negativa e o
  pedido só é criado se houver saldo; a baixa é atômica, dentro de uma transação
  (se um item falhar, nada é gravado).
- **Preço congelado:** o item do pedido guarda o `preco_unitario` do momento da venda.
- **Cancelar devolve o estoque:** `PENDENTE → CONCLUIDO/CANCELADO`, `CONCLUIDO → CANCELADO`;
  `CANCELADO` é final (409 em qualquer outra mudança).
- **1:1 respeitado:** um produto só pode ter um detalhe (409 ao tentar criar o segundo).
- **Integridade:** não exclui categoria com produtos, material em uso ou produto já vendido (409).

## Tratamento de erros

| Status | Quando |
|---|---|
| 400 | DTO inválido, `:id` não numérico, categoria/material/produto informado não existe, estoque insuficiente |
| 401 | Token ausente, inválido ou expirado; credenciais inválidas |
| 404 | Registro não encontrado |
| 409 | E-mail/nome duplicado, vínculo já existente, exclusão bloqueada, transição de status inválida |
| 500 | Erro interno |

Erros do Prisma (`P2002` → 409, `P2003` → 409, `P2025` → 404) são convertidos por um
filtro global (`src/common/prisma-exception.filter.ts`).

## Consulta avançada

`GET /relatorios/pedidos-detalhados` retorna cada pedido com o usuário, os itens, o
produto (com categoria e detalhe) — 6 tabelas em uma única consulta Prisma.
`GET /relatorios/dashboard` combina totais, `groupBy` de vendas e alertas de estoque.

## Testando a API

Insomnia, Postman ou Thunder Client (VSCode):

1. `POST /auth/register` → 2. `POST /auth/login` (copie o `access_token`) →
3. envie `Authorization: Bearer SEU_TOKEN` nas demais rotas →
4. teste também sem token (401) e com dados inválidos (400).

## Frontend (bônus)

Veja [`frontend/README.md`](frontend/README.md).

## Integrantes

- Nicole dos Santos
- Maria Eduarda

## Licença

Projeto desenvolvido exclusivamente para fins acadêmicos na disciplina de Backend do IFRS.
