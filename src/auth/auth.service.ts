import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Auth0Service } from '../auth0/auth0.service'; 

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly auth0Service: Auth0Service,
  ) {}

  async validateUser(token: string): Promise<any> {
    const user = await this.auth0Service.verifyToken(token);
    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.sub };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
