import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('file')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.s3Service.uploadFile(file.originalname, file.buffer);
  }
}
