import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from './common/prisma-exception.filter.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HistoricoModule } from './historico/historico.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { ProdutosModule } from './produtos/produtos.module.js';
import { DetalhesProdutoModule } from './detalhes-produto/detalhes-produto.module.js';
import { MateriaisModule } from './materiais/materiais.module.js';
import { PedidosModule } from './pedidos/pedidos.module.js';
import { RelatoriosModule } from './relatorios/relatorios.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HistoricoModule,
    UsuariosModule,
    CategoriasModule,
    ProdutosModule,
    DetalhesProdutoModule,
    MateriaisModule,
    PedidosModule,
    RelatoriosModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: PrismaExceptionFilter }],
})
export class AppModule {}
