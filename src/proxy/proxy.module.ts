import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DocumentsController } from './documents.controller';
import { ScanController } from './scan.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000, // 10 seconds
    }),
  ],
  controllers: [DocumentsController, ScanController],
})
export class ProxyModule {}
