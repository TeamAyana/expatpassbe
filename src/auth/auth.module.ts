import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { Auth0Strategy } from 'src/auth0/auth0.strategy';
import { JwtService } from '@nestjs/jwt';
import { Auth0Service } from 'src/auth0/auth0.service';

@Module({
  providers: [AuthService, PrismaService, Auth0Strategy, JwtService, Auth0Service],
  controllers: [AuthController],
  
})
export class AuthModule {}
