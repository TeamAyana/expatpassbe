import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaService } from './prisma/prisma.service';
import { HealthModule } from './health/health.module';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: process.env.APP_SECRET,
      signOptions: { expiresIn: process.env.EXPIRES_IN },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot(),
    HealthModule,
  ],
  providers: [PrismaService, AuthService],
})
export class AppModule {}
