import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('login')
  @ApiResponse({ status: 200, description: 'Redirects to Auth0 for login.' })
  login(@Res() res: Response) {
    const redirectUri = `https://YOUR_AUTH0_DOMAIN/authorize?client_id=YOUR_CLIENT_ID&response_type=token&redirect_uri=http://localhost:3000/auth/callback&scope=openid profile email`;
    res.redirect(redirectUri);
  }

  @Post('signup')
  @ApiResponse({ status: 201, description: 'User signed up successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  async signup(@Body() body: { email: string; username: string; password: string }) {
    try {
      const user = await this.authService.signup(body.email, body.password, body.username);
      return { message: 'User signed up successfully', user };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('callback/normal')
  @ApiResponse({ status: 200, description: 'Handles Auth0 callback.' })
  async callback(@Req() req: Request) {
    const token = req.query.access_token as string;
    const user = await this.authService.validateUser(token);
    return this.authService.login(user);
  }

  @Get('callback/social')
  @ApiResponse({ status: 200, description: 'Handles Auth0 callback for social login.' })
  async callbackSocial(@Req() req: Request, @Res() res: Response) {
    const profile = req.user; // Assuming you have middleware to handle Auth0 callback and populate user profile
    const user = await this.authService.handleSocialLogin(profile);

    // Generate JWT token or handle login success
    return res.json({ message: 'User logged in successfully', user });
  }
}
