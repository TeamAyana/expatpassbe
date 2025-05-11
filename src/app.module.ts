import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { Auth0Service } from './auth0/auth0.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: process.env.APP_SECRET,
      signOptions: { expiresIn: process.env.EXPIRES_IN },
    }),
    ConfigModule.forRoot(),
    LoggerModule.forRoot(),
  ],
  providers: [Auth0Service],
})
export class AppModule {}
