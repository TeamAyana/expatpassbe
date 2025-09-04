import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DocumentsController } from './documents.controller';
import { ScanController } from './scan.controller';
import { VisaComplianceController } from './visa-compliance.controller';
import { UserService } from '@/user/user.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
    }),
  ],
  controllers: [DocumentsController, ScanController, VisaComplianceController],
  providers: [UserService],
})
export class ProxyModule {}
