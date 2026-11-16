import { ConflictException, NotFoundException } from '@nestjs/common';
import { PedidosService } from './pedidos.service.js';

// Testes unitários das regras de status/estoque dos pedidos (sem banco).
describe('PedidosService', () => {
  const tx = {
    itemPedido: { findMany: vi.fn() },
    produto: { update: vi.fn() },
    pedido: { update: vi.fn(), delete: vi.fn() },
  };
  const prisma = {
    pedido: { findUnique: vi.fn() },
    $transaction: vi.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  const service = new PedidosService(prisma as any);

  beforeEach(() => {
    vi.clearAllMocks();
    tx.itemPedido.findMany.mockResolvedValue([
      { produtoId: 1, quantidade: 2 },
      { produtoId: 2, quantidade: 1 },
    ]);
  });

  it('findOne lança 404 quando o pedido não existe', async () => {
    prisma.pedido.findUnique.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('cancelar um pedido devolve os itens ao estoque', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 5, status: 'PENDENTE' });
    await service.update(5, { status: 'CANCELADO' });

    expect(tx.produto.update).toHaveBeenCalledTimes(2);
    expect(tx.produto.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { quantidade: { increment: 2 } },
    });
  });

  it('concluir um pedido NÃO mexe no estoque', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 5, status: 'PENDENTE' });
    await service.update(5, { status: 'CONCLUIDO' });
    expect(tx.produto.update).not.toHaveBeenCalled();
  });

  it('pedido cancelado não pode mudar de status (409)', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 5, status: 'CANCELADO' });
    await expect(service.update(5, { status: 'CONCLUIDO' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('excluir pedido ativo devolve o estoque; excluir cancelado não', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 5, status: 'PENDENTE' });
    await service.remove(5);
    expect(tx.produto.update).toHaveBeenCalledTimes(2);

    vi.clearAllMocks();
    prisma.pedido.findUnique.mockResolvedValue({ id: 6, status: 'CANCELADO' });
    await service.remove(6);
    expect(tx.produto.update).not.toHaveBeenCalled();
    expect(tx.pedido.delete).toHaveBeenCalledWith({ where: { id: 6 } });
  });
});
