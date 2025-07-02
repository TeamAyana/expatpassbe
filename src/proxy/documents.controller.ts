import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AxiosError, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Stream } from 'stream';

@Controller('documents')
@ApiTags('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const documentServiceUrl = this.configService.get<string>(
      'DOCUMENT_SERVICE_URL',
      'http://document-service.internal',
    );
    this.logger.log(
      `Proxying request to : ${documentServiceUrl}${req.originalUrl}`,
    );
    const url = `${documentServiceUrl}${req.originalUrl}`;
    const method = req.method.toLowerCase();

    // Add the internal secret header
    const headers = {
      ...req.headers,
      'x-internal-secret': this.configService.get<string>('INTERNAL_SECRET'),
    };

    try {
      const response: AxiosResponse<Stream> = await firstValueFrom(
        this.httpService.request<Stream>({
          url,
          method,
          headers,
          data: req.body as Record<string, any>,
          responseType: 'stream',
        }),
      );

      res.status(response.status);
      response.data.pipe(res);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        res
          .status(axiosError.response.status || 500)
          .json(axiosError.response.data || { message: 'Proxy error' });
      } else {
        res.status(500).json({ message: 'Proxy error' });
      }
    }
  }
}
