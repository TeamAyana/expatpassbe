import { Controller, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @ApiResponse({ status: 200, description: 'Redirects to Auth0 for login.' })
  login(@Res() res: Response) {
    const redirectUri = `https://YOUR_AUTH0_DOMAIN/authorize?client_id=YOUR_CLIENT_ID&response_type=token&redirect_uri=http://localhost:3000/auth/callback&scope=openid profile email`;
    res.redirect(redirectUri);
  }

  @Get('callback')
  @ApiResponse({ status: 200, description: 'Handles Auth0 callback.' })
  async callback(@Req() req: Request) {
    const token = req.query.access_token;
    const user = await this.authService.validateUser(token);
    return this.authService.login(user);
  }
}
