import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      domain: configService.get<string>('AUTH0_DOMAIN', ""),
      clientID: configService.get<string>('AUTH0_CLIENT_ID', ""),
      clientSecret: configService.get<string>('AUTH0_CLIENT_SECRET', ""),
      callbackURL: 'http://localhost:3000/auth/callback',
      scopeSeparator: 'openid profile email',
      passReqToCallback: true,
    });
  }

  async validate(accessToken: string, refreshToken: string, extraParams: any, profile: any, done: Function) {
    done(null, profile); // Pass the user profile to the next middleware
  }
}
