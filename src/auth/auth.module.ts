import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';

@Module({
  imports: [
    // registerAsync garante que o .env já foi lido pelo ConfigModule
    // antes de montarmos o JwtModule com o JWT_SECRET.
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' as const },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Guard GLOBAL: toda rota nova já nasce protegida. Use @Public() para liberar.
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AuthModule {}
