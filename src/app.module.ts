import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { validateEnv } from './config/env.validation';
import auth0Config from './config/auth0.config';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [auth0Config],
    }),
    AuthModule,
    PrismaModule,
    HealthModule,
    UserModule,
    ProxyModule,
  ],
})
export class AppModule {}
