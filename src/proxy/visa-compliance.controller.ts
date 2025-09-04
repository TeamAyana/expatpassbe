import {
  Controller,
  All,
  Req,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('api/v1/visa-compliance/*')
export class VisaComplianceController {
  private readonly visaServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const visaServiceUrl = this.configService.get<string>(
      'VISA_COMPLIANCE_SERVICE_URL',
    );
    if (!visaServiceUrl) {
      throw new Error('VISA_COMPLIANCE_SERVICE_URL is not configured');
    }
    this.visaServiceUrl = visaServiceUrl;
  }

  @All()
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    try {
      // Extract the path after /api/v1/visa-compliance/
      const path = req.params[0] || '';
      const targetUrl = `${this.visaServiceUrl}/api/v1/visa-compliance/${path}`;

      // Extract user ID from request
      const userId = this.extractUserId(req);
      if (userId) {
        req.headers['x-user-id'] = userId;
      }

      // Prepare request configuration
      const config = {
        method: req.method,
        url: targetUrl,
        headers: {
          ...req.headers,
          host: new URL(this.visaServiceUrl).host,
        },
        params: req.query,
        data: req.body,
        timeout: 30000, // 30 seconds timeout
      };

      // Make the request to the visa compliance service
      const response = await firstValueFrom(this.httpService.request(config));

      // Forward the response
      res.status(response.status).json(response.data);
    } catch (error) {
      if (error.response) {
        // Forward error response from the visa compliance service
        res.status(error.response.status).json(error.response.data);
      } else {
        // Handle network or other errors
        throw new HttpException(
          'Visa compliance service is unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
  }

  private extractUserId(req: Request): string | null {
    // Try to get user ID from different sources
    if (req.user && typeof req.user === 'object' && 'sub' in req.user) {
      return req.user.sub as string;
    }

    if (req.headers['x-user-id']) {
      return req.headers['x-user-id'] as string;
    }

    // For GET requests, we might not need user ID
    if (req.method === 'GET') {
      return null;
    }

    return null;
  }
}
