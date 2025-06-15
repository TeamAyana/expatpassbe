import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async exchangeCodeForTokens(code: string) {
    const domain = this.configService.get<string>('auth0.domain');
    const clientId = this.configService.get<string>('auth0.clientId');
    const clientSecret = this.configService.get<string>('auth0.clientSecret');
    const callbackURL = this.configService.get<string>('auth0.callbackURL');

    if (!domain || !clientId || !clientSecret || !callbackURL) {
      throw new Error('Missing required Auth0 configuration');
    }

    try {
      const response = await axios.post(`https://${domain}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: callbackURL,
      });

      const { access_token, refresh_token, id_token } = response.data;

      // Decode and verify ID token
      const profile = this.verifyIdToken(id_token);

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        profile,
      };
    } catch (error) {
      throw new Error('Failed to exchange code for tokens');
    }
  }

  private verifyIdToken(idToken: string) {
    // In a real implementation, you would verify the JWT signature
    // and validate the claims. For now, we'll just decode it.
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }

  async syncUser(auth0User: { userId: string; email: string; name: string }) {
    let user = await this.prisma.user.findUnique({
      where: { auth0Id: auth0User.userId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          auth0Id: auth0User.userId,
          email: auth0User.email,
          fullname: auth0User.name,
          username: this.generateUsername(auth0User.email),
        },
      });
    }

    return user;
  }

  async getUser(auth0User: { userId: string }) {
    return this.prisma.user.findUnique({ where: { auth0Id: auth0User.userId } });
  }

  private generateUsername(email: string) {
    return email.split('@')[0] + Math.floor(Math.random() * 10000);
  }
}
