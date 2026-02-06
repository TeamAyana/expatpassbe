import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaHealthIndicator, TerminusModule } from '@nestjs/terminus';
import { PrismaService } from 'src/prisma/prisma.service';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [PrismaService, PrismaHealthIndicator],
})
export class HealthModule {}
