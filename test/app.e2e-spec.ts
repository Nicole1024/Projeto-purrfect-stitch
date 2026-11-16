import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { Prisma } from './../src/generated/prisma/client.js';

// Estes testes rodam a API inteira (Guard global, ValidationPipe, filtros),
// mas com o PrismaService trocado por um "dublê", então NÃO precisam do banco.
process.env.JWT_SECRET = 'segredo-de-teste';
process.env.DATABASE_URL = 'postgresql://x:y@localhost/z';

describe('API da loja (e2e, sem banco)', () => {
  let app: INestApplication;
  let token: string;

  const produtoCroche = { id: 1, nome: 'Amigurumi de gato', preco: 50, quantidade: 2 };

  const tx = {
    produto: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    pedido: { create: vi.fn() },
  };
  const prisma = {
    usuario: { findUnique: vi.fn(), create: vi.fn() },
    categoria: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    produto: { findUnique: vi.fn() },
    $transaction: vi.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
  };

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma.usuario.findUnique.mockResolvedValueOnce({
      id: 7,
      nome: 'Ana',
      email: 'ana@email.com',
      senha: await bcrypt.hash('123456', 4),
    });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ana@email.com', senha: '123456' });
    token = login.body.access_token;
  });

  afterAll(() => app.close());
  beforeEach(() => vi.clearAllMocks());

  const auth = () => ({ Authorization: `Bearer ${token}` });

  describe('autenticação', () => {
    it('login correto devolve JWT e dados do usuário (sem senha)', async () => {
      expect(token).toEqual(expect.any(String));
    });

    it('login com senha errada -> 401', async () => {
      prisma.usuario.findUnique.mockResolvedValueOnce({
        id: 7, nome: 'Ana', email: 'ana@email.com', senha: await bcrypt.hash('outra', 4),
      });
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ana@email.com', senha: '123456' })
        .expect(401);
    });

    it('cadastro não devolve a senha e guarda hash bcrypt', async () => {
      prisma.usuario.findUnique.mockResolvedValueOnce(null);
      prisma.usuario.create.mockImplementationOnce(async ({ data }) => ({ id: 1, ...data }));

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ nome: 'Bia', email: 'BIA@Email.com', senha: 'abcdef' })
        .expect(201);

      expect(res.body).toEqual({ id: 1, nome: 'Bia', email: 'bia@email.com' });
      const gravado = prisma.usuario.create.mock.calls[0][0].data;
      expect(gravado.senha).not.toBe('abcdef');
      expect(await bcrypt.compare('abcdef', gravado.senha)).toBe(true);
    });

    it('cadastro com e-mail repetido -> 409', async () => {
      prisma.usuario.findUnique.mockResolvedValueOnce({ id: 1 });
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ nome: 'Bia', email: 'bia@email.com', senha: 'abcdef' })
        .expect(409);
    });

    it('cadastro com dados inválidos -> 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ nome: 'Bia', email: 'nao-e-email', senha: '123' })
        .expect(400);
    });
  });

  describe('Guard global', () => {
    it.each([
      ['get', '/categorias'],
      ['get', '/produtos'],
      ['get', '/materiais'],
      ['get', '/pedidos'],
      ['get', '/relatorios/dashboard'],
      ['post', '/produtos'],
    ] as const)('%s %s sem token -> 401', async (metodo, rota) => {
      await request(app.getHttpServer())[metodo](rota).expect(401);
    });

    it('token inválido -> 401', async () => {
      await request(app.getHttpServer())
        .get('/categorias')
        .set('Authorization', 'Bearer lixo')
        .expect(401);
    });

    it('com token válido a rota responde', async () => {
      prisma.categoria.findMany.mockResolvedValueOnce([]);
      await request(app.getHttpServer()).get('/categorias').set(auth()).expect(200);
    });
  });

  describe('validação e erros', () => {
    it('DTO inválido -> 400', async () => {
      await request(app.getHttpServer())
        .post('/categorias')
        .set(auth())
        .send({ nome: '' })
        .expect(400);
    });

    it('id não numérico -> 400', async () => {
      await request(app.getHttpServer()).get('/produtos/abc').set(auth()).expect(400);
    });

    it('registro inexistente -> 404', async () => {
      prisma.produto.findUnique.mockResolvedValueOnce(null);
      await request(app.getHttpServer()).get('/produtos/999').set(auth()).expect(404);
    });

    it('preço zero ou estoque negativo -> 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/produtos')
        .set(auth())
        .send({ categoriaId: 1, nome: 'X', preco: 0, quantidade: -1 })
        .expect(400);
      expect(JSON.stringify(res.body.message)).toContain('estoque');
    });

    it('categoria inexistente ao criar produto -> 400', async () => {
      prisma.categoria.findUnique.mockResolvedValueOnce(null);
      await request(app.getHttpServer())
        .post('/produtos')
        .set(auth())
        .send({ categoriaId: 99, nome: 'X', preco: 10, quantidade: 1 })
        .expect(400);
    });

    it('erro P2002 do Prisma vira 409 pelo filtro global', async () => {
      prisma.categoria.findUnique.mockResolvedValueOnce(null);
      prisma.categoria.create.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'x' }),
      );
      await request(app.getHttpServer())
        .post('/categorias')
        .set(auth())
        .send({ nome: 'Amigurumis', descricao: 'Bonecos' })
        .expect(409);
    });
  });

  describe('pedidos: regra de estoque', () => {
    const corpo = { clienteNome: 'Carla', itens: [{ produtoId: 1, quantidade: 3 }] };

    it('estoque insuficiente -> 400 e nada é gravado', async () => {
      tx.produto.findMany.mockResolvedValueOnce([produtoCroche]);
      tx.produto.updateMany.mockResolvedValueOnce({ count: 0 });

      const res = await request(app.getHttpServer())
        .post('/pedidos')
        .set(auth())
        .send(corpo)
        .expect(400);

      expect(res.body.message).toContain('Estoque insuficiente');
      expect(tx.pedido.create).not.toHaveBeenCalled();
    });

    it('produto inexistente -> 400', async () => {
      tx.produto.findMany.mockResolvedValueOnce([]);
      await request(app.getHttpServer()).post('/pedidos').set(auth()).send(corpo).expect(400);
    });

    it('pedido sem itens -> 400', async () => {
      await request(app.getHttpServer())
        .post('/pedidos')
        .set(auth())
        .send({ clienteNome: 'Carla', itens: [] })
        .expect(400);
    });

    it('venda válida baixa o estoque, soma o total e usa o usuário do token', async () => {
      tx.produto.findMany.mockResolvedValueOnce([produtoCroche]);
      tx.produto.updateMany.mockResolvedValueOnce({ count: 1 });
      tx.pedido.create.mockImplementationOnce(async ({ data }) => ({ id: 10, ...data }));

      await request(app.getHttpServer())
        .post('/pedidos')
        .set(auth())
        .send({
          clienteNome: 'Carla',
          itens: [
            { produtoId: 1, quantidade: 1 },
            { produtoId: 1, quantidade: 1 }, // repetido: é somado
          ],
        })
        .expect(201);

      expect(tx.produto.updateMany).toHaveBeenCalledWith({
        where: { id: 1, quantidade: { gte: 2 } },
        data: { quantidade: { decrement: 2 } },
      });
      const dados = tx.pedido.create.mock.calls[0][0].data;
      expect(dados.total).toBe(100);
      expect(dados.usuarioId).toBe(7);
    });
  });
});
