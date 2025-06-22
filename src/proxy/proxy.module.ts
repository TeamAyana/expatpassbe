import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyController } from './documents.controller';
import { ScanController } from './scan.controller';

@Module({
  imports: [HttpModule],
  controllers: [ProxyController, ScanController],
})
export class ProxyModule {}
