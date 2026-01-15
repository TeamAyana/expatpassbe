import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import {
  CallbackResponseDto,
  ErrorResponseDto,
  LoginResponseDto,
  ProfileResponseDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  @ApiOperation({
    summary: 'Initiate Auth0 login',
    description:
      'Returns the Auth0 authorization URL for the specified client type (web or mobile)',
  })
  @ApiQuery({
    name: 'client',
    required: true,
    enum: ['web', 'mobile'],
    description: 'The type of client requesting authentication',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the Auth0 authorization URL',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid client type',
    type: ErrorResponseDto,
  })
  login(@Query('client') client: string, @Res() res) {
    const state = this.authService.generateState();
    const url =
      `https://${process.env.AUTH0_DOMAIN}/authorize?` +
      `response_type=code&` +
      `client_id=${process.env.AUTH0_CLIENT_ID}&` +
      `redirect_uri=${process.env.AUTH0_CALLBACK_URL}&` +
      `scope=openid%20profile%20email&` +
      `state=${state}`;

    // Store state in session/cookie for web clients
    if (client === 'web') {
      res.cookie('auth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    return res.json({ url });
  }

  @Get('callback')
  @ApiOperation({
    summary: 'Handle Auth0 callback',
    description:
      'Processes the Auth0 callback, exchanges the code for tokens, and returns user information',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'The authorization code from Auth0',
  })
  @ApiQuery({
    name: 'state',
    required: true,
    description: 'The state parameter to prevent CSRF attacks',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns access token, refresh token, and user information',
    type: CallbackResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid state or authentication failed',
    type: ErrorResponseDto,
  })
  async callback(
    @Req() req,
    @Res() res,
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    // Verify state for web clients
    if (req.headers['user-agent'].includes('Mozilla')) {
      const storedState = req.cookies?.auth_state;
      if (!storedState || storedState !== state) {
        return res.status(400).json({ error: 'Invalid state' });
      }
      res.clearCookie('auth_state');
    }

    try {
      const tokens = await this.authService.exchangeCodeForTokens(code);
      const user = await this.authService.syncUser(tokens.profile);

      // For web clients, redirect to frontend with token
      if (req.headers['user-agent'].includes('Mozilla')) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}`,
        );
      }

      // For mobile clients, return JSON response
      return res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      });
    } catch (error) {
      return res.status(400).json({ error: 'Authentication failed' });
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Returns the profile information for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user profile information',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: ErrorResponseDto,
  })
  async getProfile(@Req() req: Request & { user: any }) {
    return this.authService.getUser(req.user);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Redirects to Auth0 logout endpoint to clear the session',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Auth0 logout page',
  })
  logout(@Res() res) {
    res.redirect(
      `https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${process.env.FRONTEND_URL}`,
    );
  }
}
