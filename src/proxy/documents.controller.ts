import { Controller, All, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Controller('documents')
export class ProxyController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const documentServiceUrl = this.configService.get<string>('DOCUMENT_SERVICE_URL', 'http://document-service.internal');
    const url = `${documentServiceUrl}${req.originalUrl}`;
    const method = req.method.toLowerCase();

    // Add the internal secret header
    const headers = {
      ...req.headers,
      'x-internal-secret': this.configService.get<string>('INTERNAL_SECRET'),
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          url,
          method,
          headers,
          data: req.body,
          responseType: 'stream',
        })
      );

      res.status(response.status);
      response.data.pipe(res);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        res.status(axiosError.response!.status || 500).json(axiosError.response!.data || { message: 'Proxy error' });
      } else {
        res.status(500).json({ message: 'Proxy error' });
      }
    }
  }
} 