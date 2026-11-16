import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { PASTA_UPLOADS } from './common/imagem.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Imagens enviadas ficam em uploads/ e são servidas em /uploads/...
  app.useStaticAssets(PASTA_UPLOADS, { prefix: '/uploads' });

  // whitelist: descarta campos que não existem no DTO
  // transform: converte o corpo para instâncias dos DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
