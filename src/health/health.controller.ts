import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get('swagger')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('swagger', 'http://localhost:7100/docs'),
    ]);
  }

  @Get('db')
  @HealthCheck()
  checkDb() {
    return this.health.check([
      () => this.db.pingCheck('database', this.prisma),
    ]);
  }
}
